import Image from "next/image";
import type { ServicioPaso } from "@/lib/servicios-contenido";
import Eyebrow from "../Eyebrow";
import { QuoteButton } from "../QuoteModal";

export type ServiceFeatureBlockProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Lista con viñetas debajo del párrafo. Mismo estilo que el `ul` de
   *  ArticleBody.tsx. */
  vinetas?: readonly string[];
  /** Pasos del bloque. Si los trae, el bloque pasa a ancho completo, sin
   *  imagen ni botón, con los pasos como rejilla de tarjetas numeradas. */
  flujo?: readonly ServicioPaso[];
  /** Qué lado de la rejilla lleva la imagen en escritorio. Se ignora en los
   *  bloques con `flujo`, que no llevan imagen. */
  imageSide?: "left" | "right";
  /** Ruta pública de la foto. Sin ella se pinta el degradado de marca. */
  imagen?: string;
  /** Texto alternativo de `imagen`. */
  imagenAlt?: string;
  /**
   * Carga la foto con prioridad (`fetchPriority="high"` y sin `lazy`). Sólo
   * para el primer bloque de la página: en escritorio su foto entra en el
   * primer pliegue y es candidata a LCP. El resto se queda en diferido.
   */
  prioridad?: boolean;
};

/**
 * Span de cada tamaño de fila sobre la rejilla de 12 columnas de escritorio.
 * Clases literales para que Tailwind las detecte al compilar.
 */
const SPAN_POR_FILA: Record<number, string> = {
  1: "lg:col-span-12",
  2: "lg:col-span-6",
  3: "lg:col-span-4",
  4: "lg:col-span-3",
};

/**
 * Reparte `n` elementos en filas de hasta cuatro, lo más parejas posible:
 * primero se fija el número de filas que exigen cuatro por fila y luego se
 * reparte el total entre ellas. Las filas largas van primero.
 *
 *   6 → 3 3      7 → 4 3      8 → 4 4
 *   9 → 3 3 3   10 → 4 3 3   11 → 4 4 3
 */
function filasParejas(n: number): number[] {
  const filas = Math.ceil(n / 4);
  const base = Math.floor(n / filas);
  const sobrantes = n % filas;
  return Array.from({ length: filas }, (_, i) =>
    i < sobrantes ? base + 1 : base,
  );
}

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
 * FOTO: si el bloque trae `imagen`, se pinta con next/image dentro de la
 * caja `aspect-[4/3] overflow-hidden rounded-2xl` (mismo tratamiento que
 * <StatsSection>). Si no la trae, la misma caja se rellena con el degradado
 * de marca de globals.css, sin borde punteado ni etiqueta: estas páginas ya
 * se indexan y el hueco no puede anunciarse como hueco.
 */
