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
 * ESTADO DEL CONTENIDO, que es lo que gobierna el resto de decisiones:
 *   · la POLÍTICA DE SEGURIDAD es definitiva. Se importa de lib/nosotros, que
 *     es la misma fuente que publica /nosotros
 *   · el AVISO DE PRIVACIDAD es el DOCUMENTO DEFINITIVO del cliente, transcrito
 *     literalmente. Ya no es un borrador: razón social, domicilio y correo del
 *     Departamento de Privacidad vienen del documento. El único hueco que queda
 *     marcado con [PENDIENTE: …] es la fecha de última actualización, que el
 *     documento no trae
 *   · los TÉRMINOS Y CONDICIONES ya no están aquí ni como hueco. No existe el
 *     texto y una sección vacía prometía algo que no hay
 *
 * QUEDA PENDIENTE, de la lista que dejó la versión borrador:
 *   · poner `live: true` a la entrada de "Aviso de privacidad" de INFO_LINKS
 *     en Footer.tsx (la de "Términos y condiciones" ya se retiró de esa lista,
 *     porque apuntaba al ancla #terminos que esta página ya no tiene)
 *   · envolver en <Link href="/apartado-legal#privacidad"> el "Aviso de
 *     privacidad" del CookieBanner (tiene un TODO(compliance) marcándolo)
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
