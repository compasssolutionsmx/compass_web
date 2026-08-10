import { SITE_DESCRIPTION, SITE_URL } from "@/app/layout";
import { getAllPostSlugs, getPostBySlug, postHref } from "@/lib/blog";
import { COMPROMISOS_SEGURIDAD, INTRO_SEGURIDAD } from "@/lib/nosotros";

/**
 * /llms-full.txt — la versión extendida de /llms.txt: no una lista de enlaces,
 * sino el TEXTO COMPLETO del sitio para que un modelo lo consuma de una sola
 * lectura, sin recorrer 44 URLs.
 *
 * SE GENERA EN BUILD, NO ES UN ARCHIVO EN public/. Es la diferencia que
 * importa: `llms.txt` sí está en public/ y hay que editarlo a mano cada vez que
 * se publica una nota; éste lee `src/content/blog` con las mismas funciones que
 * alimentan el índice, las rutas estáticas y el sitemap. Añadir un .mdx lo mete
 * aquí solo. Mismo patrón que `app/sitemap.ts` y `app/robots.ts`, que tampoco
 * viven en public/ y se sirven igual desde la raíz.
 *
 * `force-static`: se resuelve una vez en build y se sirve como estático. Sin
 * esto, un route handler puede quedar como función bajo demanda y este archivo
 * no tiene nada de dinámico — leería los mismos .mdx en cada petición.
 *
 * QUEDA FUERA: /apartado-legal, que es `noindex` mientras el aviso sea un
 * borrador, y /proveedores y /vacantes, que son formularios de captura sin
 * contenido informativo que aporte a un modelo. Las tres siguen en llms.txt
 * como enlaces.
 */
export const dynamic = "force-static";

/**
 * MDX -> texto plano legible.
 *
 * Se opera sobre la cadena ENTERA y no línea a línea a propósito: el cuerpo va
 * con saltos duros a ~80 columnas y hay enlaces cuyo `[texto]` y `(destino)`
 * caen en líneas distintas. Una pasada por línea los partiría por la mitad y
 * dejaría corchetes sueltos en el texto.
 *
 * Los enlaces internos se resuelven a URL absoluta —un modelo que lee este
 * archivo no tiene forma de resolver "/blog/algo"— y se anotan junto al ancla,
 * en vez de tirarla: el ancla es la que describe el destino.
 */
function mdxToText(content: string): string {
  return (
    content
      // Enlaces internos -> absolutos. `[^\]]` y `[^)]` cruzan saltos de línea.
      .replace(
        /\[([^\]]+)\]\((\/[^)\s]*)\)/g,
        (_m, texto: string, href: string) =>
          `${texto.replace(/\s+/g, " ")} (${new URL(href, SITE_URL).toString()})`,
      )
      // Enlaces externos: ya son absolutos, sólo se aplanan.
      .replace(
        /\[([^\]]+)\]\((https?:[^)\s]*)\)/g,
        (_m, texto: string, href: string) =>
          `${texto.replace(/\s+/g, " ")} (${href})`,
      )
      // Los encabezados del cuerpo bajan un nivel para colgar del título del
      // artículo, que aquí es un H2. La jerarquía relativa se conserva intacta.
      .replace(/^###\s+/gm, "#### ")
      .replace(/^##\s+/gm, "### ")
      // Marcas de énfasis: se van los símbolos, se quedan las palabras.
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/(^|\W)[*_]([^*_]+)[*_](?=\W|$)/g, "$1$2")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Las tres páginas clave.
 *
 * SE ESCRIBEN AQUÍ Y NO SE EXTRAEN SOLAS, que es la única concesión de este
 * archivo: son componentes de React, no markdown, así que no hay un cuerpo que
 * leer del disco como con los .mdx. Lo que sí se importa es todo lo que ya vive
 * en `lib/` —la política de seguridad completa, la descripción del sitio—, de
 * modo que la parte más larga y la que más cambia se mantiene sola.
 */
function paginas(): string {
  const compromisos = COMPROMISOS_SEGURIDAD.map(
    (c, i) => `${i + 1}. ${c.titulo}: ${c.texto}`,
  ).join("\n");

  return `## Inicio

URL: ${SITE_URL}/

${SITE_DESCRIPTION}

Desde 2014, Compass Solutions mueve carga sin fronteras. Nació como freight
forwarder especializado en transporte aéreo y hoy coordina importaciones y
exportaciones por aire, mar y tierra bajo un mismo techo, con despacho aduanal
—ejecutado a través de agentes aduanales—, gestión documental y un departamento
de calidad que respalda cada embarque.

Afiliaciones y membresías que el sitio muestra: AMACARGA, CANACAR, ALACAT y WCA
(World Cargo Alliance).

## Nuestra compañía

URL: ${SITE_URL}/nosotros

${INTRO_SEGURIDAD}

Los diez compromisos de la política de seguridad y calidad:

${compromisos}

## Importaciones a México

URL: ${SITE_URL}/importaciones-a-mexico

Optimice sus importaciones a México con Compass Solutions. Soluciones
integrales de logística desde y hacia México.

Líneas de servicio de la página: transportación aérea, transportación
marítima, transportación terrestre y servicios adicionales.`;
}

export function GET(): Response {
  const posts = getAllPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post) => post !== null);

  const articulos = posts
    .map((post) => {
      const url = new URL(postHref(post.slug), SITE_URL).toString();
      return [
        `## ${post.title}`,
        ``,
        `URL: ${url}`,
        `Fecha: ${post.date} · Categoría: ${post.category} · Autor: ${post.author}`,
        `Resumen: ${post.description}`,
        ``,
        mdxToText(post.content),
      ].join("\n");
    })
    .join("\n\n---\n\n");

  const texto = `# Compass Solutions — contenido completo

> Freight forwarder mexicano fundado en 2014, con oficina en Ciudad de México. Coordina logística internacional de punta a punta —transporte aéreo, marítimo y terrestre, gestión documental y visibilidad de cada embarque— bajo un solo punto de contacto. El despacho aduanal se ejecuta a través de agentes aduanales, la figura que la ley mexicana reserva para representar al importador ante la aduana: Compass no es una agencia aduanal, es quien orquesta la cadena completa y coordina a ese agente dentro de ella.

Opera importaciones y exportaciones desde y hacia México, con foco en los
corredores de Nuevo Laredo, Manzanillo, Tampico-Altamira y el área
metropolitana de Monterrey. Modalidades: LTL/FTL, FCL/LCL, carga aérea,
refrigerada, peligrosa y sobredimensionada. Está en proceso de certificación
bajo ISO 9001 e ISO 28000.

Este archivo contiene el TEXTO COMPLETO de las páginas y los ${posts.length} artículos del
blog, en texto plano y con los enlaces resueltos a URLs absolutas, para
consumirlo sin visitar cada URL. La versión resumida, sólo con enlaces y
descripciones, está en ${SITE_URL}/llms.txt

Generado automáticamente desde el contenido del sitio en cada despliegue.

---

# Páginas

${paginas()}

---

# Blog (${posts.length} artículos)

${articulos}
`;

  return new Response(texto, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
