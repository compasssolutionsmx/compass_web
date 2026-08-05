"use client";

/**
 * Rotador de casos de éxito: UNA tarjeta a la vez, a todo el ancho de su
 * columna.
 *
 * Tercera forma de esta sección, y la primera que encaja con el patrón de dos
 * columnas que ya usan <StatsSection> y <BlogPreview>. Las dos anteriores
 * fallaron por la misma razón de fondo —repartir el ancho entre las tres
 * tarjetas—: en el bento la destacada heredaba la altura de las dos apiladas y
 * arrastraba 200px de vacío; en la fila de tres, cada una se quedaba con un
 * tercio y el texto salía apretado. Con una sola tarjeta por vista, el ancho
 * deja de ser un recurso a repartir.
 *
 * TRES SNAPS DE VERDAD. Cada slide ocupa el 80% de la vista, así que el track
 * mide bastante más que ella y Embla genera un snap por caso. Es la diferencia
 * con el intento de tres tarjetas en fila, donde al 40% sólo quedaban dos snaps
 * y el autoplay no tenía sentido.
 *
 * SANGRA A LA DERECHA. El viewport de Embla se estira hasta el borde de la
 * ventana con `bleed-right`, igual que <BlogCarousel>, para que la tarjeta
 * siguiente se corte contra la pantalla. El lado izquierdo no se toca: ahí
 * conecta con la columna de texto.
 */

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export type SuccessStory = {
  client: string;
  /**
   * Logo del cliente, A COLOR: va con next/image tal cual, sin el `mask-image`
   * de las certificaciones — enmascararlo lo aplanaría a una silueta.
   *
   * Las medidas son las del archivo RECORTADO y hacen falta para que next/image
   * reserve el hueco correcto y no haya salto de layout al cargar.
   */
  logo: { src: string; width: number; height: number };
  headline: string;
  subtitle: string;
  description: string;
};

const AUTOPLAY_MS = 6000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function StoryCard({ story }: { story: SuccessStory }) {
  return (
    // TARJETA EN brand-100 sobre el blanco de la sección — el default seguro
    // que fija el mockup, en lugar del verde limón del sitio en vivo.
    //
    // El cuerpo va en slate-600 y NO en el slate-500 habitual del sitio: sobre
    // brand-100 el 500 da 4.05:1 y no pasa AA; el 600 da 6.45:1.
    //
    // Sin glow al hover, a diferencia de `.tech-card`: no es clicable ni
    // seleccionable, y reaccionar al puntero prometería algo que no ocurre.
    <div className="flex h-full flex-col rounded-3xl bg-brand-100 p-8">
      {/* Alto fijo y ancho máximo a la vez: los tres archivos tienen
          proporciones muy distintas —CEMEX es 5.2 veces más ancho que alto,
          Arca 2.5— y sin el tope de ancho el de CEMEX saldría desproporcionado.
          Con la caja acotada por los dos lados, `object-contain` baja el alto de
          los muy apaisados y los tres se leen parejos. */}
      <Image
        src={story.logo.src}
        alt={story.client}
        width={story.logo.width}
        height={story.logo.height}
        className="h-12 w-auto max-w-[12rem] object-contain object-left"
      />

      <div className="mt-6">
        {/* 30px fijos, sin subir a 36 en pantallas grandes. Con el sangrado la
            tarjeta ya no ocupa toda la columna —a 1280px mide 588px y no 710—,
            y a 36px el titular de CEMEX necesitaba 614px de caja de texto: se
            partía en dos líneas justo en el salto de breakpoint, subiendo la
            altura de las tres porque el track iguala por la más alta. */}
        <h3 className="font-heading text-3xl font-bold leading-tight text-brand-900">
          {story.headline}
        </h3>
        <p className="mt-2 font-heading text-base font-semibold text-brand-700">
          {story.subtitle}
        </p>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          {story.description}
        </p>
      </div>
    </div>
  );
}

