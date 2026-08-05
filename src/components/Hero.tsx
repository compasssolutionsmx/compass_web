import HeroVideo from "./HeroVideo";
import Eyebrow from "./Eyebrow";

export default function Hero() {
  return (
    // `id="hero"` ya no lo observa Header.tsx: desde que el header se condensa
    // por posición de scroll, no necesita saber dónde termina el hero. Se deja
    // como ancla de la sección.
    //
    // COMPOSICIÓN CON EL COTIZADOR: <QuoteSection> se sobrepone al borde
    // inferior con margen negativo, así que el hero le reserva espacio con el
    // padding inferior en vez de centrar el texto en toda la altura. El texto
    // queda centrado en la franja [pt, alto - pb].
    //
    // El reparto de padding es asimétrico a propósito (pt > pb): así el bloque
    // de texto baja del centro geométrico y se acerca a la tarjeta, en vez de
    // quedar pegado al header con un hueco grande debajo. En 1440x900 el hueco
    // entre el párrafo y la tarjeta pasa de 233px a 97px.
    //
    // Altura: 5/6 de viewport, min 640px.
    // `rounded-b-[2rem]`: el mismo lenguaje que el `rounded-3xl` (1.5rem) de la
    // tarjeta, un punto más abierto por ser un elemento a sangre. El
    // `overflow-hidden` que ya estaba por el video es lo que recorta el video y
    // el gradiente contra esa curva.
    <section
      id="hero"
      className="relative flex h-[83.333vh] min-h-[640px] items-center overflow-hidden rounded-b-[2rem] pb-16 pt-20 md:pb-32 md:pt-24"
    >
      <div className="absolute inset-0 bg-brand-950">
        {/* Video del cliente (42.93 s). El manejo de fuentes y el diferido que
            mantiene su peso fuera del LCP viven en HeroVideo, que es cliente
            por eso. El `bg-brand-950` de este contenedor es el relleno que se
            ve hasta el primer frame. El master sin comprimir está en
            media-src/, fuera de public/ y gitignoreado; las versiones
            servidas están en public/home/. */}
        <HeroVideo />
        {/* Velo de marca: dos radiales superpuestos que oscurecen la esquina
            inferior izquierda (donde cae el texto) y dejan la superior derecha
            casi limpia. Es lo que garantiza el contraste del texto y del logo
            sin importar qué frame del video toque. La receta y las mediciones
            de contraste están en `hero-overlay`, en globals.css. */}
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* El CTA "DESCUBRA MÁS" se eliminó: con el cotizador sobrepuesto justo
          debajo, dos botones a menos de 100px uno del otro competían por la
          misma atención y el secundario mandaba fuera del embudo. El cotizador
          es ahora el CTA principal del hero. */}
      {/* Antes esto era un grid de dos columnas —texto y la tarjeta de
          certificaciones— que sólo se separaba en `xl`. Las certificaciones se
          movieron a su propia sección bajo el cotizador, así que aquí queda una
          sola columna y el grid sobra. */}
      <div className="relative mx-auto w-full max-w-7xl px-6">
        {/* Eyebrow de posicionamiento. <Eyebrow> renderiza un <p>, NO un
            heading: el hero ya tiene su <h1> y meter un heading encima
            rompería la jerarquía del documento.
            `tone="dark"` por ir sobre el video: 6.00:1 en el peor frame. */}
        <Eyebrow tone="dark" className="mb-4">
          Freight forwarder y logística internacional en México
        </Eyebrow>
        {/* Una sola línea en desktop. Medido con la Manrope real: el texto
            ocupa 15.259 em, o sea ~791px en bold a text-5xl, y necesita un
            viewport de ~839px. Por eso el `nowrap` entra en `lg` (1024px) y no
            en `md` (768px), donde se desbordaría.
            El `max-w-4xl` (896px) se libera en lg: si no, seguiría partiendo
            aunque el viewport diera de sobra. En móvil sí parte, es inevitable. */}
        <h1 className="max-w-4xl font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:max-w-none lg:whitespace-nowrap">
          Impulsamos su Crecimiento Global
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-slate-200">
          Transformamos los desafíos globales en oportunidades. Diseñamos
          soluciones logísticas sin fronteras que impulsan el crecimiento de
          cada industria a través de las fronteras.
        </p>
      </div>
    </section>
  );
}
