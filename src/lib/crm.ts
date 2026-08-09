import "server-only";

import type { Lead, LeadSource } from "./lead-email";
import { requestTypeLabel } from "./request-types";

/**
 * Envío del lead al CRM externo.
 *
 * ─── POR QUÉ VIVE EN EL SERVIDOR ──────────────────────────────────────────
 *
 * Esto sustituye a `postToWebhook`, el stub que vivía en `useLeadSubmit` y sólo
 * hacía un `console.info`. Su propio TODO pedía justamente esto: hacerlo desde
 * el servidor. La razón es que la URL del CRM y su secreto son configuración
 * privada, y cualquier cosa que toque el cliente viaja en el bundle y se lee
 * con abrir las herramientas de desarrollo. Desde aquí no sale al navegador.
 *
 * De paso se gana algo que el cliente no podía dar: el envío al CRM queda
 * DETRÁS de las trampas anti-bot y de la validación de `parseLead`, así que el
 * CRM no recibe lo que el sitio ya descartó.
 *
 * ─── AISLAMIENTO ──────────────────────────────────────────────────────────
 *
 * Esta función NO LANZA NUNCA. Ni por red, ni por timeout, ni por un 500 del
 * CRM, ni por configuración ausente. El correo es el registro del lead y la
 * pantalla de confirmación del usuario depende de él; si el CRM se cae, lo
 * único que debe pasar es que quede una línea en el log. Quien la llama
 * tampoco mira lo que devuelve.
 *
 * ─── CONFIGURACIÓN: UNA URL POR FORMULARIO ────────────────────────────────
 *
 *   CRM_WEBHOOK_URL_COTIZADOR     Destino de las solicitudes de cotización.
 *   CRM_WEBHOOK_URL_WHATSAPP      Destino del modal corto de WhatsApp.
 *
 * SON DOS Y NO UNA porque el destino ES la clasificación: el CRM decide qué es
 * cada lead por dónde entra, así que mandar los dos formularios al mismo sitio
 * los mezclaría en la misma categoría. Cada una es obligatoria para SU origen y
 * son independientes: configurar sólo una deja esa mitad funcionando y la otra
 * apagada, avisando en el log. Ninguna tiene valor por defecto a propósito —
 * adivinar un destino sería mandar datos de clientes a donde nadie confirmó, y
 * caer al de otro formulario sería clasificar mal el lead en silencio, que es
 * peor que no enviarlo.
 *
 *   CRM_WEBHOOK_SECRET_COTIZADOR  Opcionales. Si están, viajan como
 *   CRM_WEBHOOK_SECRET_WHATSAPP   `Authorization: Bearer`.
 *   CRM_WEBHOOK_SECRET            Respaldo común de las dos: si los dos
 *                                 destinos comparten token, basta con ésta.
 *
 * Si el CRM espera otro esquema de autenticación —una cabecera propia, una
 * firma HMAC— se cambia en `headers`, abajo.
 */

/** Cuánto se espera al CRM antes de darlo por perdido. */
const TIMEOUT_MS = 5_000;

/**
 * ORÍGENES QUE SÍ VAN AL CRM. `proveedor` y `vacante` quedan fuera: no son
 * leads de venta —uno es una empresa ofreciéndose y el otro una persona
 * postulándose— y meterlos en el embudo comercial es exactamente lo que el
 * ruteo de correos por origen se pasó el tiempo evitando.
 */
const CRM_SOURCES = ["cotizador", "whatsapp"] as const;

type CrmSource = (typeof CRM_SOURCES)[number];

function isCrmSource(source: LeadSource): source is CrmSource {
  return (CRM_SOURCES as readonly LeadSource[]).includes(source);
}

/**
 * QUÉ VARIABLE MANDA EN CADA ORIGEN. Mismo patrón que `RECIPIENTS_ENV` en
 * `lead-email`, y por el mismo motivo: el nombre de la variable sigue al
 * ORIGEN del lead, no al destino que hoy tenga configurado. Si mañana el CRM
 * cambia de proveedor, el nombre no pasa a mentir.
 *
 * Al ser un mapa y no un `if`, añadir un tercer origen al CRM es añadir una
 * línea aquí y otra en `CRM_SOURCES`; el resto del archivo no se toca.
 */
const CRM_URL_ENV: Record<CrmSource, string> = {
  cotizador: "CRM_WEBHOOK_URL_COTIZADOR",
  whatsapp: "CRM_WEBHOOK_URL_WHATSAPP",
};

const CRM_SECRET_ENV: Record<CrmSource, string> = {
  cotizador: "CRM_WEBHOOK_SECRET_COTIZADOR",
  whatsapp: "CRM_WEBHOOK_SECRET_WHATSAPP",
};

