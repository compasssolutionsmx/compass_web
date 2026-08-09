import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProviderForm from "@/components/ProviderForm";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import { bindTail } from "@/lib/typography";

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
          {/* Mismo hero corto que /nosotros: `brand-gradient` con las esquinas
              inferiores redondeadas y sólo eyebrow + titular, centrados. Los
              dos párrafos que vivían aquí bajaron a la columna izquierda de la
              sección siguiente, junto al formulario que describen.
              `pt-32` deja pasar el header flotante, que es fixed.

              EL `px` VA EN EL MISMO ELEMENTO QUE EL `max-w-7xl`, no en el
              <section> de fuera. Con `box-sizing: border-box` el tope de 1280px
              incluye el padding; si el padding queda fuera del tope, el
              contenedor sigue midiendo 1280 completos y el bloque arranca en un
              punto distinto al de las secciones de abajo. Es el mismo desfase
              que había en el hero de artículo. */}
          <section className="brand-gradient rounded-b-[2rem] pb-16 pt-32 md:pb-20 md:pt-40">
            <div className="mx-auto max-w-7xl px-6 text-center">
              <Eyebrow tone="dark" className="mb-4">
                Red de proveedores
              </Eyebrow>
              {/* Sin `max-w`: centrado y sin tope, cabe en una línea desde
                  640px de viewport (mide 667px a `text-5xl`). Por debajo parte
                  en dos, y el `bindTail` SIGUE HACIENDO FALTA: sin él deja
                  "proveedor" sola en la segunda línea entre 360 y 480px, que es
                  casi toda la franja de móvil. El bloque atado, "en proveedor",
                  mide 256px contra los 272px de caja a 320px de viewport. */}
              <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                {bindTail("Conviértase en proveedor")}
              </h1>
            </div>
          </section>

          {/* Misma estructura de contenedor que el hero —`max-w-7xl` con el
              `px-6` en el propio elemento—, así los dos bloques comparten los
              mismos bordes. Antes esta sección era `max-w-3xl`, la mitad de
              ancha que el hero. */}
          <section
            aria-labelledby="proveedores-formulario"
            className="mx-auto max-w-7xl px-6 py-16 md:py-24"
          >
            {/* `lg:items-center`: el texto es bastante más corto que el
                formulario, y alineado arriba dejaba un hueco largo bajo él con
                la tarjeta siguiendo sola hacia abajo. Centrado reparte ese aire
                a ambos lados y las dos columnas se leen como un par.

                En móvil colapsa a una columna y el texto queda ARRIBA por orden
                de DOM, que es el que corresponde: primero se explica qué es esto
                y luego se pide llenarlo. */}
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              {/* CENTRADO EN MÓVIL, alineado a la izquierda de `lg` en adelante.
                  El corte es `lg` y no `md` porque es donde ESTA página abre sus
                  dos columnas (`lg:grid-cols-2`): por debajo, el texto va apilado
                  encima del formulario y centrado se lee como la entrada de la
                  sección; a partir de ahí es la columna izquierda de un par y
                  tiene que arrancar en la misma vertical que la tarjeta.

                  Va en el contenedor y no en cada elemento: `text-align` se
                  hereda, así que una clase cubre el <h2> y los dos párrafos.

                  NO HACE FALTA `mx-auto` EN NINGUNO: revisado el bloque entero,
                  ninguno de los tres lleva `max-w-*` propio, así que sus cajas ya
                  ocupan el ancho completo de la celda y centrar el texto los
                  centra de verdad. Si algún día se le pone un tope de medida a
                  los párrafos —como el `max-w-[42ch]` de <ImportStats>—, ese
                  elemento necesitará además su `mx-auto` o quedará el texto
                  centrado dentro de una caja pegada a la izquierda. */}
              <div className="text-center lg:text-left">
                {/* El <h2> mantiene la jerarquía h1 -> h2 -> (h3 de la pantalla
                    de confirmación, cuando aparece) -> h4 del footer, sin
                    saltos. Nombra la sección entera, formulario incluido, y por
                    eso es el destino del `aria-labelledby`. */}
                <h2
                  id="proveedores-formulario"
                  className="font-heading text-2xl font-bold text-brand-900 md:text-3xl"
                >
                  {bindTail("Complete el formulario")}
                </h2>

                {/* DELIBERADAMENTE GENERAL: no enumera requisitos, ni
                    certificaciones exigidas, ni etapas de aprobación, ni plazos
                    de respuesta. Nada de eso está confirmado por el cliente, y
                    escribirlo aquí lo volvería una promesa del sitio. Lo único
                    que se afirma es lo que de verdad ocurre: los datos quedan
                    registrados y disponibles para el área que corresponda.

                    El texto es el mismo que estaba en el hero, palabra por
                    palabra; sólo cambia el color, que pasa de brand-50 sobre el
                    degradado a slate-600 sobre blanco. */}
                <p className="mt-5 text-lg leading-relaxed text-slate-600">
                  {bindTail(
                    "Operamos con una red de aliados que sostiene el movimiento de carga de nuestros clientes: transportistas, almacenes, agentes aduanales y servicios especializados. Si su empresa trabaja en alguno de esos frentes, deje aquí sus datos.",
                  )}
                </p>
                <p className="mt-4 leading-relaxed text-slate-600">
                  {bindTail(
                    "Su registro llega directo al equipo de Compass Solutions y queda a disposición del área correspondiente para cuando se evalúen nuevos proveedores.",
                  )}
                </p>
              </div>

              {/* SE QUITÓ EL <h2> "Registro de proveedores": con el titular de
                  la izquierda eran dos encabezados del mismo nivel diciendo casi
                  lo mismo, uno al lado del otro.

                  Y la nota de campos obligatorios se MUDÓ DENTRO de la tarjeta,
                  a <ProviderForm>. Aquí fuera quedaba en tierra de nadie: por
                  encima del borde blanco se leía como el cierre del texto de la
                  izquierda y no como una instrucción del formulario. */}
              <ProviderForm />
            </div>
          </section>
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
