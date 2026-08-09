"use client";

/**
 * Cuerpo de /vacantes: la postulación primero y la lista de vacantes después.
 *
 * DOS SECCIONES, mismo patrón que /proveedores:
 *   1. Postulación — texto suelto a la izquierda y el formulario en su tarjeta
 *      blanca a la derecha, dos columnas del mismo ancho.
 *   2. Vacantes disponibles — a ancho completo, debajo.
 *
 * POR QUÉ SIGUE SIENDO UN SOLO COMPONENTE Y NO DOS SUELTOS: el botón
 * "Postularme a este puesto" de cada tarjeta tiene que encabezar el mensaje del
 * formulario con una referencia a ese puesto. Eso obliga a que alguien sostenga
 * la conexión entre las dos secciones, y ese alguien es este componente — a
 * través del `ref` imperativo que expone <VacanteForm>. La alternativa (subir
 * todo el estado del formulario aquí) haría cliente y controlado un formulario
 * que hoy se maneja solo. Al separarse en dos secciones esa conexión pasó a ser
 * lo único que las une, así que partir el componente costaría un contexto
 * entero.
 *
 * EL TEXTO DE LA POSTULACIÓN VIVE AQUÍ y no en la página porque acompaña al
 * formulario: es el mismo par texto+tarjeta de /proveedores, sólo que allí las
 * dos mitades caben en `page.tsx` y aquí la tarjeta necesita este envoltorio de
 * cliente. Es el texto que estaba en el hero, palabra por palabra.
 */

import { useRef } from "react";
import Link from "next/link";
import VacanteForm, { type VacanteFormHandle } from "./VacanteForm";
import { QuoteButton } from "./QuoteModal";
import { useSmoothScroll } from "./SmoothScroll";
import { bindTail } from "@/lib/typography";
import type { Vacante } from "@/lib/vacantes";

