"use client";

/**
 * Barra ancha del cotizador, sobrepuesta al borde inferior del hero.
 *
 * Sólo aporta posicionamiento y ancho: el formulario de 4 pasos vive en
 * <QuoteWizard>, compartido tal cual con el modal de "Contáctenos".
 */

import { useId } from "react";
import QuoteWizard from "./QuoteWizard";

export default function QuoteSection() {
  const titleId = useId();

  return (
    // El `pb` es corto a propósito (40/48px): debajo va <Certifications>, que
    // no lleva padding superior, así que este valor ES el hueco entre el
    // cotizador y la fila de logos. Bajó de 64/80px para acercarlos.
    //
    // Sobrepuesta al hero con margen negativo. En móvil el margen es menor
    // porque la tarjeta crece (los grids colapsan a 1 columna) y taparía el
    // párrafo del hero.
    //
    // La tarjeta cruza la curva `rounded-b-[2rem]` del hero, pero no choca con
    // ella: el hero va a sangre y la tarjeta es max-w-6xl centrada, así que las
    // esquinas redondeadas del hero quedan a los lados, fuera de la tarjeta.
    <section
      id="cotizador"
      aria-labelledby={titleId}
      className="relative z-10 -mt-16 pb-10 md:-mt-40 md:pb-12"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <QuoteWizard headingId={titleId} />
      </div>
    </section>
  );
}
