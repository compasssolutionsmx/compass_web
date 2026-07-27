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

export type PostFrontmatter = {
  title: string;
  description: string;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  author: string;
  category: string;
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
  return {
    ...(data as PostFrontmatter),
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
 * Slug de un encabezado. Se usa en DOS sitios que deben coincidir: el `id` que
 * se pinta en el <h2>/<h3> del cuerpo y el `href` del índice. Por eso vive aquí
 * y no duplicado en cada componente.
 */
export function slugifyHeading(text: string): string {
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
