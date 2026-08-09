import { Resend } from "resend";
import {
  ACK_SUBJECT,
  buildAckHtml,
  buildAckText,
  buildHtml,
  buildReplyTo,
  buildSubject,
  buildText,
  leadFrom,
  leadRecipients,
  parseLead,
  type Lead,
} from "@/lib/lead-email";
import { inspectSubmission } from "@/lib/bot-trap";
import { checkLeadRate, clientIp } from "@/lib/rate-limit";
import { sendToCrm } from "@/lib/crm";

/**
 * POST /api/lead — manda el correo de aviso con los datos del formulario.
 *
 * POR QUÉ EXISTE ESTE ENDPOINT y no se llama a Resend desde el cliente: la
 * RESEND_KEY es un secreto de cuenta. Cualquier cosa que llegue al bundle del
 * navegador es pública, así que la clave sólo puede tocarse aquí. Por eso
 * tampoco se llama `NEXT_PUBLIC_RESEND_KEY` — ese prefijo es precisamente la
 * instrucción de "mételo en el bundle".
 *
 * ES UN RESPALDO. Quien llama es <useLeadSubmit>, que ignora el resultado y
 * manda al usuario a WhatsApp pase lo que pase. Que esto devuelva 500 no le
 * cuesta el lead a nadie; que bloquee, sí. De ahí que los errores se registren
 * en el servidor y se respondan rápido.
 *
 * PROTECCIÓN ANTI-BOT, en tres capas y sin dependencias externas:
 *   1. honeypot   campo trampa, en `lib/bot-trap`
 *   2. time-trap  mínimo de segundos entre montar el formulario y enviarlo,
 *                 mismo módulo
 *   3. rate limit por IP, en `lib/rate-limit`, donde está explicado por qué en
 *                 serverless hacen falta dos contadores y qué se le escapa a
 *                 cada uno
 * Las tres registran en el log lo que descartan, con motivo, para poder medir
 * si están parando bots o personas. Buscar `[lead] descartado`.
 */

/** Sin caché y siempre en el servidor: cada envío es un efecto secundario. */
export const dynamic = "force-dynamic";

/**
 * Acuse de recibo al cliente. SÓLO cotizador, y NUNCA lanza.
 *
 * NO PUEDE ROMPER NADA, que es su requisito principal: el aviso interno es el
 * registro del lead y la pantalla de confirmación del usuario depende de aquél,
 * no de éste. Si Resend rechaza este correo —dirección que rebota, cuota,
 * cualquier cosa— se anota en el log y el flujo sigue como si no existiera.
 *
 * NO SE LLEGA AQUÍ CON UN ENVÍO DESCARTADO. Esta función se llama al final del
 * handler, después de que el honeypot, el time-trap y `parseLead` hayan
 * devuelto por su cuenta; un envío que caiga en cualquiera de los tres sale del
 * handler antes, así que jamás se manda un acuse a la dirección inventada de un
 * bot. El `buildReplyTo` de abajo es el último filtro: sin correo válido no hay
 * a quién escribir y no se intenta.
 */
