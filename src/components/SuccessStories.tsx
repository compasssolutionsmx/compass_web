import { QuoteButton } from "./QuoteModal";
import SuccessStoriesCarousel, {
  type SuccessStory,
} from "./SuccessStoriesCarousel";

/**
 * Casos de éxito. Va justo encima de <IntegratedSolutions>.
 *
 * Dos columnas: a la izquierda el bloque fijo —eyebrow, H2, párrafo y el CTA
 * al cotizador—; a la derecha el rotador, que muestra UN caso a la vez a todo
 * el ancho de su columna. Es el mismo patrón de <StatsSection> y <BlogPreview>.
 *
 * Aquí sólo viven el encabezado y los datos; el rotador es cliente y está en
 * <SuccessStoriesCarousel>, igual que <BlogPreview> con <BlogCarousel>.
 *
 * Los tres casos son los del sitio actual de Compass, con sus cifras tal cual.
 * COLOR: el verde limón del sitio actual NO viaja aquí. Las tarjetas van en
 * brand-100 sobre el blanco de página, que es el default seguro que fija el
 * mockup de la landing y respeta la regla de "sin color de acento" del
 * proyecto.
 *
 * COMPARTIDO por el home y por /importaciones-a-mexico: el mockup de la landing
 * trae esta misma sección, con los mismos tres clientes y el mismo copy, así
 * que se construye una vez y se monta en las dos.
 *
 * USO DE MARCAS: los tres son logos de clientes y el cliente confirmó tener
 * autorización para exhibirlos. Si esa autorización cambia para alguno, se
 * quita su entrada de aquí.
 */

/**
 * TODO(cliente): CEMEX y Nestlé comparten subtítulo Y texto, palabra por
 * palabra. Está copiado fiel del sitio actual, donde no se nota porque los
 * casos se ven de uno en uno; aquí conviven en el mismo carrusel y el duplicado
 * canta. Hace falta que el cliente redacte un texto propio para cada caso, y de
 * paso que las cifras cuadren con lo que se cuenta: ese texto compartido habla
 * de tiempos de tránsito, mientras que un titular promete rendimiento
 * energético y el otro eficiencia x2. Ninguna de las dos cifras queda explicada
 * por el párrafo que lleva debajo.
 *
 * TODO(logos): los archivos que se apuntan aquí son RECORTES generados a partir
 * de los que entregó el cliente, que siguen intactos en la misma carpeta con su
 * nombre original. Hubo que recortarlos porque cada uno traía una cantidad
 * distinta de lienzo transparente alrededor —CEMEX un 70%, Arca un 39%, Nestlé
 * un 31%—, y con `object-contain` eso se traduce en tamaños ópticos dispares:
 * a la misma altura CSS, el logo de CEMEX se veía a la mitad que el de Nestlé.
 * Si el cliente manda versiones nuevas, hay que volver a recortarlas o pedirlas
 * ya ajustadas, y actualizar `width`/`height` aquí.
 */
const STORIES: SuccessStory[] = [
  {
    client: "Arca Continental",
    logo: {
      src: "/logo-clients/arca-continental.webp",
      width: 900,
      height: 366,
    },
    headline: "Rentabilidad Maximizada",
    subtitle: "Optimización de Costos en Fletes.",
    description:
      "Gracias a nuestras alianzas globales, ofrecemos tarifas competitivas en transporte multimodal, permitiendo a nuestros clientes expandir su alcance sin incrementar su presupuesto logístico.",
  },
  {
    client: "CEMEX",
    logo: { src: "/logo-clients/cemex.webp", width: 874, height: 167 },
    headline: "+19% Rendimiento Energético",
    subtitle: "Conectividad Global Estratégica.",
    description:
      "Rediseñamos sus flujos de importación desde Asia, Europa y América, logrando reducir los tiempos de tránsito a la mitad mediante la consolidación inteligente de carga.",
  },
  {
    client: "Nestlé",
    logo: { src: "/logo-clients/nestle.webp", width: 824, height: 236 },
    headline: "Eficiencia Logística +2X",
    subtitle: "Conectividad Global Estratégica.",
    description:
      "Rediseñamos sus flujos de importación desde Asia, Europa y América, logrando reducir los tiempos de tránsito a la mitad mediante la consolidación inteligente de carga.",
  },
];

export default function SuccessStories() {
  return (
    // `py-20` como <ServicesGrid> encima y <IntegratedSolutions> debajo: es el
    // ritmo de esta zona del home, así que esta sección no introduce saltos.
    //
    // Sección sobre el blanco de página: el tinte brand-100 vive ahora en las
    // TARJETAS, no en la franja. Si fueran los dos, las tarjetas se perderían
    // contra su propio fondo.
    <section
      aria-labelledby="casos-titulo"
      className="mx-auto max-w-7xl px-6 py-20"
    >
      <div>
        {/* DOS COLUMNAS, 2fr/3fr — o sea 40/60, que es lo que pedía el diseño.
            Es el mismo esquema de <BlogPreview> (bloque fijo de texto a un
            lado, pieza que se mueve al otro), sólo que allí la izquierda es de
            ancho fijo y aquí proporcional, porque el párrafo de entrada es más
            largo y con 20rem se iba a ocho líneas.
            `lg:items-center` alinea los dos bloques por su centro: la columna
            izquierda es más corta que la tarjeta y anclada arriba quedaría
            descolgada. En móvil se apilan, texto primero.

            `grid-cols-1` NO ES DECORATIVO, arregla un desbordamiento real. Sin
            él, por debajo de `lg` el grid no declara columnas y cae en una
            pista implícita `auto`, que se dimensiona por el max-content de su
            contenido. Y el contenido aquí es un carrusel cuyo track mide tres
            veces la vista, así que la pista se estiraba a 736px dentro de un
            contenedor de 342px: el titular, el párrafo y la tarjeta se salían
            de la pantalla. `grid-cols-1` emite `repeat(1, minmax(0,1fr))`, y
            ese `min` en 0 es lo que impide que el contenido infle la pista —
            el mismo motivo por el que la fila de `lg` usa `minmax(0,...)`. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-12">
          <div>
            {/* Sin eyebrow: el mockup de la landing abre directo en el H2, y
                este bloque es el mismo en las dos páginas. */}
            <h2
              id="casos-titulo"
              className="font-heading text-3xl font-bold text-brand-900 md:text-4xl"
            >
              Impacto Real en la Cadena de Suministro
            </h2>
            <p className="mt-4 text-slate-600">
              No solo gestionamos logística, entregamos resultados tangibles.
              Transformamos los desafíos de importación en oportunidades de
              ahorro y eficiencia operativa para su empresa, garantizando que su
              inversión esté protegida y llegue a tiempo.
            </p>

            {/* Mismo <QuoteButton> que el CTA de <IntegratedSolutions>; cambia
                sólo la piel, porque allá va sobre la caja oscura y aquí sobre
                el blanco de la página. */}
            <QuoteButton className="mt-8 rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90">
              Solicite una Cotización
            </QuoteButton>
          </div>

          <SuccessStoriesCarousel stories={STORIES} />
        </div>
      </div>
    </section>
  );
}
