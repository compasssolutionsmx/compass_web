import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";
import { getAllPosts, postHref } from "@/lib/blog";

/**
 * Sitemap generado en build, no una lista escrita a mano.
 *
 * Los artículos salen de `getAllPosts()`, que es la misma función que alimenta
 * el índice y las rutas estáticas: añadir un .mdx a src/content/blog lo mete
 * aquí solo, sin tocar este archivo. De ahí sale también `lastModified`, con la
 * fecha del frontmatter.
 *
 * SÓLO ESTÁN LAS RUTAS QUE EXISTEN HOY — home, índice, artículos,
 * /importaciones-a-mexico, /proveedores, /vacantes y /nosotros. Las páginas de
 * servicio no entran porque todavía no se construyen; `allServicePaths()` de
 * lib/services.ts ya está listo para cuando existan, pero listarlas ahora sería
 * mandar al crawler a un 404.
 *
 * /apartado-legal SÍ existe pero queda fuera a propósito: lleva
 * `robots: { index: false }` mientras el aviso sea un borrador, y listar en el
 * sitemap una URL que se pide no indexar es darle al crawler dos órdenes
 * opuestas.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const ultimoPost = posts.reduce<string | undefined>(
    (masReciente, post) =>
      !masReciente || post.date > masReciente ? post.date : masReciente,
    undefined,
  );

  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: new URL("/blog", SITE_URL).toString(),
      // El índice cambia cuando se publica una nota, así que su fecha es la del
      // artículo más reciente.
      lastModified: ultimoPost,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      /**
       * FALTABA. Es una página indexable —declara `robots: index, follow`
       * explícito—, con canonical y datos estructurados propios, y encima es el
       * destino del tráfico pagado. Quedó fuera de la lista cuando se creó, así
       * que el rastreo programado nunca la veía: sólo llegaba a ella siguiendo
       * enlaces.
       *
       * Prioridad alta, por debajo sólo de la home: es una landing de campaña,
       * no una página de servicio al negocio como las dos de abajo.
       */
      url: new URL("/importaciones-a-mexico", SITE_URL).toString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Prioridad baja a propósito en las dos: son páginas de servicio al
    // negocio, no contenido por el que se quiera competir en búsqueda.
    {
      url: new URL("/proveedores", SITE_URL).toString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: new URL("/vacantes", SITE_URL).toString(),
      // Cambia cada vez que se publica o se retira una vacante en
      // lib/vacantes.ts, que es más seguido que el resto de estas páginas.
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      // Prioridad más alta que las otras dos: es contenido institucional —
      // historia, misión y política de seguridad—, no un formulario de servicio.
      url: new URL("/nosotros", SITE_URL).toString(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    ...posts.map((post) => ({
      url: new URL(postHref(post.slug), SITE_URL).toString(),
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
