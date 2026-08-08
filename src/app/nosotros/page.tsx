import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroBackdrop from "@/components/HeroBackdrop";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import { COMPROMISOS_SEGURIDAD, INTRO_SEGURIDAD } from "@/lib/nosotros";
import { NOSOTROS_LABEL } from "@/lib/site";
import { bindTail } from "@/lib/typography";

const PATH = "/nosotros";

/**
 * Alimenta el <title> y el Open Graph. NO el <h1>: en pantalla el hero titula
 * "Nuestra historia", que es de lo que va la página; "Nuestra compañía" es el
 * nombre de la sección en el nav y es lo que conviene en el resultado de
 * búsqueda y al compartir.
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
 * Los cuatro párrafos de la historia.
 *
 * Van en el módulo y no inline en el JSX para que el `.map` de abajo quede
 * legible: el texto es lo único que cambia entre ellos. Aquí no vale sacarlo a
 * `lib/nosotros.ts` como el resto del contenido de la página —lo hacía la
 * cronología, y ese dato tenía estructura (año + texto) que otras superficies
 * podían reutilizar. Esto es prosa corrida de una sola sección.
 */
const HISTORIA_PARRAFOS = [
  "Compass Solutions nació en febrero de 2014 como un freight forwarder, iniciando operaciones con servicios aéreos y de importación terrestre inbound. La creciente demanda de sus clientes impulsó, en 2015, la integración de soluciones marítimas y, en 2016, la ampliación de cobertura con movimientos terrestres a nivel nacional.",
  "De esta forma se consolidó una oferta integral de servicios en tres ejes principales: aéreo, terrestre y marítimo.",
  "Entre 2017 y 2018 se fortaleció la operación terrestre, incrementando significativamente el volumen de movimientos y profesionalizando los servicios de última milla. En 2019, con la firme convicción de garantizar la mejor experiencia a sus clientes, se estableció el departamento de calidad.",
  "Finalmente, en 2021 se dio un paso estratégico al robustecer la división terrestre, con el objetivo de elevar los estándares y profesionalizar aún más este sector clave dentro de la organización.",
];

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

            {/* Mismo centrado que el hero del home: `text-center` en el
                contenedor y `mx-auto` en los bloques que lleven tope de ancho.
                El eyebrow es un <p> con la pastilla en `inline-block`, así que
                se centra con el `text-center`; el <h1> no lleva `max-w-*`, y
                sin caja que centrar tampoco necesita `mx-auto`. Si algún día se
                le pone tope, hay que añadírselo o quedará pegado a la izquierda
                con el texto centrado dentro. */}
            <div className="relative mx-auto max-w-7xl text-center">
              <Eyebrow tone="dark" className="mb-4">
                Nuestra compañía
              </Eyebrow>
              <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                Nuestra historia
              </h1>
            </div>
          </section>

          {/* ---------- HISTORIA ---------- */}
          <section
            aria-labelledby="historia-titulo"
            className="mx-auto max-w-7xl px-6 py-20 md:py-24"
          >
            {/* OJO CON EL `ch`: se resuelve contra la fuente de ESTE div, que
                hereda el cuerpo a 16px. Los párrafos de dentro van a 18px y el
                <h2> a 30/36px, así que ninguno cabe a 68 caracteres reales;
                el número es la caja, no la medida del texto que contiene. */}
            <div className="mx-auto max-w-[68ch] text-center">
              {/* Este era el <h1> del hero. Baja aquí como <h2> visible y de
                  paso resuelve el encabezado de la sección: antes era un
                  `sr-only` que sólo existía para que el documento no saltara
                  del <h1> a los <h3> de misión y visión. */}
              <h2
                id="historia-titulo"
                className="font-heading text-3xl font-bold leading-tight text-brand-900 md:text-4xl"
              >
                {/* Espacio DURO entre "le" e "importa.", misma protección que
                    <ImportHero> y <ImportControl>. Sin él este titular deja
                    "importa." sola en la última línea en dos bandas: hacia
                    640px de viewport y otra vez por debajo de ~370px. Y a 36px
                    entra en la caja por 5px justos en el arranque de `md`, así
                    que en cuanto el kerning o el redondeo del navegador se
                    muevan un pelo, parte. Atado, el peor caso son dos palabras
                    en el último renglón, no una. */}
                +12 años moviendo lo que le{"\u00A0"}importa.
              </h2>

              {/* `bindTail` ata las dos últimas palabras de cada párrafo. En
                  texto centrado una última línea de una sola palabra se lee
                  como un error de maquetación, no como el final natural del
                  párrafo: queda sola en mitad de la caja. El caso que lo pedía
                  era el P4, que cerraba con "organización." colgando. */}
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-600">
                {HISTORIA_PARRAFOS.map((parrafo) => (
                  <p key={parrafo}>{bindTail(parrafo)}</p>
                ))}
              </div>
            </div>
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
