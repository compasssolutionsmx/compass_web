import type { ReactNode } from "react";

/**
 * Eyebrow de sección en formato pastilla. Tratamiento único para todo el sitio:
 * antes cada sección lo resolvía con sus propias clases y el resultado era
 * inconsistente (unas en versales, otras en caja mixta, tracking distinto).
 *
 * Caja mixta en todos, que era lo mayoritario.
 *
 * CONTRASTE del texto sobre la pastilla:
 *   light  brand-900 sobre brand-100   12.82:1
 *   dark   brand-50  sobre white/10    12.32:1 en brand-950,
 *                                       6.00:1 en el peor frame del video
 *   tint   brand-900 sobre blanco      15.07:1
 * Los tres pasan AA y AAA sobre fondo sólido. El `light` usa brand-100 y no
 * brand-50 porque el 50 contra el blanco de sección queda en 1.09:1 y la
 * pastilla no se distinguiría del fondo.
 */
export default function Eyebrow({
  children,
  tone = "light",
  className = "",
}: {
  children: ReactNode;
  /**
   * - `light` sobre el blanco de página (por defecto)
   * - `dark`  sobre brand-950 o sobre el video del hero
   * - `tint`  sobre una caja brand-100: ahí el pill `light` sería del mismo
   *           color que la caja y desaparecería, así que se invierte a blanco.
   */
  tone?: "light" | "dark" | "tint";
  /** Va en el <p> contenedor: alineación y margen inferior los pone quien lo usa. */
  className?: string;
}) {
  const TONES = {
    light: "bg-brand-100 text-brand-900",
    dark: "bg-white/10 text-brand-50",
    tint: "bg-white text-brand-900",
  } as const;

  return (
    <p className={className}>
      <span
        className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${TONES[tone]}`}
      >
        {children}
      </span>
    </p>
  );
}
