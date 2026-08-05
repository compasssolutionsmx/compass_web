import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";

/**
 * robots.txt.
 *
 * NO BLOQUEA NADA, a propósito: hoy todo lo que responde 200 es contenido que
 * se quiere indexar. Antes de este archivo no existía robots.txt, lo que en la
 * práctica es lo mismo —permitir todo— sólo que sin declararlo y sin apuntar al
 * sitemap.
 *
 * CUANDO APAREZCA CONTENIDO EN BORRADOR habrá que volver aquí. `lib/services.ts`
 * ya marca nodos con `draft: true` y hoy eso sólo los oculta de la UI; si
 * alguno llega a tener página, su ruta tendría que entrar en `disallow` o
 * llevar `robots: { index: false }` en su metadata.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
