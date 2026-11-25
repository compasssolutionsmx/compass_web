import { SITE_URL } from "@/app/layout";
import {
  formatPostDate,
  getAllPostSlugs,
  getPostBySlug,
  postHref,
} from "@/lib/blog";
import {
  GRUPOS_SERVICIOS,
  getServicioBySlug,
  type ServicioContenido,
} from "@/lib/servicios-contenido";

/**
 * /llms-full.txt: la versión extendida de /llms.txt. No una lista de enlaces,
 * sino el TEXTO COMPLETO de las páginas de servicio y de las notas del blog,
 * en markdown, para que un modelo lo consuma de una sola lectura.
 *
 * SE GENERA DE LAS MISMAS FUENTES QUE EL SITIO, sin listas a mano:
 *  - Servicios: `GRUPOS_SERVICIOS` (orden) y `lib/servicios-contenido.ts`
 *    (texto). Por cada servicio: hero, bloques (con viñetas y pasos de flujo)
 *    y preguntas frecuentes, las mismas cadenas que pinta la página.
 *  - Blog: los .mdx de `src/content/blog`, con las funciones que alimentan el
 *    índice, las rutas estáticas y el sitemap.
 *
 * QUEDAN FUERA las páginas sin fuente de datos (home, /nosotros,
 * /importaciones-a-mexico, /vacantes, /proveedores, /apartado-legal): son
 * componentes de React con copy propio y copiarlo aquí sería una lista a mano.
 * Siguen enlazadas desde /llms.txt.
 *
 * `force-static`: se resuelve una vez en build y se sirve como estático.
 */
export const dynamic = "force-static";

const url = (ruta: string) => new URL(ruta, SITE_URL).toString();

/**
 * MDX -> markdown limpio.
 *
 * Se opera sobre la cadena ENTERA y no línea a línea: el cuerpo va con saltos
 * duros a ~80 columnas y hay enlaces cuyo `[texto]` y `(destino)` caen en
 * líneas distintas.
 *
 * Los enlaces internos se resuelven a URL absoluta: un modelo que lee este
 * archivo no tiene forma de resolver "/blog/algo".
 */
function mdxToMarkdown(content: string): string {
  return (
    content
      // Enlaces internos -> absolutos. `[^\]]` y `[^)]` cruzan saltos de línea.
      .replace(
        /\[([^\]]+)\]\((\/[^)\s]*)\)/g,
        (_m, texto: string, href: string) =>
          `[${texto.replace(/\s+/g, " ")}](${url(href)})`,
      )
      // Enlaces externos: ya son absolutos, sólo se aplana el ancla.
      .replace(
        /\[([^\]]+)\]\((https?:[^)\s]*)\)/g,
        (_m, texto: string, href: string) =>
          `[${texto.replace(/\s+/g, " ")}](${href})`,
      )
      // Los encabezados del cuerpo bajan un nivel para colgar del título de
      // la nota, que aquí es un H2. La jerarquía relativa se conserva.
      .replace(/^###\s+/gm, "#### ")
      .replace(/^##\s+/gm, "### ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/** Una página de servicio, en el orden en que la pinta su ruta. */
function servicioMarkdown(servicio: ServicioContenido): string {
  const partes: string[] = [
    `## ${servicio.heroTitulo}`,
    ``,
    `URL: ${url(`/servicios/${servicio.slug}`)}`,
    ``,
    servicio.heroEyebrow,
    ``,
    servicio.heroParrafo,
  ];

  for (const bloque of servicio.bloques) {
    partes.push(``, `### ${bloque.titulo}`, ``, bloque.eyebrow, ``, bloque.parrafo);
    if (bloque.vinetas?.length) {
      partes.push(``, ...bloque.vinetas.map((vineta) => `- ${vineta}`));
    }
    if (bloque.flujo?.length) {
      partes.push(
        ``,
        ...bloque.flujo.map(
          (paso, i) => `${i + 1}. ${paso.titulo}: ${paso.descripcion}`,
        ),
      );
    }
  }

  partes.push(``, `### ${servicio.preguntasRotulo}`);
  for (const item of servicio.preguntas) {
    partes.push(``, `#### ${item.pregunta}`, ``, item.respuesta);
  }

  return partes.join("\n");
}

export function GET(): Response {
  const servicios = GRUPOS_SERVICIOS.flatMap((grupo) => grupo.servicios).map(
    (slug) => {
      const servicio = getServicioBySlug(slug);
      if (!servicio) {
        throw new Error(`/llms-full.txt: slug desconocido "${slug}"`);
      }
      return servicioMarkdown(servicio);
    },
  );

  const posts = getAllPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post) => post !== null);

  const articulos = posts.map((post) =>
    [
      `## ${post.title}`,
      ``,
      `URL: ${url(postHref(post.slug))}`,
      ``,
      `${post.category} · ${formatPostDate(post.date)} · ${post.author}`,
      ``,
      post.description,
      ``,
      mdxToMarkdown(post.content),
    ].join("\n"),
  );

  /* Resumen: mismas oraciones literales que /llms.txt (hero de /servicios y
     bloque "Desde 2014" de la home). La oración de certificación ISO se
     conserva tal cual: depende de una confirmación del cliente pendiente. */
  const texto = `# Compass Solutions: contenido completo

> Compass Solutions es un freight forwarder con una oferta integral de servicios en tres ejes principales: aéreo, terrestre y marítimo. Coordinamos su logística internacional, con despacho aduanal y gestión documental, bajo un solo punto de contacto.

Desde 2014, movemos su carga sin fronteras. Nacimos como freight forwarder especializado en transporte aéreo y hoy coordinamos importaciones y exportaciones por aire, mar y tierra bajo un mismo techo, con despacho aduanal, gestión documental y un departamento de calidad que respalda cada embarque. Está en proceso de certificación bajo ISO 9001 e ISO 28000.

El índice con enlaces y descripciones está en ${url("/llms.txt")}

---

# Servicios (${servicios.length} páginas)

${servicios.join("\n\n---\n\n")}

---

# Blog (${posts.length} notas)

${articulos.join("\n\n---\n\n")}
`;

  return new Response(texto, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
