import "server-only";

/**
 * Correo de aviso de lead: destinatarios, validación y maquetado.
 *
 * SÓLO SERVIDOR. El `import "server-only"` es la red de seguridad: si alguien
 * importa este módulo desde un componente de cliente, el build falla en vez de
 * filtrar la configuración —y, por arrastre, la clave de Resend— al bundle del
 * navegador.
 *
 * QUÉ ES ESTE CORREO DEPENDE DEL FORMULARIO, desde que ninguno redirige ya a
 * WhatsApp:
 *   - cotizador  es el REGISTRO PRINCIPAL del lead
 *   - whatsapp   sigue siendo un RESPALDO por si el prospecto nunca abre la
 *                conversación que se le ofrece al final
 *   - proveedor  NO ES UN LEAD DE VENTA: es una empresa ofreciéndose como
 *                proveedora desde /proveedores, y el correo lo dice en el
 *                asunto y en el pie para que no acabe en el flujo comercial
 *   - vacante    TAMPOCO ES UN LEAD: es una persona postulándose desde
 *                /vacantes, con el mismo tratamiento de asunto y pie
 * Esa diferencia se refleja en el pie de cada correo (ver SOURCE_FOOTNOTES).
 *
 * VARIABLES DE ENTORNO:
 *   RESEND_KEY          obligatoria. Secreta: NUNCA prefijarla con NEXT_PUBLIC_.
 *   LEAD_RECIPIENTS     destinatarios comerciales: cotizador y modal de
 *                       WhatsApp, los dos únicos orígenes que sí son leads. Es
 *                       la fuente de verdad; la lista del código sólo actúa de
 *                       red y se avisa a gritos en el log cuando toca usarla.
 *   PROVIDER_RECIPIENTS destinatarios del registro de proveedores.
 *   VACANCY_RECIPIENTS  destinatarios de las postulaciones a vacantes (RH).
 *                       Las dos van SEPARADAS a propósito: ver `RECIPIENTS_ENV`.
 *   LEAD_EMAIL_FROM     remitente. Opcional: si falta se usa el de abajo.
 */

import { requestTypeLabel } from "./request-types";

/**
 * Lista de RESPALDO comercial, para que un entorno mal configurado no se trague
 * los leads en silencio. La lista buena es `LEAD_RECIPIENTS`; ésta sólo entra si
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
 * Respaldo del registro de proveedores. NO comparte una sola dirección con la
 * lista comercial de arriba salvo `hola@scndal.com`, y eso es intencional: un
 * proveedor ofreciéndose no es un prospecto, y llegaba a las seis personas de
 * ventas por no tener buzón propio.
 */
const PROVIDER_FALLBACK_RECIPIENTS = [
  "pricing@compasssolutions.com.mx",
  "hola@scndal.com",
  "gmartinez@compasssolutions.com.mx",
];

/**
 * Respaldo de las postulaciones a vacantes. Un solo buzón, el de RH, y ninguna
 * dirección comercial: un CV con nombre, teléfono y correo no tiene por qué
 * pasar por la bandeja de ventas — es un dato personal de alguien que busca
 * trabajo, no un prospecto.
 */
const VACANCY_FALLBACK_RECIPIENTS = ["rh@compasssolutions.com.mx"];

/**
 * QUÉ VARIABLE DE ENTORNO manda en cada origen.
 *
 * Antes no existía este mapa: los cuatro formularios llamaban a un único
 * `leadRecipients()` y todo terminaba en `LEAD_RECIPIENTS`. La diferencia entre
 * orígenes vivía sólo en el asunto y el pie del correo, o sea que un registro de
 * proveedor llegaba igualmente a la bandeja de ventas, avisado pero presente.
 *
 * EL NOMBRE DE CADA VARIABLE SIGUE AL ORIGEN, no al departamento que la lee:
 * `proveedor` -> PROVIDER_RECIPIENTS, `vacante` -> VACANCY_RECIPIENTS. Es lo
 * que mantiene el mapa legible de un vistazo. Llamarla HR_RECIPIENTS habría
 * mezclado los dos criterios —quién recibe frente a qué se recibe— y obligaría
 * a recordar de memoria que RH es lo de vacantes; además, si mañana RH deja de
 * ser el destino, el nombre pasaría a mentir mientras que el origen no cambia.
 */
const RECIPIENTS_ENV: Record<LeadSource, string> = {
  cotizador: "LEAD_RECIPIENTS",
  whatsapp: "LEAD_RECIPIENTS",
  proveedor: "PROVIDER_RECIPIENTS",
  vacante: "VACANCY_RECIPIENTS",
};

