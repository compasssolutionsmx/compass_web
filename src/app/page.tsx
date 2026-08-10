import type { Metadata } from "next";
import BlogPreview from "@/components/BlogPreview";
import Certifications from "@/components/Certifications";
import FeaturesGrid from "@/components/FeaturesGrid";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IntegratedSolutions from "@/components/IntegratedSolutions";
import { QuoteModalProvider } from "@/components/QuoteModal";
import QuoteSection from "@/components/QuoteSection";
import ServicesGrid from "@/components/ServicesGrid";
import StatsSection from "@/components/StatsSection";
import SuccessStories from "@/components/SuccessStories";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import YearsBanner from "@/components/YearsBanner";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/app/layout";

/**
 * La home era la ÚNICA página indexable sin canonical. Heredaba title y
 * description del layout, pero `alternates` no se hereda: hay que declararlo
 * por página. Sin él, cualquier variante con parámetros —los `?utm_*` de las
 * campañas, un `?fbclid` pegado desde Meta— puede indexarse como URL aparte y
 * repartir la señal de la página más importante del sitio.
 *
 * `openGraph` se repite ENTERO a propósito: en cuanto una página declara el
 * suyo, reemplaza al del layout en vez de fusionarse, así que declarar sólo
 * `url` habría dejado la home sin imagen al compartirla. Las constantes vienen
 * del layout para que no puedan divergir.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Compass Solutions",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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

export default function Home() {
  return (
    // Los dos providers montan sus modales y los dejan disponibles para
    // cualquier <QuoteButton> / <WhatsAppButton> del árbol. El de WhatsApp va
    // POR FUERA porque <QuoteModal> lo llama para pasar de un modal al otro.
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* Arriba del todo esta página tiene el video del hero detrás. */}
        <Header topTone="dark" />
        <main className="flex-1">
          <Hero />
          <QuoteSection />
          <Certifications />
          <StatsSection />
          <FeaturesGrid />
          <YearsBanner />
          <ServicesGrid />
          <SuccessStories />
          <IntegratedSolutions />
          <BlogPreview />
        </main>
        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
