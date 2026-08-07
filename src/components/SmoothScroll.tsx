"use client";

/**
 * Scroll suave con inercia (Lenis) para todo el sitio.
 *
 * Expone `pause`/`resume` por contexto porque Lenis y los modales se pelean: si
 * un modal bloquea el scroll del body mientras Lenis sigue vivo, el fondo se
 * mueve por debajo. Los tres modales del sitio lo llaman en su efecto de
 * bloqueo.
 *
 * ACCESIBILIDAD: con `prefers-reduced-motion` Lenis NO se instancia. El scroll
 * con inercia es justo el tipo de movimiento que molesta a quien es sensible, y
 * el usuario se queda con el scroll nativo del navegador, que además ya lleva
 * el `scroll-padding-top` de globals.css para los anclas.
 */

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

type SmoothScrollApi = {
  pause: () => void;
  resume: () => void;
  /**
   * Lleva el scroll a un elemento. Si Lenis está apagado —por
   * `prefers-reduced-motion`— cae al scroll nativo, que ya respeta el
   * `scroll-padding-top` del CSS.
   */
  scrollTo: (target: HTMLElement) => void;
  /**
   * Centra un elemento en el viewport, en vez de alinear su borde superior
   * (que es lo que hace `scrollTo`, pensado para anclas de nav). Lo usa el
   * auto-avance del paso 1 del cotizador inline: al elegir tipo de servicio la
   * tarjeta crece hacia abajo, y sin esto quedaría con el borde superior
   * pegado al header en vez de centrada.
   *
   * Calcula la posición absoluta a mano en vez de delegar en el `offset` de
   * `lenis.scrollTo` con el elemento: ese offset se SUMA a la alineación por
   * borde superior, no calcula un centrado real.
   */
  scrollToCenter: (target: HTMLElement) => void;
};

/** Por defecto no hace nada: si Lenis está apagado, pausar y reanudar sobran. */
const SmoothScrollContext = createContext<SmoothScrollApi>({
  pause: () => {},
  resume: () => {},
  scrollTo: (target) => target.scrollIntoView(),
  scrollToCenter: (target) =>
    target.scrollIntoView({ block: "center", behavior: "smooth" }),
});

export function useSmoothScroll(): SmoothScrollApi {
  return useContext(SmoothScrollContext);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      // `lerp` manda sobre `duration`: cuanto más bajo, más peso tiene el
      // scroll. 0.09 se nota claramente sin llegar a sentirse lento.
      lerp: 0.09,
      smoothWheel: true,
      // Los anclas del nav (#soluciones, #oferta) pasan por Lenis. El offset
      // replica el `scroll-padding-top: 6rem` del CSS, que Lenis no respeta
      // porque no usa el scroll nativo para llegar al destino.
      anchors: { offset: -96 },
      // No hace falta un callback `prevent`: Lenis ya recorre el composedPath
      // del evento buscando `data-lenis-prevent` y sus variantes por eje. Los
      // elementos que lo necesitan lo declaran ellos mismos.
    });

    lenisRef.current = lenis;

    // El bucle de rAF es obligatorio: sin él Lenis se instancia pero no avanza
    // ni un frame, y el scroll se siente exactamente igual que el nativo.
    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  /**
   * Remide el documento en cada cambio de ruta.
   *
   * POR QUÉ HACE FALTA: Lenis mantiene su propio límite de scroll
   * (`scrollHeight - height`) y lo refresca con un ResizeObserver sobre
   * <html>. Un ResizeObserver dispara por cambios del BORDER-BOX del elemento
   * observado, no de su `scrollHeight`; y <html> lleva `h-full`, así que su
   * border-box mide siempre el viewport, sea la página larga o corta. Resultado:
   * al navegar entre páginas de distinto alto el observer nunca se entera y
   * Lenis se queda con el límite de la página anterior — de más si venías de una
   * larga (scroll muerto al final) o de menos si venías de una corta.
   *
   * `resize()` no depende del observer: relee `scrollHeight` a mano
   * (lenis.mjs -> Dimensions.onContentResize), que sí refleja el contenido real
   * aunque el border-box esté clavado. Por eso el arreglo va aquí y no en el
   * `h-full` del layout, que sostiene el sticky footer.
   *
   * Corre después del commit del DOM nuevo, así que mide la página ya montada.
   * Si una ruta creciera DESPUÉS (una imagen sin dimensiones reservadas, un
   * bloque que se hidrata tarde), esa altura extra volvería a quedar fuera:
   * ahí haría falta remedir en el load de ese recurso, no en la navegación.
   */
  useEffect(() => {
    lenisRef.current?.resize();
  }, [pathname]);

  const api = useMemo<SmoothScrollApi>(
    () => ({
      pause: () => lenisRef.current?.stop(),
      resume: () => lenisRef.current?.start(),
      scrollTo: (target) => {
        const lenis = lenisRef.current;
        if (lenis) lenis.scrollTo(target, { offset: -96 });
        else target.scrollIntoView();
      },
      scrollToCenter: (target) => {
        const lenis = lenisRef.current;
        if (!lenis) {
          target.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }
        // Posición absoluta que deja al elemento centrado: su borde superior
        // actual, más el scroll ya acumulado, menos la mitad del sobrante
        // entre el alto del viewport y el alto del elemento.
        const rect = target.getBoundingClientRect();
        const destino =
          window.scrollY +
          rect.top -
          Math.max(0, window.innerHeight - rect.height) / 2;
        lenis.scrollTo(Math.max(0, destino));
      },
    }),
    [],
  );

  return (
    <SmoothScrollContext.Provider value={api}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
