import Eyebrow from "./Eyebrow";
import HeroBackdrop from "./HeroBackdrop";

export default function Hero() {
  return (
    // `id="hero"` ya no lo observa Header.tsx: desde que el header se condensa
    // por posición de scroll, no necesita saber dónde termina el hero. Se deja
    // como ancla de la sección.
    //
    // COMPOSICIÓN CON EL COTIZADOR: <QuoteSection> se sobrepone al borde
    // inferior con margen negativo, así que el hero le reserva espacio con el
    // padding inferior.
    //
    // BLOQUE ANCLADO ARRIBA (`items-start`), no centrado. Antes era
    // `items-center`, y eso hacía que `pt` NO controlara la distancia al
    // eyebrow: con el bloque centrado en la franja [pt, alto - pb], el tope
    // vale pt + (alto - pt - pb - contenido)/2, o sea que cada 4px quitados de
    // `pt` sólo subían el eyebrow 2px. Medido en 1440x900 con el bloque real
    // (216px de alto): el eyebrow caía a 251px del borde, y aun poniendo pt a
    // CERO se quedaba a 203px — la distancia la ponía el centrado, no el
    // padding.
    //
    // Con `items-start` el tope ES `pt`, control 1:1 y en pasos de 4px. A
    // `md:pt-36` (144px) el eyebrow sube de 251px a 144px y queda a 72px por
    // debajo de la pastilla del header, que es fixed y termina hacia los 72px.
    // Para acercarlo o alejarlo, mover `md:pt-*` de 4 en 4: ahora sí se
    // traduce píxel por píxel.
    //
    // ALTURA: 3/4 de viewport, min 560px. Bajó de `83.333vh` / `min-640px`, y
    // las DOS cosas importaban. El objetivo era que la tarjeta del cotizador
    // —que sube 160px dentro del hero con el `-mt-40` de <QuoteSection>—
    // terminara dentro de la primera pantalla. Con los valores anteriores su
    // base caía por debajo del pliegue en todos los portátiles comunes: 20px a
    // 900 de alto, 26px a 864, 37px a 800 y 42px a 768. Y en el de 768 el
    // recorte no lo causaba el `vh` sino el `min-h`, que a esa altura era quien
    // mandaba: bajar sólo el `vh` habría dejado ese caso igual de roto.
    //
    // Con 75vh / 560px la tarjeta cabe en los cinco tamaños, con entre 22 y
    // 100px de margen. El `min-h` sigue muy por encima de los 488px que el hero
    // necesita para su propio contenido (pt-36 + bloque de 216px + pb-32).
    //
    // De paso encoge el hueco que el `items-start` había abierto entre el
    // párrafo y la tarjeta: de ~230px a ~155px.
    // `rounded-b-[2rem]`: el mismo lenguaje que el `rounded-3xl` (1.5rem) de la
    // tarjeta, un punto más abierto por ser un elemento a sangre. El
    // `overflow-hidden` que ya estaba por el video es lo que recorta el video y
    // el gradiente contra esa curva.
    <section
      id="hero"
      className="relative flex h-[75vh] min-h-[560px] items-start overflow-hidden rounded-b-[2rem] pb-16 pt-24 md:pb-32 md:pt-36"
    >
      <HeroBackdrop />

      {/* El CTA "DESCUBRA MÁS" se eliminó: con el cotizador sobrepuesto justo
          debajo, dos botones a menos de 100px uno del otro competían por la
          misma atención y el secundario mandaba fuera del embudo. El cotizador
          es ahora el CTA principal del hero. */}
      {/* Antes esto era un grid de dos columnas —texto y la tarjeta de
          certificaciones— que sólo se separaba en `xl`. Las certificaciones se
          movieron a su propia sección bajo el cotizador, así que aquí queda una
          sola columna y el grid sobra. */}
      {/* `text-center` centra el contenido de los tres bloques; el `mx-auto` de
          cada uno es lo que centra sus CAJAS, que están topadas por `max-w-*` y
          si no quedarían pegadas a la izquierda con el texto centrado dentro. */}
      <div className="relative mx-auto w-full max-w-7xl px-6 text-center">
        {/* Eyebrow de posicionamiento. <Eyebrow> renderiza un <p>, NO un
            heading: el hero ya tiene su <h1> y meter un heading encima
            rompería la jerarquía del documento.
            `tone="dark"` por ir sobre el video: 6.00:1 en el peor frame. */}
        <Eyebrow tone="dark" className="mb-4">
          Freight forwarder y logística internacional en México
        </Eyebrow>
        {/* Una sola línea en desktop. Medido sobre el woff2 que sirve next/font,
            en el peso y ancho reales del titular (Archivo bold, wdth 112.5):
            el texto ocupa 18.302 em, o sea ~878px a text-5xl, y con el px-6 del
            contenedor necesita un viewport de ~926px. Por eso el `nowrap` entra
            en `lg` (1024px) y no en `md` (768px), donde se desbordaría.

            El margen se estrechó al cambiar Manrope por Archivo semi expanded:
            el mismo texto medía ~806px, así que el colchón en `lg` pasó de
            ~170px a ~98px. Pasar el titular a sentence case devolvió 20px de
            esos (las minúsculas son más estrechas), pero sigue sin haber sitio
            para alargar la frase sin bajar el `nowrap` a `xl`.

            El `max-w-4xl` (896px) se libera en lg: si no, seguiría partiendo
            aunque el viewport diera de sobra. En móvil sí parte, es inevitable. */}
        <h1 className="mx-auto max-w-4xl font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:max-w-none lg:whitespace-nowrap">
          Impulsamos su crecimiento global
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-200">
          Transformamos los desafíos globales en oportunidades. Diseñamos
          soluciones logísticas sin fronteras que impulsan el crecimiento de
          cada industria a través de las fronteras.
        </p>
      </div>
    </section>
  );
}
