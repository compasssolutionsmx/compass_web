import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import { bindTail } from "@/lib/typography";

/**
 * 404 del sitio.
 *
 * COBERTURA: este único fichero atiende los DOS casos. Los docs de Next 16 lo
 * dicen explícitamente: «el `app/not-found.js` raíz maneja cualquier URL no
 * coincidente de toda la aplicación», además de los `notFound()` lanzados desde
 * un segmento. El `notFound()` de `/blog/[slug]` cae aquí porque no hay ningún
 * `not-found.js` más cercano en `app/blog/`.
 *
 * NO se usa `global-not-found.js`: es experimental, exige un flag en la
 * configuración y salta el layout raíz, así que habría que reimportar estilos,
 * fuentes y el resto del andamiaje para acabar con el mismo header y footer que
 * aquí salen gratis.
 */

/**
 * EL `metadata` DE UN `not-found` SÍ SE LEE, aunque la documentación sólo lo
 * describa para `global-not-found`. Comprobado en el código de Next 16.2.12
 * (`lib/metadata/resolve-metadata.js`): cuando hay convención de error,
 * `collectMetadata` resuelve el módulo con `getComponentTypeModule(tree,
 * 'not-found')` y le aplica `getDefinedMetadata`, y ese item se encola el
 * ÚLTIMO, así que pisa al del layout.
 *
 * El `robots` va explícito por dejar la intención escrita, pero es un cinturón
 * sobre tirantes: Next ya inyecta `noindex` por su cuenta en las respuestas con
 * código 404.
 */
export const metadata: Metadata = {
  title: "Página no encontrada | Compass Solutions",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `topTone="light"` — la primera página del sitio que lo usa. Las demás
            arrancan con un hero oscuro; ésta es blanca de arriba abajo, y con
            "dark" el logo y el nav saldrían blancos sobre blanco. */}
        <Header topTone="light" />

        <main className="flex-1">
          {/* `pt-32 md:pt-40` es el despeje del header flotante, el mismo que
              usan los heroes del resto del sitio. El `px-6` va en el mismo
              elemento que el `max-w-7xl`: con `box-sizing: border-box` el tope
              incluye el padding, y separarlos descuadra el bloque respecto a
              las demás secciones. */}
          <section className="mx-auto max-w-7xl px-6 pb-20 pt-32 text-center md:pb-24 md:pt-40">
            {/* UNA SOLA COLUMNA, centrada: ilustración, etiqueta, titular y
                botón. Los bloques con tope de ancho llevan su propio `mx-auto`,
                porque con `text-center` el texto se centraría dentro de una caja
                que seguiría pegada a la izquierda.

                La ilustración se topa en `max-w-2xl` (672px). A todo el ancho
                del contenedor mediría 1232x785px —es horizontal, 1178x750, o sea
                1.57:1— y dejaría el botón fuera de la primera pantalla. Con 672
                se queda en 428px de alto y todo el bloque cabe sin bajar. */}
            <Image
              src="/404.webp"
              alt=""
              width={1178}
              height={750}
              priority
              sizes="(min-width: 768px) 672px, 100vw"
              className="mx-auto h-auto w-full max-w-2xl"
            />

            {/* `alt=""` porque es decorativa: el mensaje lo llevan el eyebrow y
                el <h1>, y describirla obligaría a un lector de pantalla a
                escuchar el dibujo antes de llegar a la única acción que hay.

                `priority` ahora sí: pesa 35 KB y es lo primero que se ve. */}
            <Eyebrow className="mb-4 mt-10">Error 404</Eyebrow>

            {/* BAJADO de `text-4xl md:text-5xl` (36/48px) a `text-3xl md:text-4xl`
                (30/36px). A 48px el titular medía 882px y dominaba la página por
                encima de la ilustración; a 36px son 662px y sigue entrando en una
                sola línea desde 768px de viewport. */}
            <h1 className="font-heading text-3xl font-bold leading-tight text-brand-900 md:text-4xl">
              {bindTail("Esta carga no ha llegado a destino")}
            </h1>

            {/* Un solo destino, y el más útil: volver al principio. Sin enlaces
                secundarios que obliguen a elegir en una página a la que nadie
                quería llegar. */}
            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
            >
              Ir al inicio
            </Link>
          </section>
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
