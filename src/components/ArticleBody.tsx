import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { slugifyHeading } from "@/lib/blog";

/**
 * Texto plano de un nodo de React, para poder generar el `id` de un encabezado.
 * El children de un h2 puede traer <em>, <code>, etc., no sólo una cadena.
 */
function toPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toPlainText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return toPlainText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/**
 * Los `id` se calculan con el MISMO `slugifyHeading` que usa el índice lateral,
 * así que los anclas siempre coinciden.
 */
function heading(level: 2 | 3) {
  const Tag = level === 2 ? "h2" : "h3";
  const size =
    level === 2
      ? "mt-12 text-2xl md:text-3xl"
      : "mt-8 text-xl md:text-2xl";

  return function Heading({ children }: { children?: ReactNode }) {
    return (
      <Tag
        id={slugifyHeading(toPlainText(children))}
        // `scroll-mt` deja aire bajo el header fijo cuando se llega por ancla.
        className={`scroll-mt-28 font-heading font-bold text-brand-900 ${size}`}
      >
        {children}
      </Tag>
    );
  };
}

const components = {
  h2: heading(2),
  h3: heading(3),

  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mt-5 leading-relaxed text-slate-700" {...props} />
  ),

  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mt-5 list-disc space-y-2 pl-6 leading-relaxed text-slate-700"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mt-5 list-decimal space-y-2 pl-6 leading-relaxed text-slate-700"
      {...props}
    />
  ),

  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mt-6 border-l-4 border-brand-200 bg-brand-100/60 py-3 pl-5 pr-4 italic text-brand-900"
      {...props}
    />
  ),

  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-900 underline underline-offset-2 hover:no-underline"
          {...props}
        />
      );
    }
    return (
      <Link
        href={href}
        className="font-medium text-brand-900 underline underline-offset-2 hover:no-underline"
        {...props}
      />
    );
  },

  /**
   * Las imágenes del cuerpo pasan por next/image. Markdown no aporta medidas,
   * así que se usa `width`/`height` genéricos y el CSS manda: el alto real lo
   * fija `h-auto` sobre el ancho de la columna.
   * TODO: si una nota necesita una proporción concreta, conviene usar el
   * componente <Image> directamente dentro del MDX en vez de `![]()`.
   */
  img: ({ src, alt }: ComponentPropsWithoutRef<"img">) =>
    typeof src === "string" ? (
      <Image
        src={src}
        alt={alt ?? ""}
        width={1200}
        height={800}
        sizes="(min-width: 1024px) 46rem, 100vw"
        className="mt-8 h-auto w-full rounded-2xl"
      />
    ) : null,

  hr: () => <hr className="mt-10 border-slate-200" />,
};

export default function ArticleBody({ source }: { source: string }) {
  return (
    // `max-w-[68ch]` mantiene la línea en el rango cómodo de lectura
    // (~65-75 caracteres) aunque la columna sea más ancha.
    <div className="max-w-[68ch]">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
