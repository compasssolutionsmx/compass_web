/**
 * Trampas anti-bot compartidas por los cuatro formularios: honeypot y
 * time-trap.
 *
 * SIN "server-only" A PROPÓSITO. Este módulo lo importan los dos lados: el
 * cliente necesita el nombre del campo y el umbral de tiempo para no violarlo
 * él mismo, y el servidor necesita las mismas constantes para juzgar. Nada de
 * lo que hay aquí es secreto — un bot que lea el bundle descubre que el campo
 * se llama `website`, y da igual: la trampa no depende de que su nombre sea
 * desconocido, sino de que rellenarlo sea la conducta equivocada.
 *
 * QUÉ CUBRE CADA CAPA, que no es lo mismo:
 *   - HONEYPOT   pilla al bot que parsea el HTML y rellena todo input que
 *                encuentra. Es la más barata y la que más spam real para.
 *   - TIME-TRAP  pilla al que sí renderiza la página (navegador headless) pero
 *                envía en milisegundos, y al que hace POST crudo contra
 *                `/api/lead` sin haber pasado por el formulario: ése no tiene
 *                de dónde sacar el campo, y su ausencia ya lo delata.
 *
 * LAS DOS NO PESAN LO MISMO Y POR ESO NO HACEN LO MISMO. El time-trap descarta;
 * el honeypot sólo MARCA, y el envío llega igual a la bandeja del equipo con un
 * aviso en el asunto. La razón es el falso positivo: el honeypot tiene uno
 * plausible —un gestor de contraseñas que autorrellena el campo oculto de un
 * cliente real— y descartar por eso significaba perder un lead en silencio, sin
 * que nadie se enterara nunca. Marcado, el peor caso es que alguien lea un
 * correo de spam; descartado, el peor caso era perder una venta. Por eso este
 * módulo devuelve las dos cosas por separado y no como un único veredicto.
 * Ninguna de las dos para a alguien decidido que forje el payload a mano; para
 * eso está el limitador por IP de `lib/rate-limit`, y por encima de todo el WAF
 * de la plataforma.
 */

/**
 * Nombre del campo trampa. Se llama `website` porque es lo que un bot QUIERE
 * rellenar: los formularios de contacto reales piden sitio web constantemente,
 * así que su heurística lo trata como un campo legítimo más.
 *
 * NO se llama `honeypot`, `hp` ni nada que lo delate: los bots que valen algo
 * saltan los campos cuyo nombre huele a trampa, y entonces la trampa no atrapa.
 */
export const HONEYPOT_FIELD = "website";

/**
 * Mínimo de milisegundos entre que el formulario se monta y que se envía.
 *
 * TRES SEGUNDOS, y el número está elegido por abajo, no por arriba. El
 * formulario más corto del sitio es el modal de WhatsApp: nombre, teléfono y
 * correo. Escribir eso a mano son 10-20 segundos incluso yendo rápido, así que
 * el margen contra un humano tecleando es enorme. Quien de verdad se acerca a
 * los 3 s es el autorrelleno del navegador: un clic en la sugerencia llena los
 * tres campos de golpe y deja el envío en 1-2 s. De ahí que no se pueda apretar
 * más, y de ahí también que el cliente espere en vez de fallar (ver
 * `useLeadSubmit`): así ni siquiera ese caso llega a rozar el umbral.
 *
 * Por arriba no hace falta ser fino: un bot que renderiza y envía lo hace en
 * decenas de milisegundos, no en dos segundos y medio.
 */
export const MIN_FILL_MS = 3_000;

/**
 * Tope de sensatez. Un `elapsedMs` mayor que esto no es una persona que dejó la
 * pestaña abierta doce horas —eso es raro pero posible y se acepta—, es un
 * número inventado o un reloj roto. Se usa sólo para descartar valores
 * absurdos, no para caducar formularios.
 */
export const MAX_FILL_MS = 24 * 60 * 60 * 1000;

/**
 * Por qué se descartó un envío. `honeypot` YA NO ESTÁ AQUÍ: dejó de descartar.
 * Va tal cual al log, así que se lee en español.
 */
export type DiscardReason = "demasiado-rapido" | "sin-marca-de-tiempo";

/**
 * Las dos señales, por separado y ambas evaluadas siempre.
 *
 * QUE SE EVALÚEN LAS DOS IMPORTA: un envío puede traer el campo trampa relleno
 * Y venir sin marca de tiempo. Cuando esto devolvía un único veredicto y
 * cortaba en el primer fallo, el honeypot tapaba al time-trap; ahora el que
 * descarta manda, y la marca viaja con el lead si además llega a enviarse.
 */
export type TrapReport = {
  /** Campo trampa relleno. NO descarta: marca el correo para revisión. */
  flagged: { detail: string } | null;
  /** Motivo por el que el envío no debe procesarse. */
  discard: { reason: DiscardReason; detail: string } | null;
};

/**
 * Lee el honeypot de un `<form>` ya enviado.
 *
 * Vía `FormData` y no vía estado de React a propósito: el campo trampa no tiene
 * por qué existir en el estado de ningún formulario —no es un dato del lead, es
 * un sensor— y así los cuatro lo recogen con la misma línea, sin `useState` ni
 * refs que mantener.
 */
export function readHoneypot(form: HTMLFormElement): string {
  const value = new FormData(form).get(HONEYPOT_FIELD);
  return typeof value === "string" ? value : "";
}

/**
 * Juicio del servidor. Mira las dos señales y NO decide qué responder: eso lo
 * hace la ruta, que es quien sabe que una marca sigue adelante y un descarte
 * no.
 */
export function inspectSubmission(body: {
  honeypot: unknown;
  elapsedMs: unknown;
}): TrapReport {
  const { honeypot, elapsedMs } = body;

  // Cualquier cosa que no sea cadena vacía cuenta. Un bot que mande el campo
  // como número o como array también se delata: el humano no lo ve siquiera.
  const relleno = typeof honeypot !== "string" || honeypot.trim() !== "";

  const flagged = relleno
    ? {
        // Se registra el LARGO, nunca el contenido: si un gestor de contraseñas
        // llegara a autorrellenarlo, ese contenido sería un dato del usuario y
        // no tiene por qué acabar en un log.
        detail: `campo trampa relleno (${typeof honeypot === "string" ? `${honeypot.trim().length} caracteres` : typeof honeypot})`,
      }
    : null;

  // AUSENTE CUENTA COMO FALLO, y es la mitad del valor de esta capa: el POST
  // crudo contra `/api/lead` que nunca cargó la página no tiene de dónde sacar
  // este número. El formulario del sitio siempre lo manda.
  if (typeof elapsedMs !== "number" || !Number.isFinite(elapsedMs)) {
    return {
      flagged,
      discard: {
        reason: "sin-marca-de-tiempo",
        detail: `elapsedMs ausente o no numérico (${typeof elapsedMs})`,
      },
    };
  }

  if (elapsedMs < MIN_FILL_MS || elapsedMs > MAX_FILL_MS) {
    return {
      flagged,
      discard: {
        reason: "demasiado-rapido",
        detail: `elapsedMs=${Math.round(elapsedMs)} fuera de [${MIN_FILL_MS}, ${MAX_FILL_MS}]`,
      },
    };
  }

  return { flagged, discard: null };
}
