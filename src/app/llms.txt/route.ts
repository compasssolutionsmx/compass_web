import { SITE_URL } from "@/app/layout";
import { BLOG_CATEGORIES, getAllPosts, postHref } from "@/lib/blog";
import {
  GRUPOS_SERVICIOS,
  getServicioBySlug,
} from "@/lib/servicios-contenido";

/**
 * /llms.txt: el índice del sitio para modelos, según llmstxt.org (H1, resumen
 * en blockquote y secciones H2 con listas de enlaces).
 *
 * SE GENERA DE LAS MISMAS FUENTES QUE EL SITIO, sin listas a mano:
 *  - Servicios: `GRUPOS_SERVICIOS` (agrupación y orden) y
 *    `lib/servicios-contenido.ts` (título y descripción). Un servicio nuevo en
 *    la agrupación aparece aquí solo.
 *  - Blog: `getAllPosts()`, agrupado por `category` en el orden de
 *    `BLOG_CATEGORIES`. Una categoría nueva sale con su propio nombre como
 *    encabezado, sin tocar este archivo.
 *
 * TODO TEXTO DE AQUÍ ES TEXTO VISIBLE EN EL SITIO. Las descripciones de las
 * páginas sin fuente de datos (Empresa, Optional) y el resumen están copiados
 * literalmente de la página que se indica junto a cada uno. Si cambia el copy
 * de esa página, hay que cambiarlo aquí.
 *
 * LA DESCRIPCIÓN DE CADA SERVICIO es la primera oración de su
 * `seoDescripcion`, la misma línea que pinta su tarjeta en /servicios. La
 * `seoDescripcion` completa sólo vive en la meta description, y en tres
 * servicios su segunda oración no aparece como texto visible en ninguna
 * página.
 */
export const dynamic = "force-static";

const url = (ruta: string) => new URL(ruta, SITE_URL).toString();

const enlace = (titulo: string, ruta: string, descripcion: string) =>
  `- [${titulo}](${url(ruta)}): ${descripcion}`;

/** Primera oración: mismo criterio que la tarjeta de /servicios. */
function primeraOracion(texto: string): string {
  const fin = texto.search(/\.\s/);
  return fin === -1 ? texto : texto.slice(0, fin + 1);
}

function seccionServicios(): string {
  const grupos = GRUPOS_SERVICIOS.map((grupo) => {
    const lineas = grupo.servicios.map((slug) => {
      const servicio = getServicioBySlug(slug);
      if (!servicio) throw new Error(`/llms.txt: slug desconocido "${slug}"`);
      return enlace(
        servicio.heroTitulo,
        `/servicios/${slug}`,
        primeraOracion(servicio.seoDescripcion),
      );
    });
    return [`### ${grupo.nombre}`, ``, ...lineas].join("\n");
  });

  return [
    `## Servicios`,
    ``,
    // Hero e índice de /servicios (app/servicios/page.tsx).
    enlace(
      "Servicios de logística y transporte de carga",
      "/servicios",
      "Coordinamos importaciones y exportaciones por aire, mar y tierra bajo un mismo techo, conectando los puertos, aeropuertos y corredores terrestres donde se mueve su carga.",
    ),
    ``,
    grupos.join("\n\n"),
  ].join("\n");
}

function seccionBlog(): string {
  const posts = getAllPosts();

  // Se recorre BLOG_CATEGORIES y no las categorías presentes en las notas: el
  // orden lo manda la lista declarada. Una categoría sin notas no imprime
  // encabezado vacío.
  const categorias = BLOG_CATEGORIES.map((categoria) => {
    const delGrupo = posts.filter((post) => post.category === categoria);
    if (!delGrupo.length) return null;
    return [
      `### ${categoria}`,
      ``,
      ...delGrupo.map((post) =>
        enlace(post.title, postHref(post.slug), post.description),
      ),
    ].join("\n");
  }).filter(Boolean);

  return [`## Blog`, ``, categorias.join("\n\n")].join("\n");
}

export function GET(): Response {
  /* Resumen: oraciones literales del hero de /servicios y del bloque
     "Desde 2014" de la home (<YearsBanner>). La oración de certificación ISO
     se conserva tal cual: depende de una confirmación del cliente pendiente. */
  const texto = `# Compass Solutions

> Compass Solutions es un freight forwarder con una oferta integral de servicios en tres ejes principales: aéreo, terrestre y marítimo. Coordinamos su logística internacional, con despacho aduanal y gestión documental, bajo un solo punto de contacto.

Desde 2014, movemos su carga sin fronteras. Nacimos como freight forwarder especializado en transporte aéreo y hoy coordinamos importaciones y exportaciones por aire, mar y tierra bajo un mismo techo, con despacho aduanal, gestión documental y un departamento de calidad que respalda cada embarque. Está en proceso de certificación bajo ISO 9001 e ISO 28000.

El texto completo de las páginas de servicio y de las notas del blog está en ${url("/llms-full.txt")}

${seccionServicios()}

${seccionBlog()}

## Empresa

${enlace("Nuestra compañía", "/nosotros", "Compass Solutions nació en febrero de 2014 como un freight forwarder, iniciando operaciones con servicios aéreos y de importación terrestre inbound. Su política de seguridad y calidad se traduce en diez compromisos concretos.")}
${enlace("Importe y exporte con su freight forwarder experto en México", "/importaciones-a-mexico", "Simplificamos sus importaciones logísticas a México mediante soluciones integrales 360° que garantizan la eficiencia operativa que su compañía necesita.")}
${enlace("Trabaje en Compass Solutions", "/vacantes", "Buscamos perfiles para las áreas de operación, servicio a cliente y administración, dentro de nuestras soluciones aéreas, marítimas y terrestres, respaldados por más de 12 años de experiencia en logística internacional.")}
${enlace("Conviértase en proveedor", "/proveedores", "Operamos con una red de aliados que sostiene el movimiento de carga de nuestros clientes: transportistas, almacenes, agentes aduanales y servicios especializados.")}

## Optional

${enlace("Apartado legal", "/apartado-legal", "Aviso de privacidad y política de seguridad.")}
`;

  return new Response(texto, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
