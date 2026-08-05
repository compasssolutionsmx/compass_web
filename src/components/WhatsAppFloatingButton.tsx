"use client";

import { useEffect, useRef, useState } from "react";
import WhatsAppIcon from "./WhatsAppIcon";
import { WhatsAppButton } from "./WhatsAppModal";

/** Aire entre el botón y el borde superior del footer. */
const MARGEN_FOOTER_PX = 16;

/**
 * Espacio que hay que dejar libre arriba. Es el mismo `scroll-padding-top: 6rem`
 * de globals.css, que ya modela lo que ocupa el header fijo: por debajo de esa
 * línea el botón se metería detrás del header, que va en z-40 contra su z-30.
 */
const ZONA_HEADER_PX = 96;

/** El `bottom-6` del botón, en píxeles. Es la base sobre la que se desplaza. */
const BASE_BOTTOM_PX = 24;

/**
 * Ancla el botón justo por encima del footer.
 *
 * El desplazamiento NO es un valor fijo: se recalcula contra el borde superior
 * real del footer en cada frame de scroll. Mientras el footer está lejos vale 0
 * y el botón se queda donde siempre; en cuanto el footer sube lo suficiente
 * para tocarlo, el desplazamiento crece exactamente al mismo ritmo que el
 * scroll, así que el botón se queda quieto en pantalla —clavado sobre el borde
 * del footer— mientras la página sigue corriendo por debajo.
 *
 * Como el desplazamiento arranca en 0 y crece de forma continua, no hay ningún
 * salto que suavizar: por eso el botón NO lleva transición en `translate`. Una
 * transición aquí sería contraproducente — el botón iría con retraso respecto
 * al borde del footer y se metería dentro justo mientras se scrollea, que es
 * precisamente el defecto que esto viene a arreglar.
 *
 * El valor se escribe directo en el DOM como variable CSS, sin pasar por el
 * estado de React: son ~60 escrituras por segundo mientras se scrollea, y cada
 * una provocaría un render completo del componente.
 *
 * SE OCULTA cuando ya no cabe. Si el footer es más alto que el viewport —en
 * móvil lo es— al llegar al final de la página el footer ocupa toda la pantalla
 * y no queda ni un hueco donde poner el botón sin invadirlo. Ahí la única
 * respuesta coherente con "nunca encima del footer" es que se desvanezca; se
 * recupera solo al subir.
 */
function useAnclajeSobreFooter(
  botonRef: React.RefObject<HTMLButtonElement | null>,
) {
  const [sinEspacio, setSinEspacio] = useState(false);

  useEffect(() => {
    const boton = botonRef.current;
    const footer = document.querySelector("footer");
    if (!boton || !footer) return;

    let frame = 0;

    const medir = () => {
      frame = 0;
      const { top } = footer.getBoundingClientRect();
      const alturaBoton = boton.offsetHeight;

      // Cuánto del footer se ve, medido desde el borde inferior del viewport.
      const invasion = window.innerHeight - top;
      // Lo que hay que subir el botón —cuyo borde inferior está a
      // BASE_BOTTOM_PX del fondo— para que quede por encima de esa línea.
      const desplazamiento = Math.max(
        0,
        invasion + MARGEN_FOOTER_PX - BASE_BOTTOM_PX,
      );
      boton.style.setProperty("--fab-footer-lift", `${desplazamiento}px`);

      // Con ese desplazamiento el borde SUPERIOR del botón queda en
      // `top - MARGEN - alturaBoton`. Si eso ya no llega a la zona libre bajo
      // el header, es que no hay hueco entre el header y el footer.
      setSinEspacio(top - MARGEN_FOOTER_PX - alturaBoton < ZONA_HEADER_PX);
    };

    // Siempre a través de rAF: el scroll dispara muchas veces por frame y
    // `getBoundingClientRect` fuerza cálculo de layout.
    const programar = () => {
      if (frame) return;
      frame = requestAnimationFrame(medir);
    };

    const reposo = () => {
      boton.style.setProperty("--fab-footer-lift", "0px");
      setSinEspacio(false);
    };

    // El observador es sólo un interruptor de eficiencia: enciende el
    // seguimiento cuando el footer está cerca y lo apaga cuando no, para no
    // medir en todo el resto de la página. El margen inferior lo enciende con
    // antelación, antes de que el footer asome.
    let siguiendo = false;
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting === siguiendo) return;
        siguiendo = entrada.isIntersecting;
        if (siguiendo) {
          window.addEventListener("scroll", programar, { passive: true });
          programar();
        } else {
          window.removeEventListener("scroll", programar);
          reposo();
        }
      },
      { rootMargin: "0px 0px 240px 0px" },
    );
    observer.observe(footer);

    // El alto del footer cambia con el ancho de la ventana (las columnas se
    // apilan), y eso mueve su borde superior sin que haya habido scroll.
    const resizeObserver = new ResizeObserver(programar);
    resizeObserver.observe(footer);
    window.addEventListener("resize", programar);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", programar);
      window.removeEventListener("resize", programar);
      boton.style.removeProperty("--fab-footer-lift");
    };
  }, [botonRef]);

  return sinEspacio;
}

