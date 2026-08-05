"use client";

/**
 * Video de fondo del hero. Decorativo: el mensaje vive en el <h1>, por eso va
 * `aria-hidden` y sin controles. Se reproduce siempre, para todos los
 * visitantes.
 *
 * Por qué es un componente cliente y no un <video> suelto dentro de Hero:
 * el HTML que sale del servidor NO trae ninguna <source>. Sin fuentes, el
 * navegador no puede pedir un solo byte de video durante la carga inicial, así
 * que el peso del archivo (5.65-12.32 MB según el códec) no entra nunca en el
 * critical path del LCP. Las fuentes se montan después de hidratar, o sea
 * después del primer paint, y ahí arranca la descarga en segundo plano.
 *
 * Mientras tanto se ve el `bg-brand-950` del contenedor. Ese hueco hasta el
 * primer frame es inherente a cualquier fondo en video.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * De mejor a peor compresión: el navegador se queda con la primera que soporta.
 * H.264 al final como fallback universal.
 */
const SOURCES = [
  { src: "/home/back-hero.av1.mp4", type: 'video/mp4; codecs="av01.0.05M.08"' },
  { src: "/home/back-hero.webm", type: 'video/webm; codecs="vp9"' },
  { src: "/home/back-hero.mp4", type: "video/mp4" },
] as const;

/** No hay nada a lo que suscribirse: el valor sólo cambia de servidor a cliente. */
const noopSubscribe = () => () => {};

export default function HeroVideo() {
  // `false` en el servidor, `true` en el cliente. Es lo que mantiene las
  // <source> fuera del HTML inicial. Va por useSyncExternalStore y no por
  // useState + efecto porque la regla react-hooks/set-state-in-effect del
  // proyecto rechaza el segundo patrón.
  const hasHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasHydrated) return;

    // Recoge las <source> que React acaba de montar. `preload="none"` evita
    // cualquier descarga especulativa antes de este punto.
    video.load();
    // Puede rechazar si el navegador bloquea el autoplay pese al `muted`; en
    // ese caso se queda el fondo sólido del contenedor.
    video.play().catch(() => {});
  }, [hasHydrated]);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className="h-full w-full bg-brand-950 object-cover opacity-60"
    >
      {hasHydrated &&
        SOURCES.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
    </video>
  );
}
