import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlogCarousel from "./BlogCarousel";
import Eyebrow from "./Eyebrow";
import { formatPostDate, getAllPosts, postHref } from "@/lib/blog";

export default function BlogPreview() {
  // Los mismos artículos del sistema MDX que alimenta /blog, ya ordenados de
  // más reciente a más antiguo. Se acabaron los placeholders hardcodeados y el
  // TODO de la API headless de WordPress: el contenido vive en el repo.
  const posts = getAllPosts().map((post) => ({
    slug: post.slug,
    href: postHref(post.slug),
    title: post.title,
    cover: post.cover,
    coverAlt: post.coverAlt,
    category: post.category,
    date: post.date,
    dateLabel: formatPostDate(post.date),
  }));

  return (
    // El padding superior es corto: la sección de arriba ya cierra con su
    // propio aire y aquí sobraba espacio muerto antes del bloque.
    //
    // El inferior, en cambio, es el más generoso del home (112/128px). Debajo
    // va el footer, que arranca en brand-950 a sangre: con `pb-20` las tarjetas
    // del carrusel quedaban casi pegadas a esa banda oscura.
    <section className="mx-auto max-w-7xl px-6 pb-28 pt-10 md:pb-32 md:pt-12">
      {/* Columna izquierda fija + carrusel a la derecha. En móvil se apilan:
          primero el encabezado, luego las tarjetas. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <div>
          <Eyebrow className="mb-3">Blog</Eyebrow>
          {/* Dos líneas en pantalla, UNA sola cadena para quien no la ve. El
              espacio antes del <br> es obligatorio: sin él, `textContent` —que
              es de donde salen el nombre accesible y lo que indexa un
              buscador— decía "ÚltimasNoticias", todo junto. El <br> no aporta
              separación de palabra. */}
          <h2 className="font-heading text-3xl font-bold leading-tight text-brand-900 md:text-4xl">
            Últimas <br />
            noticias
          </h2>
          <p className="mt-4 max-w-sm text-slate-600">
            Comercio exterior, transporte y operación aduanal explicados por
            nuestro equipo.
          </p>
          <Link
            href="/blog"
            className="group mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-brand-900"
          >
            Ver más
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-250 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>

        <BlogCarousel posts={posts} />
      </div>
    </section>
  );
}
