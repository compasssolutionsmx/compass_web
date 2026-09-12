import AnimatedCounter from "../AnimatedCounter";

/**
 * "Resultados en datos". Es el mismo patrón que <StatsSection> del home —
 * franja brand-100, cifra grande con <AnimatedCounter>, descripción debajo—
 * pero NO reutiliza ese componente.
 *
 * POR QUÉ NO SE PARAMETRIZÓ StatsSection: el mockup no pide "las mismas tres
 * métricas con otro número", pide otra sección. Cambia el layout (dos columnas
 * con texto a la izquierda y rejilla a la derecha, contra el bloque foto+texto
 * y fila de tres del home) y cambia el fondo de la tarjeta (brand-100 sobre
 * blanco aquí, blanca sobre brand-100 allá). Doblar StatsSection para cubrir
 * las dos formas habría dejado un componente con más ramas que contenido. Lo
 * que sí se comparte de verdad es <AnimatedCounter> y los tokens.
 *
 * LAS CIFRAS SÍ SON LAS MISMAS QUE LAS DEL HOME, y ese es el punto: son las
 * definitivas validadas por el cliente, en el mismo orden y con el mismo copy
 * que en <StatsSection>. Antes cada página afirmaba cosas distintas (+15k aquí
 * contra +10k allá; +400 clientes contra 200 asociados). Si se tocan aquí, hay
 * que tocarlas allá.
 */
const METRICS = [
  {
    target: 50,
    prefix: "+",
    label: "Países",
    description:
      "Cobertura internacional para sus operaciones de comercio exterior.",
  },
  {
    target: 95,
    suffix: "%",
    label: "Efectividad",
    description:
      "Comprometidos con la eficiencia y cumplimiento de cada operación.",
  },
  {
    target: 50,
    prefix: "+",
    label: "Clientes satisfechos",
    description:
      "Empresas que confían en Compass Solutions para sus operaciones logísticas.",
  },
];