export default function SuccessStoriesCarousel({
  stories,
}: {
  stories: SuccessStory[];
}) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  // AUTOPLAY SÍ, aquí. Con una tarjeta por vista los otros dos casos quedan
  // completamente ocultos, así que sin rotación la mayoría no sabría que
  // existen. Es lo contrario del intento anterior, donde las tres se veían a la
  // vez y el autoplay sólo habría inquietado.
  //
  // WCAG 2.2.2 pide poder detener lo que se mueve solo: se cubre por tres
  // lados —el puntero encima lo para, el foco de teclado lo para, y cualquier
  // interacción (flecha, punto, arrastre) lo para para siempre—, y con
  // `prefers-reduced-motion` el plugin ni se registra.
  //
  // SIN `loop`, y `containScroll: false`. Los dos juntos son lo que impide que
  // se vea una tarjeta cortada por la IZQUIERDA:
  //
  //   - `loop: true` colocaba la tarjeta anterior pegada a la izquierda de la
  //     actual para poder dar la vuelta. Medido: al arrastrar hacia atrás, Arca
  //     aparecía en [123,775] con el viewport empezando en 626, o sea rebanada
  //     en una línea a media página. Con loop no hay forma de evitarlo: el
  //     track es circular y SIEMPRE hay algo inmediatamente a la izquierda.
  //
  //   - `containScroll: "trimSnaps"` (el de <BlogCarousel>) añade un snap final
  //     que alinea el FINAL del track con el borde derecho. Ese punto no cae en
  //     el inicio de ningún slide, así que el de la izquierda queda cortado.
  //     Con `containScroll: false` los snaps son exactamente los inicios de
  //     slide, de modo que el borde izquierdo del viewport siempre coincide con
  //     el borde de una tarjeta.
  //
  // El precio es que en el último caso no hay nada asomando a la derecha —
  // quedan ~163px de banda vacía— pero es honesto: ahí se acabó el carrusel.
  // Y sin loop el autoplay rebobina al primero en vez de encadenar.
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "start",
      containScroll: false,
      duration: prefersReducedMotion ? 0 : 25,
    },
    prefersReducedMotion
      ? []
      : [
          Autoplay({
            delay: AUTOPLAY_MS,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
          }),
        ],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Sólo se registra el listener; no se llama a `setState` en el cuerpo del
  // efecto. El índice inicial de Embla es 0, que es justo el estado inicial,
  // así que no hace falta sincronizar de entrada.
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  return (
    // Patrón de carrusel de la APG: el contenedor se anuncia como tal y cada
    // slide dice qué número es de cuántos. Sin esto, un lector de pantalla lee
    // los tres casos seguidos sin saber que sólo uno está a la vista.
    <div
      role="group"
      aria-roledescription="carrusel"
      aria-label="Casos de éxito"
    >
      {/* `bleed-right` (globals.css) saca el viewport de Embla del contenedor
          de página y lo lleva hasta el borde derecho de la ventana, igual que
          en <BlogCarousel>: así la tarjeta siguiente se corta contra la
          pantalla y no contra un margen. Sólo lo lleva ESTE div — la fila de
          puntos y flechas de abajo se queda alineada con la columna.
          El `overflow-hidden` sigue siendo imprescindible: es lo que recorta el
          track, que mide varias veces el ancho de la vista.
          El sobrante de la barra de scroll lo recorta el `overflow-x: clip` de
          <html>, que ya estaba puesto por el carrusel del blog.

          `data-lenis-prevent-horizontal` y NO `data-lenis-prevent`: el segundo
          hace que Lenis ignore el gesto entero —también el vertical— y la
          página se atasca al pasar el cursor por encima. */}
      <div
        className="bleed-right overflow-hidden"
        data-lenis-prevent-horizontal
        ref={emblaRef}
      >
        <ul className="flex items-stretch gap-6">
          {stories.map((story, index) => (
            <li
              key={story.client}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${stories.length}: ${story.client}`}
              /* 80% del viewport SANGRADO, no de la columna. Deja la tarjeta
                 actual casi completa y un tramo de la siguiente asomando: 123px
                 a 1280px de ventana, 139px a 1440 y 187px a 1920 — el sangrado
                 crece con la ventana, así que el asomo también.
                 Sigue habiendo tres snaps reales: el track mide 3×80% + gaps,
                 muy por encima de la vista, así que Embla nunca se queda sin
                 nada que desplazar. */
              className="min-w-0 flex-[0_0_80%]"
            >
              <StoryCard story={story} />
            </li>
          ))}
        </ul>
      </div>

      {/* Navegación DEBAJO de la tarjeta y no arriba: el encabezado de la
          sección vive en la columna izquierda, y unas flechas arriba a la
          derecha competirían con él. Sin estos controles no habría forma de
          llegar a los otros dos casos. */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <ul className="flex items-center gap-2" aria-label="Ir a un caso">
          {stories.map((story, index) => (
            <li key={story.client}>
              <button
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Ver el caso de ${story.client}`}
                aria-current={index === selectedIndex ? "true" : undefined}
                /* El punto activo se alarga en vez de sólo cambiar de color:
                   la forma sobrevive a la ceguera al color, que el color solo
                   no (WCAG 1.4.1). */
                className={`block h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "w-6 bg-brand-900"
                    : "w-2 bg-brand-900/25 hover:bg-brand-900/45"
                }`}
              />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Caso anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-900/20 text-brand-900 transition-colors hover:border-brand-900 hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Caso siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-900/20 text-brand-900 transition-colors hover:border-brand-900 hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
