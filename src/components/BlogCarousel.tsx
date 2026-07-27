"use client";

/**
 * Carrusel de las tarjetas de noticias del home.
 *
 * Usa Embla (headless, sin estilos propios) por el arrastre: implementar a mano
 * el drag con ratón y táctil, con su inercia, snapping y recálculo en resize,
 * es donde se acumulan los casos raros. Embla no impone marcado ni CSS, así que
 * el diseño sigue siendo enteramente nuestro.
 *
 * Los datos llegan ya resueltos desde el servidor: este componente es cliente
 * sólo por la interacción.
 */

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Los datos llegan YA RESUELTOS desde el servidor, incluidos el href y la fecha
 * formateada. No se importa `lib/blog` aquí a propósito: ese módulo lee el
 * sistema de archivos con `node:fs` y arrastrarlo a un componente cliente
 * rompe el build.
 */
export type CarouselPost = {
  slug: string;
  href: string;
  title: string;
  cover: string;
  coverAlt: string;
  category: string;
  /** ISO, para el atributo `dateTime`. */
  date: string;
  /** Ya formateada para mostrar. */
  dateLabel: string;
};

const AUTOPLAY_MS = 4500;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export default function BlogCarousel({ posts }: { posts: CarouselPost[] }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  // Con movimiento reducido el plugin de autoplay ni se registra: el carrusel
  // sigue siendo navegable con flechas, arrastre y teclado, pero no se mueve
  // solo. Cambiar el array de plugins reinicializa Embla, que es justo lo que
  // se quiere si el usuario cambia la preferencia en caliente.
  // `loop: false` a propósito. Embla ANULA `containScroll` cuando `loop` está
  // activo (en su código: `loop && !!containScroll` desactiva el contenido), y
  // sin `trimSnaps` el último snap deja al final un tramo vacío — el hueco
  // blanco a la derecha. Además, con 4 tarjetas y 3 visibles `canLoop()`
  // devuelve false, así que el loop tampoco estaba funcionando de verdad: se
  // pagaba el precio sin obtener el efecto. Con `trimSnaps` el último snap deja
  // la última tarjeta al ras del borde derecho, y en los snaps intermedios la
  // siguiente asoma sola.
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, align: "start", containScroll: "trimSnaps" },
    prefersReducedMotion
      ? []
      : [
          Autoplay({
            delay: AUTOPLAY_MS,
            // Se detiene en cuanto el usuario toma el control (flecha, arrastre
            // o táctil) para no pelearse con él, y se pausa mientras el puntero
            // esté encima.
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      {/* Flechas arriba y alineadas al extremo derecho de la sección. Van aquí
          y no en <BlogPreview> porque necesitan la API de Embla, que vive en
          este componente. */}
      <div className="mb-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Noticia anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-brand-900 transition-colors hover:border-brand-900 hover:bg-brand-100"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Noticia siguiente"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-brand-900 transition-colors hover:border-brand-900 hover:bg-brand-100"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* `overflow-hidden` es el viewport de Embla; el track va dentro. */}
      {/* `data-lenis-prevent-horizontal` y NO `data-lenis-prevent`: el segundo
          hace que Lenis ignore el gesto entero —también el vertical— y la
          página se atoraba al pasar el cursor por encima. Embla sólo escucha
          `mousedown` y `touchstart`, nunca `wheel`, así que el scroll vertical
          nunca estuvo en disputa: lo único que conviene apartar es el gesto
          horizontal del trackpad. */}
      <div
        className="overflow-hidden"
        data-lenis-prevent-horizontal
        ref={emblaRef}
      >
        <ul className="flex gap-5">
          {posts.map((post) => (
            <li
              key={post.slug}
              /* En `lg` el 32% dejaba la tercera tarjeta terminando justo en el
                 borde: sin hueco, pero tampoco se veía que hubiera más. Con 30%
                 sobra un tramo de la cuarta y el gesto de arrastre se anuncia
                 solo. */
              className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_48%] lg:flex-[0_0_30%]"
            >
              <Link
                href={post.href}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl"
              >
                <Image
                  src={post.cover}
                  alt={post.coverAlt}
                  width={1200}
                  height={800}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 75vw"
                  /* Sólo el placeholder remoto va sin optimizar; las portadas
                     reales de /public sí pasan por el optimizador de Next. */
                  unoptimized={post.cover.startsWith("http")}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:scale-105"
                />

                {/* Degradado de abajo hacia arriba: garantiza el contraste del
                    título sin importar qué traiga la portada. Medido contra una
                    portada blanca, el peor caso posible: 15.5:1. */}
                <div className="absolute inset-0 bg-linear-to-t from-brand-950/95 via-brand-950/55 to-transparent" />

                {/* El degradado es transparente arriba, así que este badge cae
                    sobre la portada cruda. Con `bg-white/15` el texto blanco
                    daba 1.00:1 sobre una portada clara —invisible—; hoy no se
                    nota porque las portadas provisionales son oscuras, pero con
                    fotos reales fallaría. Con el navy al 70% da 6.99:1 incluso
                    sobre blanco puro. */}
                <div className="absolute inset-x-0 top-0 p-5">
                  <span className="inline-block rounded-full bg-brand-950/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <time
                    dateTime={post.date}
                    className="text-xs font-medium text-brand-100"
                  >
                    {post.dateLabel}
                  </time>
                  <h3 className="mt-1.5 font-heading text-lg font-bold leading-snug text-white">
                    {post.title}
                  </h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