const FALLBACK_BY_SOURCE: Record<LeadSource, string[]> = {
  cotizador: FALLBACK_RECIPIENTS,
  whatsapp: FALLBACK_RECIPIENTS,
  proveedor: PROVIDER_FALLBACK_RECIPIENTS,
  vacante: VACANCY_FALLBACK_RECIPIENTS,
};

/**
 * Remitente. El dominio está verificado en Resend (confirmado por el cliente),
 * que es lo que la API exige para entregar: desde un dominio sin verificar
 * responde 403 y no sale nada.
 */
const DEFAULT_FROM = "Compass Solutions <leads@compasssolutions.com.mx>";

/**
 * Destinatarios SEGÚN EL ORIGEN del formulario.
 *
 * Los dos caminos que no son el feliz gritan en el log en vez de dejar el
 * problema enterrado, porque el síntoma de este fallo es justamente que NO pasa
 * nada visible: quien envía el formulario ve su pantalla de confirmación tan
 * contento y el aviso nunca llega a nadie.
 *
 *   - variable ausente o vacía  -> se usa la lista de respaldo del código
 *   - direcciones con mala pinta -> se descartan una a una, y el resto se manda
 *
 * Lo segundo importa más de lo que parece: Resend rechaza el envío ENTERO si
 * una sola dirección viene mal formada, así que un typo en la variable dejaría
 * sin correo también a los destinatarios buenos. Mejor perder al del typo
 * —anotado en el log— que perderlos a todos.
 *
 * OJO: el respaldo que se usa cuando falla la variable es el DEL ORIGEN, nunca
 * el comercial. Si `PROVIDER_RECIPIENTS` no está configurada, un registro de
 * proveedor cae en `PROVIDER_FALLBACK_RECIPIENTS`, no en la lista de ventas.
 */
export function leadRecipients(source: LeadSource): string[] {
  const variable = RECIPIENTS_ENV[source];
  const respaldo = FALLBACK_BY_SOURCE[source];
  const raw = process.env[variable];

  const candidatos = (raw ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  if (candidatos.length === 0) {
    console.error(
      `[lead] ${variable} no está definida o vino vacía (origen: ${source}). Se usa la lista de respaldo del código; revisar la configuración del entorno.`,
    );
    return respaldo;
  }

  const validos = candidatos.filter(isEmail);
  const descartados = candidatos.filter((address) => !isEmail(address));

  if (descartados.length > 0) {
    console.error(
      `[lead] ${variable} trae direcciones inválidas que se descartaron: ${descartados.join(", ")}`,
    );
  }

  if (validos.length === 0) {
    console.error(
      `[lead] ninguna dirección de ${variable} era válida. Se usa la lista de respaldo del código.`,
    );
    return respaldo;
  }

  return validos;
}

export function leadFrom(): string {
  return process.env.LEAD_EMAIL_FROM?.trim() || DEFAULT_FROM;
}

/* ─────────────────────────── Contrato del payload ───────────────────────── */

export type LeadSource = "cotizador" | "whatsapp" | "proveedor" | "vacante";

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
    ["contactoPreferido", "Contacto preferido"],
  ],
  whatsapp: [
    ["nombre", "Nombre"],
    ["correo", "Correo"],
    ["telefono", "Teléfono"],
    ["tipo", "Tipo de servicio"],
    ["mensaje", "Mensaje"],
  ],
  /**
   * La empresa va PRIMERO, al revés que en los otros dos: aquí quien se
   * registra es un proveedor, y lo que identifica el registro es la compañía,
   * no la persona que llenó el formulario.
   *
   * `servicio` es texto libre del selector de la página, NO un slug de
   * `request-types`: son categorías de lo que el proveedor OFRECE, que no
   * coinciden con los tipos de solicitud del cotizador. Por eso la clave no es
   * `tipo` — si lo fuera, `orderedFields` intentaría traducirla con
   * `requestTypeLabel` y no encontraría nada.
   */
  proveedor: [
    ["empresa", "Empresa"],
    ["nombre", "Contacto"],
    ["correo", "Correo"],
    ["telefono", "Teléfono"],
    ["servicio", "Servicio que ofrece"],
    ["mensaje", "Mensaje"],
    // El consentimiento va AL FINAL y en el correo a propósito: es la única
    // constancia de que se marcó la casilla, y conviene que quede archivada en
    // el mismo sitio que los datos que ampara.
    ["consentimiento", "Consentimiento"],
  ],
  /**
   * Aquí manda la PERSONA, así que su nombre va primero —al revés que en
   * `proveedor`, donde identifica la empresa.
   *
   * `puesto` y no `tipo`, por el mismo motivo que `servicio` en proveedores:
   * `orderedFields` traduce la clave `tipo` con `requestTypeLabel`, que sólo
   * conoce los slugs del cotizador y no encontraría nada.
   */
  vacante: [
    ["nombre", "Nombre"],
    ["puesto", "Puesto de interés"],
    ["correo", "Correo"],
    ["telefono", "Teléfono"],
    ["mensaje", "Mensaje"],
  ],
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  cotizador: "Cotizador (formulario de 4 pasos)",
  whatsapp: "Modal rápido de WhatsApp",
  proveedor: "Registro de proveedores (/proveedores)",
  // Decía sólo "Vacante", que en la cabecera del correo no aclara si es una
  // oferta publicada o alguien postulándose. Los otros tres nombran el
  // formulario y su ruta; éste ahora también.
  vacante: "Postulación a vacante (/vacantes)",
};

