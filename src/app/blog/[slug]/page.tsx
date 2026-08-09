import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import ArticleBody from "@/components/ArticleBody";
import ArticleToc from "@/components/ArticleToc";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteButton, QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import { SITE_URL } from "@/app/layout";
import {
  buildBlogPostingJsonLd,
  extractHeadings,
  formatPostDate,
  getAllPostSlugs,
  getAllPosts,
  getPostBySlug,
  postHref,
} from "@/lib/blog";
import { bindTail } from "@/lib/typography";

/** Rutas estáticas: una por .mdx. */
export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = postHref(post.slug);
  return {
    // `seoTitle` ya viene con su propio sufijo de marca cuando se usa, así que
    // no se le vuelve a añadir; el `title` normal sí lo lleva.
    title: post.seoTitle ?? `${post.title} | Compass Solutions`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "es_MX",
      siteName: "Compass Solutions",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.cover, alt: post.coverAlt }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);

  // Sigue leyendo: primero las de la misma categoría, luego el resto por fecha.
  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const sameA = a.category === post.category ? 0 : 1;
      const sameB = b.category === post.category ? 0 : 1;
      return sameA - sameB;
    })
    .slice(0, 3);

  /**
   * JSON-LD. Todo lo que declara está VISIBLE en la página: título, descripción,
   * fecha, autor y portada se pintan en el hero de aquí abajo. Nada oculto.
   */
  const jsonLd = buildBlogPostingJsonLd(post, SITE_URL);

  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* La cabecera del artículo es oscura, igual que la del índice. */}
        <Header topTone="dark" />

        <main className="flex-1">
          <script
            type="application/ld+json"
            // El JSON va serializado; no hay HTML dentro.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          {/* ---------- HERO ---------- */}
          {/* GUTTER PROPIO DE ESTA PÁGINA: `px-6 lg:px-12`, mientras el resto
              del sitio se queda en `px-6`. El hero de artículo es el único que
              combina texto alineado a la izquierda con un bloque que corre casi
              hasta el borde del contenedor (el <h1> es `max-w-4xl`, 896px), y
              con 24px de inset el titular se lee pegado al canto. Los heroes
              centrados —home, /importaciones, /nosotros— no tienen el problema
              porque su texto nunca se acerca al borde.

              LOS CUATRO CONTENEDORES DE LA PÁGINA LLEVAN EL MISMO VALOR: este
              hero, el bloque de cuerpo + sidebar, el banner de cotización y
              "Sigue leyendo". Tienen que moverse juntos o el <h1> deja de
              arrancar en la misma x que el cuerpo, que es justo para lo que se
              subió este contenedor de `max-w-4xl` a `max-w-7xl`. */}
          <section className="relative overflow-hidden rounded-b-[2rem] bg-brand-950 pb-16 pt-32 md:pb-20 md:pt-40">
            <Image
              src={post.cover}
              alt={post.coverAlt}
              width={1920}
              height={1072}
              sizes="100vw"
              priority
              unoptimized={post.cover.startsWith("http")}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Velo de tres tramos. La portada puede ser cualquier foto, así
                que ni el header ni el título pueden depender de ella:
                  arriba  85% — franja donde flota el header (logo blanco, nav)
                  medio   45% — se despeja para que la foto se vea
                  abajo   92% — franja del título y los metadatos
                El velo anterior tenía el medio MÁS oscuro que los extremos, al
                revés de lo que conviene. */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(1,27,38,0.85)_0%,rgba(1,27,38,0.45)_38%,rgba(1,27,38,0.92)_100%)]" />

            {/* `max-w-7xl` igual que el cuerpo y las demás secciones: antes
                era `max-w-4xl` y el H1 arrancaba 192px más a la derecha que el
                primer párrafo. El ancho de lectura se limita ahora en cada
                bloque de texto, no en el contenedor.

                EL `px` VA AQUÍ, EN EL MISMO ELEMENTO QUE EL `max-w-7xl`, y eso
                no es cosmético: con `box-sizing: border-box` el tope de 1280px
                INCLUYE el padding, así que el contenido arranca en
                `(vp - 1280)/2 + px`. Cuando el padding estaba en el <section>
                de fuera se quedaba FUERA del tope: el contenedor seguía
                midiendo 1280 completos y el texto arrancaba en `px` a secas.

                Las dos fórmulas coinciden hasta 1280px de viewport y divergen a
                partir de ahí, hasta separarse exactamente el valor del padding
                (48px en `lg`). El cuerpo, que sí tiene el `px` junto al
                `max-w-7xl`, quedaba 48px más a la derecha que este titular.

                Es el mismo patrón que ya usan el hero del home, el de
                /importaciones y el del índice de blog. */}
            <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
              <Eyebrow tone="dark" className="mb-4">
                {post.category}
              </Eyebrow>

              {/* `text-2xl md:text-4xl` (24/36px), bajado de `text-3xl
                  md:text-5xl`. A 48px NINGÚN titular cabía en una línea: el más
                  largo medía 1321px contra los 1232px útiles del contenedor
                  padre, así que todos partían sí o sí. A 36px tres de los
                  cuatro actuales entran completos en una sola línea.

                  Y la caja vuelve a `max-w-4xl` (896px): con la fuente más
                  chica ya no hace de cuello de botella —el titular más ancho
                  mide 991px— y da mejor reparto que el `max-w-5xl` que tuvo un
                  momento. */}
              <h1 className="max-w-4xl font-heading text-2xl font-bold leading-tight text-white md:text-4xl">
                {bindTail(post.title)}
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-brand-50">
                {post.description}
              </p>

              {/* Fecha y autor visibles: es lo que el JSON-LD declara. */}
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-100">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.author}</span>
              </p>
            </div>
          </section>

          {/* ---------- CUERPO + SIDEBAR ---------- */}
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:px-12">
            {/* LA PISTA IZQUIERDA TOPA EN LA MEDIDA DE LECTURA, no en `1fr`.
                Con `1fr` la pista se estiraba a todo lo que sobrara (880px a
                partir de 1280) mientras el texto se quedaba en sus 68ch (744px),
                y esos 136px de sobrante se sumaban al gap: el hueco que se veía
                entre el cuerpo y el índice era de 200px, no de los 64 del
                `gap-16`.

                Y el gap NO era la palanca. Con la pista izquierda en `1fr`, el
                hueco visual sale de `caja - lateral - texto`: lo que el gap
                cediera se lo iba a quedar el sobrante, así que bajarlo no movía
                nada en pantalla.

                Ahora la pista mide lo mismo que el texto y el sobrante se lo
                queda la lateral, que pasa a ser elástica con suelo de 18rem. El
                hueco visual es exactamente el gap declarado en todos los anchos.

                EL `68ch` DEBE COINCIDIR con el `max-w-[68ch]` de <ArticleBody>.
                Los dos se resuelven contra la misma fuente heredada (DM Sans a
                16px, 1ch = 10.944px -> 744px), así que casan por construcción;
                si allí se cambia la medida, hay que cambiarla aquí.

                El suelo de 18rem en la lateral es lo que mantiene intacto el
                comportamiento por debajo de ~1145px: ahí el texto todavía no
                llega a sus 68ch y es la pista quien lo limita, exactamente como
                antes. */}
            {/* `grid-cols-1` en la base es preventivo, no correctivo: sin
                columnas declaradas, por debajo de `lg` la pista implícita es
                `auto` y se dimensiona por el max-content de su contenido — y
                aquí el contenido es el cuerpo del artículo, con sus tablas y
                sus bloques de código. Es el mismo desbordamiento que ya mordió
                en <SuccessStories> y en <BlogPreview>. `repeat(1, minmax(0,1fr))`
                lo cierra. */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,68ch)_minmax(18rem,1fr)] lg:gap-16">
              {/* ÍNDICE EN MÓVIL, ARRIBA DEL CUERPO. Antes sólo existía dentro
                  del <aside>, y al colapsar a una columna el <aside> cae después
                  del artículo: el índice aparecía al final, cuando ya no sirve
                  para navegar.

                  SIN `order` Y SIN RECOLOCAR NADA CON GRID, que es lo que rompe
                  la correspondencia entre el orden visual y el de lectura. Lo
                  resuelve el propio `lg:hidden` de esta variante: `display: none`
                  no genera caja, así que de `lg` para arriba este elemento NO ES
                  UN ELEMENTO DE LA REJILLA y el autoposicionamiento deja los dos
                  de siempre —cuerpo a la izquierda, <aside> a la derecha—,
                  exactamente como estaba. Y por debajo de `lg` la rejilla es de
                  una columna y reparte en el orden del DOM: índice, cuerpo,
                  tarjeta.

                  Resultado: en los dos anchos el orden del DOM ES el orden
                  visual, así que el tabulador y el lector de pantalla recorren
                  lo mismo que se ve. */}
              <ArticleToc headings={headings} variant="movil" />

              <article>
                <ArticleBody source={post.content} />
              </article>

              {/* En móvil este <aside> queda al final y contiene SÓLO la tarjeta
                  de contacto: su índice es la variante `escritorio`, que ahí va
                  en `display: none`. Es lo que corresponde — un CTA es el cierre
                  natural de una lectura, y metido entre el índice y el primer
                  párrafo interrumpiría el artículo antes de empezarlo.

                  El `lg:sticky` sigue envolviendo a las DOS piezas, así que en
                  escritorio índice y tarjeta se quedan fijos como un solo bloque,
                  igual que hasta ahora. En móvil no hay sticky, y tampoco lo
                  había: la clase siempre fue `lg:`. */}
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="space-y-8">
                  <ArticleToc headings={headings} variant="escritorio" />

                  <div className="brand-gradient rounded-2xl p-6">
                    <p className="font-heading text-lg font-bold text-white">
                      ¿Necesita mejorar su logística?
                    </p>
                    <p className="mt-2 text-sm text-brand-50">
                      Cuéntenos qué mueve y le proponemos la mejor ruta.
                    </p>
                    <QuoteButton className="mt-5 w-full rounded-full bg-white px-6 py-2.5 font-heading text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50">
                      Contáctenos
                    </QuoteButton>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* ---------- CIERRE: banner de cotización ---------- */}
          <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-12">
            <div className="brand-gradient rounded-3xl px-8 py-12 text-center md:px-14 md:py-16">
              <h2 className="mx-auto max-w-2xl font-heading text-2xl font-bold text-white md:text-3xl">
                Solicite una cotización y mueva su carga con Compass
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-brand-50">
                Aéreo, marítimo y terrestre bajo un mismo techo, con un solo
                punto de contacto para toda su operación.
              </p>
              <QuoteButton className="mt-8 rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50">
                Solicitar cotización
              </QuoteButton>
            </div>
          </section>

          {/* ---------- Sigue leyendo ---------- */}
          {related.length > 0 && (
            <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
              <h2 className="mb-8 font-heading text-2xl font-bold text-brand-900 md:text-3xl">
                Sigue leyendo
              </h2>

              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={postHref(item.slug)}
                      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl"
                    >
                      <Image
                        src={item.cover}
                        alt=""
                        width={1200}
                        height={800}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        unoptimized={item.cover.startsWith("http")}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-brand-950/95 via-brand-950/55 to-transparent" />

                      <div className="absolute inset-x-0 top-0 p-5">
                        <span className="inline-block rounded-full bg-brand-950/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                          {item.category}
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <time
                          dateTime={item.date}
                          className="text-xs font-medium text-brand-100"
                        >
                          {formatPostDate(item.date)}
                        </time>
                        <h3 className="mt-1.5 font-heading text-lg font-bold leading-snug text-white">
                          {item.title}
                        </h3>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                          Leer
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform duration-250 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:-translate-y-[3px] motion-safe:group-hover:translate-x-[3px]"
                          />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
