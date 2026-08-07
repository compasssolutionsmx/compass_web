import type { Metadata } from "next";
import Certifications, {
  CERTIFICATIONS_IMPORTACIONES,
} from "@/components/Certifications";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import QuoteSection from "@/components/QuoteSection";
import SuccessStories from "@/components/SuccessStories";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import ImportControl from "@/components/importaciones/ImportControl";
import ImportCtaBanner from "@/components/importaciones/ImportCtaBanner";
import ImportHero from "@/components/importaciones/ImportHero";
import ImportSolutions from "@/components/importaciones/ImportSolutions";
import ImportStats from "@/components/importaciones/ImportStats";
import { SITE_URL } from "@/app/layout";
import { SALES_PHONE_DISPLAY } from "@/lib/site";

const PATH = "/importaciones-a-mexico";

const TITLE = "Expertos en importaciones a México - Compass Solutions";
const DESCRIPTION =
  "Optimice sus importaciones a México con Compass Solutions. Soluciones integrales de logística desde y hacia México.";

/**
 * ESTA URL RECIBE TRÁFICO PAGADO (Google Ads y Meta), así que `robots` va
 * explícito en vez de heredado: index/follow declarado deja constancia de que
 * la página se indexa a propósito y no es sólo destino de anuncios.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Compass Solutions",
    url: PATH,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

/**
 * JSON-LD de la landing.
 *
 * REGLA DEL PROYECTO: todo dato aquí tiene que estar VISIBLE como texto en esta
 * misma página. Por eso el bloque es corto y por eso NO lleva `aggregateRating`,
 * `areaServed` con una lista de países, ni `telephone` de sucursales — nada de
 * eso se pinta. Lo que declara:
 *
 *   name / description   → el <h1> y el párrafo del hero
 *   provider             → el logotipo y el nombre de marca, en header y footer
 *   telephone            → el teléfono del header y del footer
 *   serviceType          → los cuatro títulos de "Soluciones Logísticas"
 *
 * `Service` con `provider` de tipo `Organization` en vez de dos bloques
 * sueltos: es una sola entidad —el servicio de importación que presta Compass—
 * y separarlos obligaría a repetir la organización sin que aporte nada.
 */
function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Importaciones a México",
    description: DESCRIPTION,
    serviceType: [
      "Transportación aérea",
      "Transportación marítima",
      "Transportación terrestre",
      "Servicios adicionales",
    ],
    provider: {
      "@type": "Organization",
      name: "Compass Solutions",
      url: SITE_URL,
      telephone: SALES_PHONE_DISPLAY,
    },
    url: new URL(PATH, SITE_URL).toString(),
  };
}

export default function ImportacionesAMexico() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `variant="conversion"`: logo, teléfono y un CTA. Sin los cuatro
            enlaces de nav — en una landing de una sola sección apuntarían fuera
            de la página, que es lo último que quiere una página de campaña.
            Volver al header completo es cambiar esta palabra. */}
        <Header topTone="dark" variant="conversion" />

        <main className="flex-1">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
          />

          {/* 🆕 exclusivo de esta landing */}
          <ImportHero />

          {/* ♻️ EL MISMO cotizador inline del home, sin parametrizar. Va aquí,
              entre el hero y las certificaciones, por dos razones que no son
              intercambiables: se sobrepone al corte redondeado del hero con su
              margen negativo —en cualquier otra posición mordería la sección
              anterior— y su `pb` ES el hueco superior de <Certifications>, que
              no trae `pt` propio. */}
          <QuoteSection />

          {/* ♻️ mismo componente del home, con ALACAT en lugar de WCA */}
          <Certifications
            items={CERTIFICATIONS_IMPORTACIONES}
            title="Certificados para el éxito"
          />

          {/* 🆕 */}
          <ImportControl />

          {/* ♻️ mismo patrón que StatsSection, en 4 métricas — ver la nota del
              componente sobre por qué no se parametrizó aquél */}
          <ImportStats />

          {/* ♻️ 3 de 4 tarjetas comparten categoría y foto con ServicesGrid */}
          <ImportSolutions />

          {/* 🆕 */}
          <ImportCtaBanner />

          {/* ♻️ el MISMO componente que monta el home */}
          <SuccessStories />
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
