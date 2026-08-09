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
  size = "sm",
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
  /**
   * - `sm`    14px con `px-4 py-1.5`. Es el de todo el sitio y el que había
   *           antes de que existiera este prop.
   * - `compacto` baja a 12px y aprieta el padding POR DEBAJO DE `md`, y vuelve
   *           a `sm` exacto de ahí en adelante — o sea que no cambia nada en
   *           escritorio.
   *
   * Existe por un eyebrow concreto: el de /importaciones-a-mexico, con 66
   * caracteres, es de largo el más largo del sitio y en un teléfono ocupa dos
   * líneas SIEMPRE. Ver la nota de <ImportHero>: no hay tamaño al que quepa en
   * una, así que lo único que queda por hacer es que esas dos líneas pesen
   * menos. Para los eyebrow de una línea este prop no aporta nada.
   */
  size?: "sm" | "compacto";
  /** Va en el <p> contenedor: alineación y margen inferior los pone quien lo usa. */
  className?: string;
}) {
  const TONES = {
    light: "bg-brand-100 text-brand-900",
    dark: "bg-white/10 text-brand-50",
    tint: "bg-white text-brand-900",
  } as const;

  // El contraste no depende del tamaño: son los mismos pares de color, y a
  // 12px el texto sigue siendo "pequeño" para WCAG (el umbral de texto grande
  // son 18.66px en negrita), así que el listón aplicable no se mueve.
  const SIZES = {
    sm: "px-4 py-1.5 text-sm",
    compacto: "px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm",
  } as const;

  return (
    <p className={className}>
      <span
        className={`inline-block rounded-full font-semibold ${SIZES[size]} ${TONES[tone]}`}
      >
        {children}
      </span>
    </p>
  );
}
