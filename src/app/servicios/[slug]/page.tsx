import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import {
  allServicioSlugs,
  getServicioBySlug,
} from "@/lib/servicios-contenido";

/**
 * PÁGINA DE SERVICIO, una ruta dinámica para las 18. Sustituye a la plantilla
 * estática /servicios/ftl, que era este mismo diseño con el copy de FTL
 * incrustado: ahora el diseño vive aquí y el copy en
 * `lib/servicios-contenido.ts`, una entrada por página.
 *
 * RUTAS PLANAS a propósito: /servicios/<slug>, sin anidar por rama ni por
 * modo. Siguen siendo DISTINTAS de lo que generaría `servicePath()` en
 * `src/lib/services.ts` (que anidaría por rama y modo). Ese árbol no se tocó,
 * ni el footer, ni el nav: estas páginas siguen sin engancharse a ninguna
 * navegación real. `lib/servicios-contenido.ts` lista dónde no coinciden los
 * dos modelos.
 *
 * `robots: { index: false, follow: false }` y fuera de `sitemap.ts`: son
 * borradores de revisión, no páginas aprobadas. Mismo criterio que usó este
 * proyecto con /apartado-legal mientras su aviso era borrador, y el que ya
 * traía la plantilla de FTL.
 *
 * TODO EL COPY ES MARCADOR DE POSICIÓN, entre corchetes, salvo el nombre del
 * servicio en el <h1>. Las tres imágenes (hero y una por bloque alternado)
 * son cajas con borde punteado y su medida, sin archivo real detrás. Los
 * números de la banda de métricas quedan como "Pendiente".
 */

/** Rutas estáticas: una por entrada de `lib/servicios-contenido.ts`. */
export function generateStaticParams() {
  return allServicioSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const servicio = getServicioBySlug(slug);
  if (!servicio) return {};

  return {
    title: `${servicio.seoTitulo} | Compass Solutions`,
    description: servicio.seoDescripcion,
    alternates: { canonical: `/servicios/${servicio.slug}` },
    robots: { index: false, follow: false },
  };
}

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const servicio = getServicioBySlug(slug);
  if (!servicio) notFound();

  const [bloqueUno, bloqueDos] = servicio.bloques;

  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `topTone="dark"`: el hero es foto con velo oscuro, igual que el de
            artículo de blog. */}
        <Header topTone="dark" />

        <main className="flex-1">
          <ServiceHero
            eyebrow={servicio.heroEyebrow}
            titulo={servicio.heroTitulo}
            parrafo={servicio.heroParrafo}
          />

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
              eyebrow={bloqueUno.eyebrow}
              title={bloqueUno.titulo}
              description={bloqueUno.parrafo}
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
              eyebrow={bloqueDos.eyebrow}
              title={bloqueDos.titulo}
              description={bloqueDos.parrafo}
              imageSide="right"
              imageLabel="[Imagen de marcador de posición — 1200×900]"
            />
          </div>

          <ServiceMetrics
            titulo={servicio.metricasTitulo}
            metricas={servicio.metricas}
          />
          <ServiceFaq
            rotulo={servicio.preguntasRotulo}
            preguntas={servicio.preguntas}
          />
          <RelatedServicesCarousel />
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
