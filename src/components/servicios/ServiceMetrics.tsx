import type { ServicioMetrica } from "@/lib/servicios-contenido";
import Eyebrow from "../Eyebrow";

export type ServiceMetricsProps = {
  titulo: string;
  metricas: readonly ServicioMetrica[];
};

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
 * LA SECCIÓN ENTERA NO SE RENDERIZA MIENTRAS NO HAYA CIFRAS REALES. Antes
 * pintaba la palabra "Pendiente" en el hueco del número; desde que estas
 * páginas son indexables eso era un marcador de posición visible en
 * producción. Ahora se exige que TODAS las métricas traigan `cifra`: con una
 * sola a medias la banda quedaría coja, con dos números y un hueco, que se
 * lee peor que no tenerla. Hoy ninguna de las 18 entradas la trae, así que
 * hoy la banda no sale en ninguna página.
 *
 * EL RITMO VERTICAL NO DEPENDE DE ESTA SECCIÓN: cada sección de la página
 * aporta su propio `py-20`, así que al desaparecer ésta el hueco entre el
 * segundo bloque alternado (`pb-20`) y las preguntas (`pt-20`) sigue siendo
 * los mismos 160px que separan al resto de secciones entre sí.
 *
 * EL TÍTULO Y LAS MÉTRICAS LLEGAN POR PROPS desde
 * `lib/servicios-contenido.ts`.
 */
export default function ServiceMetrics({
  titulo,
  metricas,
}: ServiceMetricsProps) {
  const conCifra = metricas.filter(
    (metrica): metrica is ServicioMetrica & { cifra: string } =>
      typeof metrica.cifra === "string" && metrica.cifra.trim() !== "",
  );

  if (conCifra.length !== metricas.length || conCifra.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <Eyebrow className="mb-4">Resultados</Eyebrow>
        <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
          {titulo}
        </h2>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {conCifra.map((metrica, i) => (
          <li
            key={i}
            className="rounded-2xl bg-white p-6 text-center shadow-sm shadow-brand-950/5"
          >
            <p className="font-heading text-4xl font-bold text-brand-900">
              {metrica.cifra}
            </p>
            <p className="mt-2 font-heading text-sm font-bold text-brand-900">
              {metrica.nombre}
            </p>
            <p className="mt-1 text-sm text-slate-600">{metrica.descripcion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