function VacanteCard({
  vacante,
  onPostularse,
}: {
  vacante: Vacante;
  onPostularse: (puesto: string) => void;
}) {
  // Contraste sobre brand-100: slate-600 6.45:1 y brand-700 8.22:1. El cuerpo
  // NO usa el slate-500 habitual del sitio porque sobre este fondo se queda en
  // 4.05:1 y no pasa AA.
  const DATOS = [
    ["Ubicación", vacante.ubicacion],
    ["Escolaridad", vacante.escolaridad],
    ["Edad", vacante.edad],
    ["Experiencia", vacante.experiencia],
  ] as const;

  return (
    <article className="rounded-3xl bg-brand-100 p-6 md:p-8">
      <h3 className="font-heading text-2xl font-bold text-brand-900">
        {vacante.puesto}
      </h3>

      {/* <dl> y no una lista suelta: cada dato es un par etiqueta-valor, y así
          un lector de pantalla los anuncia emparejados.

          CUATRO COLUMNAS EN `lg`: la tarjeta ya no vive en una columna de 7/12
          sino a ancho completo, y a dos columnas los valores cortos —"Ciudad de
          México", "Entre 25 y 49 años"— quedaban perdidos en cajas de ~600px.
          A cuatro se leen como una ficha técnica. El alto de la fila lo marca
          "Experiencia", que es el único valor largo; los otros tres se quedan
          en una línea, alineados arriba. */}
      <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        {DATOS.map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {etiqueta}
            </dt>
            <dd className="mt-1 text-sm text-slate-600">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-brand-900/10 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Requisitos
        </p>
        <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-slate-600 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
          {vacante.requisitos.map((requisito) => (
            <li key={requisito}>{requisito}</li>
          ))}
        </ul>
      </div>

      {/* No navega ni envía nada: sólo escribe en el mensaje del formulario.
          Por eso es un <button> y no un enlace. Blanco sobre brand-900:
          15.07:1. */}
      <button
        type="button"
        onClick={() => onPostularse(vacante.puesto)}
        className="mt-6 rounded-full bg-brand-900 px-6 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Postularme a este puesto
      </button>
    </article>
  );
}

export default function VacantesBoard({ vacantes }: { vacantes: Vacante[] }) {
  const formRef = useRef<VacanteFormHandle>(null);
  const formColumnRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  /**
   * Encabeza el mensaje del formulario con el puesto y lleva al usuario hasta
   * él.
   *
   * EL SCROLL YA NO ES CONDICIONAL. Antes las dos cosas estaban lado a lado en
   * la misma rejilla, y en desktop el formulario ya se veía: moverlo habría
   * sido desorientador. Ahora el formulario está en la sección de ARRIBA en
   * todos los anchos, así que quien pulsa el botón de una tarjeta nunca lo
   * tiene a la vista y siempre hay que subirle hasta él. Sin esto, el clic
   * escribiría en un mensaje fuera de pantalla y no pasaría nada visible.
   *
   * `scrollTo` es el del proyecto: pasa por Lenis con el mismo offset que los
   * anclas del nav, y cuando Lenis está apagado —`prefers-reduced-motion`—
   * cae a un `scrollIntoView()` sin animación. O sea que la preferencia de
   * movimiento reducido se respeta sin comprobarla aquí otra vez.
   *
   * El foco lo mueve <VacanteForm> desde dentro, que es quien sabe cuál de sus
   * campos sigue vacío.
   */
  function postularse(puesto: string) {
    formRef.current?.aplicarPuesto(puesto);

    if (formColumnRef.current) scrollTo(formColumnRef.current);
  }

  return (
    <>
      {/* SECCIÓN 1 — POSTULACIÓN. Mismo contenedor que el hero —`max-w-7xl` con
          el `px-6` en el propio elemento—, así los dos bloques comparten los
          mismos bordes en todos los anchos. */}
      <section
        aria-labelledby="vacantes-postulacion"
        className="mx-auto max-w-7xl px-6 py-16 md:py-24"
      >
        {/* DOS COLUMNAS DEL MISMO ANCHO, y `lg:items-center` porque el texto es
            bastante más corto que el formulario: alineado arriba dejaba un
            hueco largo bajo él con la tarjeta siguiendo sola hacia abajo.
            Centrado reparte ese aire a ambos lados y las dos columnas se leen
            como un par.

            EN MÓVIL colapsa a una sola columna por el `grid` sin `grid-cols` de
            base, y el texto queda ARRIBA por orden de DOM, que es el que
            corresponde: primero se explica de qué va esto y luego se pide
            llenarlo. El `gap-12` pasa a ser separación vertical entre los dos
            bloques. */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* CENTRADO EN MÓVIL, a la izquierda de `lg` en adelante — el mismo
              corte que /proveedores y por el mismo motivo: `lg:grid-cols-2` es
              donde esta sección abre sus dos columnas. Por debajo, el texto va
              apilado encima del formulario y centrado se lee como la entrada de
              la sección; a partir de ahí es la columna izquierda de un par y
              tiene que arrancar en la misma vertical que la tarjeta.

              Va en el contenedor porque `text-align` se hereda: una clase cubre
              el <h2>, los dos párrafos y el enlace. Ese enlace es `inline-block`,
              así que el centrado lo alcanza sin ayuda —una caja de nivel inline
              la centra `text-align`, no hace falta `mx-auto`—.

              NINGUNO DE LOS CUATRO LLEVA `max-w-*` propio, revisado uno por uno,
              así que sus cajas ya ocupan el ancho completo de la celda y centrar
              el texto los centra de verdad. La única excepción de alineación es
              el aviso de origen, que se explica en su sitio. */}
          <div className="text-center lg:text-left">
            {/* Nombra la sección entera, formulario incluido, y por eso es el
                destino del `aria-labelledby`. Jerarquía: h1 del hero -> este h2
                -> h3 (los puestos de abajo y la pantalla de confirmación de la
                tarjeta) -> h4 del footer, sin saltos. */}
            <h2
              id="vacantes-postulacion"
              className="font-heading text-2xl font-bold text-brand-900 md:text-3xl"
            >
              {bindTail("Envíe su postulación")}
            </h2>

            {/* Los dos párrafos que estaban en el hero, palabra por palabra;
                sólo cambia el color, que pasa de slate-200 sobre la foto a
                slate-600 sobre blanco (7.56:1, AA de sobra). */}
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              {bindTail(
                "En Compass Solutions crecemos junto con la operación: cada nueva ruta, cliente y proyecto de comercio exterior requiere personas comprometidas con la seguridad, la puntualidad y el servicio.",
              )}
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              {bindTail(
                "Buscamos perfiles para las áreas de operación, servicio a cliente y administración, dentro de nuestras soluciones aéreas, marítimas y terrestres, respaldados por más de 12 años de experiencia en logística internacional.",
              )}
            </p>

            {/* LO QUE QUEDA DEL BOTÓN DEL HERO. Ahí arriba ya no cabe —el hero
                es sólo eyebrow y titular— pero el atajo sigue haciendo falta:
                las vacantes pasaron a estar DEBAJO del formulario, así que
                quien viene a mirar qué hay abierto antes de postularse tendría
                que recorrerlo entero a ciegas.

                Baja de botón sólido a enlace de texto a propósito: en el hero
                era la única llamada de la página, y aquí compitiendo con
                "Enviar postulación" a un palmo de distancia mandaría al usuario
                al sitio equivocado.

                Sigue siendo un ancla y no un botón: es navegación dentro de la
                página, y así funciona con "abrir en pestaña nueva" y con el
                teclado sin añadir nada. Lenis lo intercepta con el mismo offset
                que el nav; con `prefers-reduced-motion` Lenis no se instancia y
                queda el salto nativo, que ya respeta el
                `scroll-padding-top: 6rem` de globals.css. */}
            <a
              href="#vacantes-disponibles"
              className="mt-6 inline-block font-heading text-sm font-semibold text-brand-900 underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              Vea las vacantes disponibles
            </a>

            {/* AVISO DE ORIGEN. Vivía dentro de la tarjeta, encima de los
                campos. Sale de ahí pero NO pierde su función, que es avisar
                ANTES de que nadie llene nada: esta columna se lee primero en las
                dos disposiciones —a la izquierda de la tarjeta en desktop, y
                encima de ella en móvil, donde además queda pegada a su borde
                superior—.

                CIERRA LA COLUMNA, después de los párrafos y del atajo. Es un
                apunte para la minoría que llegó al sitio equivocado, no parte
                del hilo de la sección; metido entre el titular y los párrafos
                abriría con una advertencia antes de haber dicho de qué va esto,
                y entre los párrafos y el atajo partiría en dos lo único que sí
                se lee seguido. De remate también equilibra el alto de las dos
                columnas, que es lo que reparte el `lg:items-center`.

                Tratamiento sobrio a propósito —borde y fondo tenue de la familia
                brand— y NO `accent-red`, que está reservado a la salida de
                proveedores del cotizador. Un bloque rojo aquí leería como error,
                y esto es una aclaración.

                El contraste no cambia al mudarse: el fondo de debajo era el
                blanco de la tarjeta y ahora es el blanco de la página, así que
                la composición es la misma. Sobre brand-100/60 encima de blanco,
                texto slate-600 6.88:1 y enlaces brand-900 13.69:1.

                SE QUEDA ALINEADO A LA IZQUIERDA, es el único del bloque que se
                sale del centrado de móvil, y `text-left` está aquí para
                cancelar la herencia del contenedor. La caja SÍ queda centrada
                —no lleva `max-w`, ocupa el ancho completo de la celda—; lo que
                no se centra es el texto de dentro, y a propósito: son dos
                frases que ocupan cinco líneas a 375px y llevan dos enlaces
                incrustados. Centradas quedan dentadas por los dos lados y los
                enlaces caen en sitios distintos en cada línea, que es justo lo
                que un aviso no puede permitirse. Además el cambio de alineación
                ayuda a leerlo como lo que es: un apunte al margen, no la
                continuación del texto de arriba. */}
            <p className="mt-8 rounded-2xl border border-brand-900/15 bg-brand-100/60 p-4 text-left text-sm leading-relaxed text-slate-600">
              Este formulario es exclusivo para postulaciones de empleo. Si
              busca una cotización, use el{" "}
              {/* Abre el modal del cotizador en esta misma página, en vez de
                  mandar al usuario al home a buscarlo. Ya no está dentro del
                  <form>, así que su `type="button"` dejó de ser lo que impide
                  que lo envíe; se queda igualmente porque <QuoteButton> lo trae
                  de fábrica. */}
              <QuoteButton className="font-medium text-brand-900 underline underline-offset-2 transition-opacity hover:opacity-80">
                cotizador
              </QuoteButton>
              . Si desea registrarse como proveedor, visite{" "}
              <Link
                href="/proveedores"
                className="font-medium text-brand-900 underline underline-offset-2 transition-opacity hover:opacity-80"
              >
                Proveedores
              </Link>
              .
            </p>
          </div>

          {/* SE QUITÓ EL <h2> "Déjenos sus datos": con el titular de la
              izquierda eran dos encabezados del mismo nivel diciendo casi lo
              mismo, uno al lado del otro.

              Y la nota de campos obligatorios se MUDÓ DENTRO de la tarjeta, a
              <VacanteForm>. Aquí fuera quedaba en tierra de nadie: por encima
              del borde blanco se leía como el cierre del texto de la izquierda
              y no como una instrucción del formulario.

              El `ref` va en este <div> y no en la tarjeta porque es el destino
              del scroll de "Postularme a este puesto".

              <VacanteForm> YA NO RECIBE `vacantes`: las necesitaba para armar
              las opciones de su <select> de puesto, que desapareció. Lo que el
              botón de una tarjeta le pasa ahora es el nombre del puesto, y eso
              viaja por el `ref`. */}
          <div ref={formColumnRef}>
            <VacanteForm ref={formRef} />
          </div>
        </div>
      </section>

      {/* SECCIÓN 2 — VACANTES DISPONIBLES, a ancho completo y debajo. Sin `pt`:
          el `pb` de la sección de arriba ya separa las dos. */}
      <section
        aria-labelledby="vacantes-disponibles"
        className="mx-auto max-w-7xl px-6 pb-16 md:pb-24"
      >
        {/* MISMO CORTE EN `lg` que el titular de la sección de arriba, aunque
            aquí no haya dos columnas que separar: la página entera cambia de
            alineación en el mismo ancho, y ver dos titulares de la misma página
            volver a la izquierda en momentos distintos se notaría. Debajo van
            las tarjetas a ancho completo con su contenido alineado a la
            izquierda, que es la composición de siempre —rótulo centrado sobre
            bloques alineados—.

            Sin `max-w` propio, así que no necesita `mx-auto`. El `id` es el
            destino del ancla "Vea las vacantes disponibles" y del
            `aria-labelledby` de la sección; la alineación no lo afecta. */}
        <h2
          id="vacantes-disponibles"
          className="mb-6 text-center font-heading text-2xl font-bold text-brand-900 md:text-3xl lg:text-left"
        >
          Vacantes disponibles
        </h2>

        {/* ESTADO VACÍO: la sección NO desaparece. Quien llega buscando trabajo
            necesita saber que la puerta sigue abierta, y el formulario de
            arriba sigue sirviendo porque los datos se guardan también para
            vacantes futuras. */}
        {vacantes.length > 0 ? (
          <div className="grid gap-6">
            {vacantes.map((vacante) => (
              <VacanteCard
                key={vacante.slug}
                vacante={vacante}
                onPostularse={postularse}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl bg-brand-100 p-6 text-slate-600 md:p-8">
            Ahora mismo no tenemos vacantes publicadas. Aun así, puede dejarnos
            sus datos en el formulario de arriba: los guardamos para cuando se
            abra una posición que corresponda con su perfil.
          </p>
        )}
      </section>
    </>
  );
}
