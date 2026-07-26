"use client";

import { useEffect, useRef, useState } from "react";

const ANIMATION_DURATION_MS = 1600;

type AnimatedCounterProps = {
  /** Valor final al que sube el contador. */
  target: number;
  className?: string;
};

/**
 * Cuenta de 0 a `target` la primera vez que entra en viewport
 * (IntersectionObserver). Respeta `prefers-reduced-motion`: en ese caso
 * muestra el valor final sin animar.
 */
export default function AnimatedCounter({
  target,
  className,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let cleanupFrame: (() => void) | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || hasAnimated.current) return;

        hasAnimated.current = true;
        observer.disconnect();

        // Sin animación si el usuario pidió movimiento reducido: se muestra
        // directamente el valor final.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setValue(target);
          return;
        }

        const start = performance.now();
        let frameId = 0;

        const tick = (now: number) => {
          const progress = Math.min((now - start) / ANIMATION_DURATION_MS, 1);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(eased * target));
          if (progress < 1) frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        cleanupFrame = () => cancelAnimationFrame(frameId);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cleanupFrame?.();
    };
  }, [target]);

  return (
    <span ref={elementRef} className={className}>
      {value}
    </span>
  );
}
