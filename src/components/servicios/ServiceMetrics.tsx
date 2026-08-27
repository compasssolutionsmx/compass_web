import Eyebrow from "../Eyebrow";

/**
 * Banda de métricas para la plantilla de servicio.
 *
 * NO HAY UN COMPONENTE REUTILIZABLE PARA ESTO: <StatsSection> (home) e
 * <ImportStats> (landing de importaciones) son ambos específicos de su
 * página, con sus propias cifras y su propio layout, y ninguno se
 * parametrizó nunca para admitir otro juego de datos (el propio código de
 * <ImportStats> explica por qué no se derivó de <StatsSection>). Esta pieza
 * toma prestada la tarjeta de <StatsSection> —blanca, `rounded-2xl`, sombra
 * tenue, cifra grande en brand-900— por ser el tratamiento de "cifra suelta"
 * más establecido del sitio, pero como sección propia y no anidada dentro
 * de una caja tintada con imagen encima.
 *
 * SIN NÚMEROS: por instrucción de la tarea, cada cifra queda literalmente
 * como "Pendiente", no en 0 ni con un valor de ejemplo — un cero se leería
 * como un dato real y negativo, no como un hueco por llenar.
 */
const METRICAS = [
  {
    etiqueta: "[Nombre de la métrica]",
    descripcion: "[Descripción breve de marcador de posición para esta cifra.]",
  },
  {
    etiqueta: "[Nombre de la métrica]",
    descripcion: "[Descripción breve de marcador de posición para esta cifra.]",
  },
  {
    etiqueta: "[Nombre de la métrica]",
    descripcion: "[Descripción breve de marcador de posición para esta cifra.]",
  },
];

export default function ServiceMetrics() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <Eyebrow className="mb-4">Resultados</Eyebrow>
        <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
          El impacto de FTL en su operación
        </h2>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {METRICAS.map((metrica, i) => (
          <li
            key={i}
            className="rounded-2xl bg-white p-6 text-center shadow-sm shadow-brand-950/5"
          >
            <p className="font-heading text-4xl font-bold text-slate-400">
              Pendiente
            </p>
            <p className="mt-2 font-heading text-sm font-bold text-brand-900">
              {metrica.etiqueta}
            </p>
            <p className="mt-1 text-sm text-slate-600">{metrica.descripcion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
