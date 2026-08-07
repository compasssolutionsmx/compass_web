import Image from "next/image";
import Eyebrow from "../Eyebrow";

/**
 * "Su carga bajo control, sin sorpresas." Sección exclusiva de la landing (🆕),
 * sin equivalente en el home.
 *
 * DOS BLOQUES, uno debajo del otro:
 *   1. rejilla de dos columnas — el argumento a la izquierda y el recorte del
 *      tiranosaurio a la derecha
 *   2. fila a ancho completo con las tres promesas
 *
 * Las tres promesas eran <ImportFeatures>, una sección propia entre las
 * certificaciones y ésta. Al absorberlas aquí, ese componente se quedó sin uso
 * y se eliminó; sus textos viven ahora en FEATURES, unas líneas más abajo.
 *
 * SOBRE BLANCO. Estuvo tintada en brand-100 hasta que el tinte se pasó a
 * <ImportStats>, la sección de abajo, para que el color cayera sobre las cifras
 * y no sobre este bloque.
 */

/**
 * SIN ÍCONO, a diferencia de cuando eran sección propia: allá cada tarjeta
 * abría con un glifo de lucide dentro de un círculo `bg-white/12`. Aquí el
 * bloque es un cierre de sección y no su encabezado, así que se queda sólo el
 * texto. Con el ícono fuera, el `p-8` de antes dejaba demasiado aire arriba y
 * el padding baja a `p-6`.
 */
const FEATURES = [
  {
    title: "Inteligencia logística",
    description:
      "No solo transportamos; diseñamos la ruta más eficiente para tu cadena de suministro, mitigando riesgos desde el origen.",
  },
  {
    title: "Capacidad global",
    description:
      "Conectamos los principales puertos y aeropuertos del mundo con las aduanas más importantes de México.",
  },
  {
    title: "Certeza jurídica",
    description:
      "Expertos en clasificación arancelaria y NOMs. Importa con la tranquilidad de que tu carga cumple con cada regulación vigente.",
  },
];

