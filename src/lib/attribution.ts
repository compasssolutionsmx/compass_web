/**
 * Atribución de campaña: identificadores de clic y UTM de la URL de llegada,
 * guardados en `localStorage` para mandarlos con el cotizador.
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
 * ─── ÚLTIMO CLIC ──────────────────────────────────────────────────────────
 *
 *   - Si la URL trae gclid, wbraid, gbraid o fbclid, el registro se SOBRESCRIBE
 *     entero con lo que traiga la URL y el reloj de 90 días vuelve a empezar.
 *   - Si no trae ninguno de los cuatro, el registro existente se conserva
 *     INTACTO, aunque la URL traiga UTM: unos UTM sueltos no pisan un clic
 *     pagado. Sólo se escriben si no había registro vigente.
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

/** Identificadores de clic pagado. Son los únicos que sobrescriben. */
export const CLICK_ID_KEYS = ["gclid", "wbraid", "gbraid", "fbclid"] as const;

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

/**
 * Los nueve campos, en el orden en que se leen. Los nombres son los mismos en
 * la URL, en `localStorage`, en el payload y en el CRM: no se traducen.
 */
export const ATTRIBUTION_KEYS = [...CLICK_ID_KEYS, ...UTM_KEYS] as const;

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

/** Sólo claves conocidas y con contenido. Nunca devuelve cadenas vacías. */
function cleanValues(source: (key: AttributionKey) => unknown): AttributionValues {
  const values: AttributionValues = {};
  for (const key of ATTRIBUTION_KEYS) {
    const raw = source(key);
    if (typeof raw !== "string") continue;
    const value = raw.trim().slice(0, MAX_LARGO_VALOR);
    if (value) values[key] = value;
  }
  return values;
}

function hasClickId(values: AttributionValues): boolean {
  return CLICK_ID_KEYS.some((key) => Boolean(values[key]));
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
    const values = cleanValues((key) => stored[key]);
    if (Object.keys(values).length === 0) return null;

    return { values, capturedAt: record.capturedAt };
  } catch {
    return null;
  }
}

/**
 * Captura desde la query string de la URL de llegada (`window.location.search`).
 * Aplica la regla de último clic de la cabecera. No escribe registros vacíos.
 */
export function captureAttribution(search: string): void {
  if (typeof window === "undefined") return;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return;
  }

  const values = cleanValues((key) => params.get(key));
  if (Object.keys(values).length === 0) return;

  // Sin identificador de clic, cualquier registro vigente se queda como está.
  if (!hasClickId(values) && readAttribution()) return;

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
