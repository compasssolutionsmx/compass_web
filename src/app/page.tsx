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
