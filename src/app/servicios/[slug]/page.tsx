import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import ServiceCierre from "@/components/servicios/ServiceCierre";
import ServiceCotizar from "@/components/servicios/ServiceCotizar";
import ServiceFaq from "@/components/servicios/ServiceFaq";
import ServiceFeatureBlock from "@/components/servicios/ServiceFeatureBlock";
import ServiceHero from "@/components/servicios/ServiceHero";
import RelatedServicesCarousel from "@/components/servicios/RelatedServicesCarousel";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import {
  allServicioSlugs,
  getServicioBySlug,
  serviciosRelacionados,
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
 * SIN `robots` DECLARADO: las 18 heredan el comportamiento indexable por
 * defecto y entran en `sitemap.ts`, derivadas de `allServicioSlugs()`. Antes
 * llevaban `robots: { index: false, follow: false }` porque el copy era de
 * relleno; hoy el copy es real y se levantó ese bloqueo. El `canonical` de
 * abajo ya no convive con un noindex, así que las dos señales apuntan al
 * mismo lado.
 *
 * SIN NINGÚN MARCADOR DE POSICIÓN VISIBLE. El copy de las 18 es real y ya no
 * queda nada entre corchetes ni ningún "Pendiente" en pantalla. Lo que sigue
 * faltando es el ARTE: las tres cajas de imagen (hero y una por bloque
 * alternado) llevan el degradado de marca en la medida exacta que tendrá la
 * foto, sin borde punteado ni etiqueta, para que el hueco no se anuncie como
 * hueco en una página que ya se indexa.
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

  const [bloqueUno, ...restoBloques] = servicio.bloques;

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
              vinetas={bloqueUno.vinetas}
              flujo={bloqueUno.flujo}
              imageSide="left"
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

          {/* Del segundo bloque en adelante, todos después de la banda. La
              alternancia sigue la posición en `servicio.bloques`: el segundo
              a la derecha, el tercero a la izquierda y así. `gap-20` es el
              mismo `py-20` de ritmo entre secciones; con dos bloques sólo hay
              un hijo y el resultado es idéntico al de antes. */}
          <div className="mx-auto flex max-w-7xl flex-col gap-20 px-6 pb-20">
            {restoBloques.map((bloque, i) => (
              <ServiceFeatureBlock
                key={bloque.titulo}
                eyebrow={bloque.eyebrow}
                title={bloque.titulo}
                description={bloque.parrafo}
                vinetas={bloque.vinetas}
                flujo={bloque.flujo}
                imageSide={i % 2 === 0 ? "right" : "left"}
              />
            ))}
          </div>

          <ServiceFaq
            rotulo={servicio.preguntasRotulo}
            preguntas={servicio.preguntas}
          />
          {servicio.cotizar ? <ServiceCotizar {...servicio.cotizar} /> : null}
          {servicio.cierre ? <ServiceCierre {...servicio.cierre} /> : null}
          <RelatedServicesCarousel
            servicios={serviciosRelacionados(servicio.slug)}
          />
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
