/**
 * Pipeline del blog: los artículos son archivos .mdx dentro del repo, sin CMS
 * ni servicios externos. El frontmatter lo parsea gray-matter.
 *
 * Todo lo de aquí toca el sistema de archivos, así que sólo corre en servidor.
 * Como se consume desde componentes de servidor sin `dynamic`, las rutas se
 * generan estáticas en build (SSG).
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { organizationRef } from "@/lib/jsonld";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

/**
 * CATEGORÍAS VÁLIDAS, declaradas en un solo sitio. Antes `category` era un
 * string libre en cada .mdx: un typo creaba una categoría nueva en silencio y
 * nadie se enteraba hasta verla suelta en el filtro del índice.
 *
 * Mismo patrón que `lib/services.ts`: la lista manda y el contenido se valida
 * contra ella. Añadir una categoría es añadirla aquí; el tipo y el filtro del
 * índice se enteran solos.
 */
export const BLOG_CATEGORIES = [
  "Comercio exterior",
  "Logística internacional",
  "Transporte terrestre",
  "Transporte aéreo",
  "Operación y almacén",
  "Tecnología",
  "Actualidad",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type PostFrontmatter = {
  title: string;
  /**
   * Title tag alternativo, sólo para SEO. Cuando existe manda en el <title> y
   * en nada más: el <h1> del artículo, la tarjeta del índice y el `headline`
   * del JSON-LD siguen usando `title`.
   *
   * Existe porque un buen H1 y un buen title tag no siempre son la misma frase:
   * el H1 puede permitirse ser largo y conversacional, mientras que el title se
   * corta a ~60 caracteres en el resultado de búsqueda y conviene que abra con
   * la keyword. Sin este campo, cambiar uno obligaba a cambiar el otro.
   */
  seoTitle?: string;
  description: string;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  /**
   * ISO `YYYY-MM-DD`. OPCIONAL: sólo se pone cuando un artículo YA PUBLICADO se
   * revisa de verdad. Si falta, `dateModified` del JSON-LD cae en `date`, que
   * es la verdad para una nota que no se ha tocado desde que salió.
   *
   * POR QUÉ A MANO Y NO DERIVADO. Se evaluaron las dos fuentes automáticas y
   * las dos mienten:
   *
   *  - `fs.mtime`: en Vercel el repo se clona limpio en cada build, así que
   *    todos los archivos traen la marca del checkout. Publicaría los 41
   *    artículos como "actualizados hoy" en cada despliegue.
   *  - `git log -1 -- archivo`: aquí el blog entero entró en un par de commits
   *    masivos, así que git fecha las 41 notas el 2026-08-08 y el 2026-08-09
   *    aunque su `date` vaya de 2025 a 2026. Encima Vercel clona con historial
   *    recortado, así que en cuanto un archivo lleve unos commits sin tocarse
   *    la consulta vuelve vacía y haría falta un fallback igualmente.
   *
   * Un campo opcional no obliga a mantener nada en los 41 archivos existentes:
   * hoy ninguno lo lleva y todos declaran una fecha correcta. Sólo se escribe
   * el día que se corrija un artículo, que es exactamente cuando el dato
   * importa.
   */
  updated?: string;
  author: string;
  category: BlogCategory;
  cover: string;
  coverAlt: string;
  keywords: string[];
  /**
   * OPT-IN al bloque `FAQPage`. Sólo marca que el artículo está redactado en
   * forma de preguntas y respuestas; QUÉ preguntas entran lo decide
   * `extractFaq()` leyendo el cuerpo, no este campo.
   *
   * Es opt-in y no automático porque "tener encabezados con signo de
   * interrogación" no es lo mismo que "ser un FAQ". Hay notas con una pregunta
   * retórica de titular —"El Día Mundial del Comercio Justo es un espejo: ¿qué
   * reflejan sus operaciones?"— que cumplen todas las reglas mecánicas y aun
   * así nadie las escribe en un buscador. Esa criba es editorial y se hace
   * aquí, artículo por artículo.
   */
  faq?: boolean;
};

/** Lo que necesita el listado: frontmatter + slug, sin el cuerpo. */
export type PostSummary = PostFrontmatter & { slug: string };

/** Lo que necesita la página del artículo: además el cuerpo MDX en crudo. */
export type Post = PostSummary & { content: string };

/**
 * Un solo sitio construye las URLs de artículo.
 *
 * TODO(decidir en el paso de la página de artículo): el sitio actual en
 * WordPress publica los posts en la raíz (`/funciones-agente-aduanal-mexico`),
 * no bajo `/blog/`. Mantener esas URLs conservaría el SEO ya indexado, pero
 * obliga a una ruta dinámica en la raíz que convive con /nosotros, /vacantes,
 * etc. La alternativa es `/blog/[slug]` + redirects 301 desde las viejas.
 * Mientras se decide, todo pasa por aquí y cambiarlo es una línea.
 */
export function postHref(slug: string): string {
  return `/blog/${slug}`;
}

function parsePost(fileName: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  // Se valida en BUILD y se revienta, en vez de dejar pasar la categoría rara.
  // Esto corre en `readAll`, o sea durante la generación estática: un .mdx con
  // un typo tira el build con el nombre del archivo y la lista buena, que es
  // mucho mejor que publicar una categoría huérfana que el filtro del índice
  // pintaría como una pill más.
  if (!BLOG_CATEGORIES.includes(frontmatter.category)) {
    throw new Error(
      `[blog] ${fileName}: categoría "${frontmatter.category}" no está declarada. ` +
        `Las válidas son: ${BLOG_CATEGORIES.join(", ")}. ` +
        `Si la categoría es nueva, añádela a BLOG_CATEGORIES en lib/blog.ts.`,
    );
  }

  return {
    ...frontmatter,
    slug: fileName.replace(/\.mdx$/, ""),
    content,
  };
}

function readAll(): Post[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(parsePost)
    .sort((a, b) => b.date.localeCompare(a.date)); // más reciente primero
}

/** Listado para el índice. Devuelve el frontmatter sin el cuerpo. */
export function getAllPosts(): PostSummary[] {
  return readAll().map(({ content, ...summary }) => {
    void content; // el índice no necesita el cuerpo
    return summary;
  });
}

/** Un artículo por slug, con su cuerpo MDX. `null` si no existe. */
export function getPostBySlug(slug: string): Post | null {
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(BLOG_DIR, file))) return null;
  return parsePost(file);
}

