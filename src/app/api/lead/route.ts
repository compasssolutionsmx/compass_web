import { after } from "next/server";
import { Resend } from "resend";
import {
  ACK_SUBJECT,
  buildAckHtml,
  buildAckText,
  buildCrmAlertHtml,
  buildCrmAlertSubject,
  buildCrmAlertText,
  crmAlertRecipients,
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
/**
 * Tope del acuse. Se eligió POR ENCIMA del peor caso observado (14.43 s en el
 * envío del 09:06), no por debajo: cortar antes de eso mataría acuses que iban
 * a salir bien. Como ya no bloquea al usuario, lo único que acota es cuánto
 * puede seguir viva la función, o sea el cómputo que se paga.
 *
 * Se espera que nunca se alcance: al correr DESPUÉS de la respuesta, este envío
 * ya no compite con el correo interno contra Resend, que es la explicación más
 * probable de aquellos 14 s.
 */
const ACUSE_TIMEOUT_MS = 20_000;

/**
 * `signal` NO figura en el tipo `PostOptions` del SDK, pero SÍ llega al `fetch`:
 * `post()` hace `{ method, body, ...options, headers }` y se lo pasa entero a
 * `fetchRequest`. Verificado a mano contra el SDK 6.18.1 apuntándolo a un
 * servidor local de 14 s: con `AbortSignal.timeout(2000)` cortó a los 2.007 s.
 *
 * SE ELIGIÓ `signal` Y NO `Promise.race`, y la diferencia importa aquí:
 *   - `signal` CANCELA la petición de verdad y devuelve un resultado
 *     determinista que se puede registrar.
 *   - `Promise.race` sólo deja de esperar; la petición sigue viva. Al volver del
 *     callback de `after()`, Vercel puede congelar la función y matarla a mitad,
 *     con lo que el log diría "timeout" sin saber si el correo salió o no. Un
 *     registro que miente es peor que no tenerlo.
 * Si una versión futura del SDK dejara de reenviar `options`, esto degrada a
 * "sin timeout" —la función vive más y el correo igual sale—, nunca a perder
 * nada.
 */
type SendOptions = Parameters<Resend["emails"]["send"]>[1];

async function enviarAcuse(
  resend: Resend,
  lead: Lead,
  leadId: string,
): Promise<void> {
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
      `[lead] acuse omitido id=${leadId} motivo=marcado-por-filtro-anti-bot`,
    );
    return;
  }

  const destino = buildReplyTo(lead);
  if (!destino) {
    console.warn(`[lead] acuse omitido id=${leadId} motivo=sin-correo-valido`);
    return;
  }

  const signal = AbortSignal.timeout(ACUSE_TIMEOUT_MS);

  try {
    const { error } = await resend.emails.send(
      {
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
      },
      { signal } as SendOptions,
    );

    if (error) {
      // `signal.aborted` y NO el texto del error: cuando el timeout salta, el
      // SDK devuelve un `application_error` genérico ("Unable to fetch data")
      // indistinguible de un fallo de red. El estado del signal sí lo
      // distingue, y sin adivinar leyendo mensajes que pueden cambiar.
      const motivo = signal.aborted
        ? `timeout-${ACUSE_TIMEOUT_MS}ms`
        : `resend:${error.name}:${error.message}`;
      console.error(
        `[lead] ACUSE FALLIDO id=${leadId} destino=${destino} motivo=${motivo}`,
      );
      return;
    }

    console.info(`[lead] acuse enviado id=${leadId}`);
  } catch (thrown) {
    console.error(
      `[lead] ACUSE FALLIDO id=${leadId} destino=${destino} motivo=excepcion`,
      thrown,
    );
  }
}

/**
 * Tope del aviso de fallo del CRM. Más corto que el del acuse a propósito: si
 * Resend está lento o caído, este correo es lo ÚLTIMO que queda vivo de la
 * invocación, y alargarlo sólo estira la función sin ganar nada. Diez segundos
 * son de sobra para un envío que normalmente tarda menos de uno.
 */
const ALERTA_TIMEOUT_MS = 10_000;

/**
 * Avisa por correo de que un lead no llegó al CRM.
 *
 * ─── POR QUÉ NO PUEDE ROMPER NADA ─────────────────────────────────────────
 *
 * Corre dentro de `after()`, o sea después de que el usuario ya recibió su
 * confirmación. Un fallo aquí no puede tocar esa respuesta, pero sí podría
 * dejar la función colgada o tumbar el callback, así que lleva su propio
 * try/catch y su propio `AbortSignal.timeout`, igual que el acuse.
 *
 * ─── POR QUÉ NO HAY BUCLE ─────────────────────────────────────────────────
 *
 * El caso incómodo es evidente: si el aviso viaja por Resend y Resend está
 * caído, el aviso también falla. La salida es que ESTE fallo sólo se registra
 * en el log y no dispara nada más. No hay reintentos, no se llama a sí misma y
 * no existe ninguna ruta desde su propio error de vuelta a esta función. Un
 * fallo del CRM produce como mucho UN intento de aviso, y si ese intento falla,
 * una línea de log y punto.
 *
 * Cuando Resend está caído, además, el correo interno también habría fallado
 * antes: la respuesta habría sido 502 y `after()` ni siquiera se habría
 * programado. O sea que este escenario sólo se da si Resend cae ENTRE el correo
 * interno y este aviso, ventana de unos segundos.
 */
