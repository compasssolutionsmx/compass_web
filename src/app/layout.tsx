import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

/**
 * Dos familias, self-hosted por next/font (no salen requests a Google):
 *  - DM Sans   -> cuerpo. Es el `font-sans` por defecto, aplicado en <body>.
 *  - Manrope   -> titulares. Se aplica con la utilidad `font-heading` en cada
 *                 h1-h4. Ver los tokens --font-sans / --font-heading en
 *                 globals.css.
 * Ambas son variable fonts, así que no hace falta declarar `weight`: los
 * font-bold / font-semibold de Tailwind interpolan el eje de peso.
 * Sustituyen a Inter, que sale del proyecto.
 */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Transformamos los desafíos globales en oportunidades. Diseñamos soluciones logísticas sin fronteras que impulsan el crecimiento de cada industria a través de las fronteras.";

// TODO: definir title/description reales de SEO con el equipo de contenido.
// El spec de referencia sólo trae el <title> del archivo de spec, no el del
// sitio en producción.
export const metadata: Metadata = {
  // Dominio final, confirmado. Necesario para que las URLs relativas de Open
  // Graph se resuelvan a absolutas: los crawlers no siguen rutas relativas.
  metadataBase: new URL("https://compasssolutions.com.mx"),
  title: "Compass Solutions",
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
    title: "Compass Solutions",
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
      className={`${dmSans.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
