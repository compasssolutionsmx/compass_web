import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { postFileNames, slugFromFileName } from "./src/lib/blog-archivos";

/**
 * MAPEO DE LAS RUTAS DE SERVICIO DEL WORDPRESS LEGACY.
 *
 * Clave: el slug viejo bajo `/solucion/`. Valor: el slug nuevo bajo
 * `/servicios/`, que tiene que existir en `lib/servicios-contenido.ts`.
 *
 * DOS RUTAS VIEJAS CAEN EN EL MISMO DESTINO: `expeditado` y `prioritario`
 * apuntan las dos a `/servicios/expeditado`. En el WordPress eran dos páginas
 * distintas y aquí es una sola, así que el destino se repite a propósito.
 *
 * `/solucion/nacional` y `/solucion/internacional` NO ESTÁN EN ESTA TABLA:
 * eran páginas de rama y van al índice `/servicios` (ver `redirects()`). Las
 * rutas de `/tipo-solucion/` siguen sin regla.
 *
 * LOS SLUGS VIEJOS ESTÁN SIN VERIFICAR CONTRA EL ORIGEN. El sitemap del
 * legacy no se pudo consultar (el host entero responde 401 con Basic auth),
 * así que esta tabla es la lista que vino en la instrucción, no una lectura
 * del WordPress. Si algún slug real difiere, su regla simplemente nunca
 * coincide y esa URL sigue dando 404: hay que corregir la clave aquí.
 */
const SERVICIOS_LEGACY: Record<string, string> = {
  "transporte-maritimo-completo-fcl": "fcl",
  "transporte-maritimo-consolidado-lcl": "lcl",
  portacontenedor: "portacontenedor",
  "flat-rack": "flat-rack",
  "open-top": "open-top",
  isotanques: "isotanques",
  "roll-on-roll-off-ro-ro": "ro-ro",
  "transporte-terrestre-dedicado-ftl": "ftl",
  "transporte-terrestre-consolidado-ltl": "ltl",
  lowboy: "lowboy",
  plataformas: "plataformas",
  "unidades-con-rampa": "unidades-con-rampa",
  "almacenaje-y-distribucion": "almacenaje-y-distribucion",
  "empaque-y-embalaje": "empaque-y-embalaje",
  expeditado: "expeditado",
  prioritario: "expeditado",
  seguro: "seguro-de-carga",
  "previo-en-origen": "previo-en-origen",
};

/**
 * URLS DEL BLOG DEL WORDPRESS EN LA RAÍZ. El WordPress publicaba las notas en
 * `/<slug>` y Search Console sigue mostrando decenas de esas URLs indexadas
 * (en dos casos Google servía la vieja en lugar de la nota nueva). Cada nota
 * de hoy vive en `/blog/<slug>` con el MISMO slug, así que la regla se genera
 * desde `postFileNames()` de `lib/blog-archivos.ts`, la misma base de la que
 * `lib/blog.ts` saca el sitemap y el `generateStaticParams` del artículo: una
 * nota nueva queda cubierta sola. (No se importa `lib/blog.ts` directamente
 * porque la configuración no resuelve el alias `@/` que ese módulo usa.)
 *
 * GUARDA CONTRA COLISIONES: si un slug de nota coincidiera con una ruta real
 * de la raíz, su regla capturaría esa página. Las rutas reales salen de la
 * lista de abajo MÁS lo que haya en `src/app` y en `public` al compilar, para
 * que una página o un archivo nuevo en la raíz también quede protegido. Las
 * notas que colisionan no generan regla y se avisa en la consola del build.
 */
