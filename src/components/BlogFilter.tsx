"use client";

/**
 * Filtro por categoría del índice del blog, más la rejilla que gobierna.
 *
 * ES EL PRIMER FILTRADO DEL SITIO, así que conviene dejar por escrito lo que se
 * decidió y lo que no:
 *
 *   - EN MEMORIA, sin red. La página es estática y trae los cuatro artículos ya
 *     cargados; pedir nada al servidor para esconder tres tarjetas sería peor
 *     que inútil.
 *   - SIN estado en la URL. Un `?categoria=` haría el filtro compartible y
 *     recordable al recargar, pero obliga a `useSearchParams` y a un
 *     `<Suspense>`, y con cuatro artículos no compensa. Cuando el blog crezca,
 *     es lo primero que hay que añadir.
 *   - LAS CATEGORÍAS SE DERIVAN DE LOS POSTS presentes, no de la lista completa
 *     de `BLOG_CATEGORIES`: una pill que no devuelve nada es una pill que sobra.
 *     La lista central sigue siendo la que valida el frontmatter.
 *
 * NO recibe `PostSummary` sino una forma ya preparada: `lib/blog` importa
 * `node:fs` en el módulo, así que un componente cliente no puede tocarlo. El
 * server component mapea antes lo que hace falta —incluida la fecha ya
 * formateada—, que es el mismo patrón de <BlogPreview> con <BlogCarousel>.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useId, useMemo, useState } from "react";

export type FilterPost = {
  slug: string;
  href: string;
  title: string;
  description: string;
  cover: string;
  coverAlt: string;
  category: string;
  /** ISO, para el atributo `dateTime`. */
  date: string;
  /** Ya formateada para mostrar. */
  dateLabel: string;
};

/** Valor de "sin filtro". No es una categoría, por eso no sale de los datos. */
const TODAS = "Todas";

export default function BlogFilter({ posts }: { posts: FilterPost[] }) {
  const [activa, setActiva] = useState<string>(TODAS);
  const categoriasId = useId();

  // Orden de aparición en la lista —que ya viene de más reciente a más
  // antiguo—, no alfabético: así la primera pill es la del artículo más nuevo.
  const categorias = useMemo(
    () => [TODAS, ...new Set(posts.map((post) => post.category))],
    [posts],
  );

  const visibles = useMemo(
    () =>
      activa === TODAS
        ? posts
        : posts.filter((post) => post.category === activa),
    [posts, activa],
  );

  return (
    <>
      {/* Rótulo de la fila. NO es un <Eyebrow>: la pastilla del eyebrow se
          leería como una pastilla más de la fila, es decir, como si "Categorías"
          fuera una categoría seleccionable. Texto plano, con el mismo
          tratamiento tipográfico que tenía el rótulo del hero.

          Y NO es un heading: rotula un control de interfaz, no una sección de
          contenido. Como heading aparecería en la navegación por encabezados
          entre el <h1> y los artículos, que es justo donde estorba. Se conecta
          al grupo con `aria-labelledby`, así el nombre accesible ES el texto
          visible en vez de un `aria-label` paralelo que puede desincronizarse. */}
      {/* Sin `mt`: lo tenía para separarse del <h1> que estaba justo encima, y
          ese <h1> se fue al hero. Ahora esto es lo primero de la sección y el
          hueco lo pone el `pt` de la sección, que ya está ajustado. */}
      <p
        id={categoriasId}
        className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-slate-500"
      >
        Categorías
      </p>

      {/* `role="group"` y `aria-pressed` en vez de tabs: esto no cambia de
          panel, filtra una lista que sigue siendo la misma. Son botones de
          alternancia, y así los anuncia un lector de pantalla. */}
      <div
        role="group"
        aria-labelledby={categoriasId}
        className="mb-10 flex flex-wrap gap-3"
      >
        {categorias.map((categoria) => {
          const seleccionada = categoria === activa;
          return (
            <button
              key={categoria}
              type="button"
              aria-pressed={seleccionada}
              onClick={() => setActiva(categoria)}
              /* Mismo lenguaje de pastilla que el <Chip> del cotizador:
                 seleccionada en brand-900 sólido (blanco encima, 15.07:1) y en
                 reposo con borde, texto slate-600 sobre blanco (7.58:1). */
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                seleccionada
                  ? "border-brand-900 bg-brand-900 text-white"
                  : "border-slate-300 text-slate-600 hover:border-brand-900 hover:text-brand-900"
              }`}
            >
              {categoria}
            </button>
          );
        })}
      </div>

      {/* `aria-live="polite"`: al filtrar no se navega ni se mueve el foco, así
          que sin esto el cambio de la lista sería invisible para quien no ve la
          pantalla. */}
      <div aria-live="polite" className="sr-only">
        {visibles.length === posts.length
          ? `${posts.length} artículos`
          : `${visibles.length} de ${posts.length} artículos, categoría ${activa}`}
      </div>

      {/* Encabezado de la rejilla, sólo para lectores de pantalla. VIVE AQUÍ Y
          NO EN LA PÁGINA porque tiene que quedar DESPUÉS del rótulo de las
          pastillas y pegado a la lista que nombra; estando arriba anunciaba
          "Artículos" y lo siguiente que aparecía era el filtro. Es el puente de
          jerarquía: sin él la página salta del <h1> a los <h3> de las tarjetas. */}
      <h2 className="sr-only">Artículos</h2>

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((post) => (
          <li key={post.slug}>
            {/* La tarjeta entera es el área clicable, así que el foco visible
                cae sobre ella y no sólo sobre el título. `group` gobierna el
                zoom de la portada y el desplazamiento de la flecha. */}
            <Link
              href={post.href}
              className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 transition-[box-shadow,border-color] duration-250 hover:ring-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
            >
              {/* SIN texto encima de la portada, a diferencia de la destacada:
                  aquí la imagen va arriba y el texto debajo sobre blanco, así
                  que no hace falta velo ni medir contraste contra la foto. */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.cover}
                  alt={post.coverAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span className="font-semibold text-brand-900">
                    {post.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.date}>{post.dateLabel}</time>
                </div>

                <h3 className="font-heading text-xl font-bold leading-snug text-brand-900">
                  {post.title}
                </h3>

                {/* El excerpt se pinta SIEMPRE, y no sólo por diseño: el JSON-LD
                    del índice declara `description` de cada artículo, y la regla
                    del proyecto es que nada se declare ahí sin estar visible. */}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {post.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-semibold text-brand-900">
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
    </>
  );
}
