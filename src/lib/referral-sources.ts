/**
 * Opciones de "¿Cómo se enteró de nosotros?", compartidas por los dos
 * formularios que capturan leads de venta (<QuoteWizard> y <WhatsAppModal>).
 *
 * Vive en `lib` y no en un componente por la misma razón que `request-types`:
 * son datos puros, sin React ni DOM, y así el módulo puede importarse desde
 * cualquiera de los dos lados sin arrastrar código de cliente.
 *
 * EL VALOR ES LA PROPIA ETIQUETA, al revés que en `request-types`, que guarda
 * slugs. Aquí no hace falta traducir nada: lo que se elige es exactamente lo
 * que se quiere leer en el correo, y el campo admite además texto libre, que no
 * tiene slug posible. Un slug obligaría a un mapa de traducción en el servidor
 * para un dato que nadie filtra ni agrupa todavía.
 */
export const REFERRAL_SOURCES = [
  "Búsqueda en Google",
  "Redes sociales",
  "Recomendación de un cliente o conocido",
  "Ya trabajamos con Compass antes",
  "Evento o feria",
  "Contacto de un asesor de Compass",
  "Otro",
] as const;

/**
 * La opción que revela el campo de texto libre. Se deriva del array en vez de
 * escribirse otra vez para que no puedan separarse: si la última opción cambia
 * de nombre, esto la sigue.
 */
export const REFERRAL_OTHER = REFERRAL_SOURCES[REFERRAL_SOURCES.length - 1];

/** Placeholder del texto libre que aparece al elegir "Otro". */
export const REFERRAL_OTHER_PLACEHOLDER = "¿Dónde nos encontró?";

/**
 * Lo que viaja cuando el campo se deja vacío.
 *
 * NO se omite la clave. El campo es opcional, así que la mayoría de los leads
 * llegarían sin él, y `orderedFields` sólo pinta las claves que traen valor:
 * sin esto, la fila desaparecería del correo en unos envíos y aparecería en
 * otros. Mandando siempre algo, el aviso tiene el mismo formato en los dos
 * casos y quien lo lee sabe que el campo se mostró y se dejó en blanco, en vez
 * de preguntarse si el formulario lo tenía.
 */
export const REFERRAL_UNSPECIFIED = "No especificado";

/**
 * Valor definitivo del campo a partir de lo que haya en el formulario.
 *
 * Las tres salidas posibles:
 *   sin elegir              -> "No especificado"
 *   "Otro" + texto escrito  -> el texto, EN LUGAR de la palabra "Otro"
 *   "Otro" sin texto        -> "Otro"
 *
 * El tercer caso es el único que la instrucción no fijaba. Se manda "Otro" y no
 * "No especificado" porque no son lo mismo: quien eligió "Otro" sí contestó la
 * pregunta —dijo que no llegó por ninguno de los canales de la lista— y perder
 * eso convertiría una respuesta en un silencio. Es el mismo criterio que el
 * `subResuelto` del paso 2 del cotizador, que ante el "Otro" sin escribir manda
 * la palabra en vez de quedarse sin dato.
 */
export function resolveReferral(seleccion: string, textoLibre: string): string {
  if (seleccion === REFERRAL_OTHER) {
    return textoLibre.trim() || REFERRAL_OTHER;
  }
  return seleccion.trim() || REFERRAL_UNSPECIFIED;
}
