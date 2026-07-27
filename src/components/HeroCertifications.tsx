"use client";

/**
 * Carrusel de certificaciones del hero: una tarjeta de vidrio claro que rota
 * los logos con crossfade.
 *
 * Es cliente por dos motivos: el temporizador del carrusel y la lectura de
 * `prefers-reduced-motion`.
 *
 * Los logos son monocromos blancos sobre alfa, así que sobre la tarjeta clara
 * desaparecerían. Se tiñen a brand-900 con `mask-image` (ver `.cert-mark` en
 * globals.css), que da la silueta exacta sin transformar color.
 */

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * TODO(cliente): falta ALACAT. Está fuera del carrusel a propósito, no por
 * olvido: el único ejemplar que existe se sirve del WordPress, que responde con
 * un challenge anti-bot y no deja verificar el archivo. Sin poder confirmar que
 * es monocromo sobre alfa como los otros tres, aplicarle el enmascarado es un
 * riesgo — si trae fondo opaco saldría como un rectángulo navy sólido.
 * Cuando llegue alacat.png a /public/logo-certs/, verificar que sea monocromo
 * y añadirlo aquí.
 */
const CERTIFICATIONS = [
  { src: "/logo-certs/amacarga.png", alt: "AMACARGA" },
  { src: "/logo-certs/canacar.png", alt: "CANACAR" },
  { src: "/logo-certs/isoeeee.png", alt: "ISO" },
];

const INTERVALO_MS = 2800;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * El <span> enmascarado no es una imagen para el navegador, así que necesita
 * `role="img"` + `aria-label` para conservar el equivalente del `alt`.
 */
function CertMark({ src, alt }: { src: string; alt: string }) {
  return (
    <span
      role="img"
      aria-label={alt}
      className="cert-mark block h-full w-full"
      style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
    />
  );
}

export default function HeroCertifications() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % CERTIFICATIONS.length),
      INTERVALO_MS,
    );
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    // Tarjeta ajustada al logo: el ancho lo fija la tarjeta y el alto sale del
    // aspect ratio real de los PNG (512x291), así que el logo llena el ancho
    // disponible en vez de flotar en un hueco.
    <div className="glass w-52 rounded-2xl p-3 xl:w-56 xl:p-4">
      {/* Con la preferencia de movimiento reducido no rota: se muestran los
          tres a la vez, así no se pierde información por quitar la animación. */}
      {prefersReducedMotion ? (
        <ul className="flex flex-col gap-2">
          {CERTIFICATIONS.map((cert) => (
            <li key={cert.alt} className="h-8">
              <CertMark {...cert} />
            </li>
          ))}
        </ul>
      ) : (
        /* Los tres <li> están siempre en el DOM y sólo cambia la opacidad: el
           crossfade es visual, y un lector de pantalla recibe la lista completa
           de certificaciones en vez de una sola. */
        <ul className="relative aspect-[512/291] w-full">
          {CERTIFICATIONS.map((cert, i) => (
            <li
              key={cert.alt}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <CertMark {...cert} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
