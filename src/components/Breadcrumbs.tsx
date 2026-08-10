import Link from "next/link";
import { buildBreadcrumbJsonLd, type Crumb } from "@/lib/jsonld";

/**
 * MIGAS DE PAN, visibles y con su `BreadcrumbList` al lado.
 *
 * El JSON-LD se genera AQUÍ, del mismo array que se acaba de pintar, y no en la
 * página. La regla del proyecto —nada declarado que no esté visible— deja de
 * depender de que alguien se acuerde: si un escalón no se renderiza, tampoco se
 * declara, porque salen los dos del mismo `items`.
 *
 * DÓNDE SE USAN: sólo en las páginas de artículo. Ver la nota de decisión en
 * `app/blog/[slug]/page.tsx`.
 *
 * ACCESIBILIDAD
 *  · `<nav aria-label>` porque hay más de un nav en la página (el del header) y
 *    sin etiqueta los dos suenan igual en el rotor de un lector de pantalla.
 *  · Lista ordenada: los escalones tienen orden y el lector lo anuncia.
 *  · El último NO es enlace y lleva `aria-current="page"`. Un enlace a la
 *    página en la que ya estás es ruido para quien navega con teclado.
 *  · Los separadores van `aria-hidden`: son decoración, y sin esto se leerían
 *    como "barra" entre cada escalón.
 */
export default function Breadcrumbs({
  items,
  siteUrl,
  className = "",
}: {
  items: Crumb[];
  siteUrl: string;
  className?: string;
}) {
  return (
    <nav aria-label="Migas de pan" className={className}>
      {/* `flex-wrap` y no truncado: el título de un artículo puede ser largo y
          cortarlo con puntos suspensivos dejaría el texto visible distinto del
          declarado en el JSON-LD. Que reparta en dos líneas es preferible. */}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
        {items.map((crumb, i) => {
          const esUltimo = i === items.length - 1;

          return (
            <li key={crumb.href ?? crumb.name} className="flex items-center">
              {esUltimo || !crumb.href ? (
                // `text-slate-700` sobre blanco: 8.6:1, muy por encima de AA.
                // Un punto más oscuro que los enlaces para señalar dónde está
                // el usuario sin recurrir a negrita, que competiría con el h1.
                <span aria-current="page" className="text-slate-700">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
                >
                  {crumb.name}
                </Link>
              )}

              {!esUltimo && (
                <span aria-hidden="true" className="ml-2 text-slate-300">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(items, siteUrl)),
        }}
      />
    </nav>
  );
}
