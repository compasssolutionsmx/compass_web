/**
 * Fila de certificaciones y asociaciones, debajo del cotizador.
 *
 * Antes esto era <HeroCertifications>: una tarjeta de vidrio dentro del hero
 * que rotaba los logos de uno en uno con crossfade. Se sustituye por una fila
 * estática con los cuatro a la vez, así que desaparece todo lo que sostenía la
 * rotación —temporizador, índice, crossfade y la rama de `prefers-reduced-
 * motion` que mostraba la lista completa cuando el movimiento estaba vetado—.
 * Al no quedar ni estado ni efectos, tampoco necesita ser componente de
 * cliente.
 *
 * FONDO BLANCO, el de la página, sin caja propia. Medido contra los dos
 * candidatos, con las tintas reales de cada logo:
 *
 *                                    blanco    brand-100
 *   monocromos (teñidos brand-900)   15.07:1     12.82:1
 *   WCA guinda   #a94c02              5.64:1      4.80:1
 *   WCA gris     #575756              7.23:1      6.15:1
 *   WCA naranja  #f07f13              2.71:1      2.31:1
 *
 * El blanco gana en las cuatro. El naranja de WCA no llega a 3:1 en ninguno de
 * los dos fondos, y no hay fondo claro razonable donde llegue: es un naranja
 * medio. No es un defecto que arreglar — WCAG 1.4.11 exime expresamente a los
 * logotipos del mínimo de contraste, y la silueta de WCA la dibujan el guinda y
 * el gris, que pasan de sobra; el naranja es relleno.
 *
 * Además, un fondo brand-100 aquí dejaría dos cajas tintadas pegadas, porque
 * <StatsSection> abre justo debajo con la suya.
 */

import Image from "next/image";

type Certification = {
  src: string;
  alt: string;
  /** Se pinta tal cual, sin `mask-image`, porque el arte ya viene a color. */
  color?: boolean;
};

/**
 * TODO(cliente): falta ALACAT. Está fuera a propósito, no por olvido: el único
 * ejemplar que existe se sirve del WordPress, que responde con un challenge
 * anti-bot y no deja verificar el archivo. Sin poder confirmar que es monocromo
 * sobre alfa como los otros tres, aplicarle el enmascarado es un riesgo — si
 * trae fondo opaco saldría como un rectángulo navy sólido.
 * Cuando llegue alacat.png a /public/logo-certs/, verificar que sea monocromo y
 * añadirlo aquí; la fila pasaría a cinco y habría que revisar el grid.
 */
const CERTIFICATIONS: Certification[] = [
  { src: "/logo-certs/amacarga-trim.png", alt: "AMACARGA" },
  { src: "/logo-certs/canacar-trim.png", alt: "CANACAR" },
  { src: "/logo-certs/isoeeee-trim.png", alt: "ISO" },
  {
    src: "/logo-certs/WCA-LOGO.svg",
    alt: "WCA World Cargo Alliance",
    color: true,
  },
];

/**
 * Los tres PNG son monocromos blancos sobre alfa, así que sobre fondo claro
 * desaparecerían: se tiñen a brand-900 con `mask-image` (ver `.cert-mark` en
 * globals.css), que da la silueta exacta sin transformar ningún color.
 *
 * TODO(logos): los `-trim.png` son RECORTES generados a partir de los archivos
 * originales del cliente, que siguen intactos al lado. Se recortaron porque los
 * tres eran casi todo lienzo transparente y en proporciones distintas: la tinta
 * de AMACARGA ocupaba el 55% del alto del archivo, la de CANACAR el 58% y la de
 * ISO el 70%. Con `mask-size: contain` eso significa que a la misma altura CSS
 * cada logo se dibujaba a un tamaño distinto, y los tres bastante más chicos
 * que el SVG de WCA, que sí viene ajustado. Recortados al bounding box de la
 * tinta, los cuatro responden igual a la misma caja. Verificado que siguen
 * siendo monocromos sobre alfa, que es lo que `.cert-mark` necesita.
 *
 * EXCEPCIÓN: WCA, cuyo SVG ya viene a color (naranja, guinda y gris).
 * Enmascararlo lo aplanaría a una silueta navy y perdería su identidad, así que
 * va como imagen normal. Si algún día llega un WCA monocromo blanco sobre alfa,
 * basta con quitarle el flag `color` para que entre al tratamiento común.
 *
 * El <span> enmascarado no es una imagen para el navegador, de ahí el
 * `role="img"` + `aria-label`: es lo que conserva el equivalente del `alt`.
 */
function CertLogo({ src, alt, color }: Certification) {
  if (color) {
    return (
      <Image src={src} alt={alt} fill unoptimized className="object-contain" />
    );
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className="cert-mark block h-full w-full"
      style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
    />
  );
}

export default function Certifications() {
  return (
    // SIN padding superior: el hueco de arriba lo pone entero el `pb` de
    // <QuoteSection>, que se recortó a `pb-10 md:pb-12` (40/48px) para acercar
    // esta fila al cotizador. Añadir aquí otro `pt` sería el doble padding que
    // hay que evitar entre dos secciones seguidas.
    <section
      aria-labelledby="certificaciones-titulo"
      className="mx-auto max-w-7xl px-6 pb-16 md:pb-20"
    >
      {/* Un <h2> de verdad y no un <Eyebrow>: hace falta un elemento con `id`
          para nombrar la sección, y de paso la fila de logos entra en el
          esquema del documento en vez de quedar como cuatro imágenes sueltas
          sin contexto. Caja mixta, sin versales ni tracking, que es el criterio
          que ya fijó <Eyebrow> para las etiquetas del sitio. */}
      <h2
        id="certificaciones-titulo"
        className="text-center font-heading text-sm font-semibold text-brand-900"
      >
        Certificados y asociados con
      </h2>

      {/* Dos columnas hasta `lg` y cuatro a partir de ahí. Los logos se ajustan
          a su celda con `contain`, e `items-center` los alinea por su eje: como
          los recortes tienen proporciones distintas, ninguno llena su caja en
          los dos ejes a la vez. */}
      <ul className="mt-6 grid grid-cols-2 items-center gap-x-8 gap-y-10 md:mt-8 lg:grid-cols-4 lg:gap-x-12">
        {CERTIFICATIONS.map((cert) => (
          <li
            key={cert.alt}
            /* Acotado por ALTO y por ANCHO. Los cuatro recortes tienen
               proporciones muy distintas —AMACARGA 2.39, CANACAR 1.61, WCA 1.54
               e ISO 1.00, que es cuadrado—, así que fijar sólo el alto dejaría
               a AMACARGA al doble de ancho que ISO. Con el tope de 14rem los
               muy apaisados se limitan por ancho y el conjunto se lee parejo.
               A esta altura (80px en md+) el más apaisado, AMACARGA, sale a
               191px de ancho, así que el tope de 224px NO llega a actuar y los
               cuatro quedan exactamente a 80px de alto — que es el peso óptico
               más parejo posible. El tope se queda como red por si algún día
               entra un logo aún más apaisado o sube la altura. En la columna de
               `lg`, que mide 272px, esos 191px caben con holgura. */
            className="relative mx-auto h-14 w-full max-w-[14rem] md:h-20"
          >
            <CertLogo {...cert} />
          </li>
        ))}
      </ul>
    </section>
  );
}
