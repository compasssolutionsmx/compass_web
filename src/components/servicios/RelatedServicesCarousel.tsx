"use client";

/**
 * Carrusel de "otros servicios" para la plantilla de servicio.
 *
 * NO HAY UN CARRUSEL DE SERVICIOS RELACIONADOS EN EL SITIO HOY. Se construye
 * calcando el mecanismo de <BlogCarousel> —Embla headless, mismas flechas,
 * mismo `data-lenis-prevent-horizontal`, mismo `bleed-right`, mismo
 * difuminado del borde izquierdo cuando ya se desplazó— porque es el único
 * carrusel horizontal que ya existe en el sitio y resuelve exactamente lo
 * que pide esta sección. La envoltura de "columna de texto fija + carrusel"
 * calca la de <BlogPreview>.
 *
 * LOS DOS VIVEN EN UN SOLO ARCHIVO, a diferencia de BlogPreview/BlogCarousel:
 * ese par está partido en dos porque BlogPreview lee `lib/blog.ts` con
 * `node:fs` en el servidor y BlogCarousel tiene que ser cliente por Embla —
 * una frontera que aquí no existe, porque no hay ninguna fuente de datos
 * real que leer del sistema de archivos. Con datos fijos de marcador de
 * posición, partir el componente en dos no aportaría nada.
 *
 * SIN AUTOPLAY: a diferencia de <BlogCarousel>, esta pieza enlaza a otros
 * servicios, no a contenido editorial que convenga ir mostrando solo; se
 * deja el avance en manos del usuario.
 *
 * SIN DATOS REALES: las tarjetas son `<div>` y no `<Link>` —mismo criterio
 * que <ServicesGrid>—, porque ninguna otra página de servicio existe
 * todavía.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Eyebrow from "../Eyebrow";

const OTROS_SERVICIOS = [
  "[Servicio relacionado 1]",
  "[Servicio relacionado 2]",
  "[Servicio relacionado 3]",
  "[Servicio relacionado 4]",
];

export default function RelatedServicesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });

  // ¿Ya nos movimos del principio? Decide si difuminar el borde izquierdo,
  // mismo criterio que <BlogCarousel>.
  const [desplazado, setDesplazado] = useState(false);
  useEffect(() => {
    if (!emblaApi) return;
    const alSeleccionar = () => setDesplazado(emblaApi.canScrollPrev());
    emblaApi.on("select", alSeleccionar).on("reInit", alSeleccionar);
    return () => {
      emblaApi.off("select", alSeleccionar).off("reInit", alSeleccionar);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <div>
          <Eyebrow className="mb-3">Servicios relacionados</Eyebrow>
          <h2 className="font-heading text-3xl font-bold leading-tight text-brand-900 md:text-4xl">
            Otros servicios <br />
            que pueden interesarle
          </h2>
          <p className="mt-4 max-w-sm text-slate-600">
            [Texto de marcador de posición] introducción breve a la sección
            de servicios relacionados.
          </p>
        </div>

        <div className="relative">
          {/* Flechas arriba, alineadas al extremo derecho, mismo lugar que en
              <BlogCarousel>. */}
          <div className="mb-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Servicio anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-brand-900 transition-colors hover:border-brand-900 hover:bg-brand-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Servicio siguiente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-brand-900 transition-colors hover:border-brand-900 hover:bg-brand-100"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div
            className={`bleed-right overflow-hidden ${
              desplazado
                ? "[mask-image:linear-gradient(to_right,transparent_0,#000_48px,#000_100%)]"
                : ""
            }`}
            data-lenis-prevent-horizontal
            ref={emblaRef}
          >
            <ul className="flex gap-6 lg:gap-8">
              {OTROS_SERVICIOS.map((nombre) => (
                <li
                  key={nombre}
                  className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_45%] lg:flex-[0_0_28%]"
                >
                  <div className="flex aspect-[3/4] cursor-default flex-col justify-end overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-5">
                    <p className="font-heading text-lg font-bold leading-snug text-slate-500">
                      {nombre}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
