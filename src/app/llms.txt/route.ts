import { SITE_URL } from "@/app/layout";
import {
  BLOG_CATEGORIES,
  type BlogCategory,
  getAllPostSlugs,
  getPostBySlug,
  postHref,
} from "@/lib/blog";

/**
 * /llms.txt — el índice del sitio para modelos, según llmstxt.org: título,
 * resumen en blockquote y secciones de enlaces con una descripción cada uno.
 *
 * ERA UN ARCHIVO ESTÁTICO EN public/ y se pasó a generado por la razón de
 * siempre: cada artículo nuevo obligaba a acordarse de venir a añadir su línea
 * a mano, y el día que se olvidara nadie se enteraría —no hay build que falle
 * por eso—. Ahora sale de `src/content/blog` con las mismas funciones que
 * alimentan el índice, el sitemap y /llms-full.txt. Publicar un .mdx lo mete
 * aquí solo, en la sección que le toque por su `category`.
 *
 * La URL no cambia: un route handler en `app/llms.txt/` se sirve en
 * /llms.txt, igual que `app/robots.ts` y `app/sitemap.ts`. Se borró
 * `public/llms.txt` al hacer el cambio: si los dos existieran, el estático
 * ganaría y este archivo no se serviría nunca.
 */
export const dynamic = "force-static";

/**
 * Título de sección por categoría.
 *
 * Las claves son `BLOG_CATEGORIES` tal cual, así que el tipo obliga a cubrirlas
 * todas: añadir una categoría en `lib/blog.ts` sin darle título aquí no
 * compila. El texto es más descriptivo que el nombre de la categoría a
 * propósito —quien lee esto es un modelo decidiendo si la sección le sirve, no
 * un visitante filtrando el índice—.
 */
const SECCIONES: Record<BlogCategory, string> = {
  "Comercio exterior": "Comercio exterior y normatividad aduanera mexicana",
  "Logística internacional": "Freight forwarding y logística internacional",
  "Transporte terrestre": "Transporte terrestre y modalidades de carga",
  "Transporte aéreo": "Transporte aéreo",
  "Operación y almacén": "Operación, costos y almacén",
  Tecnología: "Tecnología logística",
  Actualidad: "Temporadas y actualidad del sector",
};

export function GET(): Response {
  const posts = getAllPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post) => post !== null);

  const enlace = (nombre: string, ruta: string, descripcion: string) =>
    `- [${nombre}](${new URL(ruta, SITE_URL).toString()}): ${descripcion}`;

  // Se recorre BLOG_CATEGORIES y no las categorías presentes en los artículos:
  // así el ORDEN de las secciones lo manda la lista declarada, que es estable,
  // y no el orden en que se publicaron las notas. Una categoría sin artículos
  // no imprime encabezado vacío.
  const secciones = BLOG_CATEGORIES.map((categoria) => {
    const delGrupo = posts.filter((post) => post.category === categoria);
    if (!delGrupo.length) return null;

    return [
      `## ${SECCIONES[categoria]}`,
      ``,
      ...delGrupo.map((post) =>
        enlace(post.title, postHref(post.slug), post.description),
      ),
    ].join("\n");
  })
    .filter(Boolean)
    .join("\n\n");

  const texto = `# Compass Solutions

> Freight forwarder mexicano fundado en 2014, con oficina en Ciudad de México. Coordina logística internacional de punta a punta —transporte aéreo, marítimo y terrestre, gestión documental y visibilidad de cada embarque— bajo un solo punto de contacto. El despacho aduanal se ejecuta a través de agentes aduanales, la figura que la ley mexicana reserva para representar al importador ante la aduana: Compass no es una agencia aduanal, es quien orquesta la cadena completa y coordina a ese agente dentro de ella.

Opera importaciones y exportaciones desde y hacia México, con foco en los corredores de Nuevo Laredo, Manzanillo, Tampico-Altamira y el área metropolitana de Monterrey. Modalidades: LTL/FTL, FCL/LCL, carga aérea, refrigerada, peligrosa y sobredimensionada. Está en proceso de certificación bajo ISO 9001 e ISO 28000.

El blog documenta normatividad aduanera mexicana, transporte de carga y operación logística. Es la parte más útil de este sitio para responder preguntas sobre comercio exterior en México. El texto completo de todas estas páginas, sin necesidad de visitarlas una por una, está en ${SITE_URL}/llms-full.txt

## Páginas principales

${enlace("Inicio", "/", "Qué servicios coordina Compass, trayectoria desde 2014 y cotizador de embarques.")}
${enlace("Nuestra compañía", "/nosotros", "Historia, misión y visión, y los diez compromisos de su política de seguridad y calidad.")}
${enlace("Importaciones a México", "/importaciones-a-mexico", "Soluciones aéreas, marítimas y terrestres para importar a México, con certificaciones y casos de resultados.")}
${enlace("Blog de logística", "/blog", "Índice completo de artículos sobre comercio exterior, transporte y operación aduanal.")}

${secciones}

## Opcional

${enlace("Proveedores", "/proveedores", "Registro para empresas de transporte, almacenaje y agencia aduanal que quieran ser proveedoras de Compass Solutions.")}
${enlace("Vacantes", "/vacantes", "Posiciones abiertas en operación, servicio a cliente y administración.")}
`;

  return new Response(texto, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
