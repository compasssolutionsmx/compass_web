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
          primero el encabezado, luego las tarjetas.

          `grid-cols-1` NO ES DECORATIVO, arregla dos fallos a la vez y los dos
          son el mismo. Sin él, por debajo de `lg` este grid no declara columnas
          y cae en una pista implícita `auto`, que se dimensiona por el
          max-content de su contenido. Y el contenido de la segunda celda es un
          carrusel cuyo track mide varias veces la vista, así que la pista se
          inflaba muy por encima del contenedor:

            1. la página se ensanchaba y aparecía el scroll horizontal — el
               `overflow-x: clip` de <html> recorta lo que se sale, pero no
               impide que el bloque se MAQUETE más ancho: el titular, el párrafo
               y las tarjetas quedaban colocados fuera de la pantalla;
            2. y el viewport de Embla, que es un bloque dentro de esa celda,
               crecía con ella hasta caber los cuatro slides enteros. Ahí Embla
               colapsa a un único snap y desactiva el arrastre: por eso ni se
               deslizaba ni respondían las flechas.

          `grid-cols-1` emite `repeat(1, minmax(0,1fr))`, y ese `min` en 0 es lo
          que impide que el contenido infle la pista — el mismo motivo por el que
          la fila de `lg` usa `minmax(0,...)`.

          ES EXACTAMENTE EL MISMO FALLO que ya se diagnosticó y se corrigió en
          <SuccessStories>, el otro sitio con un carrusel dentro de un grid; ver
          la nota de su propio `grid-cols-1`. Este quedó sin arreglar. Al añadir
          un carrusel dentro de un grid, declarar siempre las columnas. */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-12">
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