async function enviarAcuse(resend: Resend, lead: Lead): Promise<void> {
  if (lead.formulario !== "cotizador") return;

  /**
   * UN LEAD MARCADO NO RECIBE ACUSE, y esto es una decisión aparte de "marcar
   * en vez de descartar", no una consecuencia de ella.
   *
   * El aviso interno llega igual porque lo lee una persona que puede juzgar. El
   * acuse es distinto: es correo SALIENTE hacia una dirección que, si el envío
   * era de un bot, probablemente sea falsa, robada o una trampa de spam. Mandar
   * ahí desde el dominio verificado castiga su reputación de envío, o sea la
   * entregabilidad de TODOS los correos del sitio, incluidos los avisos que sí
   * importan.
   *
   * Lo que se pierde si el marcado era un cliente real: se queda sin el correo
   * automático. No sin respuesta — el equipo tiene su solicitud delante y la
   * nota del cuerpo le dice justamente que lo contacte si el lead tiene sentido.
   */
  if (lead.flagged) {
    console.info(
      "[lead] acuse omitido: el envío está marcado por el filtro anti-bot.",
    );
    return;
  }

  const destino = buildReplyTo(lead);
  if (!destino) return;

  try {
    const { error } = await resend.emails.send({
      from: leadFrom(),
      to: destino,
      /**
       * RESPONDER LE ESCRIBE A VENTAS, no a este buzón. Es la misma lista que
       * acaba de recibir el aviso interno, así que si el cliente contesta el
       * acuse —y contestan— la respuesta cae en la bandeja de la gente que ya
       * tiene su solicitud delante, en vez de en `leads@`, que nadie lee.
       *
       * Va la lista ENTERA y no una sola dirección a propósito: quien conteste
       * llega a las mismas personas que el aviso original, sin depender de que
       * una concreta esté disponible.
       */
      replyTo: leadRecipients("cotizador"),
      subject: ACK_SUBJECT,
      html: buildAckHtml(lead),
      text: buildAckText(lead),
    });

    if (error) {
      console.error("[lead] no se pudo enviar el acuse al cliente:", error);
      return;
    }

    console.info("[lead] acuse enviado al cliente");
  } catch (thrown) {
    console.error("[lead] error inesperado al enviar el acuse:", thrown);
  }
}

