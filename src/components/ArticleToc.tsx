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
 */

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/blog";
import { useSmoothScroll } from "./SmoothScroll";

export default function ArticleToc({ headings }: { headings: Heading[] }) {
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

  return (
    <nav aria-label="Contenido del artículo">
      {/* Móvil: colapsado. `open` sin media query no serviría, así que se
          duplica el listado en dos contenedores y cada uno se muestra en su
          breakpoint. Es marcado de más, pero evita JS de resize. */}
      <details className="group rounded-xl border border-slate-200 p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-sm font-semibold text-brand-900">
          Contenido
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="mt-3">{list}</div>
      </details>

      <div className="hidden lg:block">
        <p className="mb-3 font-heading text-sm font-semibold text-brand-900">
          Contenido
        </p>
        {list}
      </div>
    </nav>
  );
}
