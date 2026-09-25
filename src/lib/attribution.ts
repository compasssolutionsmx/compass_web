/**
 * Atribución de campaña: identificador de clic y UTM de la URL de llegada, más
 * el dominio externo del que venía la persona, guardados en `localStorage` para
 * mandarlos con el cotizador.
 *
 * Sin React y sin DOM más allá de `localStorage`, igual que `lib/consent`, del
 * que copia el patrón: una clave, un objeto con timestamp, try/catch en cada
 * acceso y caducidad comprobada al leer.
 *
 * ─── SE GUARDA SIEMPRE, SIN MIRAR EL CONSENTIMIENTO ───────────────────────
 *
 * Es una decisión tomada, no un olvido. El registro no sale del navegador
 * salvo dentro de un envío del cotizador, que la persona hace a propósito.
 *
 * ─── UN SOLO IDENTIFICADOR DE CLIC ────────────────────────────────────────
 *
 * Los cuatro parámetros de clic pagado (gclid, wbraid, gbraid, fbclid) se
 * guardan colapsados en dos campos: `click_id` con el valor y `click_source`
 * con el nombre del parámetro del que salió. Si una URL trajera varios, gana
 * el primero de `CLICK_ID_PARAMS`, sin depender del orden de la query string.
 *
 * ─── ÚLTIMO CLIC ──────────────────────────────────────────────────────────
 *
 *   - Si la URL trae cualquiera de los cuatro, el registro se SOBRESCRIBE
 *     entero con lo que traiga la URL y el reloj de 90 días vuelve a empezar.
 *   - Si no trae ninguno, el registro existente se conserva INTACTO, aunque la
 *     URL traiga UTM o haya referrer: ninguno de los dos pisa un clic pagado.
 *     Sólo se escriben si no había registro vigente.
 *
 * ─── REFERRER ─────────────────────────────────────────────────────────────
 *
 * Sólo el hostname de `document.referrer` (chatgpt.com, linkedin.com), sin
 * protocolo ni ruta. No se guarda si viene vacío ni si es el propio sitio: lo
 * que interesa es el origen externo, y una navegación interna diría siempre
 * "compasssolutions.com.mx". Viaja en la misma escritura que el resto.
 *
 * ─── NUNCA LANZA ──────────────────────────────────────────────────────────
 *
 * En modo privado o con almacenamiento bloqueado, `localStorage` lanza al
 * leer o al escribir. Aquí eso se traga: la atribución se pierde, el sitio y
 * el formulario siguen igual. La ausencia de atribución no puede costar un
 * lead.
 */

export const ATTRIBUTION_STORAGE_KEY = "compass:attribution";

/** Vigencia desde la captura. Más viejo que esto se descarta al leer. */
export const ATTRIBUTION_MAX_AGE_DAYS = 90;

/**
 * Parámetros de clic pagado, EN ORDEN DE PRIORIDAD: es el desempate cuando
 * llegan varios en la misma URL. Son los únicos que sobrescriben el registro,
 * y sus nombres son los valores posibles de `click_source`.
 */
export const CLICK_ID_PARAMS = ["gclid", "wbraid", "gbraid", "fbclid"] as const;

export type ClickSource = (typeof CLICK_ID_PARAMS)[number];

/**
 * Sólo estos tres. `utm_term` y `utm_content` ya no se capturan, y si un
 * registro guardado los trae se ignoran al leer: la lectura reconstruye el
 * objeto con esta lista y nada más.
 */
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

/**
 * Los seis campos, en el orden en que se leen. Los nombres son los mismos en
 * `localStorage`, en el payload y en el CRM: no se traducen.
 */
export const ATTRIBUTION_KEYS = [
  "click_id",
  "click_source",
  ...UTM_KEYS,
  "referrer",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];

export type AttributionValues = Partial<Record<AttributionKey, string>>;

export type AttributionRecord = {
  values: AttributionValues;
  /** ISO. Fecha de la captura; de aquí sale la caducidad. */
  capturedAt: string;
};

/**
 * Tope por valor. `parseLead` RECHAZA el lead entero si un campo pasa de 2000
 * caracteres, así que una URL con un UTM absurdo bloquearía el envío. Se recorta
 * aquí, muy por debajo de ese tope: un gclid real ronda los 100.
 */
const MAX_LARGO_VALOR = 500;

const MAX_AGE_MS = ATTRIBUTION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

type Source = (key: string) => unknown;

/** Texto recortado y con contenido, o `undefined`. Nunca una cadena vacía. */
function clean(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim().slice(0, MAX_LARGO_VALOR);
  return value || undefined;
}

