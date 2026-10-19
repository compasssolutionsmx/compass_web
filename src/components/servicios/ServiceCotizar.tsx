import type { ServicioCotizar } from "@/lib/servicios-contenido";

export type ServiceCotizarProps = ServicioCotizar;

/**
 * Sección "cómo cotizar" de la plantilla de servicio. Va entre <ServiceFaq> y
 * <RelatedServicesCarousel>, y sólo se renderiza si la entrada declara
 * `cotizar` en `lib/servicios-contenido.ts`.
 *
 * MISMA COLUMNA DE LECTURA QUE LAS PREGUNTAS (`max-w-[68ch]`) y misma
 * tipografía de cuerpo de artículo: el <h2> calca al rótulo de <ServiceFaq> y
 * la lista de requisitos usa el `ul` de ArticleBody.tsx tal cual.
 */
export default function ServiceCotizar({
  titulo,
  parrafo,
  requisitos,
}: ServiceCotizarProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="max-w-[68ch]">
        <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
          {titulo}
        </h2>
        {parrafo ? (
          <p className="mt-5 leading-relaxed text-slate-700">{parrafo}</p>
        ) : null}
        <ul className="mt-5 list-disc space-y-2 pl-6 leading-relaxed text-slate-700">
          {requisitos.map((requisito) => (
            <li key={requisito}>{requisito}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