/**
 * Pie del correo. DEPENDE DEL ORIGEN, y no es un matiz de redacción.
 *
 * El cotizador ya NO manda a nadie a WhatsApp: desde que termina en pantalla de
 * confirmación, su correo es el registro PRINCIPAL del lead. Decirle a ventas
 * que "es un respaldo" y que "el prospecto fue enviado a WhatsApp" les haría
 * suponer que la conversación ya empezó en otro lado, y no empezó.
 *
 * El modal corto sí conserva el aviso de respaldo: su razón de ser sigue siendo
 * capturar al prospecto por si nunca abre la conversación de WhatsApp.
 *
 * OJO (corregido respecto del texto anterior): ese modal TAMPOCO redirige ya de
 * forma automática — ahora ofrece el enlace en la pantalla de confirmación. La
 * frase decía "fue enviado a WhatsApp al terminar el formulario", que dejó de
 * ser cierto cuando se quitó el redirect; se ajusta a lo que de verdad pasa sin
 * perder la advertencia de que puede no haber mensaje.
 */
const SOURCE_FOOTNOTES: Record<LeadSource, string> = {
  cotizador:
    "Nueva solicitud de cotización recibida desde compasssolutions.com.mx.",
  whatsapp:
    "Aviso automático del sitio compasssolutions.com.mx. Es un respaldo: al prospecto se le ofreció continuar por WhatsApp al terminar el formulario, pero puede que nunca haya mandado el mensaje.",
  /**
   * Lo importante de este pie es la ADVERTENCIA: no es un lead de venta. Sin
   * ella, un correo con nombre, empresa y teléfono se lee igual que una
   * cotización y acaba en el mismo flujo comercial.
   */
  proveedor:
    "NO ES UNA COTIZACIÓN: es una empresa que se ofrece como proveedora de Compass Solutions, registrada desde la página /proveedores del sitio.",
  /**
   * Reescrito al rutearlo a RH. El aviso "NO ES UNA COTIZACIÓN" tenía sentido
   * cuando esto caía en la bandeja comercial y había que frenar a ventas; ahora
   * llega a quien esperaba justamente esto, y advertirle de lo que no es sobra.
   * Lo que sí le sirve a RH es qué trae el correo y qué hacer con él.
   */
  vacante:
    "Postulación de empleo recibida desde la página /vacantes de compasssolutions.com.mx. Contiene datos personales de una persona candidata: trátese conforme al aviso de privacidad. Al responder, se contesta directamente a su correo.",
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
  if (
    formulario !== "cotizador" &&
    formulario !== "whatsapp" &&
    formulario !== "proveedor" &&
    formulario !== "vacante"
  ) {
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

/**
 * Asunto. Cada origen tiene el suyo y empieza por una palabra distinta
 * ("cotización" / "contacto" / "proveedor"), que es lo único que se ve en la
 * bandeja antes de abrir: por ahí se distingue un registro de proveedor de un
 * lead comercial sin tener que leer el cuerpo.
 */
export function buildSubject(lead: Lead): string {
  if (lead.formulario === "cotizador") {
    const tipo = requestTypeLabel(lead.datos.tipo) ?? "Sin tipo";
    return `Nueva cotización — ${tipo}`;
  }
  if (lead.formulario === "vacante") {
    const puesto = lead.datos.puesto || "puesto sin especificar";
    const nombre = lead.datos.nombre || "sin nombre";
    return `Nueva postulación a vacante: ${puesto} (candidato: ${nombre})`;
  }
  if (lead.formulario === "proveedor") {
    // La empresa es lo que identifica al proveedor; el nombre de la persona
    // sólo entra si no la mandaron.
    const quien =
      lead.datos.empresa || lead.datos.nombre || "empresa sin nombre";
    // Abre con "Registro de proveedor" y no con "Nuevo proveedor interesado":
    // lo segundo se lee como una oportunidad comercial en la bandeja, que es
    // exactamente la confusión que este correo tiene que evitar.
    return `Registro de proveedor — ${quien}`;
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
        ${escapeHtml(SOURCE_FOOTNOTES[lead.formulario])}
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
    SOURCE_FOOTNOTES[lead.formulario],
  ].join("\n");
}