/** Para el `generateStaticParams` de la página de artículo. */
export function getAllPostSlugs(): string[] {
  return readAll().map((post) => post.slug);
}

/**
 * Fecha legible. Se fuerza `timeZone: "UTC"` porque las fechas del frontmatter
 * son `YYYY-MM-DD` y se parsean como medianoche UTC: sin fijar la zona, un
 * build en husos negativos mostraría el día anterior.
 */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * Encabezado del cuerpo del artículo, para el índice lateral.
 *
 * `isFaq`: true cuando este encabezado es una de las preguntas que
 * `extractFaq()` capturó efectivamente para el mismo contenido. No es una
 * heurística propia — se calcula llamando a `extractFaq()` y comparando el
 * texto, así que un <h2> con forma de pregunta que `extractFaq()` descarte
 * (por tener un <h3> anidado, una respuesta corta, o mencionar la marca)
 * queda con `isFaq: false` igual que cualquier encabezado que no es pregunta.
 */
export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
  isFaq: boolean;
};

/**
 * AQUÍ VIVÍA `bindHeadingTail`, la protección anti-huérfanos del <h1> de
 * artículo. Se movió a `lib/typography.ts` como `bindTail` y se generalizó:
 * este módulo importa `node:fs` y gray-matter, así que tenerla aquí la dejaba
 * fuera del alcance de los componentes cliente y de cualquier página que no
 * fuera la de artículo. El peor caso medido para los títulos del blog (195px a
 * 24px contra los 272px de un viewport de 320) sigue documentado allí.
 */

/**
 * ANCLAS CONGELADAS: encabezados cuyo texto cambió DESPUÉS de publicarse y que
 * conservan a la fuerza el `id` que ya tenían.
 *
 * El slug sale del texto, así que reescribir un encabezado cambia su ancla y
 * rompe cualquier enlace externo —compartido por chat, guardado en marcadores,
 * citado desde fuera— que apuntara a esa sección. Aquí se declara el id viejo
 * para el texto nuevo y el ancla sobrevive a la corrección de copy.
 *
 * La clave es el TEXTO NUEVO, tal cual queda en el .mdx. Al añadir una entrada,
 * copiar el id anterior literal — no volver a derivarlo del texto viejo.
 */
