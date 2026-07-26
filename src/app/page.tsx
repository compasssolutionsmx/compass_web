import BlogPreview from "@/components/BlogPreview";
import Certifications from "@/components/Certifications";
import FeaturesGrid from "@/components/FeaturesGrid";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IntegratedSolutions from "@/components/IntegratedSolutions";
import { QuoteModalProvider } from "@/components/QuoteModal";
import ServicesGrid from "@/components/ServicesGrid";
import StatsSection from "@/components/StatsSection";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import YearsBanner from "@/components/YearsBanner";

export default function Home() {
  return (
    // El provider monta el modal de cotización y lo deja disponible para
    // cualquier <QuoteButton> del árbol (Header y Soluciones Integrales).
    <QuoteModalProvider>
      <Header />
      <main className="flex-1">
        <Hero />
        <Certifications />
        <StatsSection />
        <FeaturesGrid />
        <YearsBanner />
        <ServicesGrid />
        <IntegratedSolutions />
        <BlogPreview />
      </main>
      <WhatsAppFloatingButton />
      <Footer />
    </QuoteModalProvider>
  );
}
