import AnimatedCounter from "../AnimatedCounter";
import { QuoteButton } from "../QuoteModal";
import AssetPlaceholder from "./AssetPlaceholder";

/**
 * "Resultados en Datos". Es el mismo patrón que <StatsSection> del home —
 * franja brand-100, cifra grande con <AnimatedCounter>, descripción debajo—
 * pero NO reutiliza ese componente.
 *
 * POR QUÉ NO SE PARAMETRIZÓ StatsSection: el mockup no pide "las mismas tres
 * métricas con otro número", pide otra sección. Cambia el layout (dos columnas
 * con foto y CTA a la izquierda, rejilla 2x2 a la derecha, contra el bloque
 * foto+texto y fila de tres del home), cambia el número de métricas (4 contra
 * 3), y cada métrica gana un rótulo corto que en el home no existe. Doblar
 * StatsSection para cubrir las dos formas habría dejado un componente con más
 * ramas que contenido. Lo que sí se comparte de verdad es <AnimatedCounter> y
 * los tokens.
 *
 * TODO(cliente): estas cuatro cifras NO son las mismas que las del home
 * (+10k operaciones contra +15k aquí; 200 asociados contra +400 clientes).
 * Vienen del mockup de la landing, que a su vez las tomó del sitio en vivo.
 * Hay que confirmar cuál juego es el bueno antes de publicar: hoy el sitio
 * afirmaría dos cosas distintas en dos páginas.
 */
const METRICS = [
  {
    target: 15,
    prefix: "+",
    suffix: "k",
    label: "Operaciones Anuales",
    description: "Operaciones anuales gestionadas con precisión quirúrgica.",
  },
  {
    target: 95.3,
    decimals: 1,
    suffix: "%",
    label: "Efectividad",
    description:
      "De efectividad en servicios expeditados y entregas just-in-time.",
  },
  {
    target: 400,
    prefix: "+",
    label: "Clientes Satisfechos",
    description:
      "Clientes satisfechos que confían su cadena de suministro en nosotros.",
  },
  {
    target: 120,
    prefix: "+",
    label: "Países Cubiertos",
    description: "Países cubiertos a través de nuestra red global de agentes.",
  },
];

export default function ImportStats() {
  return (
    <section aria-labelledby="resultados-titulo" className="bg-brand-100 py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2
            id="resultados-titulo"
            className="font-heading text-3xl font-bold text-brand-900 md:text-4xl"
          >
            Resultados en Datos
          </h2>
          {/* slate-600 y no slate-500: sobre brand-100 el 500 da 4.05:1 y no
              pasa AA. */}
          <p className="mt-4 max-w-[42ch] text-slate-600">
            Utilizamos tecnología y estrategias que satisfacen las necesidades
            de las grandes compañías, junto con un enfoque en el servicio que
            brinda tranquilidad a los operadores más pequeños.
          </p>
          <QuoteButton className="mt-8 rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Solicita una Cotización
          </QuoteButton>

          {/* TODO(assets): foto vertical de contenedores siendo izados. */}
          <AssetPlaceholder
            label="IMG: contenedores siendo izados (vertical)"
            className="mt-8 aspect-[3/4] w-full max-w-[260px] rounded-3xl"
          />
        </div>

        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {METRICS.map((metric) => (
            <li key={metric.label}>
              <p className="font-heading text-4xl font-bold text-brand-900">
                {metric.prefix}
                <AnimatedCounter
                  target={metric.target}
                  decimals={metric.decimals ?? 0}
                />
                {metric.suffix}
              </p>
              <p className="mt-1 font-heading text-sm font-bold text-brand-900">
                {metric.label}
              </p>
              <p className="mt-1 max-w-[30ch] text-sm text-slate-600">
                {metric.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