function isClickSource(value: unknown): value is ClickSource {
  return (CLICK_ID_PARAMS as readonly unknown[]).includes(value);
}

/** El primer parámetro de clic con valor, según la prioridad de la lista. */
function clickFromParams(source: Source): AttributionValues {
  for (const param of CLICK_ID_PARAMS) {
    const value = clean(source(param));
    if (value) return { click_id: value, click_source: param };
  }
  return {};
}

function utmFrom(source: Source): AttributionValues {
  const values: AttributionValues = {};
  for (const key of UTM_KEYS) {
    const value = clean(source(key));
    if (value) values[key] = value;
  }
  return values;
}

/** El `www.` no distingue sitios: el ápice redirige a www en producción. */
function sinWww(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/**
 * Hostname externo de un referrer, o nada. Vacío, ilegible o del propio sitio
 * cuentan igual: no hay origen externo que guardar.
 */
function referrerFrom(referrer: string): AttributionValues {
  if (!referrer) return {};
  try {
    const hostname = new URL(referrer).hostname;
    if (!hostname) return {};
    if (sinWww(hostname) === sinWww(window.location.hostname)) return {};
    const value = clean(hostname);
    return value ? { referrer: value } : {};
  } catch {
    return {};
  }
}

/**
 * Clic de un registro GUARDADO. Acepta el formato actual y, si no lo
 * encuentra, CONVIERTE el anterior, que guardaba gclid, wbraid, gbraid o
 * fbclid como claves sueltas: se les aplica la misma prioridad que a una URL.
 *
 * Un `click_id` sin `click_source` válido se descarta: sin saber de qué
 * plataforma salió, el valor no le sirve a nadie.
 */
function clickFromStored(stored: Record<string, unknown>): AttributionValues {
  const clickId = clean(stored.click_id);
  if (clickId) {
    return isClickSource(stored.click_source)
      ? { click_id: clickId, click_source: stored.click_source }
      : {};
  }
  return clickFromParams((key) => stored[key]);
}

/**
 * Lee el registro guardado. Devuelve `null` ante cualquier cosa rara: nada
 * guardado, JSON corrupto, forma inesperada, registro caducado o storage
 * bloqueado.
 *
 * Un registro caducado además se borra, para que no quede ocupando la clave.
 */
export function readAttribution(): AttributionRecord | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const record = parsed as Partial<AttributionRecord>;
    if (typeof record.capturedAt !== "string") return null;
    if (typeof record.values !== "object" || record.values === null) {
      return null;
    }

    const ageMs = Date.now() - new Date(record.capturedAt).getTime();
    if (!Number.isFinite(ageMs)) return null;
    if (ageMs > MAX_AGE_MS) {
      try {
        window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      } catch {
        // Si no se puede borrar, igual se trata como vacío.
      }
      return null;
    }

    // Se reconstruye en vez de reenviar el objeto del JSON: así no se cuelan
    // claves extra ni valores que no sean texto.
    const stored = record.values as Record<string, unknown>;
    const values: AttributionValues = {
      ...clickFromStored(stored),
      ...utmFrom((key) => stored[key]),
      ...(clean(stored.referrer) ? { referrer: clean(stored.referrer) } : {}),
    };
    if (Object.keys(values).length === 0) return null;

    return { values, capturedAt: record.capturedAt };
  } catch {
    return null;
  }
}

/**
 * Captura desde la query string de la URL de llegada (`window.location.search`)
 * y desde `document.referrer`. Aplica la regla de último clic de la cabecera.
 * No escribe registros vacíos.
 */
export function captureAttribution(search: string, referrer = ""): void {
  if (typeof window === "undefined") return;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return;
  }

  const get: Source = (key) => params.get(key);
  const values: AttributionValues = {
    ...clickFromParams(get),
    ...utmFrom(get),
    ...referrerFrom(referrer),
  };
  if (Object.keys(values).length === 0) return;

  // Sin identificador de clic, cualquier registro vigente se queda como está.
  if (!values.click_id && readAttribution()) return;

  const record: AttributionRecord = {
    values,
    capturedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(record),
    );
  } catch {
    // Storage bloqueado: la atribución se pierde y nada más.
  }
}

/**
 * Los valores vigentes, listos para mezclar en un payload. Sin registro, o con
 * uno caducado, devuelve `{}`: las claves AUSENTES, no vacías.
 */
export function attributionFields(): AttributionValues {
  return readAttribution()?.values ?? {};
}
