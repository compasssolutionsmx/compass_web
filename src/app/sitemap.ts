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
 * SÓLO ESTÁN LAS RUTAS QUE EXISTEN HOY — home, índice y artículos. Las páginas
 * de servicio no entran porque todavía no se construyen; `allServicePaths()` de
 * lib/services.ts ya está listo para cuando existan, pero listarlas ahora sería
 * mandar al crawler a un 404. Lo mismo con /nosotros, /vacantes y
 * /apartado-legal, que hoy son enlaces sin destino.
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
    ...posts.map((post) => ({
      url: new URL(postHref(post.slug), SITE_URL).toString(),
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
