import type { Metadata } from "next";
import { Archivo, DM_Sans } from "next/font/google";
import "./globals.css";
import ConsentProvider from "@/components/ConsentProvider";
import GoogleTagManagerGate from "@/components/GoogleTagManagerGate";
import CookieBanner from "@/components/CookieBanner";
import SmoothScroll from "@/components/SmoothScroll";
import { consentBootstrapScript } from "@/lib/consent";
import { buildSiteJsonLd } from "@/lib/jsonld";

/**
 * Dos familias, self-hosted por next/font (no salen requests a Google):
 *  - DM Sans   -> cuerpo. Es el `font-sans` por defecto, aplicado en <body>.
 *  - Archivo   -> titulares. Se aplica con la utilidad `font-heading` en cada
 *                 h1-h4. Ver los tokens --font-sans / --font-heading en
 *                 globals.css.
 * Ambas son variable fonts, así que no hace falta declarar `weight`: los
 * font-bold / font-semibold de Tailwind interpolan el eje de peso.
 * Sustituyen a Manrope (titulares) e Inter, que salen del proyecto.
 */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

/**
 * `axes: ["wdth"]` NO es decorativo: next/font sólo incluye el eje de peso por
 * defecto, y sin pedir el de ancho el archivo descargado no tendría con qué
 * responder al `font-variation-settings: "wdth" 112.5` (semi expanded) que
 * `--font-heading--font-variation-settings` aplica en globals.css — el texto
 * saldría en ancho normal sin avisar. Archivo declara wdth 62–125 en el
 * catálogo de next/font, así que 112.5 cae dentro del rango.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

/**
 * Dominio final, confirmado. ÚNICA FUENTE de la URL absoluta del sitio: la
 * consumen `metadataBase` de aquí abajo, el JSON-LD del artículo y el sitemap.
 * Antes había una segunda copia hardcodeada en blog/[slug]/page.tsx.
 */
export const SITE_URL = "https://compasssolutions.com.mx";

/**
 * EXPORTADOS para que la home los reutilice. `app/page.tsx` no tenía metadata
 * propia y heredaba estas dos de aquí, que estaba bien para el <title> pero la
 * dejaba SIN canonical: `alternates` no se hereda, hay que declararlo en la
 * página. Y en cuanto una página declara `openGraph`, el del layout se
 * reemplaza entero en vez de fusionarse — así que la home tiene que repetir
 * title, description e imagen para no perderlos. De ahí que salgan de aquí y no
 * duplicadas allá.
 */
export const SITE_TITLE = "Freight forwarder en México | Compass Solutions";
export const SITE_DESCRIPTION =
  "Coordinamos su logística internacional: transporte aéreo, marítimo y terrestre, despacho aduanal y gestión documental, bajo un solo punto de contacto.";

export const metadata: Metadata = {
  // Necesario para que las URLs relativas de Open Graph y los canonical se
  // resuelvan a absolutas: los crawlers no siguen rutas relativas.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // 512x512, el tamaño que recomienda Next para el icono base: desde ahí
  // resuelve el resto de densidades. No hace falta generar más medidas.
  icons: {
    icon: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Compass Solutions",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // 1200x630 (1.91:1), la medida estándar de Open Graph. El archivo original
    // venía en 1200x674 y se recortó centrado (22px arriba y abajo).
    images: [
      {
        url: "/brand/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Contenedor Compass Solutions en el Puerto de Lázaro Cárdenas",
      },
    ],
  },
  // Sin esto X/Twitter muestra una miniatura chica en vez de la imagen grande.
  // Hereda title/description/images de openGraph.
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${dmSans.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Estado por defecto de Google Consent Mode v2 (todo denegado) más la
            reproducción de la decisión ya guardada. El cuerpo se genera en
            lib/consent, para que no se desincronice de las constantes que usa
            el resto de la app.

            ETIQUETA CRUDA Y NO <Script strategy="beforeInteractive">, aunque
            los docs de Next recomienden lo segundo para scripts de terceros.
            Comprobado en el HTML compilado: `beforeInteractive` no emite un
            <script> síncrono, sino que encola el código en `self.__next_s` para
            que lo evalúe el runtime de Next. Eso corre antes de la hidratación,
            que es suficiente para casi todo, pero deja una rendija: una
            etiqueta de terceros pegada a mano en el documento podría ejecutarse
            antes que esa cola, y a Consent Mode llegar tarde es exactamente el
            fallo que no puede ocurrir — sin un `default` previo, gtag.js asume
            consentimiento y su primer hit ya sale con cookies.

            Así, en cambio, el navegador lo ejecuta al parsear, antes de
            cualquier otra cosa del <body>. Es el mismo patrón con el que se
            evita el parpadeo de tema. */}
        <script
          dangerouslySetInnerHTML={{ __html: consentBootstrapScript() }}
        />
        {/* IDENTIDAD DEL SITIO, en TODAS las páginas. Va en el layout y no en
            la home porque el resto de bloques JSON-LD —el `publisher` de cada
            artículo, el `provider` del servicio— ya no repiten la organización:
            la referencian por `@id`. Una referencia sólo resuelve si el nodo
            está en el mismo documento, así que si esto viviera en una sola
            página, las otras 49 quedarían apuntando al vacío. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildSiteJsonLd(SITE_URL)),
          }}
        />
        <ConsentProvider>
          {/* GTM va DENTRO del provider porque lee el consentimiento, y sólo se
              monta cuando lo hay. Ver <GoogleTagManagerGate>. */}
          <GoogleTagManagerGate />
          {/* El banner va ANTES del contenido en el DOM, aunque se vea abajo:
              así el tabulador y los lectores de pantalla se topan con él al
              entrar, en vez de después de recorrer la página entera. Su posición
              visual la fija `position: fixed`, no el orden del marcado. */}
          <CookieBanner />
          <SmoothScroll>{children}</SmoothScroll>
        </ConsentProvider>
      </body>
    </html>
  );
}
