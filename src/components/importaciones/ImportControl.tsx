import Image from "next/image";
import Eyebrow from "../Eyebrow";
import { QuoteButton } from "../QuoteModal";

/**
 * "Su carga bajo control, sin sorpresas." Sección exclusiva de la landing (🆕),
 * sin equivalente en el home.
 *
 * Dos columnas: el argumento a la izquierda y un panel de marca a la derecha.
 * El panel es `brand-gradient` con el logotipo centrado — el mockup pone ahí un
 * bloque oscuro con la marca, no una foto, así que no hay asset pendiente.
 */
export default function ImportControl() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <Eyebrow className="mb-5">
            Gestión Aduanal y Logística de Precisión
          </Eyebrow>
          <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
            Su carga bajo control, sin sorpresas.
          </h2>
          <p className="mt-5 max-w-[48ch] text-slate-500">
            En Compass Solutions, entendemos que una importación detenida es
            dinero perdido. Por ello, ofrecemos una solución integral que abarca
            desde la recolección en el extranjero hasta la entrega en tu puerta.
            Nos especializamos en carga consolidada (LCL), contenedores
            completos (FCL) y proyectos especiales, adaptándonos al volumen y
            urgencia de tu negocio.
          </p>
          <QuoteButton className="mt-8 rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Solicita una Cotización
          </QuoteButton>
        </div>

        <div className="brand-gradient flex min-h-[320px] items-center justify-center rounded-3xl p-8 md:min-h-[400px]">
          {/* Mismo SVG monocromo que el header y el footer; sobre el degradado
              oscuro va en blanco con el filtro de siempre. */}
          <Image
            src="/brand/logotipo.svg"
            alt="Compass Solutions"
            width={1617}
            height={362}
            unoptimized
            className="h-10 w-auto brightness-0 invert md:h-12"
          />
        </div>
      </div>
    </section>
  );
}
