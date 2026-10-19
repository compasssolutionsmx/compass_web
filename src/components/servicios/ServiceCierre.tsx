import type { ServicioCierre } from "@/lib/servicios-contenido";
import { QuoteButton } from "../QuoteModal";

export type ServiceCierreProps = ServicioCierre;

/**
 * Bloque de cierre de la plantilla de servicio, con botón de cotización. Va
 * después de <ServiceCotizar> y antes de <RelatedServicesCarousel>, y sólo se
 * renderiza si la entrada declara `cierre` en `lib/servicios-contenido.ts`.
 *
 * MISMA CAJA QUE <ImportCtaBanner>: `brand-gradient` con `rounded-3xl`, texto
 * blanco y el botón blanco sobre el degradado. El párrafo va en brand-100,
 * que sobre el punto más claro del degradado (brand-800) da 9.86:1 según
 * globals.css. El botón abre el mismo <QuoteModal> que el resto de CTA.
 */
export default function ServiceCierre({
  titulo,
  parrafo,
  textoBoton,
}: ServiceCierreProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="brand-gradient flex flex-wrap items-center justify-between gap-8 rounded-3xl p-8 md:p-12">
        <div className="max-w-[60ch]">
          <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
            {titulo}
          </h2>
          <p className="mt-4 leading-relaxed text-brand-100">{parrafo}</p>
        </div>

        <QuoteButton className="rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50">
          {textoBoton}
        </QuoteButton>
      </div>
    </section>
  );
}