const ANCLAS_CONGELADAS: Record<string, string> = {};

/**
 * Slug de un encabezado. Se usa en DOS sitios que deben coincidir: el `id` que
 * se pinta en el <h2>/<h3> del cuerpo y el `href` del índice. Por eso vive aquí
 * y no duplicado en cada componente — y por eso la tabla de anclas congeladas
 * se consulta AQUÍ DENTRO: así los dos consumidores heredan el override sin que
 * ninguno tenga que acordarse de aplicarlo.
 */
export function slugifyHeading(text: string): string {
  const congelada = ANCLAS_CONGELADAS[text.trim()];
  if (congelada) return congelada;

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // fuera acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Encabezados H2 y H3 del cuerpo MDX, en orden.
 *
 * Se saltan los bloques de código para no confundir un `## comentario` de
 * dentro de un fence con un encabezado real.
 *
 * `isFaq` se resuelve llamando a `extractFaq()` sobre el mismo `content` y
 * comparando el texto: es la MISMA función que decide qué entra al
 * `FAQPage`, así que el índice y el JSON-LD nunca pueden divergir sobre qué
 * cuenta como pregunta. `extractFaq()` está declarada más abajo en este
 * archivo, pero al ser un `function` con hoisting puede llamarse aquí sin
 * problema.
 *
 * `faq` es EL MISMO flag opt-in de `PostFrontmatter.faq` que decide si la
 * página pinta el `FAQPage`. Sin él en `true`, `extractFaq()` ni se llama: un
 * artículo sin `faq: true` puede tener un `<h2>` que cumpla mecánicamente las
 * reglas de pregunta (empieza en "¿", sin H3 anidado, respuesta larga) sin
 * que el autor lo haya escrito como FAQ, y ese encabezado debe seguir
 * navegable en el índice igual que hasta ahora. El día que el artículo SÍ
 * declare `faq: true`, el índice y el `FAQPage` vuelven a mirar exactamente
 * el mismo conjunto de preguntas.
 */
export function extractHeadings(content: string, faq: boolean): Heading[] {
  const headings: Omit<Heading, "isFaq">[] = [];
  let insideFence = false;

  for (const line of content.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(line.trim());
    if (!match) continue;

    const text = match[2].trim();
    headings.push({
      id: slugifyHeading(text),
      text,
      level: match[1].length === 2 ? 2 : 3,
    });
  }

  const faqQuestions = new Set(
    faq ? extractFaq(content).map((item) => item.question) : [],
  );

  return headings.map((heading) => ({
    ...heading,
    isFaq: faqQuestions.has(heading.text),
  }));
}

/**
 * JSON-LD `BlogPosting` para la página de cada artículo.
 *
 * REGLA: todo lo que va aquí tiene que estar VISIBLE en la página. Título,
 * descripción, fecha, autor y portada se pintan en el hero del artículo, así
 * que el schema no declara nada oculto.
 */
/** Una pregunta del FAQ con su respuesta ya en texto plano. */
export type FaqItem = { question: string; answer: string };

/**
 * Markdown -> texto plano, para que `acceptedAnswer.text` diga EXACTAMENTE lo
 * que el lector ve.
 *
 * Se quitan las marcas, no las palabras: `**negrita**` pierde los asteriscos y
 * `[ancla](/url)` se queda con el ancla, que es justo lo que se pinta en
 * pantalla.
 *
 * LOS NÚMEROS DE LISTA TAMBIÉN SE VAN, y esto costó una vuelta: el `1.` de un
 * `<ol>` no es texto del documento, lo pinta el navegador como marcador de
 * lista desde CSS. Conservarlo dejaba la respuesta declarada distinta de la
 * que un lector —o un parser leyendo el texto de la página— puede encontrar
 * ahí. Lo destapó la comprobación de que cada respuesta aparezca literal en el
 * HTML renderizado: fallaban exactamente las cinco que llevaban lista numerada.
 */
function toPlainAnswer(lines: string[]): string {
  return lines
    .map((line) =>
      line
        .replace(/^\s*(?:[-*]|\d+\.)\s+/, "") // viñeta o numeral de lista
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // enlace -> su ancla
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/(^|\W)[*_]([^*_]+)[*_](?=\W|$)/g, "$1$2")
        .replace(/`([^`]+)`/g, "$1")
        .trim(),
    )
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Un H2 es el WRAPPER de un bloque de preguntas frecuentes —"Preguntas
 * frecuentes", "Preguntas frecuentes sobre X"— cuando sus preguntas reales
 * cuelgan de él como H3, una por una.
 *
 * EL CRITERIO ES UN `startsWith`, no "contiene la palabra pregunta", y es a
 * propósito: un barrido de las 42 notas encontró dos H2 que mencionan
 * "preguntas" sin ser un bloque de FAQ —"Cinco preguntas para su operador
 * logístico" y "3 preguntas para saber si su empresa está lista", ambos
 * prompts retóricos para que el LECTOR se autoevalúe, sin H3 debajo— y las
 * siete variantes reales de wrapper en el blog empiezan todas, literal, con
 * "Preguntas frecuentes". Un `includes` habría tratado esos dos prompts como
 * wrapper y les habría anulado su propia captura por el patrón H2 antiguo.
 */
function esWrapperDePreguntas(textoH2: string): boolean {
  return textoH2.trim().toLowerCase().startsWith("preguntas frecuentes");
}

/**
 * Pares pregunta/respuesta aptos para `FAQPage`, sacados del propio cuerpo.
 *
 * NO HAY UNA LISTA DE RESPUESTAS ESCRITA A MANO EN NINGÚN SITIO, y es
 * deliberado: la regla del proyecto exige que lo declarado esté visible con el
 * mismo texto, y la única forma de garantizarlo sin depender de que alguien
 * mantenga dos copias sincronizadas es derivar la respuesta del MDX que se
 * renderiza. Si el artículo cambia, el JSON-LD cambia con él.
 *
 * DOS PATRONES DE ORIGEN PARA UNA PREGUNTA, LOS MISMOS CUATRO CRITERIOS DE
 * VALIDACIÓN PARA LAS DOS:
 *
 *  A. H2 suelto, sin H3 anidado (patrón original). La pregunta es el propio
 *     H2 y la respuesta es todo lo que cuelga de él hasta el siguiente H2.
 *  B. H2 wrapper (`esWrapperDePreguntas`) seguido de H3 — cada H3 es una
 *     pregunta independiente y su respuesta es el texto que cuelga de ESE H3
 *     hasta el siguiente H3 o hasta que termine el bloque. El wrapper mismo
 *     NUNCA se evalúa como pregunta, sin importar cómo esté redactado.
 *
 * En los dos casos, una pregunta (el H2 suelto, o cada H3 dentro del
 * wrapper) califica cuando:
 *
 *  1. Es una pregunta de verdad: abre con "¿" o cierra con "?".
 *  2. En el patrón A, el H2 NO tiene H3 dentro. Si la sección se subdivide,
 *     la respuesta está repartida y meterla entera en un `acceptedAnswer`
 *     aplana una sección completa en un párrafo. Es el caso que descarta
 *     "¿Qué es CTPAT?", que cuelga de un H3 la definición. En el patrón B
 *     esta regla no aplica al H3 individual —es justo el nivel que SÍ se
 *     captura—, pero el wrapper con un H3 que a su vez tuviera un H4 quedaría
 *     fuera de alcance: este archivo no usa H4 en ningún lado.
 *  3. Su respuesta llega a 25 palabras. Por debajo es un rótulo con dos
 *     líneas de entradilla, no una respuesta.
 *  4. No nombra la marca. "¿Cómo lo hacemos en Compass Solutions?" y sus
 *     variantes son cierre comercial, no información: Google pide que el FAQ
 *     sea contenido de ayuda y marcar publicidad como tal es justo lo que se
 *     sanciona.
 */
export function extractFaq(content: string): FaqItem[] {
  const items: FaqItem[] = [];

  // Patrón A: la pregunta directa en H2.
  let actual: { question: string; buf: string[]; h3: number } | null = null;

  // Patrón B: dentro de un H2 wrapper, cada H3 abre su propia pregunta.
  let enWrapper = false;
  let subActual: { question: string; buf: string[] } | null = null;

  let insideFence = false;

  const validar = (question: string, buf: string[]): FaqItem | null => {
    const answer = toPlainAnswer(buf);
    const esPregunta = question.startsWith("¿") || question.endsWith("?");
    const nombraMarca = /compass solutions/i.test(question);

    if (esPregunta && !nombraMarca && answer.split(" ").length >= 25) {
      return { question, answer };
    }
    return null;
  };

  const cerrarSub = () => {
    if (!subActual) return;
    const item = validar(subActual.question, subActual.buf);
    if (item) items.push(item);
    subActual = null;
  };

  // Cierra lo que esté abierto, sea el H2 del patrón A o el H3 en curso del
  // patrón B. Se llama al llegar a CUALQUIER H2 nuevo: eso es lo que termina
  // un bloque wrapper, igual que termina una pregunta suelta.
  const cerrar = () => {
    if (enWrapper) {
      cerrarSub();
      return;
    }
    if (!actual) return;
    if (actual.h3 === 0) {
      const item = validar(actual.question, actual.buf);
      if (item) items.push(item);
    }
    actual = null;
  };

  for (const line of content.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      insideFence = !insideFence;
      if (enWrapper) {
        if (subActual) subActual.buf.push(line);
      } else if (actual) {
        actual.buf.push(line);
      }
      continue;
    }

    if (!insideFence) {
      const match = /^(#{2,3})\s+(.*)$/.exec(line.trim());
      if (match) {
        if (match[1] === "##") {
          cerrar();
          const texto = match[2].trim();
          enWrapper = esWrapperDePreguntas(texto);
          // El wrapper nunca se rastrea como pregunta propia: `actual` se
          // queda en null mientras `enWrapper` es true.
          actual = enWrapper ? null : { question: texto, buf: [], h3: 0 };
          continue;
        }
        // H3
        if (enWrapper) {
          cerrarSub();
          subActual = { question: match[2].trim(), buf: [] };
        } else if (actual) {
          actual.h3++;
        }
        continue;
      }
    }

    if (enWrapper) {
      if (subActual) subActual.buf.push(line);
    } else if (actual) {
      actual.buf.push(line);
    }
  }
  cerrar();

  return items;
}

export function buildBlogPostingJsonLd(post: PostSummary, siteUrl: string) {
  const url = new URL(postHref(post.slug), siteUrl).toString();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    // El artículo como ENTIDAD, distinto de la página que lo contiene. El
    // fragmento es lo que separa las dos cosas: `#article` es el texto,
    // `mainEntityOfPage` apunta al documento.
    "@id": `${url}#article`,
    url,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    // Cae en `date` cuando el artículo no se ha revisado. Ver `updated` en
    // PostFrontmatter para por qué este dato no se deriva de git ni del mtime.
    dateModified: post.updated ?? post.date,
    image: new URL(post.cover, siteUrl).toString(),
    /**
     * MISMA EMPRESA, MISMO NODO. Los 41 artículos declaran `author: "Compass
     * Solutions"`, que es exactamente la organización del layout: dejarlo como
     * `Organization` anónima creaba una copia sin `@id` por artículo — el mismo
     * problema que se acaba de arreglar en `publisher`, sólo que 41 veces.
     *
     * El condicional NO es decorativo: `author` viene del frontmatter y el día
     * que una nota la firme una persona, referenciar la empresa sería atribuirle
     * el texto a quien no lo escribió. Si el nombre no es el de la casa, se
     * declara el autor tal cual venga.
     */
    author:
      post.author === "Compass Solutions"
        ? organizationRef(siteUrl)
        : { "@type": "Person", name: post.author },
    // REFERENCIA al nodo del layout raíz, que sí trae logo, teléfono y
    // domicilio. Antes era una `Organization` suelta con sólo `name`: sin logo
    // no calificaba para el resultado enriquecido de artículo, y al no tener
    // `@id` era una cuarta copia de la empresa que nadie podía unificar.
    publisher: organizationRef(siteUrl),
    keywords: post.keywords.join(", "),
    // Forma canónica. Era un string suelto: Schema.org lo admite como `URL`,
    // pero los ejemplos de Google usan el objeto y así queda explícito que el
    // destino es la PÁGINA, no otra entidad.
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}
