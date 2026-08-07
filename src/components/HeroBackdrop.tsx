/**
 * Fondo de hero con video: la capa base, el video y el velo de marca.
 *
 * Existe para que las páginas que usan este hero no repitan la composición.
 * <HeroVideo> ya era un componente, pero las tres piezas que lo envuelven
 * —el `bg-brand-950` de relleno, el propio video y el `hero-overlay`— se
 * escribían a mano en cada página, y son justamente las que tienen que ir
 * juntas: el velo es lo que garantiza el contraste del texto encima, así que
 * separarlo del video es cómo se cuela un hero sin él.
 *
 * NO ES `absolute` por fuera: se posiciona a sí mismo dentro del <section>, que
 * debe ser `relative overflow-hidden`. El contenido del hero va después, en un
 * hermano con `relative`, para quedar por encima.
 *
 * CONTRASTE, medido sobre los frames reales del video (21 muestras, una cada 2
 * segundos) y no sobre una estimación: en la zona donde cae el texto, el peor
 * píxel de todo el metraje deja el blanco en 6.26:1 y el eyebrow `dark`
 * (brand-50 sobre su pastilla white/10) en 4.54:1. Los dos pasan AA. El cálculo
 * incluye las tres capas: brand-950 de base, el video al 60% de opacidad encima
 * y los dos radiales del velo.
 *
 * El velo se calibró con el texto a la izquierda, que es como sigue estando en
 * /nosotros. En el home se centró después: ahí el punto MENOS protegido —la
 * esquina superior derecha del <h1>— pasa de 0.425 a 0.408 de alfa, 1.7 puntos,
 * porque el foco claro del primer radial está en 85% x y el borde del titular
 * sólo se mueve del 70% al 81%. Por eso el mismo velo sirve a las dos.
 */

import HeroVideo from "./HeroVideo";

export default function HeroBackdrop() {
  return (
    <div className="absolute inset-0 bg-brand-950">
      {/* El manejo de fuentes y el diferido que mantiene el peso del video
          fuera del LCP viven en <HeroVideo>, que es cliente por eso. El
          `bg-brand-950` de este contenedor es el relleno que se ve hasta el
          primer frame. */}
      <HeroVideo />
      {/* Velo de marca: dos radiales que oscurecen la mitad inferior izquierda
          y dejan la esquina superior derecha casi limpia. La receta está en
          `hero-overlay`, en globals.css. */}
      <div className="hero-overlay absolute inset-0" />
    </div>
  );
}
