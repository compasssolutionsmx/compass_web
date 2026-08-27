/**
 * IDENTIDAD DEL SITIO EN JSON-LD: la organización y el sitio web, declarados
 * UNA sola vez y referenciados desde todo lo demás por `@id`.
 *
 * Antes cada bloque de datos estructurados repetía la organización anidada:
 * `Service.provider` en la landing de importaciones, `Blog.publisher` en el
 * índice y `BlogPosting.publisher` en cada uno de los 41 artículos. Eran cuatro
 * definiciones distintas de la MISMA empresa, cada una con campos diferentes, y
 * ninguna con identificador: para un crawler eran cuatro organizaciones que se
 * llamaban igual.
 *
 * Ahora hay un nodo canónico con `@id` estable y el resto lo apunta con una
 * REFERENCIA DE NODO (`{"@id": ...}`). Es JSON-LD estándar y los parsers lo
 * resuelven dentro del mismo documento — por eso este bloque se pinta en el
 * layout raíz y no en una página suelta: tiene que estar presente en TODAS, o
 * las referencias quedarían colgando.
 *
 * REGLA DEL PROYECTO: nada aquí que no esté visible como texto o imagen en la
 * página. Cada campo lleva anotado de dónde sale.
 *
 * EL `siteUrl` SE RECIBE POR PARÁMETRO, no se importa. `SITE_URL` vive en
 * `app/layout.tsx` y el layout es justo quien pinta este grafo: importarlo aquí
 * cerraría un ciclo entre los dos módulos. Es el mismo patrón que ya usa
 * `buildBlogPostingJsonLd(post, siteUrl)` en `lib/blog.ts`.
 */

import { SALES_PHONE_DISPLAY } from "@/lib/site";

/**
 * Identificadores canónicos. Son URIs con fragmento, no URLs navegables: el
 * fragmento distingue la ENTIDAD (la empresa) del DOCUMENTO que habla de ella
 * (la home). Todo lo que quiera referenciarlos tiene que derivarlos de aquí,
 * para que un cambio de dominio no deje mitad de las referencias colgando.
 */
export const organizationId = (siteUrl: string) => `${siteUrl}/#organization`;
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`;

/** Referencia de nodo a la organización, para incrustar en otros bloques. */
export const organizationRef = (siteUrl: string) => ({
  "@id": organizationId(siteUrl),
});

/**
 * `@type` doble a propósito.
 *
 * `LocalBusiness` es subclase de `Organization` en Schema.org, así que declarar
 * ambos no es contradictorio: es la misma entidad vista con la precisión que
 * cada consumidor necesita. Google lee `LocalBusiness` para el panel local
 * —Compass tiene domicilio físico y está publicado en el pie— y cualquier
 * referencia que espere una `Organization` (el `publisher` de los artículos, el
 * `provider` del servicio) sigue siendo válida porque una LocalBusiness LO ES.
 *
 * La alternativa era dos nodos atados con `parentOrganization`, que duplicaría
 * nombre, logo y teléfono para describir una sola empresa con una sola oficina.
 */
function buildOrganization(siteUrl: string) {
  return {
    "@type": ["Organization", "LocalBusiness"],
    "@id": organizationId(siteUrl),
    name: "Compass Solutions",
    url: siteUrl,
    // Va como ImageObject y no como string porque es lo que piden las guías
    // de Article para `publisher.logo`. PNG y no el SVG del header/pie: las
    // directrices de Google para el logo de `Organization` en datos
    // estructurados excluyen SVG como formato soportado.
    logo: {
      "@type": "ImageObject",
      url: new URL("/brand/logotipo.jpg", siteUrl).toString(),
    },
    // Reutiliza la miniatura de Open Graph: es la foto de marca del sitio.
    image: new URL("/brand/thumbnail.jpg", siteUrl).toString(),
    // Visible y clicable en el pie, bajo "Ventas y soporte".
    telephone: SALES_PHONE_DISPLAY,
    /**
     * DESGLOSE DE LA DIRECCIÓN DEL PIE, que se pinta como una sola línea:
     * "Mitikah, Torre M, Av. Río Churubusco 601-piso 17 int 1707, Xoco,
     *  Benito Juárez, 03330 Ciudad de México, CDMX"
     * Aquí sólo se reparte en los campos de PostalAddress. No se añade ni un
     * dato que no esté en esa línea.
     */
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Mitikah, Torre M, Av. Río Churubusco 601, piso 17, int. 1707, Xoco",
      addressLocality: "Benito Juárez",
      addressRegion: "Ciudad de México",
      postalCode: "03330",
      addressCountry: "MX",
    },
    // El enlace que ya envuelve la dirección en el pie.
    hasMap: "https://maps.app.goo.gl/ipKMCtBJQzui5dMW7",
    // "Desde 2014, movemos su carga sin fronteras" — <StatsSection> en la home.
    foundingDate: "2014",
  };
}

/**
 * `WebSite` A SECAS: nombre, url y `@id`. SIN `SearchAction`.
 *
 * `SearchAction` declara que el sitio tiene un buscador con una URL de
 * resultados, y Compass no tiene buscador. Declararlo sería describir una
 * funcionalidad inexistente, que cae en la misma regla que impide meter aquí
 * datos que no se pintan. Si algún día hay `/buscar?q=`, este es el sitio donde
 * se añade.
 *
 * Sirve igual sin él: es el ancla que ata el dominio a la empresa.
 */
function buildWebSite(siteUrl: string) {
  return {
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    name: "Compass Solutions",
    url: siteUrl,
    inLanguage: "es-MX",
    publisher: organizationRef(siteUrl),
  };
}

/** Un escalón de las migas de pan. Sin `href` = página actual. */
export type Crumb = { name: string; href?: string };

/**
 * `BreadcrumbList` a partir de los MISMOS datos que pinta <Breadcrumbs>.
 *
 * Vive aquí y no en el componente para que el resto de constructores de JSON-LD
 * queden juntos, pero SÓLO lo llama <Breadcrumbs> y sólo con el array que
 * acaba de renderizar. Ese acoplamiento es deliberado: es lo que garantiza,
 * por construcción y no por disciplina, que no se declare un escalón que no
 * esté en pantalla con ese mismo texto.
 *
 * El ÚLTIMO escalón va sin `item`. Es la página actual —la que no lleva enlace
 * en el marcado—, y las guías de Google dicen expresamente que no necesita
 * destino. Así el JSON-LD refleja el HTML escalón por escalón.
 */
export function buildBreadcrumbJsonLd(items: Crumb[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.href ? { item: new URL(crumb.href, siteUrl).toString() } : {}),
    })),
  };
}

/**
 * `FAQPage` a partir de los pares que `extractFaq()` saca del propio cuerpo del
 * artículo. Nada se escribe a mano: la respuesta es el texto del MDX que se
 * está renderizando, sin sus marcas de formato.
 *
 * EXPECTATIVA REALISTA: desde agosto de 2023 Google reserva el resultado
 * enriquecido de FAQ a sitios de gobierno y salud, así que esto NO va a pintar
 * el acordeón en la SERP de un freight forwarder. Se declara porque sigue
 * siendo marcado válido que describe la página, lo consumen otros agentes y no
 * cuesta nada mantenerlo — no porque vaya a cambiar el aspecto del resultado.
 */
export function buildFaqJsonLd(
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * El grafo global, para el layout raíz. Un solo `<script>` con `@graph` en vez
 * de dos etiquetas sueltas: así los dos nodos comparten `@context` y quedan
 * declarados como parte del mismo documento semántico.
 */
export function buildSiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [buildOrganization(siteUrl), buildWebSite(siteUrl)],
  };
}
