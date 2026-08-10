import Image from "next/image";
import { QuoteButton } from "../QuoteModal";

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
          ¡Amplíe su alcance global con Compass Solutions!
        </h2>

        {/* Recorte sobre transparencia (73% del lienzo en alfa 0), así que va
            sin caja ni fondo: flota sobre el degradado igual que el
            tiranosaurio en <ImportControl>.

            SE LEE BIEN SOBRE EL FONDO OSCURO, comprobado sobre el archivo y no
            a ojo: el 97.8% de su tinta es MÁS CLARA que brand-800, que es el
            punto más claro del `brand-gradient`, y sólo el 0.7% queda por
            debajo de brand-950. No tiene el problema de ALACAT —0.0% de tinta
            casi blanca— ni se hunde en negro.

            Mantiene la caja del marcador que sustituye (h-28 w-56 = 112x224px).
            El archivo es 700x355 (ratio 1.97) y la caja 2.00, así que
            `object-contain` lo ajusta sin recorte perceptible.

            Sin `preload`: cierra la página, muy por debajo del pliegue. */}
        <Image
          src="/importaciones/buque.webp"
          alt="Buque portacontenedores cargado, visto de perfil"
          width={700}
          height={355}
          sizes="224px"
          className="h-28 w-56 shrink-0 object-contain"
        />

        <QuoteButton className="rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50">
          Solicitar cotización
        </QuoteButton>
      </div>
    </section>
  );
}
