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
      "No solo transportamos; diseñamos la ruta más eficiente para su cadena de suministro, mitigando riesgos desde el origen.",
  },
  {
    title: "Capacidad global",
    description:
      "Conectamos los principales puertos y aeropuertos del mundo con las aduanas más importantes de México.",
  },
  {
    title: "Certeza jurídica",
    description:
      "Expertos en clasificación arancelaria y NOMs. Importe con la tranquilidad de que su carga cumple con cada regulación vigente.",
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
                Freight forwarder puerta a puerta
              </Eyebrow>
              {/* El separador entre "su" y "puerta" es un espacio DURO (\u00A0), y
                arregla un quiebre feo: a `md:text-4xl` el titular mide 596px y
                la columna dentro de la tarjeta 536px, así que el algoritmo
                goloso metía "su" en la primera línea —cabía, 461px— y dejaba
                "puerta" sola en la segunda. Con el espacio duro, "su puerta" es
                un bloque indivisible de 182px y el corte cae tras "a": 406px
                arriba, 182px abajo.
                No es un <br>: eso forzaría el salto también por debajo de `md`,
                donde la frase entera cabe en una línea (497px a text-3xl). */}
              <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
                Su carga, de origen a su{"\u00A0"}puerta
              </h2>
              {/* slate-600 y NO el slate-500 habitual del sitio: sobre brand-100 el
              500 se queda en 4.05:1 y no pasa AA; el 600 da 6.45:1. Es la misma
              corrección que ya llevan <ImportStats> y las tarjetas de casos de
              éxito, que están sobre este mismo tinte. */}
              <p className="mt-5 max-w-[48ch] text-slate-600">
                Coordinamos cada tramo de su importación —desde la recolección
                en origen hasta la entrega en su fábrica o bodega en México—
                trabajando de la mano con agentes aduanales certificados, para
                que el despacho nunca sea el cuello de botella de su cadena de
                suministro.
              </p>
            </div>

            {/* RECORTE SOBRE FONDO TRANSPARENTE, no una foto rectangular: el
            archivo es 1100x1100 con las cuatro esquinas en alfa 0 y algo más de
            la mitad del lienzo vacío. Por eso NO lleva caja, ni fondo, ni
            esquinas redondeadas — la figura flota sobre el tinte de la franja.
            Venía del hero, donde ocupaba la columna entera.

            TOPE DE 504px, no ancho completo (era 420px; +20%). La columna mide
            536px a partir de 1328px de viewport —1232 de contenido, menos los
            112 del `lg:p-14` de la tarjeta, menos los 48 del `gap-12`, entre
            dos—, así que el tope deja 32px de aire: 16px por lado con el
            `mx-auto`. Por debajo de 1216px de viewport la columna es más
            estrecha que el tope y manda ella; `max-width` no fuerza ancho, así
            que la imagen NUNCA desborda.

            LO QUE SÍ SE PAGA: el arte es cuadrado (1100x1100), o sea que 504px
            de ancho son 504px de alto, y la columna de texto sólo mide 248px
            (eyebrow 32 + mb-5 20 + h2 a dos líneas 80 + mt-5 20 + párrafo de 4
            líneas 96). Con `items-center` la fila la marca la imagen y el texto
            queda centrado en el sobrante: 104px de aire arriba y abajo con el
            `-mt-12` puesto (eran 128px sin él). El ritmo ENTRE SECCIONES no se
            mueve —lo fijan el `py-20` de la sección y el `pb-16 md:pb-20` de
            <Certifications>, que no dependen del alto del contenido—, pero el
            desequilibrio dentro de la rejilla es real: si molesta, el arreglo es
            `lg:items-start`, no recortar la imagen.

            EL VACÍO NO ES DEL CSS, ES DEL ARCHIVO. Medida la caja alfa del
            .webp: la tinta ocupa de la fila 180 a la 962 del lienzo de 1100, o
            sea 180px transparentes arriba y 138px abajo (estable con umbral de
            alfa de 0 a 200, es un recorte limpio y no un degradado). A 504px en
            pantalla eso son 82.5px arriba y 63.2px abajo INCORPORADOS a la
            imagen: 146px de vacío, más que los 120px que ponían juntos el
            padding de la tarjeta y el `mt-16` de la fila de abajo. Por eso el
            aire se recorta tirando de la imagen y no bajando paddings, y por eso
            cualquier ajuste futuro debe medir la caja alfa antes que el CSS.

            Se lee sobre el tinte: su tinta dominante es un azul casi negro
            (#1c2030) que da 13.77:1 sobre brand-100, y sólo el 5.3% del arte es
            tinta muy clara.

            SIN `preload`, a diferencia de cuando vivía en el hero: aquí entra
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
              sizes="(min-width: 1024px) 504px, 100vw"
              /* `lg:-mt-12` NO recorta la imagen: cancela 48px del vacío que el
                 archivo trae dentro. Con `items-center` la caja de margen es la
                 que se centra en la fila, así que un margen negativo deja que
                 el borde de la imagen sobresalga por arriba de la fila esos
                 48px — se mete en el padding de la tarjeta, que ahí sólo tiene
                 píxeles transparentes. Aun así entra 8px por dentro del borde
                 (56 de padding menos 48), así que no llega a desbordar.
                 Sólo a partir de `lg`: por debajo la rejilla es de una columna
                 y la imagen va justo bajo el texto, separada por `gap-10`; un
                 tirón de 48px ahí la solaparía. */
              className="mx-auto h-auto w-full max-w-[504px] lg:-mt-12"
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
            slate-200 12.22:1 y el borde de hover brand-300 6.51:1.

            `mt-6` (24px) y no el `mt-16` que tenía: el hueco que se ve NO es
            este margen, es este margen MÁS los 63.2px transparentes con que
            termina el .webp de arriba. Con 64px el hueco real era de 127px;
            con 24px queda en 87px, a la par de los 90px que quedan arriba. */}
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
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
