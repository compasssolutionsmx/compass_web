import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlogFilter, { type FilterPost } from "@/components/BlogFilter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import { SITE_URL } from "@/app/layout";
import { formatPostDate, getAllPosts, postHref } from "@/lib/blog";

const PATH = "/blog";

const TITLE = "Blog de logística";
const DESCRIPTION =
  "Comercio exterior, transporte y operación aduanal explicados por el equipo de Compass Solutions.";

export const metadata: Metadata = {
  title: `${TITLE} | Compass Solutions`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Compass Solutions",
    url: PATH,
    title: TITLE,
    description: DESCRIPTION,
    // Va EXPLÍCITA: un `openGraph` de página reemplaza al del layout raíz en
    // vez de heredarle la imagen, así que sin esto el índice se compartía sin
    // miniatura. Se usa la del sitio y no la portada del artículo destacado
    // porque ésta es la tarjeta de una SECCIÓN, no de una nota concreta —y
    // porque cambiaría sola cada vez que se publica algo.
    images: [
      {
        url: "/brand/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Contenedor Compass Solutions en el Puerto de Lázaro Cárdenas",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

/**
 * JSON-LD del índice.
 *
 * REGLA DEL PROYECTO: todo lo que se declare tiene que estar VISIBLE como texto
 * en la página. Por eso cada entrada lleva sólo `headline`, `description`,
 * `datePublished`, `image` y `url` — el título, el excerpt, la fecha y la
 * portada que se pintan en la destacada y en cada tarjeta. NO lleva `author`:
 * el frontmatter lo tiene, pero el índice no lo muestra.
 *
 * `Blog` con `blogPost` y no `CollectionPage` + `ItemList`: describe lo que la
 * página es —el blog con sus entradas— en vez de envolverlo en una lista
 * genérica, y encaja con el `BlogPosting` que ya emite cada artículo.
 */
function buildJsonLd(posts: ReturnType<typeof getAllPosts>) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: TITLE,
    description: DESCRIPTION,
    url: new URL(PATH, SITE_URL).toString(),
    publisher: {
      "@type": "Organization",
      name: "Compass Solutions",
      url: SITE_URL,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      image: new URL(post.cover, SITE_URL).toString(),
      url: new URL(postHref(post.slug), SITE_URL).toString(),
    })),
  };
}

export default function BlogIndex() {
  const posts = getAllPosts();
  // Ya vienen de más reciente a más antiguo desde `readAll`.
  const [destacado, ...resto] = posts;

  // `lib/blog` importa `node:fs`, así que un componente cliente no puede
  // tocarlo: la forma que necesita el filtro se arma aquí, en servidor, con la
  // fecha ya formateada. Mismo patrón que <BlogPreview> con <BlogCarousel>.
  const paraFiltro: FilterPost[] = resto.map((post) => ({
    slug: post.slug,
    href: postHref(post.slug),
    title: post.title,
    description: post.description,
    cover: post.cover,
    coverAlt: post.coverAlt,
    category: post.category,
    date: post.date,
    dateLabel: formatPostDate(post.date),
  }));

  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* Arriba del todo esta página tiene la cabecera brand-gradient detrás. */}
        <Header topTone="dark" />
        <main className="flex-1">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildJsonLd(posts)),
            }}
          />

          {/* ---------- HERO = ARTÍCULO DESTACADO ----------
              A SANGRE, sustituyendo al hero genérico que había antes (eyebrow +
              "Blog de logística" + párrafo, 424px que empujaban la primera nota
              al 58% de la pantalla). Ahora lo primero que se ve es contenido
              real. `rounded-b-[2rem]` es el remate que ya usan todos los heroes
              a sangre del sitio.

              DOS VELOS INDEPENDIENTES, cada uno con su trabajo, y los dos
              medidos contra las TRES portadas reales —no sólo la del destacado
              de hoy—, porque la imagen cambia con cada publicación:

                · el de ABAJO (`to-t`, 95/70/0) sostiene el h2 y el excerpt.
                  Título blanco 7.85:1, excerpt slate-200 6.37:1.

                · el de ARRIBA (`to-b`, 70/60/0 sobre 160px) existe sólo para
                  la franja donde se apoya el header. Sin él el logo blanco caía
                  a 1.11:1 sobre la portada del destacado actual — invisible— y
                  a 2.45:1 sobre otra. Con él: 6.51:1, 9.52:1 y 14.20:1 en las
                  tres. Es el equivalente al radial superior del `hero-overlay`
                  de home, que allá cumple la misma función.

              El velo de abajo llega a alfa 0 arriba, así que no se estorban. */}
          <section className="relative flex aspect-[21/9] min-h-[520px] items-end overflow-hidden rounded-b-[2rem]">
            {destacado && (
              <>
                <Image
                  src={destacado.cover}
                  alt={destacado.coverAlt}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                {/* Velo del texto. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-brand-950/95 via-brand-950/70 to-transparent"
                />
                {/* Velo del header. `h-40` = 160px: cubre de sobra la barra,
                    que termina hacia los 72px, y se desvanece antes de llegar
                    al titular. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-brand-950/70 via-brand-950/60 to-transparent"
                />

                <div className="relative mx-auto w-full max-w-7xl px-6 pb-10 md:pb-14 lg:pb-20">
                  {/* El <h1> de la página se queda FIJO y pequeño: describe la
                      sección, que es lo que un índice debe declarar. Promoverlo
                      al titular del artículo lo habría hecho cambiar con cada
                      publicación y competir con el h1 de la propia nota. */}
                  <h1 className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-100">
                    {TITLE}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-200">
                    <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white backdrop-blur-sm">
                      {destacado.category}
                    </span>
                    <time dateTime={destacado.date}>
                      {formatPostDate(destacado.date)}
                    </time>
                  </div>

                  <h2 className="mt-3 max-w-3xl font-heading text-2xl font-bold leading-snug text-white md:text-4xl">
                    <Link
                      href={postHref(destacado.slug)}
                      /* El enlace envuelve SÓLO el titular y se estira sobre
                         toda la sección con el `after`. Así el área clicable
                         sigue siendo el hero entero, pero el nombre accesible
                         del enlace es el título del artículo y no todo el
                         bloque de texto. */
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {destacado.title}
                    </Link>
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
                    {destacado.description}
                  </p>
                </div>
              </>
            )}
          </section>

          <section
            aria-labelledby="blog-lista"
            className="mx-auto max-w-7xl px-6 pb-16 pt-24 md:pb-24 md:pt-40"
          >
            {/* Encabezado de la lista, sólo para lectores de pantalla. Existe
                por jerarquía: sin él la página saltaría del <h2> del destacado
                a los <h3> de las tarjetas sin nada que nombre la sección. */}
            <h2 id="blog-lista" className="sr-only">
              Artículos
            </h2>

            {/* ---------- FILTRO + REJILLA ---------- */}
            <BlogFilter posts={paraFiltro} />
          </section>
        </main>
        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
