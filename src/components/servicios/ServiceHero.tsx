import Eyebrow from "../Eyebrow";
import { QuoteButton } from "../QuoteModal";

export type ServiceHeroProps = {
  /** Categoría del servicio, encima del título. */
  eyebrow: string;
  /** Título del hero. Es el <h1> de la página. */
  titulo: string;
  parrafo: string;
};

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
 *
 * TODO EL TEXTO LLEGA POR PROPS desde `lib/servicios-contenido.ts`: este
 * componente lo comparten las 18 páginas y no puede traer el copy de un
 * servicio concreto dentro.
 */
export default function ServiceHero({
  eyebrow,
  titulo,
  parrafo,
}: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-b-[2rem] bg-brand-950 pb-16 pt-32 md:pb-20 md:pt-40">
      {/* Fondo del hero mientras no hay foto: ocupa exactamente la misma caja
          que llevará la <Image> (`absolute inset-0`), con el degradado de
          marca de globals.css. Sin borde punteado y sin etiqueta: en una
          página ya indexable el hueco no puede anunciarse como hueco, así que
          se lee como un fondo tintado deliberado. El velo de abajo sigue
          encima, igual que irá sobre la foto real. */}
      <div className="brand-gradient absolute inset-0" />

      {/* Mismo velo de tres tramos que el hero de artículo de blog. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(1,27,38,0.85)_0%,rgba(1,27,38,0.45)_38%,rgba(1,27,38,0.92)_100%)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <Eyebrow tone="dark" className="mb-4">
          {eyebrow}
        </Eyebrow>

        <h1 className="max-w-3xl font-heading text-2xl font-bold leading-tight text-white md:text-4xl">
          {titulo}
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-brand-50">{parrafo}</p>

        <QuoteButton className="mt-8 rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50">
          Solicitar cotización
        </QuoteButton>
      </div>
    </section>
  );
}