/**
 * Botón flotante de WhatsApp. Abre <WhatsAppModal> para capturar el lead antes
 * del handoff; no enlaza a wa.me.
 *
 * COLOR: se queda en navy (`.glass-solid`) con el ícono en verde de WhatsApp,
 * y no al revés. El verde de marca de WhatsApp (#25D366) con texto blanco
 * encima da 1.98:1 y falla AA de largo; el único verde de su paleta que pasa
 * (#075E54) es tan oscuro que deja de leerse como WhatsApp. Así el texto
 * mantiene 11.95:1, el ícono verde da 6.03:1 —por encima del 3:1 que pide el
 * contenido no textual— y la señal de WhatsApp la dan el glyph y el pulso.
 *
 * MOVIMIENTO: el wiggle periódico y el pulso verde viven en `.wa-fab`
 * (globals.css), que también los detiene con prefers-reduced-motion.
 *
 * POSICIÓN: fijo abajo a la derecha, y se aparta de dos cosas distintas que le
 * pueden quedar debajo:
 *   - el footer, siguiendo su borde superior (ver el hook de arriba);
 *   - el banner de cookies, que publica su altura en `--consent-banner-lift`.
 * Se toma el MÁXIMO de los dos, no la suma: son dos estorbos anclados al mismo
 * borde inferior, así que basta con librar al más alto. Ninguno de los dos
 * componentes necesita saber del otro — se hablan por esas dos variables.
 *
 * El desplazamiento usa la propiedad `translate` y no `transform`, justamente
 * porque `transform` ya lo está usando la animación del wiggle de `.wa-fab`:
 * son propiedades distintas y se componen en vez de pisarse.
 */
export default function WhatsAppFloatingButton() {
  const botonRef = useRef<HTMLButtonElement>(null);
  const sinEspacio = useAnclajeSobreFooter(botonRef);

  return (
    <WhatsAppButton
      ref={botonRef}
      ariaLabel="¡Habla con un Agente!"
      style={{
        translate:
          "0 calc(-1 * max(var(--fab-footer-lift, 0px), var(--consent-banner-lift, 0px)))",
      }}
      /* `invisible` además de `opacity-0` para que, mientras está oculto, el
         botón salga del orden de tabulación y del árbol de accesibilidad: un
         control invisible pero enfocable es una trampa para quien navega con
         teclado. `visibility` es transicionable —cambia al final de la
         transición al ocultar y al principio al mostrar—, así que el fundido
         se sigue viendo entero. */
      className={`wa-fab glass-solid fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white transition-[opacity,visibility] duration-200 ease-out hover:opacity-90 motion-reduce:transition-none sm:h-auto sm:w-auto sm:gap-2.5 sm:px-5 sm:py-3 ${
        sinEspacio ? "invisible opacity-0" : "visible opacity-100"
      }`}
    >
      <WhatsAppIcon className="h-7 w-7 shrink-0 text-[#25D366] sm:h-5 sm:w-5" />
      {/* En móvil sólo queda el ícono y el botón es circular: el nombre
          accesible lo aporta el aria-label de arriba. */}
      <span className="hidden font-heading font-semibold sm:inline">
        ¡Habla con un Agente!
      </span>
    </WhatsAppButton>
  );
}
