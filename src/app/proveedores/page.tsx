import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProviderForm from "@/components/ProviderForm";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";

const PATH = "/proveedores";

const TITLE = "Proveedores";
const DESCRIPTION =
  "Registre a su empresa como proveedora de Compass Solutions: transporte, almacenaje, agencia aduanal y servicios relacionados con la cadena de suministro.";

export const metadata: Metadata = {
  title: `${TITLE} | Compass Solutions`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Compass Solutions",
    url: PATH,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Proveedores() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `topTone="dark"`: arriba del todo hay `brand-gradient`, igual que en
            el índice del blog. Con "light" el logo y el nav saldrían oscuros
            sobre el degradado y no se leerían. */}
        <Header topTone="dark" />

        <main className="flex-1">
          {/* Mismo hero corto que el índice del blog: `brand-gradient` con las
              esquinas inferiores redondeadas. No se inventa un tratamiento
              nuevo para una página de una sola sección.
              `pt-32` deja pasar el header flotante, que es fixed. */}
          <section className="brand-gradient rounded-b-[2rem] px-6 pb-16 pt-32 md:pb-20 md:pt-40">
            <div className="mx-auto max-w-7xl">
              <Eyebrow tone="dark" className="mb-4">
                Red de proveedores
              </Eyebrow>
              <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                Sea proveedor de Compass Solutions
              </h1>
              {/* DELIBERADAMENTE GENERAL: no enumera requisitos, ni
                  certificaciones exigidas, ni etapas de aprobación, ni plazos
                  de respuesta. Nada de eso está confirmado por el cliente, y
                  escribirlo aquí lo volvería una promesa del sitio. Lo único
                  que se afirma es lo que de verdad ocurre: los datos quedan
                  registrados y disponibles para el área que corresponda. */}
              <p className="mt-5 max-w-2xl text-lg text-brand-50">
                Operamos con una red de aliados que sostiene el movimiento de
                carga de nuestros clientes: transportistas, almacenes, agentes
                aduanales y servicios especializados. Si su empresa trabaja en
                alguno de esos frentes, deje aquí sus datos.
              </p>
              <p className="mt-4 max-w-2xl text-brand-50/90">
                Su registro llega directo al equipo de Compass Solutions y queda
                a disposición del área correspondiente para cuando se evalúen
                nuevos proveedores.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="proveedores-formulario"
            className="mx-auto max-w-3xl px-6 py-16 md:py-24"
          >
            {/* El <h2> mantiene la jerarquía h1 -> h2 -> (h3 de la pantalla de
                confirmación, cuando aparece) -> h4 del footer, sin saltos. */}
            <h2
              id="proveedores-formulario"
              className="mb-2 font-heading text-2xl font-bold text-brand-900 md:text-3xl"
            >
              Registro de proveedores
            </h2>
            <p className="mb-8 text-slate-500">
              Los campos marcados con asterisco son obligatorios.
            </p>

            <ProviderForm />
          </section>
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
