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
          <section className="relative overflow-hidden rounded-b-[2rem] bg-brand-950 px-6 pb-16 pt-32 md:pb-20 md:pt-40">
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
                bloque de texto, no en el contenedor. */}
            <div className="relative mx-auto max-w-7xl">
              <Eyebrow tone="dark" className="mb-4">
                {post.category}
              </Eyebrow>

              <h1 className="max-w-4xl font-heading text-3xl font-bold leading-tight text-white md:text-5xl">
                {post.title}
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
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
              <article>
                <ArticleBody source={post.content} />
              </article>

              {/* En móvil la barra va PRIMERO en el DOM pero se pinta después
                  del cuerpo con `order`, para que el índice colapsado quede
                  arriba y la tarjeta de contacto al final. */}
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="space-y-8">
                  <ArticleToc headings={headings} />

                  <div className="brand-gradient rounded-2xl p-6">
                    <p className="font-heading text-lg font-bold text-white">
                      ¿Necesitas mejorar tu logística?
                    </p>
                    <p className="mt-2 text-sm text-brand-50">
                      Cuéntanos qué mueves y te proponemos la mejor ruta.
                    </p>
                    <QuoteButton className="mt-5 w-full rounded-full bg-white px-6 py-2.5 font-heading text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50">
                      Contáctanos
                    </QuoteButton>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* ---------- CIERRE: banner de cotización ---------- */}
          <section className="mx-auto max-w-7xl px-6 pb-16">
            <div className="brand-gradient rounded-3xl px-8 py-12 text-center md:px-14 md:py-16">
              <h2 className="mx-auto max-w-2xl font-heading text-2xl font-bold text-white md:text-3xl">
                Solicita una cotización y mueve tu carga con Compass
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-brand-50">
                Aéreo, marítimo y terrestre bajo un mismo techo, con un solo
                punto de contacto para toda tu operación.
              </p>
              <QuoteButton className="mt-8 rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50">
                Solicitar cotización
              </QuoteButton>
            </div>
          </section>

          {/* ---------- Sigue leyendo ---------- */}
          {related.length > 0 && (
            <section className="mx-auto max-w-7xl px-6 pb-20">
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
