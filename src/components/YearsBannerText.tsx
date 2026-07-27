"use client";

/**
 * Revelado palabra por palabra del claim del banner.
 *
 * El texto está SIEMPRE en el DOM, completo y en orden: sólo se anima su
 * apariencia (opacidad, desplazamiento y desenfoque). Nada se inyecta por JS,
 * así que lectores de pantalla y crawlers lo ven íntegro desde el HTML inicial.
 *
 * El estado oculto sólo se aplica DESPUÉS de hidratar (`hasHydrated`). Si se
 * aplicara ya en el servidor, sin JS el texto se quedaría invisible para
 * siempre. Como el banner vive bien abajo de la página, para cuando el usuario
 * llega ahí la hidratación ocurrió hace rato y el cambio no se percibe.
 */

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const TEXT = "+12 años brindado soluciones sin fronteras.";
const WORDS = TEXT.split(" ");

const STAGGER_MS = 90;
const DURATION_MS = 600;
const EASE = "cubic-bezier(.2,.8,.2,1)";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Sin nada a lo que suscribirse: sólo distingue servidor de cliente. */
const noopSubscribe = () => () => {};

export default function YearsBannerText() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const hasHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const [isRevealed, setIsRevealed] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsRevealed(true);
        // Una sola vez: no se vuelve a disparar al subir y bajar.
        observer.disconnect();
      },
      { threshold: 0.3 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const shouldAnimate = hasHydrated && !prefersReducedMotion;
  const isHidden = shouldAnimate && !isRevealed;

  return (
    <p
      ref={ref}
      className="font-heading text-3xl font-semibold leading-tight text-white md:text-5xl"
    >
      {WORDS.map((word, index) => {
        // El "+12" entra un punto más grande y se asienta a su escala final:
        // es el remate del efecto sin romper el orden de lectura.
        const isNumber = index === 0;
        return (
          <Fragment key={word}>
            <span
              className={`inline-block transition-[opacity,translate,filter,scale] ${
                isHidden
                  ? `translate-y-5 opacity-0 blur-[8px] ${isNumber ? "scale-110" : ""}`
                  : "translate-y-0 scale-100 opacity-100 blur-0"
              } ${isNumber ? "text-4xl md:text-6xl" : ""}`}
              style={
                shouldAnimate
                  ? {
                      transitionDelay: `${index * STAGGER_MS}ms`,
                      transitionDuration: `${DURATION_MS}ms`,
                      transitionTimingFunction: EASE,
                    }
                  : undefined
              }
            >
              {word}
            </span>
            {index < WORDS.length - 1 && " "}
          </Fragment>
        );
      })}
    </p>
  );
}
