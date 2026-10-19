import { ChevronDown } from "lucide-react";
import type { ServicioPregunta } from "@/lib/servicios-contenido";
import Eyebrow from "../Eyebrow";
import { WhatsAppButton } from "../WhatsAppModal";

export type ServiceFaqProps = {
  /** Rótulo <h2>. Empieza siempre por "Preguntas frecuentes", ver el tipo
   *  `ServicioContenido` en `lib/servicios-contenido.ts`. */
  rotulo: string;
  preguntas: readonly ServicioPregunta[];
};

/**
 * Preguntas frecuentes de la plantilla de servicio, en dos columnas.
 *
 * MISMO PATRÓN DE COLUMNA FIJA QUE <RelatedServicesCarousel> EN ESTA MISMA
 * PÁGINA (que a su vez calca a <BlogPreview>): rejilla
 * `lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]`, columna izquierda angosta
 * y fija, columna derecha con el contenido que varía. En móvil colapsa a una
 * sola columna y apila en el orden del DOM: la columna fija primero, las
 * preguntas debajo.
 *
 * `lg:items-start` y no `lg:items-center` —a diferencia de
 * <RelatedServicesCarousel>—: aquí la columna derecha (tres preguntas con su
 * respuesta) es bastante más alta que el bloque de contacto de la izquierda,
 * y centrar un bloque corto contra uno alto lo deja flotando a media altura.
 * Alineados arriba, el título de la izquierda queda a la misma altura que el
 * de la derecha, mismo criterio que ya usa <ImportStats> por la misma razón.
 *
 * MISMO PATRÓN QUE `extractFaq()` RECONOCE en las notas del blog
 * (src/lib/blog.ts): un <h2> rótulo que empieza con "Preguntas frecuentes"
 * seguido de preguntas en <h3>, cada una con su respuesta debajo. Esta
 * página no es un .mdx —`extractFaq()` sólo procesa el contenido de
 * `src/content/blog`—, así que aquí no genera ningún `FAQPage` de forma
 * automática. Se sigue el mismo patrón de encabezados a propósito: si esta
 * plantilla se aprueba y las páginas de servicio ganan su propio pipeline de
 * datos estructurados, la marcación ya calza con lo que ese código espera
 * reconocer, sin tener que reescribir esta sección.
 *
 * TIPOGRAFÍA DE PREGUNTA/RESPUESTA calcada de `heading()` en ArticleBody.tsx
 * (h2 `mt-12 text-2xl md:text-3xl`, h3 `mt-8 text-xl md:text-2xl`, los dos
 * `font-heading font-bold text-brand-900`) y del párrafo de respuesta (`mt-5
 * leading-relaxed text-slate-700`), para que la columna derecha se lea igual
 * que el cuerpo de un artículo del blog. El `mt-12` del h2 original no
 * aplica aquí: como primer elemento de su columna no necesita el aire
 * superior que sí necesita colgando de un párrafo anterior.
 *
 * ACORDEÓN CON <details>/<summary> NATIVOS, todas cerradas de entrada. Las
 * respuestas van en el HTML desde el render del servidor aunque estén
 * colapsadas: <details> sólo oculta su contenido, no lo saca del DOM, y
 * eso es requisito de SEO. Los nativos dan gratis el teclado (Tab al
 * <summary>, Enter o Espacio para abrir) y anuncian el estado
 * expandido/colapsado a lectores de pantalla, sin `aria-expanded` a mano.
 * El <h3> va DENTRO del <summary> (el modelo de contenido lo permite) para
 * conservar la jerarquía h2 > h3 que reconoce `extractFaq()`. Mismo
 * chevron con `group-open:rotate-180` que el índice móvil de ArticleToc.tsx;
 * tarjeta con la sombra suave de las tarjetas blancas de <StatsSection>.
 *
 * EL RÓTULO Y LAS PREGUNTAS LLEGAN POR PROPS desde
 * `lib/servicios-contenido.ts`. El rótulo sigue empezando por "Preguntas
 * frecuentes" en las 18 entradas: ese prefijo es lo que reconoce
 * `extractFaq()`, y romperlo dejaría la marcación sin calzar el día que estas
 * páginas ganen su propio pipeline de datos estructurados.
 */
export default function ServiceFaq({ rotulo, preguntas }: ServiceFaqProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
        {/* ---------- Columna fija ---------- */}
        <div>
          <Eyebrow className="mb-3">Contacto</Eyebrow>
          <h2 className="font-heading text-3xl font-bold leading-tight text-brand-900 md:text-4xl">
            ¿Alguna duda?
          </h2>
          <p className="mt-4 max-w-sm text-slate-600">
            Si su operación tiene un requerimiento que no aparece aquí,
            escríbanos y lo revisamos con usted.
          </p>
          <WhatsAppButton className="mt-6 rounded-full bg-brand-900 px-6 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Escríbanos por WhatsApp
          </WhatsAppButton>
        </div>

        {/* ---------- Columna de preguntas ---------- */}
        <div className="max-w-[68ch]">
          <h2 className="font-heading text-2xl font-bold text-brand-900 md:text-3xl">
            {rotulo}
          </h2>

          <div className="mt-8 space-y-4">
            {preguntas.map((item) => (
              <details
                key={item.pregunta}
                className="group rounded-2xl bg-white shadow-sm shadow-brand-950/5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-heading text-lg font-bold text-brand-900 md:text-xl">
                    {item.pregunta}
                  </h3>
                  <ChevronDown
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-brand-900 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-slate-700">
                  {item.respuesta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
