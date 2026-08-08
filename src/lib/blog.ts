/**
 * Pipeline del blog: los artículos son archivos .mdx dentro del repo, sin CMS
 * ni servicios externos. El frontmatter lo parsea gray-matter.
 *
 * Todo lo de aquí toca el sistema de archivos, así que sólo corre en servidor.
 * Como se consume desde componentes de servidor sin `dynamic`, las rutas se
 * generan estáticas en build (SSG).
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

/**
 * CATEGORÍAS VÁLIDAS, declaradas en un solo sitio. Antes `category` era un
 * string libre en cada .mdx: un typo creaba una categoría nueva en silencio y
 * nadie se enteraba hasta verla suelta en el filtro del índice.
 *
 * Mismo patrón que `lib/services.ts`: la lista manda y el contenido se valida
 * contra ella. Añadir una categoría es añadirla aquí; el tipo y el filtro del
 * índice se enteran solos.
 */
export const BLOG_CATEGORIES = [
  "Comercio exterior",
  "Logística internacional",
  "Transporte terrestre",
  "Transporte aéreo",
  "Operación y almacén",
  "Tecnología",
  "Actualidad",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type PostFrontmatter = {
  title: string;
  /**
   * Title tag alternativo, sólo para SEO. Cuando existe manda en el <title> y
   * en nada más: el <h1> del artículo, la tarjeta del índice y el `headline`
   * del JSON-LD siguen usando `title`.
   *
   * Existe porque un buen H1 y un buen title tag no siempre son la misma frase:
   * el H1 puede permitirse ser largo y conversacional, mientras que el title se
   * corta a ~60 caracteres en el resultado de búsqueda y conviene que abra con
   * la keyword. Sin este campo, cambiar uno obligaba a cambiar el otro.
   */
  seoTitle?: string;
  description: string;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  author: string;
  category: BlogCategory;
  cover: string;
  coverAlt: string;
  keywords: string[];
};

/** Lo que necesita el listado: frontmatter + slug, sin el cuerpo. */
export type PostSummary = PostFrontmatter & { slug: string };

/** Lo que necesita la página del artículo: además el cuerpo MDX en crudo. */
export type Post = PostSummary & { content: string };

/**
 * Un solo sitio construye las URLs de artículo.
 *
 * TODO(decidir en el paso de la página de artículo): el sitio actual en
 * WordPress publica los posts en la raíz (`/funciones-agente-aduanal-mexico`),
 * no bajo `/blog/`. Mantener esas URLs conservaría el SEO ya indexado, pero
 * obliga a una ruta dinámica en la raíz que convive con /nosotros, /vacantes,
 * etc. La alternativa es `/blog/[slug]` + redirects 301 desde las viejas.
 * Mientras se decide, todo pasa por aquí y cambiarlo es una línea.
 */
export function postHref(slug: string): string {
  return `/blog/${slug}`;
}

function parsePost(fileName: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  // Se valida en BUILD y se revienta, en vez de dejar pasar la categoría rara.
  // Esto corre en `readAll`, o sea durante la generación estática: un .mdx con
  // un typo tira el build con el nombre del archivo y la lista buena, que es
  // mucho mejor que publicar una categoría huérfana que el filtro del índice
  // pintaría como una pill más.
  if (!BLOG_CATEGORIES.includes(frontmatter.category)) {
    throw new Error(
      `[blog] ${fileName}: categoría "${frontmatter.category}" no está declarada. ` +
        `Las válidas son: ${BLOG_CATEGORIES.join(", ")}. ` +
        `Si la categoría es nueva, añádela a BLOG_CATEGORIES en lib/blog.ts.`,
    );
  }

  return {
    ...frontmatter,
    slug: fileName.replace(/\.mdx$/, ""),
    content,
  };
}

function readAll(): Post[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(parsePost)
    .sort((a, b) => b.date.localeCompare(a.date)); // más reciente primero
}

/** Listado para el índice. Devuelve el frontmatter sin el cuerpo. */
export function getAllPosts(): PostSummary[] {
  return readAll().map(({ content, ...summary }) => {
    void content; // el índice no necesita el cuerpo
    return summary;
  });
}

/** Un artículo por slug, con su cuerpo MDX. `null` si no existe. */
export function getPostBySlug(slug: string): Post | null {
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(BLOG_DIR, file))) return null;
  return parsePost(file);
}

