import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// TODO: tipografía real de marca sin confirmar. Inter es el placeholder que
// venía en el spec estructural.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// TODO: definir title/description reales de SEO con el equipo de contenido.
// El spec de referencia sólo trae el <title> del archivo de spec, no el del
// sitio en producción.
export const metadata: Metadata = {
  title: "Compass Solutions",
  description:
    "Transformamos los desafíos globales en oportunidades. Diseñamos soluciones logísticas sin fronteras que impulsan el crecimiento de cada industria a través de las fronteras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
