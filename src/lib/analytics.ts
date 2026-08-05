/**
 * Identificadores de medición. Un solo sitio para editarlos.
 *
 * El ID de GTM NO es un secreto: viaja en el HTML de cualquier sitio que use
 * el contenedor, así que `NEXT_PUBLIC_` es correcto aquí — al revés que la
 * RESEND_KEY, que jamás debe llevar ese prefijo. Se deja el valor por defecto
 * para que el sitio funcione sin configurar nada, y la variable de entorno
 * permite apuntar a otro contenedor (por ejemplo uno de pruebas) sin tocar
 * código.
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-KWVGFV7";