async function enviarAlertaCrm(
  resend: Resend,
  lead: Lead,
  leadId: string,
  motivo: string,
): Promise<void> {
  const signal = AbortSignal.timeout(ALERTA_TIMEOUT_MS);

  try {
    const { error } = await resend.emails.send(
      {
        from: leadFrom(),
        to: crmAlertRecipients(),
        subject: buildCrmAlertSubject(lead, leadId),
        html: buildCrmAlertHtml(lead, leadId, motivo),
        text: buildCrmAlertText(lead, leadId, motivo),
      },
      { signal } as SendOptions,
    );

    if (error) {
      // ÚLTIMO ESLABÓN: aquí ya no queda a quién avisar por correo, así que el
      // log es la única constancia. Se marca bien fuerte porque significa que
      // un lead se quedó fuera del CRM Y nadie recibió el aviso.
      console.error(
        `[crm] ALERTA NO ENVIADA id=${leadId} motivoOriginal=${motivo} motivoAlerta=${
          signal.aborted ? `timeout-${ALERTA_TIMEOUT_MS}ms` : error.name
        }`,
      );
      return;
    }

    console.info(`[crm] alerta de fallo enviada id=${leadId}`);
  } catch (thrown) {
    console.error(
      `[crm] ALERTA NO ENVIADA id=${leadId} motivoOriginal=${motivo} motivoAlerta=excepcion`,
      thrown,
    );
  }
}

/* ─────────────────────────── Instrumentación ─────────────────────────────── */

/**
 * INSTRUMENTACIÓN TEMPORAL para medir de dónde salen los 4-6 s que tarda el
 * envío. No cambia ningún comportamiento: sólo toma tiempos y escribe una línea
 * por petición. Cuando el reparto esté decidido, esto se puede quitar entero o
 * dejarse — cuesta cuatro `Date.now()` y un `console.info`.
 *
 * Buscar `[perf][lead]` en los logs de Vercel.
 */

/**
 * Momento en que se evaluó ESTE MÓDULO. Junto con `process.uptime()` da el
 * coste del arranque en frío visto desde dentro: `uptime` cubre el arranque del
 * proceso Node y la carga de Next, y la resta contra esta marca dice cuánto
 * pasó entre que el módulo quedó listo y llegó la primera petición.
 *
 * Ninguno de los dos ve el arranque del contenedor, que la función no puede
 * observar; para eso está la duración que reporta el propio panel de Vercel.
 */
const MODULO_CARGADO_EN = Date.now();
let invocaciones = 0;

/**
 * Cronometra una promesa DESDE SU CREACIÓN. Toma un thunk y no una promesa ya
 * hecha porque el acuse y el CRM arrancan antes de que se espere al correo
 * interno: medir desde el `await` daría casi cero y escondería justo lo que se
 * quiere ver.
 */