export default function ServiceFeatureBlock({
  eyebrow,
  title,
  description,
  vinetas,
  flujo,
  imageSide = "left",
  imagen,
  imagenAlt = "",
  prioridad = false,
}: ServiceFeatureBlockProps) {
  if (flujo && flujo.length > 0) {
    return (
      <BloqueFlujo
        eyebrow={eyebrow}
        title={title}
        description={description}
        vinetas={vinetas}
        flujo={flujo}
      />
    );
  }

  /* Misma caja `aspect-[4/3] overflow-hidden rounded-2xl` con o sin foto,
     para que la rejilla no cambie. `object-cover`: los originales vienen en
     4:3 o en 1.339:1 (1200x896, 2400x1792); en estos últimos se pierden unos
     pocos píxeles de los lados al encajar en 4:3.

     `sizes` sale del ancho real de la columna. El contenedor es `max-w-7xl`
     (1280px) con `px-6` y la rejilla es de dos columnas con `gap-12` desde
     `lg`, así que cada columna mide (ancho − 48 de padding − 48 de gap) / 2:
     592px fijos desde 1280px de viewport y `(100vw − 96px) / 2` entre 1024 y
     1280. Por debajo de `lg` apila a una columna de casi todo el ancho. */
  const caja = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
      {imagen ? (
        <Image
          src={imagen}
          alt={imagenAlt}
          fill
          sizes="(min-width: 1280px) 592px, (min-width: 1024px) calc((100vw - 96px) / 2), 100vw"
          className="object-cover"
          {...(prioridad
            ? { fetchPriority: "high" as const, loading: "eager" as const }
            : {})}
        />
      ) : (
        <div className="brand-gradient absolute inset-0" />
      )}
    </div>
  );

  const texto = (
    <div>
      <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
      <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
        {title}
      </h2>
      <p className="mt-5 text-slate-600">{description}</p>
      {vinetas && vinetas.length > 0 ? (
        <ul className="mt-5 list-disc space-y-2 pl-6 leading-relaxed text-slate-700">
          {vinetas.map((vineta) => (
            <li key={vineta}>{vineta}</li>
          ))}
        </ul>
      ) : null}
      <QuoteButton className="mt-8 rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90">
        Solicitar cotización
      </QuoteButton>
    </div>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
      {imageSide === "left" ? (
        <>
          {caja}
          {texto}
        </>
      ) : (
        <>
          {texto}
          {caja}
        </>
      )}
    </div>
  );
}

/**
 * Variante de ancho completo para los bloques con `flujo`: Eyebrow, H2 y
 * párrafo centrados en la columna de lectura (`max-w-[68ch]`) y, debajo, los
 * pasos como rejilla de tarjetas. Sin imagen ni botón: el CTA de la página
 * queda en <ServiceCierre>.
 *
 * Las viñetas, si las hay, van bajo el párrafo como bloque centrado con el
 * texto alineado a la izquierda: una lista centrada línea a línea no se lee.
 *
 * REJILLA DE PASOS: una columna en móvil, dos en tablet y hasta cuatro por
 * fila en escritorio. En escritorio la rejilla es de 12 columnas y cada
 * tarjeta toma el span de su fila según `filasParejas()`, para que la última
 * fila nunca quede con una o dos tarjetas sueltas. En tablet, con un total
 * impar, la última tarjeta ocupa las dos columnas por la misma razón.
 *
 * Lista ordenada: el orden de los pasos es el contenido. El número visible
 * es `aria-hidden` porque el <ol> ya lo anuncia.
 */
function BloqueFlujo({
  eyebrow,
  title,
  description,
  vinetas,
  flujo,
}: Omit<ServiceFeatureBlockProps, "imageSide" | "flujo"> & {
  flujo: readonly ServicioPaso[];
}) {
  const spans = filasParejas(flujo.length).flatMap((tamano) =>
    Array<string>(tamano).fill(SPAN_POR_FILA[tamano]),
  );
  const imparEnTablet = flujo.length % 2 === 1;

  return (
    <div>
      <div className="mx-auto max-w-[68ch] text-center">
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
          {title}
        </h2>
        <p className="mt-5 text-slate-600">{description}</p>
        {vinetas && vinetas.length > 0 ? (
          <ul className="mx-auto mt-5 w-fit list-disc space-y-2 pl-6 text-left leading-relaxed text-slate-700">
            {vinetas.map((vineta) => (
              <li key={vineta}>{vineta}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {flujo.map((paso, i) => {
          const ultimaSuelta =
            imparEnTablet && i === flujo.length - 1 ? "sm:col-span-2" : "";
          return (
            <li
              key={paso.titulo}
              className={`min-w-0 rounded-2xl bg-brand-100 p-6 ${ultimaSuelta} ${spans[i]}`}
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 font-heading text-sm font-bold text-white"
              >
                {i + 1}
              </span>
              <h3 className="mt-4 break-words font-heading text-base font-bold text-brand-900">
                {paso.titulo}
              </h3>
              <p className="mt-2 break-words text-sm leading-relaxed text-slate-700">
                {paso.descripcion}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
