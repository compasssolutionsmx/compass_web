import type { Metadata } from "next";
import Certifications from "@/components/Certifications";
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
import { organizationRef } from "@/lib/jsonld";

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
    // Explícita y no heredada: un `openGraph` propio REEMPLAZA al del layout
    // raíz, así que sin esto la landing se compartía con tarjeta grande y sin
    // imagen. Importa más aquí que en el resto: esta URL es el destino de los
    // anuncios y se pega en chats y correos.
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

/**
 * JSON-LD de la landing.
 *
 * REGLA DEL PROYECTO: todo dato aquí tiene que estar VISIBLE como texto en esta
 * misma página. Por eso el bloque es corto y por eso NO lleva `aggregateRating`,
 * `areaServed` con una lista de países, ni `telephone` de sucursales — nada de
 * eso se pinta. Lo que declara:
 *
 *   name / description   → el <h1> y el párrafo del hero
 *   serviceType          → los cuatro títulos de "Soluciones Logísticas"
 *
 * EL `provider` YA NO SE DEFINE AQUÍ. Antes este bloque repetía la
 * organización —nombre, url y teléfono— y era la segunda de cuatro copias
 * sueltas de la misma empresa en el sitio. Ahora apunta por `@id` al nodo
 * canónico que el layout raíz pinta en todas las páginas, así que el teléfono,
 * el logotipo y el domicilio siguen declarados, sólo que una sola vez.
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
    // REFERENCIA, no copia. La organización se define una sola vez en el
    // layout raíz (`lib/jsonld.ts`) y aquí sólo se apunta por `@id`. Antes este
    // bloque repetía nombre, url y teléfono, creando una segunda organización
    // sin identificador que ningún crawler podía unificar con la del blog.
    provider: organizationRef(SITE_URL),
    url: new URL(PATH, SITE_URL).toString(),
  };
}

/**
 * Nav interno del header de esta landing. NO son los enlaces globales del
 * sitio: apuntan a secciones de esta misma página, así que retienen al
 * visitante en vez de sacarlo, que es lo que `variant="conversion"` quiere
 * evitar.
 *
 * Los `href` llevan la RUTA COMPLETA y no `/#seccion`: la barra sola significa
 * "home + ancla" y mandaría al usuario a otra página. Con la ruta de aquí,
 * Lenis compara pathname, ve que es el actual y lo intercepta con su scroll
 * suave y su offset.
 *
 * Sin "Gestión aduanal / freight forwarder" por ahora, decisión de contenido.
 */
const NAV_LANDING = [
  { href: `${PATH}#certificaciones`, label: "Certificaciones" },
  { href: `${PATH}#soluciones`, label: "Soluciones" },
  { href: `${PATH}#resultados`, label: "Resultados" },
];

export default function ImportacionesAMexico() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `variant="conversion"`: logo, teléfono y un CTA. Sin los cuatro
            enlaces de nav — en una landing de una sola sección apuntarían fuera
            de la página, que es lo último que quiere una página de campaña.
            Volver al header completo es cambiar esta palabra. */}
        <Header topTone="dark" variant="conversion" navLinks={NAV_LANDING} />

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

          {/* ♻️ IDÉNTICA a la del home: mismos logos y mismo título, sin
              props. Tuvo las dos cosas propias —un juego con ISO en vez de WCA
              y el título "Certificados para el éxito" del mockup— y las dos se
              retiraron. El componente sigue aceptando `items` y `title` por si
              alguna vez vuelven a divergir. */}
          <Certifications />

          {/* 🆕 */}
          <ImportControl />

          {/* ♻️ 3 de 4 tarjetas comparten categoría y foto con ServicesGrid */}
          <ImportSolutions />

          {/* ♻️ mismo patrón que StatsSection, en 4 métricas — ver la nota del
              componente sobre por qué no se parametrizó aquél */}
          <ImportStats />

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
