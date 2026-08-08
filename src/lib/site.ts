/**
 * Constantes compartidas del sitio: datos de contacto —tomados tal cual del
 * spec estructural (compass-home-spec.html)— y las etiquetas que más de una
 * página tiene que decir igual. Un solo lugar para editarlos.
 */

/**
 * Nombre de /nosotros. Vive aquí porque lo dicen TRES sitios que no pueden
 * divergir: el enlace del nav, el <title>/Open Graph/<h1> de la propia página
 * y el enlace desde /apartado-legal. Estuvieron hardcodeados por separado y
 * nada los ataba: cambiar uno dejaba a los otros dos con el nombre viejo.
 *
 * En sentence case, como el resto de titulares del sitio. "Compañía" no es
 * nombre propio: la marca es "Compass Solutions", que sí conserva sus
 * mayúsculas donde aparece.
 */
export const NOSOTROS_LABEL = "Nuestra compañía";

/** Número de WhatsApp usado en el modal, el botón flotante y el footer. */
export const WHATSAPP_NUMBER = "525541668470";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Teléfono de ventas y soporte, formateado como aparece en el footer. */
export const SALES_PHONE_DISPLAY = "+52 55 4166 8470";

/** Link a WhatsApp, opcionalmente con un mensaje prellenado. */
export function buildWhatsAppUrl(message?: string): string {
  if (!message) return WHATSAPP_URL;
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
