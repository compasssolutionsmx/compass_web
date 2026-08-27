import Eyebrow from "../Eyebrow";
import { WhatsAppButton } from "../WhatsAppModal";

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
 */
const PREGUNTAS = [
  {
    pregunta: "[Marcador de posición] ¿Qué es el servicio FTL?",
    respuesta:
      "[Texto de marcador de posición] Aquí va la respuesta completa a esta pregunta, con el mismo nivel de detalle que las preguntas frecuentes del blog: contexto, condiciones de operación y una cifra o un plazo concreto cuando corresponda.",
  },
  {
    pregunta: "[Marcador de posición] ¿Cuándo conviene FTL frente a LTL?",
    respuesta:
      "[Texto de marcador de posición] Aquí va la respuesta completa a esta pregunta, con el mismo nivel de detalle que las preguntas frecuentes del blog: contexto, condiciones de operación y una cifra o un plazo concreto cuando corresponda.",
  },
  {
    pregunta: "[Marcador de posición] ¿Qué cobertura tiene el servicio?",
    respuesta:
      "[Texto de marcador de posición] Aquí va la respuesta completa a esta pregunta, con el mismo nivel de detalle que las preguntas frecuentes del blog: contexto, condiciones de operación y una cifra o un plazo concreto cuando corresponda.",
  },
];

export default function ServiceFaq() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
        {/* ---------- Columna fija ---------- */}
        <div>
          <Eyebrow className="mb-3">[Contacto]</Eyebrow>
          <h2 className="font-heading text-3xl font-bold leading-tight text-brand-900 md:text-4xl">
            ¿Alguna duda?
          </h2>
          <p className="mt-4 max-w-sm text-slate-600">
            [Texto de marcador de posición] Invitación breve a resolver
            cualquier duda directamente con el equipo, en un tono cercano y
            sin tecnicismos.
          </p>
          <WhatsAppButton className="mt-6 rounded-full bg-brand-900 px-6 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Escríbanos por WhatsApp
          </WhatsAppButton>
        </div>

        {/* ---------- Columna de preguntas ---------- */}
        <div className="max-w-[68ch]">
          <h2 className="font-heading text-2xl font-bold text-brand-900 md:text-3xl">
            Preguntas frecuentes sobre FTL
          </h2>

          {PREGUNTAS.map((item) => (
            <div key={item.pregunta}>
              <h3 className="mt-8 font-heading text-xl font-bold text-brand-900 md:text-2xl">
                {item.pregunta}
              </h3>
              <p className="mt-5 leading-relaxed text-slate-700">
                {item.respuesta}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
