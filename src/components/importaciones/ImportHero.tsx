import Image from "next/image";
import Eyebrow from "../Eyebrow";

/**
 * Hero de /importaciones-a-mexico. Alineado con el del home: mismo esqueleto,
 * misma tipografía y mismo tratamiento de fondo, cambiando sólo el medio (foto
 * en vez de video, porque esta página es destino de campañas pagadas y el peso
 * importa más).
 *
 * JERARQUÍA CORREGIDA. Antes venía invertida del mockup: el texto grande era un
 * <p> decorativo y el <h1> era una línea pequeña subrayada con la keyword. Ahora
 * el titular grande ES el <h1> y esa línea pequeña pasó a <Eyebrow tone="dark">,
 * que es el rol que de verdad cumplía —etiqueta de posicionamiento— y el mismo
 * patrón que el home. Con eso desaparece también el resaltado `bg-brand-100/15`
 * hecho a mano: la pastilla del eyebrow ya trae el suyo.
 *
 * El botón "Contacte a un experto" salió del hero. Los <QuoteButton> del resto
 * de la página siguen ahí.
 */
export default function ImportHero() {
  return (
    // MISMA GEOMETRÍA QUE EL HERO DEL HOME —alto de viewport, `items-start` y
    // `pb-16 md:pb-32`— y no por simetría estética: es lo que permite que
    // <QuoteSection> se sobreponga aquí con el MISMO `-mt-40` que allá, sin
    // parametrizar el componente por página. Ese `pb` es el sitio que la
    // tarjeta ocupa al subir; con el `md:pb-24` de antes, y un hero de alto por
    // contenido, la tarjeta se montaba 64px sobre el párrafo.
    //
    // El `pt` NO se copia del home (allá es `pt-24 md:pt-36`): se queda el
    // `pt-32 md:pt-40` que ya tenía esta página, que es la separación estándar
    // del header flotante en el resto del sitio. Sólo desplaza el contenido
    // 16px, no afecta a la superposición.
    <section className="relative flex h-[75vh] min-h-[560px] items-start overflow-hidden rounded-b-[2rem] pb-16 pt-32 md:pb-32 md:pt-40">
      {/* MISMA PILA DE TRES CAPAS QUE EL HOME —brand-950 de base, el medio al
          60% de opacidad y el `hero-overlay` encima—, y las tres hacen falta.
          Medido sobre el archivo real compuesto con la fórmula de los dos
          radiales del velo: con la foto al 100% y sólo el overlay, el peor
          punto de la banda de texto deja el blanco en 3.09:1 y el eyebrow en
          2.48:1, o sea que no pasa AA. El 60% es lo que cierra esa brecha.
          No es un ajuste inventado: es exactamente lo que <HeroVideo> aplica a
          su <video> en el home (`opacity-60` sobre `bg-brand-950`).

          La foto es la misma que usa <YearsBanner>. Su documentación avisa de
          que tiene un rango enorme, con una zona casi blanca donde el texto sin
          velo cae a 1.03:1 — de ahí que aquí no se pueda servir cruda.

          `alt=""`: es fondo decorativo y el mensaje lo lleva el <h1>, igual que
          el video del home va `aria-hidden`. `priority` porque al haberse ido
          el tiranosaurio a <ImportControl>, ésta es la imagen sobre el pliegue
          y la candidata a LCP de la página. */}
      <div className="absolute inset-0 bg-brand-950">
        <Image
          src="/home/back-compass-all.webp"
          alt=""
          width={1728}
          height={608}
          priority
          // Ver la nota del hero de artículo: `priority` genera el preload
          // pero no marca el <img> como LCP en esta versión.
          fetchPriority="high"
          sizes="100vw"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Mismo contenedor que el home, clase por clase: `relative` para quedar
          por encima del fondo, `w-full`, `max-w-7xl`, `px-6` y `text-center`.
          Los bloques con `max-w-*` llevan su propio `mx-auto`, porque si no sus
          cajas quedarían a la izquierda con el texto centrado dentro. */}
      <div className="relative mx-auto w-full max-w-7xl px-6 text-center">
        {/* El separador es un PUNTO MEDIO (·, U+00B7) y no un guion: separa la
            marca del posicionamiento sin leerse como una resta ni como un
            guion de diálogo. Está en el subset latino de DM Sans que sirve el
            build, comprobado — no cae a `.notdef`. */}
        {/* `size="compacto"`: 12px por debajo de `md`, 14 de ahí en adelante.

            EL TEXTO SE ACORTÓ —eran 66 caracteres, "Compass Solutions ·
            Expertos en logística nacional e internacional", y partía en dos
            líneas a cualquier tamaño y en cualquier teléfono— y con los 34 de
            ahora entra en UNA línea en los tres anchos.

            AUN ASÍ EL COMPACTO SE QUEDA, y no por inercia: a 14px la pastilla
            mide 271px contra los 272px de caja que hay a 320px de viewport. Un
            píxel no es margen, es suerte — cualquier diferencia de renderizado
            de la fuente la parte en dos y devuelve el bloque pesado que
            acabamos de quitar. A 12px la pastilla mide 222px y sobran 50. De
            `md` en adelante vuelve sola a 14px, así que el tamaño de escritorio
            no depende de esta decisión. */}
        <Eyebrow tone="dark" size="compacto" className="mb-4">
          Logística nacional e internacional
        </Eyebrow>

        {/* Clases del <h1> del home. SIN `whitespace-nowrap`: aquel es un
            arreglo para el titular corto del home, y esta frase mide 1573px a
            `text-5xl`, muy por encima de los 896px de la caja, así que parte
            siempre — en dos líneas en desktop y en cinco a 375px de viewport.

            EL ESPACIO DURO ENTRE "en" Y "México" ES ANTI-HUÉRFANOS. Está
            escrito a mano por razones históricas: la utilidad equivalente vivía
            en lib/blog.ts, que importa `node:fs` y gray-matter, así que traerla
            aquí arrastraba el lector de MDX entero al grafo de esta página. Esa
            restricción YA NO EXISTE — ahora es `bindTail`, en lib/typography.ts,
            sin dependencias de Node. Este titular se puede migrar a
            `{bindTail("…")}` cuando se revise el alcance; hace exactamente esto.

            Sin el espacio duro, a 375px el titular cerraba con "México" sola en
            la quinta línea. Con él cierra con "en México" (199px), que entra de
            sobra en los 327px disponibles e incluso en los 272px de un viewport
            de 320. En desktop no cambia nada: allí la última línea ya era
            "forwarder experto en México". */}
        {/* 1.75rem (28px) EN MÓVIL, contra los 36 de `text-4xl`. `md:text-5xl`
            no se toca: de 768px en adelante esto queda exactamente igual.

            El valor no es un escalón de la escala porque el escalón no servía:
            a `text-3xl` (30px) el titular todavía se va a SEIS líneas a 320px y
            a CUATRO a 375, porque "exporte" y "forwarder" no llegan a caber
            acompañadas. A 28px baja a cuatro y tres. Y bajar más no compra
            nada: a `text-2xl` (24px) el reparto de líneas es idéntico al de 28
            en los tres anchos, así que 28 es el tamaño más grande que ya da el
            recorte máximo.

            El espacio duro de abajo sigue siendo necesario y sigue siendo
            seguro: a 28px el bloque atado "en México" mide 152px, contra los
            272px de caja que quedan a 320px de viewport. */}
        <h1 className="mx-auto max-w-4xl font-heading text-[1.75rem] font-bold leading-tight text-white md:text-5xl">
          Importe y exporte con su freight forwarder experto en{"\u00A0"}México
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-200">
          Simplificamos sus importaciones logísticas a México mediante
          soluciones integrales 360° que garantizan la eficiencia operativa que
          su compañía necesita.
        </p>
      </div>
    </section>
  );
}
