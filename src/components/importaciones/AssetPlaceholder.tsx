/**
 * Marcador para los assets de la landing que todavía no existen.
 *
 * Deliberadamente NO es un gris neutro que pueda confundirse con una foto
 * oscura: las diagonales dicen "aquí falta un archivo" a simple vista, y el
 * texto dice cuál. Cuando llegue el arte real, se cambia el <AssetPlaceholder>
 * por un <Image> y nada más se toca.
 *
 * Es decorativo para la accesibilidad —`aria-hidden`— porque su texto describe
 * una tarea de producción, no el contenido de la página. Las secciones que lo
 * usan ya dicen en su copy visible de qué hablan.
 */
export default function AssetPlaceholder({
  label,
  className = "",
}: {
  /** Qué imagen falta. Se pinta encima del patrón. */
  label: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-[repeating-linear-gradient(45deg,#e6eef1,#e6eef1_12px,#d9e5ea_12px,#d9e5ea_24px)] p-4 text-center font-heading text-xs font-semibold leading-snug text-brand-900 ${className}`}
    >
      {label}
    </div>
  );
}