/**
 * Payload APLANADO: los campos del formulario en la raíz, no dentro de `datos`.
 *
 * LAS CLAVES VIAJAN TAL CUAL, sin normalizar. `contactoPreferido` se queda en
 * camelCase, los acentos de los valores se quedan como están y nada se pasa a
 * snake_case: el mapeo del otro lado está escrito contra estos nombres exactos
 * y una sola letra distinta rompe la integración sin dar error.
 *
 * `formulario` se añade al final para que gane si algún día un formulario
 * llegara a tener un campo con ese mismo nombre. Hoy ninguno lo tiene, pero el
 * origen del lead no es negociable y no puede quedar pisado por un dato de
 * usuario.
 *
 * Lo que NO se manda: `website` y `elapsedMs`, que son sensores anti-bot y no
 * campos del formulario.
 *
 * ─── LA ÚNICA TRADUCCIÓN: EL VALOR DE `tipo` ──────────────────────────────
 *
 * `tipo` sale de aquí como ETIQUETA VISIBLE ("Marítimo") y no como el slug con
 * el que viaja por el resto del sitio ("maritimo"). Es una excepción y sólo
 * vive en esta función: el formulario, el estado de React, el POST a
 * `/api/lead` y el correo interno siguen usando el slug, que es lo que
 * `requestTypeLabel` sabe traducir. Cambiarlo en origen habría roto esa
 * traducción y el asunto del correo.
 *
 * La CLAVE sigue llamándose `tipo`; lo que cambia es su valor.
 *
 * Si llegara un slug desconocido, `requestTypeLabel` devuelve el propio valor,
 * así que el dato pasa tal cual en vez de perderse.
 */
export function crmPayload(lead: Lead): Record<string, string> {
  // Copia antes de tocar nada: `lead.datos` lo comparten el correo y el acuse,
  // que sí quieren el slug.
  const datos = { ...lead.datos };

  if (datos.tipo) {
    datos.tipo = requestTypeLabel(datos.tipo) ?? datos.tipo;
  }

  return { ...datos, formulario: lead.formulario };
}

function crmUrl(source: CrmSource): URL | null {
  const variable = CRM_URL_ENV[source];
  const raw = process.env[variable]?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    // El nombre de la variable va en el mensaje: con dos destinos, "no es una
    // URL válida" a secas obligaría a adivinar cuál de las dos revisar.
    console.error(`[crm] ${variable} no es una URL válida: ${raw}`);
    return null;
  }

  // El payload lleva nombre, correo y teléfono de una persona. Mandarlo por
  // http en claro sería filtrarlo a cualquiera en la ruta, así que se rechaza
  // en vez de enviarse igual. Se exceptúa localhost, que no sale de la máquina.
  const esLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !esLocal) {
    console.error(
      `[crm] ${variable} no usa https (${url.protocol}//): no se envía nada. El payload lleva datos personales.`,
    );
    return null;
  }

  return url;
}

/**
 * Token del origen, con respaldo en el compartido. Se resuelve así y no al
 * revés para que un destino con token propio pueda convivir con otro que usa
 * el común, sin obligar a duplicar el mismo valor en dos variables.
 */
function crmSecret(source: CrmSource): string | undefined {
  return (
    process.env[CRM_SECRET_ENV[source]]?.trim() ||
    process.env.CRM_WEBHOOK_SECRET?.trim() ||
    undefined
  );
}

/**
 * Manda el lead al CRM. Devuelve siempre, pase lo que pase.
 *
 * Se llama en paralelo con el correo, no en cadena: son dos destinos
 * independientes y encadenarlos le sumaría al usuario los dos tiempos de espera
 * mientras mira "Enviando…".
 */
export async function sendToCrm(lead: Lead): Promise<void> {
  // El type guard no es adorno: es lo que le permite a TypeScript indexar
  // `CRM_URL_ENV` con este origen y garantizar que los dos mapas cubren todos
  // los orígenes que llegan aquí. Añadir uno a `CRM_SOURCES` sin darle su
  // variable rompe la compilación en vez de fallar en producción.
  const source = lead.formulario;
  if (!isCrmSource(source)) return;

  /**
   * UN LEAD MARCADO POR EL HONEYPOT NO ENTRA AL CRM, y es una decisión aparte
   * de lo que hace el correo.
   *
   * El aviso interno sí llega marcado, porque lo lee una persona que puede
   * juzgar y descartar en un segundo. Un registro en el CRM es otra cosa: se
   * queda, se asigna, se trabaja y ensucia el embudo con contactos falsos que
   * nadie vuelve a limpiar. Si el marcado resultara ser un cliente real, el
   * equipo lo tiene delante en el correo con la nota que le dice qué revisar, y
   * puede darlo de alta a mano.
   */
  if (lead.flagged) {
    console.warn(
      "[crm] omitido: el envío está marcado por el filtro anti-bot.",
    );
    return;
  }

  const url = crmUrl(source);
  if (!url) {
    console.warn(
      `[crm] ${CRM_URL_ENV[source]} no está configurada o no es utilizable: el lead (${source}) no se envió al CRM.`,
    );
    return;
  }

  const secret = crmSecret(source);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(crmPayload(lead)),
      // Sin esto, un CRM que acepta la conexión y no responde deja al usuario
      // mirando "Enviando…" hasta que la función serverless se agote.
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(
        `[crm] ${CRM_URL_ENV[source]} respondió ${response.status}: el lead (${source}) no entró al CRM.`,
      );
      return;
    }

    console.info(`[crm] lead enviado al CRM (${source}).`);
  } catch (thrown) {
    // Cae aquí la red caída, el DNS que no resuelve y el timeout de arriba.
    console.error("[crm] no se pudo enviar el lead al CRM:", thrown);
  }
}
