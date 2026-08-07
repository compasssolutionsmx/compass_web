import { QuoteButton } from "../QuoteModal";
import AssetPlaceholder from "./AssetPlaceholder";

/**
 * Banner de cierre. Exclusivo de la landing (🆕).
 *
 * Es el último de los CTA de la página; todos —los once del mockup, en sus tres
 * variantes de texto— abren el mismo <QuoteModal> de cuatro pasos que ya está
 * en producción. No se hizo una versión reducida del formulario aunque el popup
 * del WordPress original fuera más simple: el wizard por pasos reduce más la
 * fricción y mantener dos formularios significaría mantener dos validaciones,
 * dos envíos de correo y dos contratos de payload.
 */
export default function ImportCtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="brand-gradient flex flex-wrap items-center justify-between gap-8 rounded-3xl p-8 md:p-12">
        <h2 className="max-w-[20ch] font-heading text-2xl font-bold text-white md:text-3xl">
          ¡Amplia tu alcance global con Compass Solutions!
        </h2>

        {/* TODO(assets): buque recortado sobre fondo transparente. */}
        <AssetPlaceholder
          label="IMG: buque recortado, fondo transparente"
          className="h-28 w-56 shrink-0 rounded-xl"
        />

        <QuoteButton className="rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50">
          Solicitar cotización
        </QuoteButton>
      </div>
    </section>
  );
}
