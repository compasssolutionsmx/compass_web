"use client";

/**
 * Índice del artículo, con la sección activa resaltada conforme se lee.
 *
 * El apartado activo lo decide un IntersectionObserver sobre los propios
 * encabezados del cuerpo, no el scrollY: así no hay que conocer la altura de
 * nada y sigue funcionando si el contenido cambia.
 *
 * En móvil se colapsa en un <details>: ocupa una línea y se abre a demanda, sin
 * inventar un botón flotante que taparía el texto.
 *
 * SE MONTA DOS VECES EN LA PÁGINA DE ARTÍCULO, una por variante, y de ahí sale
 * el prop `variant`. Antes las dos formas vivían en el mismo componente, una
 * debajo de la otra, y eso las ataba a ocupar el MISMO sitio del DOM — que era
 * justo el problema: en escritorio el índice va en la columna derecha, pero en
 * móvil tiene que ir ARRIBA del cuerpo, y esos son dos puntos distintos del
 * documento. Separadas en dos instancias, cada una se coloca donde le toca y el
 * orden del DOM coincide con el orden visual en los dos anchos, sin `order` ni
 * recolocaciones de grid. La que no toca sale con `display: none`, así que ni es
 * enfocable ni la ve un lector de pantalla: siempre hay exactamente un índice.
 *
 * EL PRECIO son dos IntersectionObserver sobre los mismos encabezados en vez de
 * uno. Se paga a propósito: quitarle el observador a la variante móvil dejaría
 * el índice sin resaltar la sección al abrir el <details> a media lectura, y
 * eso sí sería un cambio de comportamiento. Son ~11 elementos observados de
 * media (24 en el artículo más largo) y el navegador los evalúa fuera del hilo
 * de layout.
 */

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/blog";
import { useSmoothScroll } from "./SmoothScroll";

export default function ArticleToc({
  headings,
  variant,
}: {
  headings: Heading[];
  /**
   * `movil`      acordeón cerrado, oculto de `lg` para arriba.
   * `escritorio` lista abierta con su rótulo, oculta por debajo de `lg`.
   * El corte lo hace CSS y no una media query de JS: así no hay dos pasadas de
   * render ni desajuste entre el HTML del servidor y la hidratación.
   */
  variant: "movil" | "escritorio";
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Se marca el encabezado visible que esté más arriba. Sin esto, al
        // haber dos secciones en pantalla parpadearía entre ambas.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (visible) setActiveId(visible.target.id);
      },
      // La franja recorta el viewport a su tercio superior: la sección se marca
      // cuando su título llega arriba, no cuando entra por abajo.
      { rootMargin: "-96px 0px -66% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  function goTo(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    // Se evita el salto nativo para que lo haga Lenis; si Lenis está apagado,
    // `scrollTo` cae a `scrollIntoView`.
    event.preventDefault();
    scrollTo(target);
    // La URL sigue reflejando la sección, para poder compartir el enlace.
    history.replaceState(null, "", `#${id}`);
  }

  const list = (
    <ol className="space-y-1 border-l border-slate-200">
      {headings.map((heading) => {
        const isActive = heading.id === activeId;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(event) => goTo(event, heading.id)}
              aria-current={isActive ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1.5 text-sm transition-colors duration-200 ${
                heading.level === 3 ? "pl-7" : "pl-4"
              } ${
                isActive
                  ? "border-brand-900 font-semibold text-brand-900"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-brand-900"
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );

  /* MÓVIL: COLAPSADO Y CERRADO DE ENTRADA. Un `<details>` sin `open` ocupa una
     sola línea (~53px), así que ponerlo encima del artículo no le roba pantalla
     a lo que la gente vino a leer. Abrirlo por defecto sería insostenible: la
     mediana de estos artículos son 11 encabezados y el más largo tiene 24, con
     títulos de 44 caracteres de media — desplegado empuja el primer párrafo
     muy por debajo del pliegue. */
  if (variant === "movil") {
    return (
      <nav aria-label="Contenido del artículo" className="lg:hidden">
        <details className="group rounded-xl border border-slate-200 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-sm font-semibold text-brand-900">
            Contenido
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="mt-3">{list}</div>
        </details>
      </nav>
    );
  }

  /* ESCRITORIO: lista siempre visible, sin acordeón. El `sticky` no vive aquí
     sino en el <aside> que la envuelve, junto con la tarjeta de contacto, para
     que las dos se queden fijas como un solo bloque. Y ese `sticky` es
     `lg:sticky`, o sea que en móvil NO HAY sticky ni lo había: el acordeón se
     desplaza con la página como un bloque más. */
  return (
    <nav aria-label="Contenido del artículo" className="hidden lg:block">
      <p className="mb-3 font-heading text-sm font-semibold text-brand-900">
        Contenido
      </p>
      {list}
    </nav>
  );
}
