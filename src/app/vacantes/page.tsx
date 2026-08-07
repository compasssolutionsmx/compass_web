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

/**
 * TODO(assets): foto real de la operación (equipo, patio o terminal).
 * Placeholder de placehold.co mientras tanto, la misma convención que las
 * portadas pendientes del blog; el dominio ya está permitido en
 * next.config.ts. Se usa en el fondo del hero Y como imagen de Open Graph.
 */
const HERO_IMAGE =
  "https://placehold.co/1600x900/011b26/ffffff?text=Foto+de+la+operacion";

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
    images: [
      {
        url: HERO_IMAGE,
        width: 1200,
        height: 630,
        alt: "Vacantes en Compass Solutions",
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
          {/* HERO CORTO. No compite con el contenido: esta página existe para
              que alguien lea una vacante y se postule, así que el encabezado
              presenta y se quita de en medio. El `pt` grande es el hueco que
              necesita el header flotante, no aire decorativo.

              `overflow-hidden` aquí NO afecta al `sticky` del formulario: ese
              vive en la sección de abajo, fuera de este recorte. */}
          <section className="relative overflow-hidden rounded-b-[2rem] px-6 pb-12 pt-28 md:pb-16 md:pt-32">
            <div className="absolute inset-0">
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              {/* VELO AL 75%, y el número no es estético: el contraste hay que
                  garantizarlo contra la zona MÁS CLARA de la foto que llegue,
                  no contra su promedio. Calculado sobre el peor caso posible
                  —blanco puro debajo— con brand-950 al 75%:
                    texto blanco (H1 y CTA)      7.94:1
                    párrafos slate-200           6.44:1
                    eyebrow brand-50 en su pill  5.57:1
                  Los tres pasan AA. Al 65% el eyebrow caía a 4.14:1 y no
                  pasaba, así que 75% es el suelo, no una preferencia. */}
              <div className="absolute inset-0 bg-brand-950/75" />
            </div>

            <div className="relative mx-auto max-w-7xl">
              <Eyebrow tone="dark" className="mb-4">
                Vacantes
              </Eyebrow>
              <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                Trabaje en Compass Solutions
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-200">
                En Compass Solutions crecemos junto con la operación: cada nueva
                ruta, cliente y proyecto de comercio exterior requiere personas
                comprometidas con la seguridad, la puntualidad y el servicio.
              </p>
              <p className="mt-4 max-w-2xl text-slate-200">
                Buscamos perfiles para las áreas de operación, servicio a
                cliente y administración, dentro de nuestras soluciones aéreas,
                marítimas y terrestres, respaldados por más de 12 años de
                experiencia en logística internacional.
              </p>

              {/* Ancla y no botón: es una navegación dentro de la página, y así
                  funciona con "abrir en pestaña nueva" y con el teclado sin
                  añadir nada. Lenis intercepta los anclas con el mismo offset
                  que el nav; con `prefers-reduced-motion` Lenis no se instancia
                  y queda el salto nativo, que ya respeta el
                  `scroll-padding-top: 6rem` de globals.css. */}
              <a
                href="#vacantes-disponibles"
                className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
              >
                Ver vacantes disponibles
              </a>
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
