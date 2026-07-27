"use client";

import { useEffect, useRef, useState } from "react";

const ANIMATION_DURATION_MS = 1600;

type AnimatedCounterProps = {
  /** Valor final al que sube el contador. */
  target: number;
  /** Decimales a mostrar. 0 por defecto; el 95.3% necesita 1. */
  decimals?: number;
  className?: string;
};

/**
 * Contador que anima de 0 al valor final al entrar en viewport.
 *
 * EL VALOR FINAL ES EL ESTADO INICIAL, no el 0. Así el HTML estático ya trae la
 * cifra real —lo que ven los crawlers y quien navegue sin JS— y la animación
 * queda como mejora progresiva encima.
 *
 * Para que no haya parpadeo, el reinicio a 0 sólo ocurre si el observer
 * confirma que el elemento NO está a la vista al montar:
 *
 *   visible al cargar  -> se queda en su valor final, sin animar. Nadie ve un 0.
 *   fuera de pantalla  -> se reinicia a 0 (nadie lo ve, está fuera del viewport)
 *                         y anima cuando el usuario llega hasta él.
 *
 * Se comprueba con `intersectionRatio > 0` y no con `isIntersecting`: con el
 * umbral de 0.4, un elemento visible a medias reportaría `false` y se
 * reiniciaría a 0 delante del usuario.
 */
export default function AnimatedCounter({
  target,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(target);
  const elementRef = useRef<HTMLSpanElement>(null);
  const phase = useRef<"initial" | "armed" | "done">("initial");

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let frameId = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // Primera notificación: decide si este contador llega a animarse.
        if (phase.current === "initial") {
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          if (entry.intersectionRatio > 0 || prefersReducedMotion) {
            phase.current = "done";
            observer.disconnect();
            return;
          }

          phase.current = "armed";
          setValue(0);
          return;
        }

        if (phase.current !== "armed" || !entry.isIntersecting) return;

        phase.current = "done";
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / ANIMATION_DURATION_MS, 1);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(eased * target);
          if (progress < 1) frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
      },
      // El 0 avisa del estado inicial aunque el elemento asome poco; el 0.4 es
      // el punto en que arranca la animación.
      { threshold: [0, 0.4] },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [target]);

  return (
    <span ref={elementRef} className={className}>
      {value.toFixed(decimals)}
    </span>
  );
}
