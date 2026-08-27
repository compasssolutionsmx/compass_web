import Eyebrow from "../Eyebrow";
import { QuoteButton } from "../QuoteModal";

/**
 * Hero de la plantilla de página de servicio (/servicios/[slug]).
 *
 * MISMO ESQUELETO QUE EL HERO DE ARTÍCULO DE BLOG (app/blog/[slug]/page.tsx):
 * imagen de fondo a sangre, velo de tres tramos, texto alineado a la
 * izquierda dentro de `max-w-7xl px-6 lg:px-12`. Es el único hero del sitio
 * que combina foto de fondo con texto a la izquierda y dejaría sitio para un
 * CTA propio dentro del mismo bloque, que es justo lo que pide esta
 * plantilla — los heroes centrados (home, /importaciones, /nosotros) resuelven
 * su CTA en una sección aparte (<QuoteSection> superpuesta), no dentro del
 * propio hero.
 *
 * SIN FOTO REAL: esta es una plantilla de revisión de estructura, no una
 * página publicada. El marcador ocupa exactamente la misma caja que llevaría
 * la <Image> real (`absolute inset-0`, mismo velo encima), para que quien
 * apruebe la plantilla vea el hueco real que debe llenar el arte final y no
 * tenga que imaginarlo.
 */
export default function ServiceHero() {
  return (
    <section className="relative overflow-hidden rounded-b-[2rem] bg-brand-950 pb-16 pt-32 md:pb-20 md:pt-40">
      {/* Caja de la imagen de fondo: 1920x1080, el mismo `absolute inset-0
          h-full w-full object-cover` que ocuparía <Image>. La etiqueta va
          abajo a la derecha, fuera de las dos zonas que ya ocupa otro
          contenido: centrada caía encima del <h1> (los dos se centran en el
          mismo punto de una sección de esta altura), y arriba a la derecha
          caía detrás del header flotante (`fixed`, `z-40`, con su propio
          espacio reservado en el `pt-32 md:pt-40` de este section). */}
      <div className="absolute inset-0 flex items-end justify-end border border-dashed border-white/25 bg-brand-900 p-6">
        <p className="rounded-full bg-black/30 px-4 py-2 font-heading text-sm font-semibold text-white">
          [Imagen de marcador de posición — 1920×1080]
        </p>
      </div>

      {/* Mismo velo de tres tramos que el hero de artículo de blog. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(1,27,38,0.85)_0%,rgba(1,27,38,0.45)_38%,rgba(1,27,38,0.92)_100%)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <Eyebrow tone="dark" className="mb-4">
          Transporte terrestre
        </Eyebrow>

        <h1 className="max-w-3xl font-heading text-2xl font-bold leading-tight text-white md:text-4xl">
          FTL: transporte terrestre dedicado
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-brand-50">
          [Texto de marcador de posición] Párrafo descriptivo del servicio.
          Aquí va la propuesta de valor de FTL en dos o tres líneas: qué
          cubre, en qué tiempos y qué problema del cliente resuelve.
        </p>

        <QuoteButton className="mt-8 rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50">
          Solicitar cotización
        </QuoteButton>
      </div>
    </section>
  );
}