export default function ImportStats() {
  return (
    // SOBRE BLANCO y ya sin franja tintada: la página cierra su tramo central
    // en blanco continuo —gestión aduanal (brand-50 con tarjeta), soluciones y
    // estas cifras— y el único color de la zona lo pone la tarjeta del banner
    // de abajo.
    //
    // `py-20` SIMÉTRICO, sin excepciones por breakpoint. Los overrides en `lg`
    // que llevó este `pt` (56px y luego 20px) compensaban el hueco muerto de
    // <ImportControl>, que ya no existe: aquella sección termina en su fila de
    // tarjetas a ancho completo y no deja sobrante.
    //
    // `lg:items-start` en la rejilla es lo que blinda el cálculo por este lado:
    // al quitarse el marcador de imagen, la columna izquierda (152px) quedó más
    // baja que las métricas (248px) y centrada habría bajado el <h2> 48px.
    // Alineadas por arriba, el <h2> queda pegado al padding pase lo que pase.
    <section
      id="resultados"
      aria-labelledby="resultados-titulo"
      className="scroll-mt-28 py-20"
    >
      {/* TODOS LOS CAMBIOS DE MÓVIL VAN CON `max-lg:`, la variante de ancho
          MÁXIMO, y no con clases base más overrides en `lg`. La diferencia no es
          de estilo: así lo que se lee en el marcado es literalmente "esto sólo
          pasa por debajo de 1024px", y de ahí para arriba no hay una sola clase
          que deshacer. Escritorio queda intacto por construcción, no por
          haber acertado con los overrides.
          El corte es `lg` porque es exactamente donde esta sección pasa a sus
          dos columnas —texto a la izquierda, métricas a la derecha—, que es la
          disposición de escritorio que no se toca.

          `max-lg:px-8`: 32px de aire lateral contra los 24 de `px-6`. Con la
          tarjeta nueva, ese padding es además lo que separa el borde de la
          tarjeta del borde de la pantalla. */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 max-lg:px-8 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="max-lg:text-center">
          <h2
            id="resultados-titulo"
            className="font-heading text-3xl font-bold text-brand-900 md:text-4xl"
          >
            Resultados en datos
          </h2>
          {/* `max-lg:mx-auto` además del `text-center` del padre: sin él, la
              caja de 42ch se queda anclada a la izquierda y el texto saldría
              centrado DENTRO de una caja descentrada. Sólo se nota de 414px
              para arriba, que es donde 42ch (~344px) empieza a caber holgado.

              slate-600 y NO el slate-500 habitual: aquí sobre el blanco de la
              sección daría 4.76:1 y pasaría, pero el mismo tono se repite en la
              descripción de cada tarjeta, y ahí —sobre brand-100— el 500 cae a
              4.05:1 y NO pasa AA. Un solo tono para los dos sitios, el que
              aguanta en el peor fondo. */}
          <p className="mt-4 max-w-[42ch] text-slate-600 max-lg:mx-auto">
            Utilizamos tecnología y estrategias que satisfacen las necesidades
            de las grandes compañías, junto con un enfoque en el servicio que
            brinda tranquilidad a los operadores más pequeños.
          </p>
        </div>

        {/* `max-lg:gap-4`: con tarjeta propia, los 32px de `gap-8` separaban de
            más — el padding de cada una ya hace de aire y los huecos de 32px
            estiraban la pila sin necesidad. */}
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 max-lg:gap-4">
          {METRICS.map((metric, index) => {
            // TERCERA TARJETA CENTRADA. Con un número impar de métricas en dos
            // columnas, la última se queda sola en la segunda fila y pegada a
            // la izquierda. Abarca las dos columnas y se centra dentro de ellas.
            //
            // POR QUÉ CON ANCHO EXPLÍCITO Y NO SÓLO `justify-self-center`: un
            // elemento de rejilla centrado deja de estirarse y se encoge a su
            // contenido, así que la tarjeta saldría más angosta que las dos de
            // arriba. Fijarle el ancho de una columna —`calc(50% - gap/2)`— es
            // lo que iguala las tres.
            //
            // Los dos anchos son los dos `gap` que tiene esta rejilla: 1rem por
            // debajo de `lg` (`max-lg:gap-4`) y 2rem de ahí para arriba
            // (`gap-8`). Si se cambia un `gap`, hay que cambiar su `w`.
            //
            // Nada de esto aplica en móvil: por debajo de `sm` la rejilla es de
            // una sola columna y no hay huérfana que centrar.
            const isOrphan =
              METRICS.length % 2 === 1 && index === METRICS.length - 1;

            return (
              /* TARJETA `bg-brand-100` EN MÓVIL. Apiladas sin nada que las
                 separe, las métricas se leían como un párrafo corrido y la
                 cifra de una se pegaba a la descripción de la anterior.

                 Se eligió el tinte de marca y no la tarjeta blanca con anillo
                 (`ring-1 ring-slate-200`, la de las tarjetas del blog) por dos
                 razones: esta sección va sobre blanco, así que una tarjeta
                 blanca necesitaría el borde para existir y ese borde da 1.44:1
                 contra el fondo — por debajo del 3:1 que pide un elemento no
                 textual que delimita; y porque brand-100 es el lenguaje que el
                 sitio ya usa para las cifras (la franja de <StatsSection> en el
                 home) y para las tarjetas sobre blanco (<VacanteCard>).

                 CONTRASTE sobre brand-100: cifra y rótulo en brand-900 12.82:1,
                 descripción en slate-600 6.45:1. Los tres pasan AA. El tinte
                 contra el blanco de sección es 1.18:1, y no hace falta más: la
                 tarjeta agrupa, no codifica ninguna información por color. */
              <li
                key={metric.label}
                className={`max-lg:rounded-2xl max-lg:bg-brand-100 max-lg:p-5 ${
                  isOrphan
                    ? "sm:col-span-2 sm:col-start-1 sm:w-[calc(50%_-_0.5rem)] sm:justify-self-center lg:w-[calc(50%_-_1rem)]"
                    : ""
                }`}
              >
                {/* `max-lg:text-3xl`: 30px contra los 36 de `text-4xl`. Dentro
                    de una tarjeta de 5rem de alto útil, 36px competía con el
                    rótulo en vez de encabezarlo. La cifra más ancha es "95%" y
                    a 30px cabe de sobra en los 216px de caja útil a 320px. */}
                <p className="font-heading text-4xl font-bold text-brand-900 max-lg:text-3xl">
                  {metric.prefix}
                  {/* Sin `decimals`: las tres cifras definitivas son enteras
                    (antes el 95.3% pedía 1). <AnimatedCounter> ya trae 0 por
                    defecto. */}
                  <AnimatedCounter target={metric.target} />
                  {metric.suffix}
                </p>
                <p className="mt-1 font-heading text-sm font-bold text-brand-900">
                  {metric.label}
                </p>
                <p className="mt-1 max-w-[30ch] text-sm text-slate-600">
                  {metric.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
