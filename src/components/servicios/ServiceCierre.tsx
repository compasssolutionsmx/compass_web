import type { ServicioCierre } from "@/lib/servicios-contenido";
import { QuoteButton } from "../QuoteModal";

export type ServiceCierreProps = ServicioCierre;

/**
 * Bloque de cierre de la plantilla de servicio, con botón de cotización. Va
 * después de <ServiceFaq> y antes de <RelatedServicesCarousel>. Todas las
 * entradas de `lib/servicios-contenido.ts` declaran `cierre`.
 *
 * Una sola columna centrada: título, párrafo y botón, en ese orden.
 *
 * MISMA CAJA QUE <ImportCtaBanner>: `brand-gradient` con `rounded-3xl`, texto
 * blanco y el botón blanco sobre el degradado. El párrafo va en brand-100,
 * que sobre el punto más claro del degradado (brand-800) da 9.86:1 según
 * globals.css. El botón abre el mismo <QuoteModal> que el resto de CTA.
 *
 * Sin padding vertical propio: el `pb-20` de <ServiceFaq> da el hueco de
 * arriba y el `pt-20` de <RelatedServicesCarousel> el de abajo, 80px en cada
 * costura. Sumarle un `pb` duplicaba el hueco inferior a 160px.
 */
export default function ServiceCierre({
  titulo,
  parrafo,
  textoBoton,
}: ServiceCierreProps) {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="brand-gradient flex flex-col items-center rounded-3xl p-8 text-center md:p-12">
        <h2 className="max-w-[60ch] font-heading text-2xl font-bold text-white md:text-3xl">
          {titulo}
        </h2>
        <p className="mt-4 max-w-[60ch] leading-relaxed text-brand-100">
          {parrafo}
        </p>

        <QuoteButton className="mt-8 rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50">
          {textoBoton}
        </QuoteButton>
      </div>
    </section>
  );
}