/** Respuesta con la cookie del limitador adjunta, si la hay. */
function respond(
  body: Record<string, unknown>,
  status: number,
  setCookie?: string,
): Response {
  const headers = new Headers();
  if (setCookie) headers.set("Set-Cookie", setCookie);
  return Response.json(body, { status, headers });
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  // VA PRIMERO porque es lo más barato que hay: una comparación de números
  // antes de leer el cuerpo. A quien está en bucle no se le parsea el JSON.
  const rate = checkLeadRate(request, ip);
  if (rate.limited) {
    console.warn(`[lead] descartado (rate-limit) ip=${ip}: ${rate.reason}`);
    return respond({ error: "Demasiados envíos." }, 429, rate.setCookie);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond({ error: "JSON inválido." }, 400, rate.setCookie);
  }

  const campos = (body ?? {}) as Record<string, unknown>;
  const trampa = inspectSubmission({
    honeypot: campos.website,
    elapsedMs: campos.elapsedMs,
  });

  const origen =
    typeof campos.formulario === "string" ? campos.formulario : "desconocido";

  /**
   * TIME-TRAP -> DESCARTA. No hay falso positivo que temer: el cliente espera
   * lo que falte antes de enviar (ver `useLeadSubmit`), así que una persona no
   * llega aquí por rápida. Se devuelve un 400 de verdad y no un 200 fingido
   * porque si algún caso raro rozara a alguien —un reloj imposible, un
   * `elapsedMs` que se pierde—, fingir éxito significaría tragarse su solicitud
   * sin que nadie se entere jamás. Con el error, el formulario pinta su
   * pantalla de "no pudimos registrar su solicitud" con el botón de reintentar,
   * y el reintento SÍ pasa: el tiempo se mide desde que se montó el formulario.
   */
  if (trampa.discard) {
    console.warn(
      `[lead] descartado (${trampa.discard.reason}) formulario=${origen} ip=${ip}: ${trampa.discard.detail}`,
    );
    return respond({ error: "Envío no válido." }, 400, rate.setCookie);
  }

  /**
   * HONEYPOT -> MARCA, y el envío sigue su curso.
   *
   * Antes esto respondía un 200 fingido y tiraba el lead. El razonamiento era
   * que sólo un bot puede rellenar un campo invisible, no tabulable y fuera del
   * árbol de accesibilidad, y sigue siendo cierto EN CASI TODOS LOS CASOS. El
   * problema es el caso que falta: un gestor de contraseñas autorrellenando el
   * campo de un cliente real. Ahí el coste de equivocarse no era simétrico —un
   * correo de spam que alguien borra frente a una venta perdida sin rastro— así
   * que ahora el lead llega igual, con el asunto marcado y una nota en el
   * cuerpo que le explica al equipo qué mirar antes de borrarlo.
   *
   * El log NO cambia: mismo motivo, mismo formulario de origen y el LARGO del
   * contenido, nunca el contenido.
   */
  if (trampa.flagged) {
    console.warn(
      `[lead] marcado (honeypot) formulario=${origen} ip=${ip}: ${trampa.flagged.detail}`,
    );
  }

  const parsed = parseLead(body);
  if (!parsed.ok) {
    // Se registra pero no se detalla en la respuesta más de lo necesario: al
    // cliente le da igual y al abusador no hay por qué darle pistas.
    console.warn("[lead] payload rechazado:", parsed.error);
    return respond({ error: parsed.error }, 400, rate.setCookie);
  }

  const apiKey = process.env.RESEND_KEY;
  if (!apiKey) {
    // No es culpa de quien envía el formulario: es configuración que falta.
    console.error(
      "[lead] falta RESEND_KEY en el entorno; no se envió el correo de respaldo.",
    );
    return respond({ error: "Envío no configurado." }, 503, rate.setCookie);
  }

  // El cliente se instancia aquí y no en el módulo para que la ausencia de la
  // clave no reviente en tiempo de build ni en el arranque del proceso.
  const resend = new Resend(apiKey);

  // La marca se pega aquí y no en `parseLead`: esa función valida la forma de
  // los datos y no sabe nada de trampas. Desde este punto, el asunto y el
  // cuerpo se marcan solos.
  const lead: Lead = trampa.flagged
    ? { ...parsed.lead, flagged: true }
    : parsed.lead;

  /**
   * EL ACUSE ARRANCA EN PARALELO con el aviso interno, no después. Son dos
   * correos independientes y encadenarlos le sumaría al usuario el tiempo de
   * los dos mientras mira "Enviando…"; así el envío cuesta lo que el más lento
   * de los dos y no la suma.
   *
   * La promesa NO se espera aquí sino en el `finally`, y esa parte no es
   * estética: en serverless la función puede congelarse en cuanto se devuelve
   * la respuesta, así que un correo lanzado y no esperado es un correo que a
   * veces sale y a veces no. Esperarlo en `finally` garantiza que termina pase
   * lo que pase con el interno, sin que su resultado toque la respuesta.
   */
  const acuse = enviarAcuse(resend, lead);

  /**
   * El CRM, también en paralelo y también sin poder romper nada. `sendToCrm` no
   * lanza jamás: sus fallos —CRM caído, timeout, variable sin configurar— se
   * quedan en el log. El correo sale igual y el usuario ve su confirmación
   * igual, porque quien decide la respuesta es el envío de abajo y sólo él.
   */
  const crm = sendToCrm(lead);

  try {
    const { data, error } = await resend.emails.send({
      from: leadFrom(),
      // POR ORIGEN: el registro de proveedores tiene su propia lista y no
      // pasa por la bandeja comercial. Ver `RECIPIENTS_ENV` en lead-email.
      to: leadRecipients(lead.formulario),
      // Para que el equipo conteste al prospecto directo desde el correo.
      replyTo: buildReplyTo(lead),
      subject: buildSubject(lead),
      html: buildHtml(lead),
      text: buildText(lead),
    });

    if (error) {
      // El SDK devuelve el fallo en `error` en vez de lanzarlo. El caso más
      // probable aquí es un 403 por dominio sin verificar en Resend.
      console.error("[lead] Resend rechazó el envío:", error);
      return respond({ error: "No se pudo enviar." }, 502, rate.setCookie);
    }

    console.info("[lead] correo de respaldo enviado:", data?.id);
    return respond({ ok: true, id: data?.id }, 200, rate.setCookie);
  } catch (thrown) {
    console.error("[lead] error inesperado al enviar el correo:", thrown);
    return respond({ error: "No se pudo enviar." }, 500, rate.setCookie);
  } finally {
    // Ninguna de las dos lanza nunca, así que este await no puede convertir un
    // 200 en una excepción ni pisar el `return` de ninguna rama: sólo retrasa
    // la respuesta lo que falte para que las dos salidas terminen de verdad.
    // Esperarlas es obligatorio en serverless: la función puede congelarse en
    // cuanto se devuelve la respuesta, y un envío lanzado y no esperado es un
    // envío que a veces sale y a veces no.
    await Promise.all([acuse, crm]);
  }
}
