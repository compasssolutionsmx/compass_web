import Eyebrow from "../Eyebrow";
import { QuoteButton } from "../QuoteModal";

export type ServiceFeatureBlockProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Qué lado de la rejilla lleva la imagen en escritorio. */
  imageSide: "left" | "right";
  imageLabel: string;
};

/**
 * Bloque alternado de imagen y texto para páginas de servicio.
 *
 * NO HAY UN COMPONENTE EQUIVALENTE EN EL SITIO HOY. Lo más cercano es el
 * bloque superior de <StatsSection> (imagen + Eyebrow + H2 + párrafo, sin
 * CTA) y la rejilla de <ImportControl> (Eyebrow + H2 + párrafo + recorte
 * transparente dentro de una tarjeta con sombra) — ninguno de los dos
 * reutilizable tal cual: uno vive dentro de una caja tintada con métricas
 * debajo, el otro usa un recorte de imagen sobre fondo transparente y una
 * tarjeta propia. Este componente toma prestada su gramática visual común
 * —rejilla de dos columnas, imagen con esquinas redondeadas, Eyebrow + H2 +
 * párrafo + CTA— sin la caja ni el tinte de ninguno de los dos, para poder
 * repetirse dos veces en la misma página sin arrastrar contexto ajeno.
 *
 * EL LADO DE LA IMAGEN SE ALTERNA CAMBIANDO EL ORDEN REAL EN EL DOM, no con
 * `order` de grid — mismo criterio que ya usa <StatsSection> ("Primera en
 * el DOM, así que en móvil queda arriba al apilarse"). Por eso en móvil el
 * primer bloque apila con la imagen arriba y el segundo con el texto
 * arriba: cada uno sigue su propio orden de DOM, no uno forzado igual para
 * los dos.
 *
 * SIN FOTO REAL: el marcador ocupa la misma caja `aspect-[4/3]
 * overflow-hidden rounded-2xl` que llevaría la <Image> real (mismo
 * tratamiento que <StatsSection>).
 */
export default function ServiceFeatureBlock({
  eyebrow,
  title,
  description,
  imageSide,
  imageLabel,
}: ServiceFeatureBlockProps) {
  const imagen = (
    <div className="overflow-hidden rounded-2xl">
      <div className="flex aspect-[4/3] w-full items-center justify-center border border-dashed border-slate-300 bg-slate-100">
        <p className="px-6 text-center font-heading text-sm font-semibold text-slate-500">
          {imageLabel}
        </p>
      </div>
    </div>
  );

  const texto = (
    <div>
      <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
      <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
        {title}
      </h2>
      <p className="mt-5 text-slate-600">{description}</p>
      <QuoteButton className="mt-8 rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90">
        Solicitar cotización
      </QuoteButton>
    </div>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
      {imageSide === "left" ? (
        <>
          {imagen}
          {texto}
        </>
      ) : (
        <>
          {texto}
          {imagen}
        </>
      )}
    </div>
  );
}
