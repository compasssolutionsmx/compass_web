import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Limitador de envíos de `/api/lead`.
 *
 * ─── EL PROBLEMA DE HACER ESTO EN SERVERLESS ──────────────────────────────
 *
 * Un `Map` en memoria NO es un limitador en Vercel. Cada instancia de la
 * función tiene el suyo, las instancias nacen y mueren solas, y el arranque en
 * frío empieza de cero: el límite real de un contador en memoria es "N por
 * minuto POR INSTANCIA", que con suficiente concurrencia es no tener límite.
 * Eso es lo que había aquí antes, y el comentario que lo admitía seguía siendo
 * verdad.
 *
 * Sin añadir dependencias no existe un almacén compartido, así que en vez de
 * fingir que sí, esto combina DOS contadores imperfectos que fallan de formas
 * distintas, y deja escrito qué para cada uno:
 *
 *   1. MEMORIA DEL PROCESO. Para ráfagas. Es exacto mientras la instancia viva
 *      y no cuesta nada, y como Fluid Compute reutiliza instancias entre
 *      peticiones concurrentes, una ráfaga desde una misma IP casi siempre cae
 *      en la misma. Es lo que frena el doble clic y el script tonto en bucle.
 *      Lo que NO frena: un atacante que espacie los envíos lo justo para tocar
 *      instancias distintas.
 *
 *   2. COOKIE FIRMADA. Para lo sostenido. El contador viaja en el cliente, así
 *      que sobrevive a cualquier rotación de instancias — es el único estado
 *      que en este entorno se puede dar por compartido sin base de datos. Va
 *      firmada con HMAC, de modo que subir el contador a mano invalida la firma
 *      y el envío cuenta como nuevo, nunca como "ya gastado". Lo que NO frena:
 *      un bot que simplemente no guarde cookies, que son casi todos.
 *
 * O SEA: la 1 cubre al bot que ignora cookies pero llega en ráfaga, y la 2
 * cubre al que respeta cookies pero se toma su tiempo. Un atacante que ignore
 * cookies Y espacie los envíos pasa las dos, y eso no tiene arreglo en código
 * de aplicación. Para ese caso la respuesta correcta es una regla de rate
 * limiting en el WAF de Vercel, que corre en el borde antes de llegar aquí, o
 * un almacén compartido (Redis) si algún día se acepta la dependencia.
 */

/* ───────────────────────────── Umbrales ──────────────────────────────────── */

/**
 * RÁFAGA: 3 envíos por minuto.
 *
 * Sale de contar lo que un humano puede hacer de verdad en 60 segundos. Enviar
 * el cotizador son cuatro pasos y bastante más de un minuto; el modal corto,
 * tres campos. Tres envíos en un minuto ya es reintentar dos veces tras un
 * error, que es exactamente el techo que se quiere permitir. El cuarto en esa
 * ventana no es una persona con prisa: es un bucle.
 */
const BURST = { max: 3, windowMs: 60_000 };

/**
 * SOSTENIDO: 10 envíos por hora.
 *
 * Aquí manda una consideración que no es técnica: estas IPs SE COMPARTEN. Una
 * empresa detrás de un NAT manda a todo su equipo por la misma dirección, y
 * este sitio vende justamente a empresas. Diez por hora deja sitio a varias
 * personas de la misma oficina cotizando el mismo día, más sus reintentos, y
 * sigue cortando en seco cualquier goteo automatizado — un spammer que quiera
 * volumen necesita cientos, no doce.
 *
 * Si algún día se ve un cliente grande topando contra esto, el número a subir
 * es éste, no el de ráfaga.
 */
const SUSTAINED = { max: 10, windowMs: 60 * 60 * 1000 };

/* ─────────────────── Capa 1: memoria del proceso (ráfaga) ────────────────── */

const HITS = new Map<string, number[]>();

/** Tope de IPs distintas en memoria. Sin esto el Map crece y no baja nunca. */
const MAX_IPS = 5_000;

function burstLimited(ip: string, now: number): boolean {
  const recientes = (HITS.get(ip) ?? []).filter(
    (marca) => now - marca < BURST.windowMs,
  );

  if (recientes.length >= BURST.max) {
    HITS.set(ip, recientes);
    return true;
  }

  recientes.push(now);
  HITS.set(ip, recientes);

  if (HITS.size > MAX_IPS) {
    for (const [clave, marcas] of HITS) {
      if (marcas.every((marca) => now - marca >= BURST.windowMs)) {
        HITS.delete(clave);
      }
    }
  }

  return false;
}

/* ──────────────────── Capa 2: cookie firmada (sostenido) ─────────────────── */

const COOKIE_NAME = "cs_lead_rl";