export default function ImportControl() {
  return (
    // FONDO brand-50 (#f0f6f9). Primera vez que ese token se usa como fondo en
    // el sitio —hasta ahora sólo era color de TEXTO sobre superficies oscuras—,
    // pero no es un color nuevo: sale de la misma escala. Da 1.091:1 contra el
    // blanco, o sea que por sí solo se insinúa más que se ve; quien hace el
    // trabajo de separar la tarjeta del fondo es su sombra, no el color.
    //
    // El `pt-20` NO se toca. Con <Certifications> arriba —cuyo `pb-16
    // md:pb-20` son 80px de separación de sección, no relleno interno— el
    // hueco ya suma los 160px del ritmo de la página.
    <section className="bg-brand-50 py-20">
      {/* Dos envolturas y cada una hace una cosa: la de fuera pone el ancho
          máximo y el margen lateral contra el viewport (`px-6`), la de dentro
          es la tarjeta. Si las clases de tarjeta fueran sobre el `px-6`, ese
          padding pasaría a ser el relleno interior y la tarjeta tocaría el
          borde de la pantalla en móvil.

          Receta de tarjeta EXACTA del cotizador y de los formularios de
          proveedores y vacantes: mismo radio, misma sombra tintada de marca y
          el mismo aro de 1px que define el canto sin dibujar una línea. Lo
          único que cambia es el escalado del padding, que sigue al de
          <StatsSection> (`p-6 md:p-10 lg:p-14`) porque aquí dentro va una
          sección entera, no un formulario. */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-10 lg:p-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              {/* `light` (pill brand-100), de vuelta al tono por defecto: llevaba
              `tint` mientras la sección era brand-100, porque ahí el pill claro
              se fundía con la franja. Sobre blanco pasa lo contrario — el pill
              blanco del `tint` daría 1.00:1— y el brand-100 da 1.18:1. */}
              <Eyebrow className="mb-5">
                Gestión aduanal y logística de precisión
              </Eyebrow>
              {/* El separador entre "sin" y "sorpresas." es un espacio DURO
              (\u00A0), y arregla un quiebre feo: a `md:text-4xl` el titular mide
              702px y la columna 592px, así que el algoritmo goloso metía "sin"
              en la primera línea —cabía, 487px— y dejaba "sorpresas." sola en
              la segunda. Con el espacio duro, "sin sorpresas." es un solo
              bloque de 271px que no se puede partir, y el corte cae después de
              "control,".
              No es un <br>: eso forzaría el salto también por debajo de `md`,
              donde la frase entera sí cabe en una línea. */}
              <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
                Su carga bajo control, sin{"\u00A0"}sorpresas.
              </h2>
              {/* slate-600 y NO el slate-500 habitual del sitio: sobre brand-100 el
              500 se queda en 4.05:1 y no pasa AA; el 600 da 6.45:1. Es la misma
              corrección que ya llevan <ImportStats> y las tarjetas de casos de
              éxito, que están sobre este mismo tinte. */}
              <p className="mt-5 max-w-[48ch] text-slate-600">
                En Compass Solutions, entendemos que una importación detenida es
                dinero perdido. Por ello, ofrecemos una solución integral que
                abarca desde la recolección en el extranjero hasta la entrega en
                tu puerta. Nos especializamos en carga consolidada (LCL),
                contenedores completos (FCL) y proyectos especiales,
                adaptándonos al volumen y urgencia de tu negocio.
              </p>
            </div>

            {/* RECORTE SOBRE FONDO TRANSPARENTE, no una foto rectangular: el
            archivo es 1100x1100 con las cuatro esquinas en alfa 0 y algo más de
            la mitad del lienzo vacío. Por eso NO lleva caja, ni fondo, ni
            esquinas redondeadas — la figura flota sobre el tinte de la franja.
            Venía del hero, donde ocupaba la columna entera.

            TOPE DE 420px, no ancho completo: a ancho de columna (592px en
            desktop) la imagen salía 220px más alta que el texto de al lado y se
            comía la sección. Medida la columna izquierda —eyebrow 52px + h2 a
            dos líneas 80px + párrafo de 6 líneas 164px + botón 76px = 372px—,
            con 420px la imagen queda 48px por encima, que es la proporción que
            la deja como ancla visual sin dominar. Para bajarla más, el siguiente
            escalón de 20px es 400px (+28px) y luego 380px (paridad exacta).

            Se lee sobre el tinte: su tinta dominante es un azul casi negro
            (#1c2030) que da 13.77:1 sobre brand-100, y sólo el 5.3% del arte es
            tinta muy clara.

            SIN `priority`, a diferencia de cuando vivía en el hero: aquí entra
            en la cuarta sección de la página, muy por debajo del pliegue, así
            que ya no es candidata a LCP. Marcarla prioritaria le quitaría ancho
            de banda a lo que sí se ve primero — que en esta página es texto
            sobre el degradado, sin imagen que precargar.

            `sizes` no cambia porque la caja tampoco: sigue siendo media columna
            a partir de `lg` y todo el ancho por debajo. */}
            <Image
              src="/importaciones/importaciones-hero.webp"
              alt="Un tiranosaurio rugiendo mientras sale de un contenedor marítimo abierto"
              width={1100}
              height={1100}
              sizes="(min-width: 1024px) 420px, 100vw"
              className="mx-auto h-auto w-full max-w-[420px]"
            />
          </div>

          {/* FILA A ANCHO COMPLETO (1232px a 1440 de viewport), fuera de la
            rejilla de dos columnas: dentro de la columna de la imagen sólo
            habría 592px y estas tres tarjetas caerían a ~181px cada una,
            demasiado estrechas para su texto.

            Tarjetas OSCURAS sobre la franja tintada, el mismo tratamiento que
            tenían como sección propia. NO son `.tech-card`: esa utilidad fija
            fondo blanco y su glow está calibrado para tarjeta clara sobre
            página clara. Aquí se replica el gesto —borde que se enciende y
            sombra al hover— con las clases equivalentes en oscuro.

            Contraste sobre el tinte: la tarjeta se separa del fondo en 12.82:1,
            el título blanco da 15.07:1 dentro de ella, la descripción
            slate-200 12.22:1 y el borde de hover brand-300 6.51:1. */}
          <ul className="mt-16 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <li
                key={feature.title}
                className="h-full rounded-3xl border border-transparent bg-brand-900 p-6 transition-[border-color,box-shadow] duration-250 hover:border-brand-300 hover:shadow-2xl hover:shadow-brand-950/30 motion-reduce:transition-none"
              >
                <h3 className="font-heading text-lg font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
