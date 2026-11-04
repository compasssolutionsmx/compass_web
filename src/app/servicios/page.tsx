import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import ServiceCierre from "@/components/servicios/ServiceCierre";
import ServiceHero from "@/components/servicios/ServiceHero";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import {
  GRUPOS_SERVICIOS,
  getServicioBySlug,
} from "@/lib/servicios-contenido";

/**
 * ÍNDICE DE SERVICIOS. Reúne las 18 páginas de `/servicios/<slug>` en los
 * cuatro grupos de `GRUPOS_SERVICIOS`, que es la misma agrupación que leen el
 * mega menú, el footer y la home.
 *
 * SIN COPY NUEVO:
 *  - El párrafo de entrada junta frases que ya están en el sitio: la oferta
 *    "en tres ejes principales: aéreo, terrestre y marítimo" de /nosotros,
 *    el "un solo punto de contacto" de la descripción del sitio
 *    (`SITE_DESCRIPTION`) y las "soluciones logísticas que impulsan el
 *    crecimiento de cada industria" del hero de la home.
 *  - La línea de cada tarjeta es la primera oración de la `seoDescripcion`
 *    del servicio.
 *  - El cierre repite el bloque "Soluciones logísticas integrales" de la home
 *    (<IntegratedSolutions>).
 *
 * Cada sección lleva el `slug` del grupo como `id`, que es a donde apuntan
 * las tarjetas de modo de la home (`/servicios#maritimo`).
 */

const TITULO = "Servicios de logística y transporte de carga";
const DESCRIPCION =
  "Freight forwarder en México: transporte aéreo, marítimo y terrestre, despacho aduanal y gestión documental, bajo un solo punto de contacto.";
const PATH = "/servicios";

export const metadata: Metadata = {
  title: `${TITULO} | Compass Solutions`,
  description: DESCRIPCION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Compass Solutions",
    url: PATH,
    title: `${TITULO} | Compass Solutions`,
    description: DESCRIPCION,
    // Explícita y no heredada: un `openGraph` propio REEMPLAZA al del layout.
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

const ENTRADA =
  "Compass Solutions es un freight forwarder con una oferta integral de servicios en tres ejes principales: aéreo, terrestre y marítimo. Coordinamos su logística internacional, con despacho aduanal y gestión documental, bajo un solo punto de contacto. Diseñamos soluciones logísticas que impulsan el crecimiento de cada industria.";

/** Primera oración de un texto: hasta el primer punto seguido de espacio. */
function primeraOracion(texto: string): string {
  const fin = texto.search(/\.\s/);
  return fin === -1 ? texto : texto.slice(0, fin + 1);
}

const GRUPOS = GRUPOS_SERVICIOS.map((grupo) => ({
  slug: grupo.slug,
  nombre: grupo.nombre,
  servicios: grupo.servicios.map((slug) => {
    const servicio = getServicioBySlug(slug);
    if (!servicio) throw new Error(`/servicios: slug desconocido "${slug}"`);
    return {
      slug,
      nombre: servicio.nombre,
      linea: primeraOracion(servicio.seoDescripcion),
    };
  }),
}));

export default function ServiciosIndex() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        <Header topTone="dark" />

        <main className="flex-1">
          <ServiceHero
            eyebrow="Freight forwarder y logística internacional en México"
            titulo={TITULO}
            parrafo={ENTRADA}
          />

          {/* Mismo ritmo que la plantilla de servicio: `py-20` por sección
              y `gap-20` entre grupos. */}
          <div className="mx-auto flex max-w-7xl flex-col gap-20 px-6 py-20">
            {GRUPOS.map((grupo) => (
              <section
                key={grupo.slug}
                id={grupo.slug}
                aria-labelledby={`${grupo.slug}-titulo`}
              >
                <h2
                  id={`${grupo.slug}-titulo`}
                  className="font-heading text-3xl font-bold text-brand-900 md:text-4xl"
                >
                  {grupo.nombre}
                </h2>

                <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {grupo.servicios.map((servicio) => (
                    <li key={servicio.slug} className="min-w-0">
                      <Link
                        href={`/servicios/${servicio.slug}`}
                        className="flex h-full flex-col rounded-2xl bg-brand-100 p-6 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
                      >
                        <h3 className="font-heading text-lg font-bold text-brand-900">
                          {servicio.nombre}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                          {servicio.linea}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Sin `pt` propio en <ServiceCierre>: el `py-20` de arriba da el
              hueco superior. Debajo no hay carrusel, así que se le suma el
              `pb-20` para que no quede pegado al footer. */}
          <div className="pb-20">
            <ServiceCierre
              titulo="Soluciones logísticas integrales"
              parrafo="Coordinamos importaciones y exportaciones por aire, mar y tierra bajo un mismo techo, conectando los puertos, aeropuertos y corredores terrestres donde se mueve su carga. Un solo punto de contacto para toda su operación internacional."
              textoBoton="Solicitar cotización"
            />
          </div>
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
