import "server-only";

/**
 * Correo de aviso de lead: destinatarios, validación y maquetado.
 *
 * SÓLO SERVIDOR. El `import "server-only"` es la red de seguridad: si alguien
 * importa este módulo desde un componente de cliente, el build falla en vez de
 * filtrar la configuración —y, por arrastre, la clave de Resend— al bundle del
 * navegador.
 *
 * ESTE CORREO ES UN RESPALDO, no el canal principal. El formulario sigue
 * mandando al usuario a WhatsApp; esto existe para que el lead no se pierda si
 * esa conversación nunca llega a empezar.
 *
 * VARIABLES DE ENTORNO:
 *   RESEND_KEY        obligatoria. Secreta: NUNCA prefijarla con NEXT_PUBLIC_.
 *   LEAD_RECIPIENTS   destinatarios, separados por coma. Es la fuente de verdad;
 *                     la lista del código sólo actúa de red y se avisa a gritos
 *                     en el log cuando toca usarla.
 *   LEAD_EMAIL_FROM   remitente. Opcional: si falta se usa el de abajo.
 */

import { requestTypeLabel } from "./request-types";

/**
 * Lista de RESPALDO, para que un entorno mal configurado no se trague los
 * leads en silencio. La lista buena es `LEAD_RECIPIENTS`; ésta sólo entra si
 * aquélla falta, y cuando entra deja rastro en el log.
 */
const FALLBACK_RECIPIENTS = [
  "hola@scndal.com",
  "michel.l@scndal.com",
  "mkt@compasssolutions.com.mx",
  "andrea.r@scndal.com",
  "andrea.m@scndal.com",
  "gmartinez@compasssolutions.com.mx",
];

/**
 * Remitente. El dominio está verificado en Resend (confirmado por el cliente),
 * que es lo que la API exige para entregar: desde un dominio sin verificar
 * responde 403 y no sale nada.
 */
const DEFAULT_FROM = "Compass Solutions <leads@compasssolutions.com.mx>";

/**
 * Destinatarios desde `LEAD_RECIPIENTS`.
 *
 * Los dos caminos que no son el feliz gritan en el log en vez de dejar el
 * problema enterrado, porque el síntoma de este fallo es justamente que NO pasa
 * nada visible: el usuario se va a WhatsApp tan contento y el aviso nunca llega
 * a nadie.
 *
 *   - variable ausente o vacía  -> se usa la lista de respaldo del código
 *   - direcciones con mala pinta -> se descartan una a una, y el resto se manda
 *
 * Lo segundo importa más de lo que parece: Resend rechaza el envío ENTERO si
 * una sola dirección viene mal formada, así que un typo en la variable dejaría
 * sin correo también a los cinco destinatarios buenos. Mejor perder al del typo
 * —anotado en el log— que perderlos a todos.
 */
export function leadRecipients(): string[] {
  const raw = process.env.LEAD_RECIPIENTS;

  const candidatos = (raw ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  if (candidatos.length === 0) {
    console.error(
      "[lead] LEAD_RECIPIENTS no está definida o vino vacía. Se usa la lista de respaldo del código; revisar la configuración del entorno.",
    );
    return FALLBACK_RECIPIENTS;
  }

  const validos = candidatos.filter(isEmail);
  const descartados = candidatos.filter((address) => !isEmail(address));

  if (descartados.length > 0) {
    console.error(
      `[lead] LEAD_RECIPIENTS trae direcciones inválidas que se descartaron: ${descartados.join(", ")}`,
    );
  }

  if (validos.length === 0) {
    console.error(
      "[lead] ninguna dirección de LEAD_RECIPIENTS era válida. Se usa la lista de respaldo del código.",
    );
    return FALLBACK_RECIPIENTS;
  }

  return validos;
}

export function leadFrom(): string {
  return process.env.LEAD_EMAIL_FROM?.trim() || DEFAULT_FROM;
}

/* ─────────────────────────── Contrato del payload ───────────────────────── */

export type LeadSource = "cotizador" | "whatsapp";

export type Lead = {
  formulario: LeadSource;
  datos: Record<string, string>;
};

/** Tope de tamaño por campo. Un lead legítimo no se acerca ni de lejos. */
const MAX_LARGO_VALOR = 2000;
const MAX_CAMPOS = 30;

/**
 * Etiquetas y ORDEN de los campos en el correo, por formulario. El orden del
 * array es el orden en que se leen en el inbox, así que va de lo que identifica
 * al prospecto a lo accesorio.
 *
 * Un campo que no esté en esta lista NO se descarta: se pinta al final con su
 * nombre crudo. Es a propósito — si mañana un formulario añade un campo y nadie
 * actualiza esto, el dato llega igual aunque sea feo, en vez de perderse.
 */
const FIELD_LABELS: Record<LeadSource, [string, string][]> = {
  cotizador: [
    ["tipo", "Tipo de servicio"],
    ["sub", "Ruta / modalidad"],
    ["origen", "Origen"],
    ["destino", "Destino"],
    ["fecha", "Fecha estimada"],
    ["descripcion", "Descripción"],
    ["detalles", "Detalles"],
    ["nombre", "Nombre"],
    ["empresa", "Empresa"],
    ["correo", "Correo"],
    ["telefono", "Teléfono"],
  ],
  whatsapp: [
    ["nombre", "Nombre"],
    ["correo", "Correo"],
    ["telefono", "Teléfono"],
    ["tipo", "Tipo de servicio"],
    ["mensaje", "Mensaje"],
  ],
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  cotizador: "Cotizador (formulario de 4 pasos)",
  whatsapp: "Modal rápido de WhatsApp",
};

/**
 * Validación DE SERVIDOR. No se confía en la del cliente: este endpoint es
 * público y cualquiera puede llamarlo con lo que quiera.
 *
 * Deliberadamente permisiva con QUÉ campos llegan —los formularios evolucionan—
 * y estricta con la FORMA: tipos, tamaños y que haya al menos una vía de
 * contacto. Un lead sin correo ni teléfono no le sirve a nadie y es la firma
 * típica de un bot tanteando el endpoint.
 */
export function parseLead(
  body: unknown,
): { ok: true; lead: Lead } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Cuerpo inválido." };
  }

  const raw = body as Record<string, unknown>;

  // Honeypot: un campo que ningún humano ve ni llena. Si viene con algo, es un
  // bot rellenando todos los inputs del formulario.
  if (typeof raw.hp === "string" && raw.hp.trim() !== "") {
    return { ok: false, error: "Descartado." };
  }

  const formulario = raw.formulario;
  if (formulario !== "cotizador" && formulario !== "whatsapp") {
    return { ok: false, error: "Formulario desconocido." };
  }

  if (typeof raw.datos !== "object" || raw.datos === null) {
    return { ok: false, error: "Faltan los datos del formulario." };
  }

  const entries = Object.entries(raw.datos as Record<string, unknown>);
  if (entries.length > MAX_CAMPOS) {
    return { ok: false, error: "Demasiados campos." };
  }

  const datos: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value !== "string") {
      return { ok: false, error: `El campo ${key} no es texto.` };
    }
    if (value.length > MAX_LARGO_VALOR) {
      return { ok: false, error: `El campo ${key} es demasiado largo.` };
    }
    datos[key] = value.trim();
  }

  const correo = datos.correo;
  if (correo && !isEmail(correo)) {
    return { ok: false, error: "El correo no tiene un formato válido." };
  }
  if (!correo && !datos.telefono) {
    return { ok: false, error: "Hace falta un correo o un teléfono." };
  }

  return { ok: true, lead: { formulario, datos } };
}

