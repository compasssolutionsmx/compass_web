/**
 * Opciones del selector "Tipo de Solicitud", compartidas por los dos
 * formularios y por el servidor.
 *
 * Vivían dentro de `components/useQuoteRequest.ts`, que es un módulo de
 * cliente. Se mudaron aquí para que el Route Handler que manda el correo pueda
 * traducir el slug a su etiqueta sin arrastrar código de cliente al servidor:
 * son datos puros, sin React ni DOM.
 *
 * Las etiquetas son las exactas del spec. Los `value` son slugs propuestos:
 * TODO: confirmar los valores que espera el webhook de studio.scndal.com
 * (¿slug, etiqueta literal, id numérico?) cuando llegue su spec.
 */
export const REQUEST_TYPES = [
  { value: "maritimo", label: "Marítimo" },
  { value: "aereo", label: "Aéreo" },
  { value: "terrestre", label: "Terrestre" },
  { value: "integral", label: "Integral" },
  { value: "especializado", label: "Especializado" },
  { value: "otros", label: "Otros" },
] as const;

export type RequestTypeValue = (typeof REQUEST_TYPES)[number]["value"];

/** Etiqueta legible de un slug. Devuelve el propio valor si no lo reconoce. */
export function requestTypeLabel(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  return REQUEST_TYPES.find((type) => type.value === value)?.label ?? value;
}