/**
 * Clave de firma. NO hace falta configurar nada nuevo:
 *
 *   1. `LEAD_RATE_SECRET` si existe, que es lo explícito.
 *   2. Si no, se DERIVA de `RESEND_KEY` con un hash y un separador de dominio.
 *      Reutilizar un secreto para otra cosa es feo si se usa en crudo; pasado
 *      por SHA-256 con su propia etiqueta, lo que se firma no permite deducir
 *      la clave original ni sirve en ningún otro contexto. A cambio, esta capa
 *      funciona en producción sin que nadie tenga que acordarse de añadir una
 *      variable, que es como se quedan a medias estas cosas.
 *   3. Si tampoco hay `RESEND_KEY`, no hay clave y la capa se apaga sola. Da
 *      igual: sin esa variable el endpoint ya responde 503 y no manda nada.
 *
 * Se cachea porque `createHash` por petición es gasto tonto.
 */
let cachedSecret: Buffer | null | undefined;

function secret(): Buffer | null {
  if (cachedSecret !== undefined) return cachedSecret;

  const material =
    process.env.LEAD_RATE_SECRET?.trim() || process.env.RESEND_KEY?.trim();

  cachedSecret = material
    ? createHash("sha256").update(`compass:lead-rate:v1:${material}`).digest()
    : null;

  return cachedSecret;
}

function sign(payload: string, key: Buffer): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function verify(payload: string, firma: string, key: Buffer): boolean {
  const esperada = Buffer.from(sign(payload, key));
  const recibida = Buffer.from(firma);
  // `timingSafeEqual` exige el mismo largo; comparar longitudes antes no filtra
  // nada útil porque el largo de un HMAC-SHA256 en base64url es siempre el
  // mismo.
  if (esperada.length !== recibida.length) return false;
  return timingSafeEqual(esperada, recibida);
}

function readCookie(request: Request): { inicio: number; conteo: number } | null {
  const key = secret();
  if (!key) return null;

  const header = request.headers.get("cookie");
  if (!header) return null;

  const crudo = header
    .split(";")
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!crudo) return null;

  const [version, inicioTexto, conteoTexto, firma] = crudo.split(".");
  if (version !== "v1" || !inicioTexto || !conteoTexto || !firma) return null;
  if (!verify(`v1.${inicioTexto}.${conteoTexto}`, firma, key)) return null;

  const inicio = Number(inicioTexto);
  const conteo = Number(conteoTexto);
  if (!Number.isFinite(inicio) || !Number.isFinite(conteo)) return null;

  return { inicio, conteo };
}

function buildCookie(inicio: number, conteo: number, now: number): string | null {
  const key = secret();
  if (!key) return null;

  const payload = `v1.${inicio}.${conteo}`;
  const restanteS = Math.max(
    1,
    Math.ceil((inicio + SUSTAINED.windowMs - now) / 1000),
  );

  return [
    `${COOKIE_NAME}=${payload}.${sign(payload, key)}`,
    // Alcance mínimo: sólo la ruta que la usa. No es una cookie de seguimiento
    // y no tiene por qué viajar en cada petición del sitio.
    "Path=/api/lead",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${restanteS}`,
    // En local el sitio va por http y una cookie `Secure` se descartaría, con
    // lo que esta capa dejaría de existir justo donde se prueba.
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/* ─────────────────────────────── Veredicto ───────────────────────────────── */

export type RateVerdict = {
  limited: boolean;
  /** Motivo legible, para el log. Sólo cuando `limited`. */
  reason?: string;
  /** Cabecera `Set-Cookie` a devolver, si la capa 2 está activa. */
  setCookie?: string;
};

/**
 * Decide si esta petición pasa. NO tiene efectos secundarios fuera del
 * contador: quien llama decide qué responder y debe adjuntar `setCookie`.
 *
 * ORDEN: primero la ráfaga en memoria, que es una comparación de números, y
 * sólo después la cookie, que implica un HMAC. Si la ráfaga ya cortó, no se
 * gasta el hash.
 */
export function checkLeadRate(request: Request, ip: string): RateVerdict {
  const now = Date.now();

  if (burstLimited(ip, now)) {
    return {
      limited: true,
      reason: `ráfaga: más de ${BURST.max} envíos en ${BURST.windowMs / 1000}s`,
    };
  }

  const previa = readCookie(request);
  // Cookie ausente, manipulada o de una ventana ya cerrada: se abre una nueva.
  // Ojo con la consecuencia, que es deliberada: borrar la cookie resetea el
  // contador. Es el precio de no tener estado en el servidor, y por eso esta
  // capa es la del goteo lento y no la única.
  const enVentana = previa && now - previa.inicio < SUSTAINED.windowMs;
  const inicio = enVentana ? previa.inicio : now;
  const conteo = (enVentana ? previa.conteo : 0) + 1;

  if (conteo > SUSTAINED.max) {
    return {
      limited: true,
      reason: `sostenido: más de ${SUSTAINED.max} envíos en ${SUSTAINED.windowMs / 60_000} min`,
      // Se devuelve igualmente para que la ventana siga corriendo y el bloqueo
      // no se levante solo al recargar.
      setCookie: buildCookie(inicio, conteo, now) ?? undefined,
    };
  }

  return { limited: false, setCookie: buildCookie(inicio, conteo, now) ?? undefined };
}

/** Primera IP de `x-forwarded-for`, que en Vercel es la del cliente. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "desconocida";
}