function medido<T>(fn: () => Promise<T>): [Promise<T>, () => number] {
  const inicio = Date.now();
  let ms = -1;
  const promesa = fn().finally(() => {
    ms = Date.now() - inicio;
  });
  return [promesa, () => ms];
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
  const t0 = Date.now();
  const frio = invocaciones === 0;
  const arranqueMs = frio ? Math.round(process.uptime() * 1000) : 0;
  const desdeModuloMs = frio ? t0 - MODULO_CARGADO_EN : 0;
  invocaciones += 1;

  const ip = clientIp(request);

  // VA PRIMERO porque es lo más barato que hay: una comparación de números
  // antes de leer el cuerpo. A quien está en bucle no se le parsea el JSON.
  const tRate = Date.now();
  const rate = checkLeadRate(request, ip);
  const rateMs = Date.now() - tRate;
  if (rate.limited) {
    console.warn(`[lead] descartado (rate-limit) ip=${ip}: ${rate.reason}`);
    return respond({ error: "Demasiados envíos." }, 429, rate.setCookie);
  }

  const tParse = Date.now();
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

  const parseMs = Date.now() - tParse;

  const tInterno = Date.now();
  let internoMs = -1;

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
    internoMs = Date.now() - tInterno;

    if (error) {
      // El SDK devuelve el fallo en `error` en vez de lanzarlo. El caso más
      // probable aquí es un 403 por dominio sin verificar en Resend.
      console.error("[lead] Resend rechazó el envío:", error);
      return respond({ error: "No se pudo enviar." }, 502, rate.setCookie);
    }

    /**
     * IDENTIFICADOR DEL LEAD para todo lo que venga después. Es el id que
     * Resend le dio al aviso interno, y sirve de llave: con él se encuentra en
     * el panel de Resend el correo que lleva TODOS los datos del prospecto. Por
     * eso los logs del acuse y del CRM lo llevan — si alguno falla, ese id es
     * lo que permite recuperar el lead sin volcar datos personales al log.
     */
    const leadId = data?.id ?? "sin-id";
    console.info(`[lead] correo interno enviado id=${leadId}`);

    /**
     * ─── AQUÍ SE SALE DE LA RUTA CRÍTICA ─────────────────────────────────
     *
     * El acuse y el CRM se programan con `after()`, que en Vercel se apoya en
     * `waitUntil`: la invocación sigue viva hasta que las promesas terminen,
     * así que NO es "lanzar y olvidar" — terminan de verdad. Lo que cambia es
     * que el usuario ya no los espera. En el envío que se midió, eso son 14.4 s
     * de espera que pasan a ~0.6 s.
     *
     * SÓLO SE PROGRAMA SI EL CORREO INTERNO SALIÓ BIEN, y esa condición es lo
     * que sostiene la regla de que no se pierden leads:
     *   - si el interno falla, se responde error, no se programa nada, y el
     *     usuario ve la pantalla de reintento. No queda un registro en el CRM
     *     de un lead que nadie recibió por correo.
     *   - si el interno sale, el lead YA ESTÁ ENTREGADO al equipo. A partir de
     *     ahí, todo lo que falle aquí abajo degrada el servicio pero no pierde
     *     el lead.
     * Como efecto secundario, un reintento del usuario no puede duplicar el
     * registro en el CRM sin haber duplicado también el correo interno.
     *
     * Además deja de haber dos llamadas simultáneas a Resend, que es la
     * explicación más probable de los 14 s del acuse.
     */
    after(async () => {
      const tAfter = Date.now();
      const [acuse, acuseMs] = medido(() => enviarAcuse(resend, lead, leadId));
      const [crm, crmMs] = medido(() => sendToCrm(lead, leadId));

      // `Promise.all` sobre dos promesas que no rechazan nunca: ninguna puede
      // cancelar a la otra.
      const [, resultadoCrm] = await Promise.all([acuse, crm]);

      /**
       * El aviso va DESPUÉS y sólo si el CRM falló de verdad. `omitido` no
       * cuenta: un registro de proveedor o un lead marcado por el filtro no
       * llegan al CRM por diseño, y avisar de eso sería ruido que enseña a
       * ignorar la alerta.
       */
      let alertaMs = -1;
      if (resultadoCrm.estado === "fallido") {
        const tAlerta = Date.now();
        await enviarAlertaCrm(resend, lead, leadId, resultadoCrm.motivo);
        alertaMs = Date.now() - tAlerta;
      }

      console.info(
        `[perf][lead-after] id=${leadId} acuse=${acuseMs()}ms crm=${crmMs()}ms alerta=${alertaMs}ms total=${Date.now() - tAfter}ms`,
      );
    });

    return respond({ ok: true, id: leadId }, 200, rate.setCookie);
  } catch (thrown) {
    if (internoMs < 0) internoMs = Date.now() - tInterno;
    console.error("[lead] error inesperado al enviar el correo:", thrown);
    return respond({ error: "No se pudo enviar." }, 500, rate.setCookie);
  } finally {
    /**
     * LA RUTA CRÍTICA, que ahora es sólo lo que el usuario espera de verdad:
     * arranque en frío + limitador + parseo + correo interno. El acuse y el CRM
     * ya no aparecen aquí porque ya no se esperan; salen en su propia línea,
     * `[perf][lead-after]`, con el mismo `id` para poder unirlas.
     *
     * `elapsed` es lo que el cliente tardó desde que se montó el formulario
     * hasta enviarlo, y `espera` la parte de eso que fue la pausa artificial del
     * time-trap. Los manda el navegador; se registran aquí para tener el viaje
     * entero en una sola línea.
     */
    const campos = (body ?? {}) as Record<string, unknown>;
    console.info(
      `[perf][lead] total=${Date.now() - t0}ms frio=${frio} arranque=${arranqueMs}ms desdeModulo=${desdeModuloMs}ms ` +
        `rate=${rateMs}ms parse=${parseMs}ms interno=${internoMs}ms ` +
        `| cliente elapsed=${typeof campos.elapsedMs === "number" ? campos.elapsedMs : "?"}ms espera=${typeof campos.waitedMs === "number" ? campos.waitedMs : "?"}ms`,
    );
  }
}
