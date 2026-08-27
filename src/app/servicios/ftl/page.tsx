import type { Metadata } from "next";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import ServiceFaq from "@/components/servicios/ServiceFaq";
import ServiceFeatureBlock from "@/components/servicios/ServiceFeatureBlock";
import ServiceHero from "@/components/servicios/ServiceHero";
import ServiceMetrics from "@/components/servicios/ServiceMetrics";
import RelatedServicesCarousel from "@/components/servicios/RelatedServicesCarousel";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";

/**
 * PLANTILLA DE PÁGINA DE SERVICIO, para revisión del cliente. No es contenido
 * final: es la estructura que tendría cualquier página bajo /servicios/,
 * usando FTL (transporte terrestre dedicado) como caso de muestra.
 *
 * RUTA PLANA a propósito: /servicios/ftl, sin anidar por rama ni por modo.
 * Es DISTINTA de lo que generaría `servicePath()` en `src/lib/services.ts`
 * (que anidaría por rama y modo: /servicios/servicio-internacional/terrestre
 * /ftl) — esa función no se tocó, ni el árbol de `lib/services.ts`, ni el
 * footer, ni el nav. Esta página vive sola, sin engancharse todavía a
 * ninguna navegación real. Conectar esta plantilla al árbol de servicios,
 * decidir el esquema de URL definitivo y resolver los puntos pendientes que
 * ya documenta `lib/services.ts` son tareas aparte.
 *
 * `robots: { index: false, follow: false }` y fuera de `sitemap.ts`: es un
 * borrador de revisión, no una página aprobada. Mismo criterio que usó este
 * proyecto con /apartado-legal mientras su aviso era borrador.
 *
 * TODO EL COPY ES MARCADOR DE POSICIÓN, entre corchetes a propósito para que
 * nadie lo confunda con contenido final. Las tres imágenes (hero y una por
 * bloque alternado) son cajas con borde punteado y su medida, sin archivo
 * real detrás. Los números de la banda de métricas quedan como "Pendiente".
 */
const PATH = "/servicios/ftl";
const TITLE = "FTL: transporte terrestre dedicado (plantilla)";
const DESCRIPTION =
  "[Marcador de posición] Plantilla de página de servicio para revisión de estructura. No es copy final.";

export const metadata: Metadata = {
  title: `${TITLE} | Compass Solutions`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  robots: { index: false, follow: false },
};

export default function ServicioFtl() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `topTone="dark"`: el hero es foto con velo oscuro, igual que el de
            artículo de blog. */}
        <Header topTone="dark" />

        <main className="flex-1">
          <ServiceHero />

          {/* Cada bloque alternado es su PROPIA sección, con <Certifications>
              intercalada entre los dos como un separador delgado, no como una
              sección con el mismo peso que las que rodea.

              PADDING ASIMÉTRICO A PROPÓSITO, y sólo en el borde que toca a
              <Certifications>: el `pt-20` de arriba y el `pb-20` de abajo de
              este par de envolturas son el mismo `py-20` de siempre —el
              ritmo del resto de la página no se toca—, pero el borde que
              queda pegado a la banda de certificaciones se recorta aparte. */}
          <div className="mx-auto max-w-7xl px-6 pt-20 pb-10">
            <ServiceFeatureBlock
              eyebrow="Ventaja 1"
              title="[Título de marcador] Cobertura dedicada de punta a punta"
              description="[Texto de marcador de posición] Párrafo describiendo el primer beneficio o característica del servicio FTL, con el nivel de detalle de una sección real: qué incluye, en qué se diferencia y a qué tipo de operación sirve."
              imageSide="left"
              imageLabel="[Imagen de marcador de posición — 1200×900]"
            />
          </div>

          {/* <Certifications> no trae `pt` propio —depende del `pb` de la
              sección anterior, mismo criterio documentado en el propio
              componente—, así que el `pb-10` (40px) del bloque de arriba es
              TODO el hueco que la separa de él: bajó de los 80px de un
              `py-20` completo, que es lo que hacía que la banda se leyera
              como su propia sección y no como un separador.

              Por el otro lado, este componente SÍ trae su propio `pb-16
              md:pb-20` (64/80px) — no se toca, es lo único que no se puede
              tocar en <Certifications.tsx>—, así que el bloque de abajo ya no
              necesita aportar NINGÚN padding superior: sumarlo encima
              duplicaba el hueco (llegaba a 144/160px). Sin ese `pt`, el hueco
              real bajo los logos queda en los mismos 64/80px que ya trae el
              propio componente. */}
          <Certifications />

          <div className="mx-auto max-w-7xl px-6 pb-20">
            <ServiceFeatureBlock
              eyebrow="Ventaja 2"
              title="[Título de marcador] Visibilidad y control en tiempo real"
              description="[Texto de marcador de posición] Párrafo describiendo el segundo beneficio o característica del servicio FTL, con el nivel de detalle de una sección real: qué incluye, en qué se diferencia y a qué tipo de operación sirve."
              imageSide="right"
              imageLabel="[Imagen de marcador de posición — 1200×900]"
            />
          </div>

          <ServiceMetrics />
          <ServiceFaq />
          <RelatedServicesCarousel />
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