/** Comprobación deliberadamente laxa: descarta basura, no valida buzones. */
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/* ──────────────────────────────── Maquetado ─────────────────────────────── */

/** Hora de Ciudad de México: es donde está el equipo que lee estos correos. */
function stamp(): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date());
}

/** Campos en orden de lectura, ya con etiqueta y con `tipo` traducido. */
function orderedFields(lead: Lead): [string, string][] {
  const known = FIELD_LABELS[lead.formulario];
  const used = new Set<string>();
  const rows: [string, string][] = [];

  for (const [key, label] of known) {
    const value = lead.datos[key];
    used.add(key);
    if (!value) continue;
    rows.push([
      label,
      key === "tipo" ? (requestTypeLabel(value) ?? value) : value,
    ]);
  }

  // Lo que no estaba previsto, al final y con su nombre crudo.
  for (const [key, value] of Object.entries(lead.datos)) {
    if (used.has(key) || !value) continue;
    rows.push([key, value]);
  }

  return rows;
}

export function buildSubject(lead: Lead): string {
  if (lead.formulario === "cotizador") {
    const tipo = requestTypeLabel(lead.datos.tipo) ?? "Sin tipo";
    return `Nueva cotización — ${tipo}`;
  }
  return `Nuevo contacto WhatsApp — ${lead.datos.nombre || "sin nombre"}`;
}

/** El correo del prospecto, para que "Responder" le escriba a él. */
export function buildReplyTo(lead: Lead): string | undefined {
  const correo = lead.datos.correo;
  return correo && isEmail(correo) ? correo : undefined;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * HTML con estilos EN LÍNEA y una tabla de dos columnas. No se usan clases ni
 * `<style>` porque Gmail y Outlook los recortan; tampoco flex ni grid, que en
 * Outlook no existen. Es feo de escribir y es lo que se ve bien en todas partes.
 */
export function buildHtml(lead: Lead): string {
  const rows = orderedFields(lead)
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px 10px 0;vertical-align:top;color:#64748b;font-size:13px;white-space:nowrap;">${escapeHtml(label)}</td>
        <td style="padding:10px 0;vertical-align:top;color:#012a3a;font-size:15px;font-weight:600;">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;">
    <tr>
      <td style="padding:24px 28px;border-bottom:1px solid #e2e8f0;background:#012a3a;border-radius:12px 12px 0 0;">
        <div style="color:#ffffff;font-size:18px;font-weight:700;">${escapeHtml(buildSubject(lead))}</div>
        <div style="color:#b3d0dc;font-size:13px;margin-top:6px;">${escapeHtml(SOURCE_LABELS[lead.formulario])} · ${escapeHtml(stamp())}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 28px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">${rows}</table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.5;">
        Aviso automático del sitio compasssolutions.com.mx. Es un respaldo: el
        prospecto fue enviado a WhatsApp al terminar el formulario, pero puede
        que nunca haya mandado el mensaje.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Alternativa en texto plano. Va siempre: mejora la entregabilidad. */
export function buildText(lead: Lead): string {
  const rows = orderedFields(lead)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return [
    buildSubject(lead),
    `${SOURCE_LABELS[lead.formulario]} · ${stamp()}`,
    "",
    rows,
    "",
    "Aviso automático del sitio compasssolutions.com.mx. Es un respaldo: el prospecto fue enviado a WhatsApp al terminar el formulario, pero puede que nunca haya mandado el mensaje.",
  ].join("\n");
}
