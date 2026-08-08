import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlogFilter, { type FilterPost } from "@/components/BlogFilter";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";
import { SITE_URL } from "@/app/layout";
import { formatPostDate, getAllPosts, postHref } from "@/lib/blog";
import { bindTail } from "@/lib/typography";

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

              DOS COLUMNAS desde `lg`: el <h1> de la página sobre la imagen a la
              izquierda, y a la derecha una tarjeta blanca con el destacado. Antes
              todo el bloque iba sobrepuesto directo sobre la foto, abajo.

              SE FUE EL `aspect-[21/9]`. Con dos columnas que en móvil se apilan,
              una caja de proporción fija se desborda en cuanto el contenido
              crece. Ahora el alto lo pone el contenido y el `pt-32 md:pt-40`
              despeja el header flotante, que es lo que hacen los heroes de
              /nosotros, /proveedores y la página de artículo. A 1280px el hero
              queda en ~560px, prácticamente lo que medía antes (549px).

              LOS VELOS CAMBIARON DE TRABAJO, porque la mitad derecha ya no
              necesita sostener texto: se la come la tarjeta blanca.

                · El VELO PRINCIPAL era `to-t` (95/70/0): oscurecía abajo, que es
                  donde vivía el texto. Ahora el único texto que depende de él es
                  el <h1>, a la izquierda, así que en `lg` el degradado va `to-r`
                  (85/65/35) y deja respirar la foto justo donde se apoya la
                  tarjeta. Por debajo de `lg` las columnas se apilan y el <h1>
                  puede caer sobre cualquier zona, así que ahí se usa un `to-b`
                  casi plano (78/70/65) que no depende de dónde acabe el texto.

                  Los valores salen de medir, sobre las tres portadas, el píxel
                  casi más claro de la zona del <h1> (percentil 99.5 del fondo ya
                  compuesto, no la media, que esconde los brillos): 7.11:1 en
                  desktop y 7.73:1 apilado. Pasan AAA incluso con el umbral de
                  texto normal (7:1), y eso que el <h1> es texto grande y le
                  bastaría 4.5:1. El margen es deliberado: la portada cambia con
                  cada publicación y la siguiente puede ser mucho más clara.
                  Un velo más suave —75/55/25— se quedaba en 5.4:1 y dejaba de
                  tener colchón para eso.

                · El VELO DEL HEADER se queda igual y sigue siendo necesario: es
                  independiente del contenido, protege el logo blanco de la barra
                  y sin él caía a 1.11:1 sobre una de las portadas. */}
          <section className="relative overflow-hidden rounded-b-[2rem]">
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
                {/* Velo principal. Ver arriba por qué cambia de dirección. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-b from-brand-950/78 via-brand-950/70 to-brand-950/65 lg:bg-linear-to-r lg:from-brand-950/85 lg:via-brand-950/65 lg:to-brand-950/35"
                />
                {/* Velo del header. `h-40` = 160px: cubre de sobra la barra,
                    que termina hacia los 72px, y se desvanece antes de llegar
                    al contenido. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-brand-950/70 via-brand-950/60 to-transparent"
                />

                {/* EL `pt` Y EL `pb` NO SON SIMÉTRICOS NI DEBEN SERLO. El de
                    arriba es despeje del header flotante, no aire de diseño: la
                    barra termina hacia los 72px, así que de los 160px del
                    `md:pt-40` sólo se ven 88 por encima de la tarjeta. El de
                    abajo sí es aire puro, y con 80px (`md:pb-20`) el hero
                    cerraba más suelto por debajo que por arriba.

                    `pb-16` (64px) en todos los anchos: por debajo de la caja
                    queda algo menos que los 88px de arriba, que es lo que
                    corresponde a un cierre, y sigue habiendo el doble del radio
                    del `rounded-b-[2rem]` (32px) para que el corte no muerda la
                    tarjeta.

                    NO se baja en móvil. Ahí el `pt-32` sólo deja 56px visibles
                    arriba, la tarjeta es lo último antes del corte y necesita
                    más aire que en desktop, no menos. Por eso el valor es único
                    y no un `md:` que lo apriete.

                    El hueco de abajo es SÓLO este `pb`: la tarjeta es el
                    elemento más alto de la fila en todos los anchos `lg`
                    (316px contra los 120-180px del <h1>), así que el
                    `lg:items-center` centra el titular y no deja holgura bajo
                    la tarjeta. */}
                <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 pt-32 md:pt-40 lg:grid-cols-2 lg:items-center lg:gap-16">
                  {/* EL <h1> DE LA PÁGINA. Estuvo abajo, junto a las pastillas,
                      y antes de eso decía "Blog de logística" aquí arriba.
                      Ahora dice qué ofrece la página y lo dice en el hero, que
                      es donde un <h1> se espera. */}
                  <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                    {bindTail("Guías y análisis para mover su carga mejor")}
                  </h1>

                  {/* LA TARJETA. `relative` no es decorativo: es lo que hace que
                      el `after` del enlace se estire sobre la TARJETA y no sobre
                      el hero entero. Sin él, el área clicable se comería también
                      la columna del <h1>. */}
                  <div className="relative rounded-3xl bg-white p-6 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-8">
                    {/* `tone="light"` ahora que el fondo es blanco: el `dark`
                        era blanco translúcido y aquí desaparecería. */}
                    <Eyebrow className="mb-4">Última entrada</Eyebrow>

                    {/* Categoría y fecha con el MISMO tratamiento que la fila de
                        meta de las tarjetas de la rejilla: categoría en
                        brand-900 y fecha en slate-500. Sobre blanco la pastilla
                        translúcida que tenían sobre la foto no se ve, y
                        convertirla en pastilla sólida la habría dejado idéntica
                        al eyebrow de arriba —dos etiquetas del mismo rango
                        apiladas—. Esta tarjeta es la hermana mayor de las de
                        abajo; que compartan el tratamiento de meta es lo
                        coherente. */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                      <span className="font-semibold text-brand-900">
                        {destacado.category}
                      </span>
                      <time dateTime={destacado.date}>
                        {formatPostDate(destacado.date)}
                      </time>
                    </div>

                    <h2 className="mt-3 font-heading text-2xl font-bold leading-snug text-brand-900 md:text-3xl">
                      <Link
                        href={postHref(destacado.slug)}
                        /* El enlace envuelve SÓLO el titular y se estira sobre
                           la tarjeta con el `after`. Así toda la tarjeta es
                           clicable, pero el nombre accesible del enlace es el
                           título del artículo y no el bloque entero. */
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
                      >
                        {/* Los títulos del blog son largos y en la caja de la
                            tarjeta parten casi siempre: sin esto el destacado de
                            hoy cierra con "México" sola. */}
                        {bindTail(destacado.title)}
                      </Link>
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                      {bindTail(destacado.description)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* EL `pt` NO SIGUE EL RITMO DE 160px del resto del sitio, a
              propósito. Ese número es el `pt-32 md:pt-40` con el que los heroes
              se despejan del header flotante, no la separación entre secciones;
              al rediseñar este índice se copió aquí y el resultado era un hueco
              de 160px entre el borde del hero y las pastillas.

              Aquí arriba no hay header que despejar —lo absorbe el propio hero—
              y el corte visual ya lo da su borde a sangre con el
              `rounded-b-[2rem]`, así que no hace falta reforzarlo con aire. Se
              usa `pt-16 md:pt-20`, que es lo que separa el hero de la primera
              sección en la página de artículo.

              El `pb` es mayor que el `pt` y está bien: antes del footer sí
              conviene el respiro completo. */}
          {/* SIN `aria-labelledby`: el <h1> que nombraba esta sección subió al
              hero. La rejilla la nombra el <h2> "Artículos" que <BlogFilter>
              lleva dentro, pegado a la lista. */}
          <section className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:pb-24 md:pt-20">
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