/** Para el `generateStaticParams` de la página de artículo. */
export function getAllPostSlugs(): string[] {
  return readAll().map((post) => post.slug);
}

/**
 * Fecha legible. Se fuerza `timeZone: "UTC"` porque las fechas del frontmatter
 * son `YYYY-MM-DD` y se parsean como medianoche UTC: sin fijar la zona, un
 * build en husos negativos mostraría el día anterior.
 */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Encabezado del cuerpo del artículo, para el índice lateral. */
export type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * AQUÍ VIVÍA `bindHeadingTail`, la protección anti-huérfanos del <h1> de
 * artículo. Se movió a `lib/typography.ts` como `bindTail` y se generalizó:
 * este módulo importa `node:fs` y gray-matter, así que tenerla aquí la dejaba
 * fuera del alcance de los componentes cliente y de cualquier página que no
 * fuera la de artículo. El peor caso medido para los títulos del blog (195px a
 * 24px contra los 272px de un viewport de 320) sigue documentado allí.
 */

/**
 * ANCLAS CONGELADAS: encabezados cuyo texto cambió DESPUÉS de publicarse y que
 * conservan a la fuerza el `id` que ya tenían.
 *
 * El slug sale del texto, así que reescribir un encabezado cambia su ancla y
 * rompe cualquier enlace externo —compartido por chat, guardado en marcadores,
 * citado desde fuera— que apuntara a esa sección. Aquí se declara el id viejo
 * para el texto nuevo y el ancla sobrevive a la corrección de copy.
 *
 * La clave es el TEXTO NUEVO, tal cual queda en el .mdx. Al añadir una entrada,
 * copiar el id anterior literal — no volver a derivarlo del texto viejo.
 */
const ANCLAS_CONGELADAS: Record<string, string> = {};

/**
 * Slug de un encabezado. Se usa en DOS sitios que deben coincidir: el `id` que
 * se pinta en el <h2>/<h3> del cuerpo y el `href` del índice. Por eso vive aquí
 * y no duplicado en cada componente — y por eso la tabla de anclas congeladas
 * se consulta AQUÍ DENTRO: así los dos consumidores heredan el override sin que
 * ninguno tenga que acordarse de aplicarlo.
 */
export function slugifyHeading(text: string): string {
  const congelada = ANCLAS_CONGELADAS[text.trim()];
  if (congelada) return congelada;

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // fuera acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Encabezados H2 y H3 del cuerpo MDX, en orden.
 *
 * Se saltan los bloques de código para no confundir un `## comentario` de
 * dentro de un fence con un encabezado real.
 */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  let insideFence = false;

  for (const line of content.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(line.trim());
    if (!match) continue;

    const text = match[2].trim();
    headings.push({
      id: slugifyHeading(text),
      text,
      level: match[1].length === 2 ? 2 : 3,
    });
  }

  return headings;
}

/**
 * JSON-LD `BlogPosting` para la página de cada artículo.
 *
 * REGLA: todo lo que va aquí tiene que estar VISIBLE en la página. Título,
 * descripción, fecha, autor y portada se pintan en el hero del artículo, así
 * que el schema no declara nada oculto.
 */
export function buildBlogPostingJsonLd(post: PostSummary, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: new URL(post.cover, siteUrl).toString(),
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Compass Solutions" },
    keywords: post.keywords.join(", "),
    mainEntityOfPage: new URL(postHref(post.slug), siteUrl).toString(),
  };
}
