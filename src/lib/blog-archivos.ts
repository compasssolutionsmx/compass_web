import fs from "node:fs";
import path from "node:path";

/**
 * QUÉ ARCHIVOS SON NOTAS DEL BLOG, sin parsearlas. Es la base de la que salen
 * el índice, el sitemap y el `generateStaticParams` del artículo (vía
 * `lib/blog.ts`) y también los redirects de las URLs del WordPress en la raíz
 * (vía `next.config.ts`).
 *
 * VIVE APARTE Y SIN IMPORTS DEL PROYECTO a propósito: `next.config.ts` se
 * transpila por separado y no resuelve el alias `@/` en los módulos que
 * importa (medido: `lib/blog.ts` revienta el build al pedir `@/lib/jsonld`).
 * Este módulo sólo usa `node:fs` y `node:path`, así que lo pueden importar los
 * dos sin duplicar la regla de qué cuenta como nota.
 */
export const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

/** Nombres de archivo `.mdx` del directorio del blog. */
export function postFileNames(): string[] {
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
}

/** Slug de cada nota: el nombre del archivo sin `.mdx`. */
export function slugFromFileName(fileName: string): string {
  return fileName.replace(/\.mdx$/, "");
}
