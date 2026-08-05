import { Resend } from "resend";
import {
  buildHtml,
  buildReplyTo,
  buildSubject,
  buildText,
  leadFrom,
  leadRecipients,
  parseLead,
} from "@/lib/lead-email";

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
 * TODO(seguridad): falta el reCAPTCHA — sigue pendiente su site key. Hasta que
 * llegue, lo único que protege este endpoint es el honeypot de `parseLead` y el
 * limitador de abajo, y ninguno de los dos frena a alguien que se lo proponga.
 * Cuando esté la key, verificar aquí el token antes de mandar nada.
 */

/** Sin caché y siempre en el servidor: cada envío es un efecto secundario. */
export const dynamic = "force-dynamic";

const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 5;

/**
 * Limitador por IP, en memoria del proceso.
 *
 * ES BEST-EFFORT Y HAY QUE SABERLO: en serverless cada instancia tiene su
 * propio Map, así que el límite real es "5 por minuto POR INSTANCIA", y se
 * reinicia en cada arranque en frío. Frena el goteo tonto y los envíos
 * repetidos por doble clic, no un ataque distribuido. Para eso hace falta un
 * almacén compartido (Upstash/Redis) o el WAF de Vercel, y sobre todo el
 * reCAPTCHA del TODO de arriba.
 */
const HITS = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const ahora = Date.now();
  const recientes = (HITS.get(ip) ?? []).filter(
    (marca) => ahora - marca < VENTANA_MS,
  );

  if (recientes.length >= MAX_POR_VENTANA) {
    HITS.set(ip, recientes);
    return true;
  }

  recientes.push(ahora);
  HITS.set(ip, recientes);

  // Poda: sin esto el Map crece con cada IP que pase por aquí y no baja nunca.
  if (HITS.size > 500) {
    for (const [clave, marcas] of HITS) {
      if (marcas.every((marca) => ahora - marca >= VENTANA_MS)) {
        HITS.delete(clave);
      }
    }
  }

  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "desconocida";
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return Response.json({ error: "Demasiados envíos." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = parseLead(body);
  if (!parsed.ok) {
    // Se registra pero no se detalla en la respuesta más de lo necesario: al
    // cliente le da igual y al abusador no hay por qué darle pistas.
    console.warn("[lead] payload rechazado:", parsed.error);
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const apiKey = process.env.RESEND_KEY;
  if (!apiKey) {
    // No es culpa de quien envía el formulario: es configuración que falta.
    console.error(
      "[lead] falta RESEND_KEY en el entorno; no se envió el correo de respaldo.",
    );
    return Response.json({ error: "Envío no configurado." }, { status: 503 });
  }

  // El cliente se instancia aquí y no en el módulo para que la ausencia de la
  // clave no reviente en tiempo de build ni en el arranque del proceso.
  const resend = new Resend(apiKey);
  const { lead } = parsed;

  try {
    const { data, error } = await resend.emails.send({
      from: leadFrom(),
      to: leadRecipients(),
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
      return Response.json({ error: "No se pudo enviar." }, { status: 502 });
    }

    console.info("[lead] correo de respaldo enviado:", data?.id);
    return Response.json({ ok: true, id: data?.id });
  } catch (thrown) {
    console.error("[lead] error inesperado al enviar el correo:", thrown);
    return Response.json({ error: "No se pudo enviar." }, { status: 500 });
  }
}
