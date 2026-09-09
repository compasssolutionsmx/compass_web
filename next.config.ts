import type { NextConfig } from "next";

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
 * NO ENTRAN TODAVÍA `/solucion/nacional`, `/solucion/internacional` ni las
 * rutas de `/tipo-solucion/`: esas apuntarán al índice de servicios, que no
 * existe. Declararlas hoy sería redirigir a un 404.
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
    return Object.entries(SERVICIOS_LEGACY).map(([viejo, nuevo]) => ({
      source: `/solucion/${viejo}{/}?`,
      destination: `/servicios/${nuevo}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
