import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LegalTabs from "@/components/LegalTabs";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";

/**
 * Apartado legal. DOS SECCIONES EN TABS: aviso de privacidad y política de
 * seguridad.
 *
 * ESTADO DEL CONTENIDO — página publicada, sin borrador ni datos pendientes:
 *   · la POLÍTICA DE SEGURIDAD es definitiva. Se importa de lib/nosotros, que
 *     es la misma fuente que publica /nosotros
 *   · el AVISO DE PRIVACIDAD es el DOCUMENTO DEFINITIVO del cliente, transcrito
 *     literalmente. Razón social, domicilio y correo del Departamento de
 *     Privacidad vienen del documento. El párrafo de "última actualización"
 *     que llevaba el hueco `[PENDIENTE: …]` se quitó por completo: el
 *     documento legal que entregó el cliente no trae esa fecha, y no hay una
 *     real que poner en su lugar — inventarla en un aviso de privacidad es
 *     justo lo que no se puede hacer. Si el cliente la define más adelante,
 *     se añade el párrafo de vuelta con el valor real
 *   · los TÉRMINOS Y CONDICIONES no están aquí ni como hueco. No existe el
 *     texto y una sección vacía prometía algo que no hay
 *
 * SIN `robots: { index: false }` en `metadata` (más abajo) y listada en
 * `sitemap.ts`: la página se indexa con normalidad. El `live: true` de las
 * tres entradas de /apartado-legal en `INFO_LINKS` (Footer.tsx) y el enlace
 * del CookieBanner ya estaban resueltos antes de esta revisión.
 */

const PATH = "/apartado-legal";

const TITLE = "Apartado legal";
const DESCRIPTION =
  "Aviso de privacidad y política de seguridad de Compass Solutions.";

export const metadata: Metadata = {
  title: `${TITLE} | Compass Solutions`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
};

export default function ApartadoLegal() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `topTone="dark"`: arriba del todo hay `brand-gradient`. */}
        <Header topTone="dark" />

        <main className="flex-1">
          <section className="brand-gradient rounded-b-[2rem] px-6 pb-16 pt-32 md:pb-20 md:pt-40">
            <div className="mx-auto max-w-7xl">
              <Eyebrow tone="dark" className="mb-4">
                Información legal
              </Eyebrow>
              <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                Apartado legal
              </h1>
            </div>
          </section>

          {/* `max-w-5xl` y no el `max-w-7xl` del resto del sitio: el cuerpo es
              texto corrido para leer de principio a fin. Cada bloque de prosa
              se limita además a `max-w-[68ch]` dentro del panel; el ancho de
              aquí lo pide la rejilla de dos columnas de los compromisos, que
              dentro de un `max-w-3xl` quedaba apretada. */}
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
            <LegalTabs />
          </div>
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
