import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import { formatPostDate, getAllPosts, postHref } from "@/lib/blog";

const TITLE = "Blog de Logística";
const DESCRIPTION =
  "Comercio exterior, transporte y operación aduanal explicados por el equipo de Compass Solutions.";

export const metadata: Metadata = {
  title: `${TITLE} | Compass Solutions`,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Compass Solutions",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* Arriba del todo esta página tiene la cabecera brand-gradient detrás. */}
        <Header topTone="dark" />
        <main className="flex-1">
          {/* Cabecera tipo hero corto. Reusa `brand-gradient`, el mismo
              degradado de dos radiales del modal a pantalla completa, para que
              la página no invente un tratamiento nuevo.
              `pt-32` deja pasar el header flotante, que es fixed. */}
          <section className="brand-gradient rounded-b-[2rem] px-6 pb-16 pt-32 md:pb-20 md:pt-40">
            <div className="mx-auto max-w-7xl">
              <Eyebrow tone="dark" className="mb-4">
                Conocimiento operativo
              </Eyebrow>
              <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                {TITLE}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-brand-50">
                {DESCRIPTION}
              </p>
            </div>
          </section>

          <section
            aria-labelledby="blog-lista"
            className="mx-auto max-w-7xl px-6 py-16 md:py-24"
          >
            {/* Encabezado de la lista, sólo para lectores de pantalla. Existe
                por jerarquía: sin él la página salta del <h1> del hero a los
                títulos de tarjeta, y del último de ésos a los <h4> del footer.
                Con este <h2> la secuencia queda h1 -> h2 -> h3 -> h4, sin
                saltos, y de paso le da nombre accesible a la sección. */}
            <h2 id="blog-lista" className="sr-only">
              Artículos
            </h2>
            <ul className="flex flex-col gap-14 md:gap-20">
              {posts.map((post) => (
                <li key={post.slug}>
                  {/* Toda la fila es el área clicable, así que el foco visible
                      va sobre ella y no sólo sobre el título. `group` gobierna
                      los efectos de hover de la imagen y de la flecha. */}
                  <Link
                    href={postHref(post.slug)}
                    className="group grid gap-6 rounded-3xl md:grid-cols-2 md:items-center md:gap-12"
                  >
                    {/* En móvil la imagen va primero (order-first) para que la
                        fila colapse a formato apilado con la foto arriba. */}
                    <div className="order-first overflow-hidden rounded-2xl md:order-last">
                      {/* TODO: portadas reales. Las de placehold.co son
                          provisionales hasta que llegue el material gráfico. */}
                      <Image
                        src={post.cover}
                        alt={post.coverAlt}
                        width={1200}
                        height={800}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        unoptimized={post.cover.startsWith("http")}
                        className="aspect-[3/2] w-full object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:scale-105"
                      />
                    </div>

                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                        <span className="font-semibold text-brand-900">
                          {post.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={post.date}>
                          {formatPostDate(post.date)}
                        </time>
                      </div>

                      {/* <h3> y no <h2>: el título de la tarjeta cuelga del
                          <h2> de la lista. Las clases no cambian, así que se ve
                          exactamente igual. */}
                      <h3 className="font-heading text-2xl font-bold leading-snug text-brand-900 md:text-3xl">
                        {post.title}
                      </h3>

                      <p className="mt-4 max-w-xl text-slate-600">
                        {post.description}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-brand-900">
                        Leer más
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
        </main>
        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
