import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroBackdrop from "@/components/HeroBackdrop";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import {
  COMPROMISOS_SEGURIDAD,
  HISTORIA,
  INTRO_SEGURIDAD,
} from "@/lib/nosotros";
import { NOSOTROS_LABEL } from "@/lib/site";

const PATH = "/nosotros";

/**
 * Alimenta el <title> y el Open Graph. NO el <h1>: el titular visible de esta
 * página es "+12 años moviendo lo que le importa.", que es copy propio del hero
 * y no el nombre de la sección.
 */
const TITLE = NOSOTROS_LABEL;
const DESCRIPTION =
  "Más de 12 años moviendo carga: la historia de Compass Solutions desde 2014, su misión y visión, y los diez compromisos de su política de seguridad y calidad.";

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
    // El hero es video, así que no hay una imagen propia que compartir: se usa
    // la miniatura del sitio. Va EXPLÍCITA porque un `openGraph` de página
    // reemplaza al del layout raíz en vez de heredarle la imagen.
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

/**
 * Un hito de la cronología.
 *
 * El raíl —línea y marcador— vive en su propia columna del grid en vez de ir
 * como pseudo-elemento de la tarjeta: así la línea puede estirarse hasta el
 * alto real de la fila, que lo fija el texto y cambia en cada hito.
 */
function HitoTimeline({
  periodo,
  texto,
  esUltimo,
}: {
  periodo: string;
  texto: string;
  esUltimo: boolean;
}) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-6 sm:grid-cols-[7rem_auto_1fr] sm:gap-x-8">
      {/* El año va en su propia columna desde `sm`. En móvil no cabe al lado,
          así que se repite arriba de la tarjeta (ver más abajo) y esta celda
          desaparece. */}
      <p className="hidden pt-4 text-right font-heading text-xl font-bold text-brand-700 sm:block">
        {periodo}
      </p>

      {/* Raíl decorativo: la cronología ya se entiende por el año y el orden
          del <ol>, así que no aporta nada a un lector de pantalla. */}
      <div aria-hidden="true" className="relative flex w-3 justify-center">
        {/* En el último hito la línea se corta en el marcador, para que no
            quede un tramo colgando hacia la nada. */}
        <span
          className={`absolute top-0 w-0.5 bg-brand-200 ${esUltimo ? "h-7" : "h-full"}`}
        />
        <span className="absolute top-4 h-3 w-3 rounded-full bg-brand-900" />
      </div>

      <div className="pb-8">
        <p className="mb-2 font-heading text-lg font-bold text-brand-700 sm:hidden">
          {periodo}
        </p>
        <div className="tech-card p-5 md:p-6">
          <p className="text-slate-600">{texto}</p>
        </div>
      </div>
    </li>
  );
}

/** Misión y visión comparten forma; sólo cambian etiqueta, título y texto. */
function TarjetaValor({
  etiqueta,
  titulo,
  texto,
}: {
  etiqueta: string;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="tech-card rounded-3xl p-8 md:p-10">
      {/* `tone="light"` —el pill brand-100— y NO `tint`: la tarjeta es blanca,
          así que el pill blanco del `tint` desaparecería (1.00:1). Sobre la
          tarjeta, el brand-100 da 1.18:1 y de paso repite el color de la franja
          que hay detrás. */}
      <Eyebrow className="mb-4">{etiqueta}</Eyebrow>
      <h3 className="font-heading text-2xl font-bold text-brand-900 md:text-3xl">
        {titulo}
      </h3>
      <p className="mt-3 text-slate-600">{texto}</p>
    </div>
  );
}

export default function Nosotros() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `topTone="dark"`: detrás hay video con velo, igual que en el home. */}
        <Header topTone="dark" />

        <main className="flex-1">
          {/* ---------- HERO ----------
              Mismo fondo que el home, a través de <HeroBackdrop>: el video no
              se duplica ni se sube un asset nuevo. Más bajo que el del home
              porque aquí no hay cotizador sobrepuesto al que reservarle sitio.
              `pt-32` es el hueco del header flotante. */}
          <section className="relative overflow-hidden rounded-b-[2rem] px-6 pb-20 pt-32 md:pb-24 md:pt-40">
            <HeroBackdrop />

            <div className="relative mx-auto max-w-7xl">
              <Eyebrow tone="dark" className="mb-4">
                Nuestra historia
              </Eyebrow>
              <h1 className="max-w-[16ch] font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                +12 años moviendo lo que le importa.
              </h1>
            </div>
          </section>

          {/* ---------- HISTORIA ---------- */}
          <section
            aria-labelledby="historia-titulo"
            className="mx-auto max-w-7xl px-6 py-20 md:py-24"
          >
            {/* Encabezado sólo para lectores de pantalla: en pantalla el hero
                ya presenta la sección con su eyebrow y su <h1>, y repetirlo
                aquí sería ruido. Sin él, el documento saltaría del <h1> a los
                <h3> de misión/visión. */}
            <h2 id="historia-titulo" className="sr-only">
              Nuestra historia, año por año
            </h2>

            <ol className="mx-auto max-w-4xl">
              {HISTORIA.map((hito, i) => (
                <HitoTimeline
                  key={hito.periodo}
                  periodo={hito.periodo}
                  texto={hito.texto}
                  esUltimo={i === HISTORIA.length - 1}
                />
              ))}
            </ol>
          </section>

          {/* ---------- MISIÓN Y VISIÓN ----------
              Franja tintada: el color va en el <section>, a sangre, y el
              contenedor de ancho baja a un <div>. Si el `bg` fuera sobre
              `max-w-7xl` sería una caja, no una banda. */}
          <section
            aria-labelledby="valores-titulo"
            className="bg-brand-100 py-20 md:py-24"
          >
            <div className="mx-auto max-w-7xl px-6">
              <h2 id="valores-titulo" className="sr-only">
                Misión y visión
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <TarjetaValor
                  etiqueta="Misión"
                  titulo="Cuidamos cada carga como propia"
                  texto="Ofreciendo soluciones logísticas eficientes y confiables."
                />
                <TarjetaValor
                  etiqueta="Visión"
                  titulo="El socio logístico más confiable de México"
                  texto="Superando límites para cada entrega."
                />
              </div>
            </div>
          </section>

          {/* ---------- POLÍTICA DE SEGURIDAD ---------- */}
          <section
            aria-labelledby="politica-titulo"
            className="mx-auto max-w-7xl px-6 py-20 md:py-24"
          >
            {/* Mismo criterio que la historia: la etiqueta visible es el
                eyebrow que pide el diseño, y el <h2> va en `sr-only` para no
                escribir dos veces las mismas palabras en pantalla. */}
            <h2 id="politica-titulo" className="sr-only">
              Política de seguridad
            </h2>
            <Eyebrow className="mb-4">Política de seguridad</Eyebrow>
            <p className="max-w-[62ch] text-lg text-slate-700">
              {INTRO_SEGURIDAD}
            </p>

            {/* <ol> porque los diez están numerados en el documento del cliente
                y el orden es parte del contenido. El número visible va
                `aria-hidden`: la lista ya numera sola, y sin eso un lector de
                pantalla diría "1. 01 Servicio confiable…". */}
            <ol className="mt-12 grid gap-4 md:grid-cols-2">
              {COMPROMISOS_SEGURIDAD.map((compromiso, i) => (
                <li
                  key={compromiso.titulo}
                  className="tech-card flex gap-4 p-5 md:p-6"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-heading text-xl font-bold text-brand-600"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-brand-900">
                      {compromiso.titulo}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {compromiso.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
