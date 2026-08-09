/**
 * Identificadores de medición y envío de eventos. Un solo sitio para editarlos.
 *
 * El ID de GTM NO es un secreto: viaja en el HTML de cualquier sitio que use
 * el contenedor, así que `NEXT_PUBLIC_` es correcto aquí — al revés que la
 * RESEND_KEY, que jamás debe llevar ese prefijo. Se deja el valor por defecto
 * para que el sitio funcione sin configurar nada, y la variable de entorno
 * permite apuntar a otro contenedor (por ejemplo uno de pruebas) sin tocar
 * código.
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-KWVGFV7";

/**
 * Parámetros de un evento. Todo va como texto plano: lo que se empuja al
 * `dataLayer` son valores que GTM lee tal cual, y `undefined` se descarta en
 * vez de viajar (ver `pushEvent`).
 */
export type EventParams = Record<string, string | undefined>;

/**
 * Empuja un evento al `dataLayer`.
 *
 * NO INICIALIZA EL DATALAYER, y es a propósito. Quien lo crea es el script de
 * arranque de `lib/consent` —etiqueta cruda al principio del <body>, antes de
 * cualquier hidratación—, así que para cuando esta función puede ejecutarse el
 * array ya existe. Crearlo aquí sólo serviría para tapar el caso en que ese
 * bootstrap no corrió, y ese caso no es un evento que salvar: es que Consent
 * Mode no fijó su estado por defecto, o sea el escenario en el que MENOS se
 * quiere estar mandando nada.
 *
 * NUNCA LANZA. Se comprueba `window` —esto también se importa desde módulos que
 * el servidor evalúa— y que el `dataLayer` sea de verdad un array antes de
 * tocarlo, y el push va en try/catch. Medir no puede romper el flujo que mide:
 * el disparo vive dentro del envío de un formulario, y una excepción aquí le
 * costaría al usuario su pantalla de confirmación.
 *
 * `event` es la clave reservada con la que GTM dispara sus activadores; el
 * resto de parámetros se copian al mismo nivel para que se puedan leer como
 * variables de capa de datos.
 */
export function pushEvent(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;

  const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (!Array.isArray(dataLayer)) return;

  const payload: Record<string, string> = { event };
  for (const [key, value] of Object.entries(params)) {
    // Se omiten los ausentes en vez de mandarlos vacíos: en los informes, un
    // parámetro que no llega se agrupa aparte de uno que llega en blanco, y lo
    // segundo mentiría sobre lo que el usuario llenó. La cadena vacía cuenta
    // como ausente — es lo que devuelve un campo opcional sin tocar.
    if (value === undefined || value === "") continue;
    payload[key] = value;
  }

  try {
    dataLayer.push(payload);
  } catch {
    // Un contenedor que reemplazó `push` por el suyo y falló no puede llevarse
    // por delante el envío del formulario.
  }
}
