import type { Metadata } from "next";
import Image from "next/image";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import VacantesBoard from "@/components/VacantesBoard";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import { vacantesActivas } from "@/lib/vacantes";

const PATH = "/vacantes";

const TITLE = "Vacantes";
const DESCRIPTION =
  "Trabaje en Compass Solutions: vacantes en operación, servicio a cliente y administración dentro de nuestras soluciones aéreas, marítimas y terrestres.";

export const metadata: Metadata = {
  title: `${TITLE} | Compass Solutions`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Compass Solutions",
    url: PATH,
    title: TITLE,
    description: DESCRIPTION,
    // Explícita y no heredada: un `openGraph` propio REEMPLAZA al del layout
    // raíz, así que sin esto la página se compartiría sin miniatura.
    //
    // Es la miniatura de marca del layout, repetida a mano. Aquí había un
    // placeholder de placehold.co que servía a la vez de fondo del hero y de
    // imagen de Open Graph; al entrar la foto real en el hero, ese placeholder
    // desapareció y con él la única imagen que tenía la página. La foto del
    // hero no sirve de recambio: es 1728x608 (2.84:1), lejos del 1.91:1 que
    // piden las tarjetas sociales, y se recortaría por la mitad.
    images: [
      {
        url: "/brand/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Contenedor Compass Solutions en el Puerto de Lázaro Cárdenas",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export default function Vacantes() {
  const vacantes = vacantesActivas();

  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `topTone="dark"`: arriba del todo hay una foto con velo oscuro. */}
        <Header topTone="dark" />

        <main className="flex-1">
          {/* HERO CORTO, misma forma que el de /nosotros y /proveedores: sólo
              eyebrow + titular, centrados. Los dos párrafos y el botón que
              vivían aquí bajaron a <VacantesBoard>, junto al formulario y a la
              lista que describen. El `pt` grande es el hueco que necesita el
              header flotante, no aire decorativo; el ritmo vertical
              (pt-32/pb-16, md:pt-40/md:pb-20) es el mismo de /proveedores, que
              es el que corresponde ahora que el hero tiene esa misma altura de
              contenido.

              `overflow-hidden` recorta la foto a las esquinas redondeadas. No
              afecta a nada de abajo: el resto de la página vive fuera de este
              recorte. */}
          <section className="relative overflow-hidden rounded-b-[2rem] pb-16 pt-32 md:pb-20 md:pt-40">
            {/* MISMA PILA DE TRES CAPAS QUE <ImportHero> Y QUE EL HOME:
                brand-950 de base, la foto al 60% de opacidad y el `hero-overlay`
                encima. Las tres hacen falta, y no es una copia por simetría: el
                `hero-overlay` SOLO no alcanza. Esta foto tiene un rango enorme
                —una zona casi blanca— y con ella al 100%, con el mismo velo, el
                peor punto de esta banda de texto deja el eyebrow en 3.40:1, que
                NO pasa AA (el h1 aguantaría en 5.20:1, pero de poco sirve). El
                60% es lo que cierra esa brecha, y es exactamente lo que aplica
                <HeroVideo> a su <video> en el home.

                CONTRASTE MEDIDO per-pixel sobre el archivo real compuesto con
                la pila entera —la foto recortada como la recorta `object-cover`
                a cada ancho, más los dos radiales del velo con su geometría—, y
                sólo en los pixeles que cubren los glifos, con las mismas fuentes
                del build (Archivo wdth 112.5 y DM Sans). Peor caso de cada uno,
                en el barrido de 320 a 2560px:
                  h1 blanco            8.82:1  (peor a 320px de viewport)
                  eyebrow brand-50     5.59:1  (peor a 320px, ya sobre su
                                                pastilla white/10)
                Los dos pasan AA, y el h1 también AAA. El eyebrow es el que
                menos margen tiene: si se aclara el velo, es el primero en caer.

                Sale mejor parado que el hero de /importaciones-a-mexico con la
                misma foto porque este hero mide ~350px de alto en vez de 75vh:
                `object-cover` recorta una banda central mucho más estrecha y la
                zona clara del archivo queda casi toda fuera del encuadre.

                `alt=""`: es fondo decorativo y el mensaje lo lleva el <h1>.
                `priority` porque es la imagen sobre el pliegue y la candidata a
                LCP de la página. */}
            <div className="absolute inset-0 bg-brand-950">
              <Image
                src="/home/back-compass-all.webp"
                alt=""
                width={1728}
                height={608}
                priority
                sizes="100vw"
                className="h-full w-full object-cover opacity-60"
              />
              <div className="hero-overlay absolute inset-0" />
            </div>

            {/* EL `px` VA EN EL MISMO ELEMENTO QUE EL `max-w-7xl`, no en el
                <section> de fuera. Con `box-sizing: border-box` el tope de
                1280px incluye el padding; si el padding queda fuera del tope, el
                contenedor sigue midiendo 1280 completos y el bloque arranca en
                un punto distinto al de las secciones de abajo. Es el mismo
                desfase que se corrigió en /proveedores y en el hero de artículo.
                Con el `px` aquí dentro, hero y secciones comparten borde en
                todos los anchos: por debajo de 1328px manda el `px-6` de los
                dos, y por encima el `max-w-7xl` centrado de los dos. */}
            <div className="relative mx-auto max-w-7xl px-6 text-center">
              <Eyebrow tone="dark" className="mb-4">
                Vacantes
              </Eyebrow>
              {/* SIN `bindTail` A PROPÓSITO, al revés que en /proveedores. El
                  bloque que ataría son las dos últimas palabras, "Compass
                  Solutions": 17 caracteres que a `text-4xl` en Archivo
                  semiexpandida miden ~355px, contra los 272px de caja que quedan
                  a 320px de viewport. Al ser indivisible desbordaría en vez de
                  reajustarse — justo el caso contra el que avisa la propia
                  utilidad. Sin atar parte en tres líneas y no desborda. */}
              <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                Trabaje en Compass Solutions
              </h1>
            </div>
          </section>

          <VacantesBoard vacantes={vacantes} />
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
