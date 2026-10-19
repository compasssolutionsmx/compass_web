import type { ServicioCotizar } from "@/lib/servicios-contenido";

export type ServiceCotizarProps = ServicioCotizar;

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
 * Sección "cómo cotizar" de la plantilla de servicio. Va entre <ServiceFaq> y
 * <RelatedServicesCarousel>, y sólo se renderiza si la entrada declara
 * `cotizar` en `lib/servicios-contenido.ts`.
 *
 * El <h2> y el párrafo conservan la columna de lectura de las preguntas
 * (`max-w-[68ch]`); la rejilla de requisitos ocupa el ancho completo del
 * contenedor, porque cuatro tarjetas no caben en 68ch.
 *
 * REJILLA DE REQUISITOS: una columna en móvil, dos en tablet y hasta cuatro
 * por fila en escritorio. En escritorio la rejilla es de 12 columnas y cada
 * tarjeta toma el span de su fila según `filasParejas()`, para que la última
 * fila nunca quede con una o dos tarjetas sueltas. En tablet, con un total
 * impar, la última tarjeta ocupa las dos columnas por la misma razón.
 *
 * Tarjeta con el mismo tratamiento que los pasos de `flujo` en
 * <ServiceFeatureBlock>: fondo brand-100 y texto brand-900 en font-heading.
 */
export default function ServiceCotizar({
  titulo,
  parrafo,
  requisitos,
}: ServiceCotizarProps) {
  const spans = filasParejas(requisitos.length).flatMap((tamano) =>
    Array<string>(tamano).fill(SPAN_POR_FILA[tamano]),
  );
  const imparEnTablet = requisitos.length % 2 === 1;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="max-w-[68ch]">
        <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
          {titulo}
        </h2>
        {parrafo ? (
          <p className="mt-5 leading-relaxed text-slate-700">{parrafo}</p>
        ) : null}
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {requisitos.map((requisito, i) => {
          const ultimaSuelta =
            imparEnTablet && i === requisitos.length - 1
              ? "sm:col-span-2"
              : "";
          return (
            <li
              key={requisito}
              className={`rounded-2xl bg-brand-100 px-5 py-4 font-heading text-sm font-semibold text-brand-900 ${ultimaSuelta} ${spans[i]}`}
            >
              {requisito}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