const RUTAS_RAIZ_RESERVADAS = new Set([
  "nosotros",
  "vacantes",
  "proveedores",
  "apartado-legal",
  "servicios",
  "blog",
  "importaciones-a-mexico",
  "api",
  "llms.txt",
  "llms-full.txt",
  "sitemap.xml",
  "robots.txt",
  ...fs
    .readdirSync(path.join(process.cwd(), "src/app"), { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => entrada.name),
  ...fs.readdirSync(path.join(process.cwd(), "public")),
]);

function redirectsBlogLegacy() {
  const slugs = postFileNames().map(slugFromFileName);
  const colisiones = slugs.filter((slug) => RUTAS_RAIZ_RESERVADAS.has(slug));
  if (colisiones.length > 0) {
    console.warn(
      `[redirects] Notas sin regla en la raíz por chocar con una ruta real: ${colisiones.join(", ")}`,
    );
  }
  return slugs
    .filter((slug) => !RUTAS_RAIZ_RESERVADAS.has(slug))
    .map((slug) => ({
      source: `/${slug}{/}?`,
      destination: `/blog/${slug}`,
      permanent: true,
    }));
}

/**
 * Otras tres URLs del WordPress sin página equivalente: el formulario de
 * contacto, su página de agradecimiento y `/s`, el endpoint de búsqueda. Las
 * tres a la home.
 */
const LEGACY_A_HOME = ["contacto", "gracias", "s"];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Ya sólo queda el logo de ALACAT: los demás assets del WordPress
      // (logotipo de marca y los otros 3 logos de certificaciones) migraron a
      // /public.
      // TODO: eliminar este patrón en cuanto llegue alacat.png.
      {
        protocol: "https",
        hostname: "compasssolutions.com.mx",
        pathname: "/wp-content/uploads/**",
      },
      // TEMPORAL: placeholders de placehold.co.
      // TODO: eliminar este patrón cuando todas las imágenes usen assets
      // propios (`/public` o el CDN definitivo).
      // Se omite `search` a propósito porque las URLs de placehold.co llevan
      // query string (`?text=...`).
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  /**
   * 301 de las rutas de servicio del WordPress legacy hacia las nuevas.
   *
   * `permanent: true` sale como 308 y no como 301: Next usa 308 justo para
   * conservar el método de la petición, y para un buscador equivale a un 301
   * (permanente y cacheable). Es lo que documenta `redirects` de Next.
   *
   * LA BARRA FINAL FUNCIONA, PERO HOY CUESTA DOS SALTOS. Medido contra
   * `next start`: Next normaliza la barra ANTES de consultar estas reglas, así
   * que `/solucion/lowboy/` sale primero con un 308 a `/solucion/lowboy` y sólo
   * entonces cae aquí, con un segundo 308 a `/servicios/lowboy`. Las dos formas
   * llegan al mismo destino; la que trae barra encadena un salto de más.
   *
   * EL `{/}?` NO LO EVITA por sí solo: sólo entra en juego si se desactiva esa
   * normalización con `skipTrailingSlashRedirect: true`, y ese flag es GLOBAL.
   * Se probó: con él las dos formas resuelven en un salto, pero `/blog/`,
   * `/nosotros/` y las 46 notas dejan de redirigir y empiezan a responder 200
   * con y sin barra, o sea contenido duplicado en todo el sitio. El grupo
   * opcional se queda porque es la mitad correcta de la solución, pero
   * levantar el flag es una decisión de alcance del sitio, no de esta tabla.
   */
  async redirects() {
    return [
      /* Las dos ramas del legacy, al índice. VAN PRIMERO: hoy ninguna regla
         de abajo las captura (la tabla sólo tiene slugs concretos, sin
         comodín), pero así siguen ganando si algún día se añade uno. */
      ...["nacional", "internacional"].map((rama) => ({
        source: `/solucion/${rama}{/}?`,
        destination: "/servicios",
        permanent: true,
      })),
      ...Object.entries(SERVICIOS_LEGACY).map(([viejo, nuevo]) => ({
        source: `/solucion/${viejo}{/}?`,
        destination: `/servicios/${nuevo}`,
        permanent: true,
      })),
      // Después de las de /solucion/*, para no alterar su orden.
      ...redirectsBlogLegacy(),
      ...LEGACY_A_HOME.map((ruta) => ({
        source: `/${ruta}{/}?`,
        destination: "/",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
