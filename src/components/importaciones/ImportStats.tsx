import AnimatedCounter from "../AnimatedCounter";

/**
 * "Resultados en datos". Es el mismo patrón que <StatsSection> del home —
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
    label: "Operaciones anuales",
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
    label: "Clientes satisfechos",
    description:
      "Clientes satisfechos que confían su cadena de suministro en nosotros.",
  },
  {
    target: 120,
    prefix: "+",
    label: "Países cubiertos",
    description: "Países cubiertos a través de nuestra red global de agentes.",
  },
];

export default function ImportStats() {
  return (
    // ESTA ES LA FRANJA TINTADA de este tramo. El tinte estuvo en
    // <ImportControl>, la sección de arriba, y se pasó aquí para que el color
    // caiga sobre las cifras. La secuencia queda: blanco (certificaciones) ->
    // blanco (gestión aduanal) -> TINTE (esto) -> blanco (soluciones).
    //
    // `py-20` SIMÉTRICO, y ahora sin ninguna excepción por breakpoint. Es lo que
    // le corresponde por ser la tintada: su padding ES el borde del color, así
    // que recortarlo de un lado desbalancearía la banda a la vista. Cualquier
    // ajuste futuro del hueco entre secciones tiene que salir de la blanca.
    //
    // Durante un tiempo este `pt` llevó un override en `lg` (primero 56px,
    // luego 20px) para compensar el hueco muerto que dejaba <ImportControl>.
    // Ese parche murió cuando <ImportControl> absorbió las tres tarjetas de
    // promesas en una fila a ancho completo: su último elemento llega ahora al
    // borde de la rejilla y no deja sobrante. El hueco es la suma limpia de los
    // dos paddings, 80 + 80 = 160px.
    //
    // `lg:items-start` Y NO `items-center`, que es lo que blinda ese cálculo.
    // Al quitarse el marcador de imagen de la columna izquierda, ésta bajó a
    // 152px contra los 248px de las métricas: centrada, se habría desplazado
    // 48px hacia abajo arrastrando el <h2> con ella y el hueco habría saltado a
    // 208px. Alineadas por arriba, el <h2> queda pegado al padding pase lo que
    // pase con el alto de cualquiera de las dos columnas — sin parches de
    // padding, que es como se resolvió esto las dos veces anteriores.
    <section aria-labelledby="resultados-titulo" className="bg-brand-100 py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div>
          <h2
            id="resultados-titulo"
            className="font-heading text-3xl font-bold text-brand-900 md:text-4xl"
          >
            Resultados en datos
          </h2>
          {/* slate-600 y NO el slate-500 habitual del sitio: con la sección
              tintada otra vez, el 500 vuelve a quedarse en 4.05:1 sobre
              brand-100 y no pasa AA. El 600 da 6.45:1. */}
          <p className="mt-4 max-w-[42ch] text-slate-600">
            Utilizamos tecnología y estrategias que satisfacen las necesidades
            de las grandes compañías, junto con un enfoque en el servicio que
            brinda tranquilidad a los operadores más pequeños.
          </p>
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
