import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plane, Ship, Truck, Warehouse } from "lucide-react";
import Eyebrow from "./Eyebrow";
import {
  SCOPE_BRANCHES,
  TRANSVERSAL,
  publishedModes,
  servicePath,
  type ScopeBranch,
  type ServiceOption,
} from "@/lib/services";

/**
 * La sección ya no lista soluciones sueltas: comunica cobertura, y todo su
 * contenido se deriva del árbol de `lib/services.ts`. Los nombres de servicio
 * no se escriben aquí — si el árbol cambia, esta sección cambia sola.
 *
 * TODO(páginas): ninguna de las rutas que arma `servicePath()` existe todavía.
 * Los enlaces quedan listos para cuando se construyan.
 */

const [INTERNACIONAL, NACIONAL] = SCOPE_BRANCHES;

function mode(branch: ScopeBranch, slug: string) {
  const found = branch.modes.find((m) => m.slug === slug);
  if (!found) throw new Error(`Modo desconocido: ${branch.slug}/${slug}`);
  return found;
}

function optionNames(options: ServiceOption[], count: number): string[] {
  return options.slice(0, count).map((option) => option.name);
}

/** Cuántos chips caben sin que la tarjeta se desborde. */
const MAX_CHIPS = 4;

/**
 * Chips de un modo. Si el modo no tiene opciones —hoy el aéreo, punto (b) por
 * confirmar— se cae a las ramas donde ese modo existe, que también sale del
 * árbol. El resto sobrante se resume en un "+N".
 */
function chipsFor(modeSlug: string, options: ServiceOption[]) {
  if (options.length === 0) {
    return {
      chips: SCOPE_BRANCHES.filter((b) =>
        publishedModes(b).some((m) => m.slug === modeSlug),
      ).map((b) => b.name),
      rest: 0,
    };
  }
  return {
    chips: optionNames(options, MAX_CHIPS),
    rest: Math.max(0, options.length - MAX_CHIPS),
  };
}

const MARITIMO = mode(INTERNACIONAL, "maritimo");
const TERRESTRE = mode(INTERNACIONAL, "terrestre");
const AEREO_INT = mode(INTERNACIONAL, "aereo");

/**
 * Fila 1 — una tarjeta por rama de alcance. Las viñetas son los modos
 * PUBLICABLES de cada rama con sus opciones más representativas al lado. El
 * cabotaje nacional no aparece: sigue marcado como `draft` en el árbol.
 */
/**
 * El copy es de marketing y vive AQUÍ, no en `services.ts`: el árbol describe
 * la arquitectura de servicios, no el mensaje comercial. Los chips sí salen del
 * árbol — son los modos publicables de cada rama, así que el cabotaje nacional
 * no aparece mientras siga en `draft`.
 */
const SCOPE_COPY: Record<string, string> = {
  "servicio-internacional":
    "Traemos tu carga desde China, Estados Unidos y cualquier parte del mundo, y llevamos tus exportaciones a donde tu negocio necesite crecer. Importación y exportación por aire, mar y tierra, con despacho aduanal y un solo punto de contacto.",
  "servicio-nacional":
    "Movemos tu mercancía a cualquier rincón de México con la seguridad y los tiempos que tu operación exige. Cobertura terrestre y aérea nacional, flota propia y monitoreo en tiempo real de principio a fin.",
};

const SCOPE_CARDS = [INTERNACIONAL, NACIONAL].map((branch) => ({
  branch,
  href: servicePath(branch.slug),
  copy: SCOPE_COPY[branch.slug],
  chips: publishedModes(branch).map((m) => m.name),
}));

/**
 * Fila 2 — los cuatro modos. Son transversales a las dos ramas, pero el árbol
 * cuelga cada modo DENTRO de una rama, así que no existe un nodo de modo sin
 * alcance al que enlazar.
 * TODO(cliente): decidir si el mega-menú necesita ese nivel global. De momento
 * apuntan a la rama internacional, que es la del catálogo completo.
 */
const MODE_CARDS = [
  {
    icon: Ship,
    name: MARITIMO.name,
    href: servicePath(INTERNACIONAL.slug, MARITIMO.slug),
    image: { src: "/servicios/transporte-maritimo-fcl.webp", w: 1920, h: 960 },
    ...chipsFor(MARITIMO.slug, MARITIMO.options),
  },
  {
    icon: Truck,
    name: TERRESTRE.name,
    href: servicePath(INTERNACIONAL.slug, TERRESTRE.slug),
    image: { src: "/servicios/transporte-terrestre-ltl.webp", w: 1080, h: 720 },
    ...chipsFor(TERRESTRE.slug, TERRESTRE.options),
  },
  {
    icon: Plane,
    name: AEREO_INT.name,
    href: servicePath(INTERNACIONAL.slug, AEREO_INT.slug),
    image: { src: "/servicios/transportacion-aerea.webp", w: 1080, h: 720 },
    ...chipsFor(AEREO_INT.slug, AEREO_INT.options),
  },
  {
    icon: Warehouse,
    name: TRANSVERSAL.name,
    href: servicePath(TRANSVERSAL.slug),
    // Sin foto. En vez de dejar la tarjeta a medias, usa el degradado de marca
    // con EXACTAMENTE el mismo formato que las otras tres: así se lee como
    // parte del set y no como la que falta.
    // TODO: si llega foto de almacén, se cablea aquí y el resto no cambia.
    image: null,
    ...chipsFor(TRANSVERSAL.slug, TRANSVERSAL.options),
  },
];

export default function ServicesGrid() {
  return (
    <section id="soluciones" className="mx-auto max-w-7xl px-6 py-20">
      <Eyebrow className="mb-3 text-center">Servicios y soluciones</Eyebrow>
      <h2 className="mb-4 text-center font-heading text-3xl font-bold text-brand-900 md:text-4xl">
        Un socio. Todas las soluciones.
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-center text-slate-500">
        En Compass Solutions brindamos soluciones logísticas globales y locales
        que permiten el crecimiento de pequeñas y grandes empresas. No importa
        desde ni a donde quieras llegar, nosotros lo podemos lograr.
      </p>

      {/* ---- Fila 1: las dos ramas de alcance, protagonistas ---- */}
      <ul className="grid gap-6 md:grid-cols-2">
        {SCOPE_CARDS.map(({ branch, href, copy, chips }) => (
          <li key={branch.slug}>
            <Link
              href={href}
              className="group brand-gradient flex h-full flex-col rounded-3xl p-7 transition-shadow duration-300 hover:shadow-2xl hover:shadow-brand-950/25 md:p-8"
            >
              {/* Título a la izquierda y el enlace en la esquina superior
                  derecha. Antes el enlace cerraba la tarjeta y el copy llevaba
                  `flex-1` para empujarlo abajo: ese `flex-1` era el hueco
                  muerto. Al subir el enlace, el contenido se compacta solo. */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-heading text-2xl font-bold text-white md:text-3xl">
                  {branch.name}
                </h3>

                <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 font-heading text-sm font-semibold text-white">
                  Ver servicios
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-250 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:-translate-y-[3px] motion-safe:group-hover:translate-x-[3px]"
                  />
                </span>
              </div>

              {/* `flex-1` vive ahora aquí y no en el copy: iguala la altura de
                  las dos tarjetas dejando que los chips queden al ras de abajo,
                  sin abrir un hueco en medio. */}
              <p className="mt-5 flex-1 text-brand-50">{copy}</p>

              {/* Mismas pastillas que las tarjetas de modo de abajo, para que
                  las dos filas hablen el mismo idioma visual. */}
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>

      {/* ---- Fila 2: los cuatro modos, en formato póster ----
          El aspecto fija la altura de las cuatro: antes crecían según el largo
          de su lista y la fila quedaba despareja. Era `3/4` (retrato alto) y
          estiraba la sección de más; `aspect-square` recorta ~25% de altura y
          la foto sigue teniendo presencia porque el bloque de texto sólo ocupa
          la franja de abajo. */}
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MODE_CARDS.map((card) => (
          <li key={card.name}>
            <Link
              href={card.href}
              className={`group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-white/15 transition-[border-color,box-shadow] duration-300 hover:border-brand-300 hover:shadow-2xl hover:shadow-brand-950/30 ${
                card.image ? "" : "brand-gradient"
              }`}
            >
              {card.image && (
                /* `alt=""`: la foto es decorativa y el nombre del servicio ya
                   está en el <h3>. Darle texto duplicaría el anuncio del enlace. */
                <Image
                  src={card.image.src}
                  alt=""
                  width={card.image.w}
                  height={card.image.h}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:scale-105"
                />
              )}

              {/* Velo de abajo hacia arriba. Al 95% en la franja del contenido
                  garantiza el texto sin importar qué traiga la foto: medido
                  contra el píxel más claro de las tres, 15.6:1. */}
              {card.image && (
                <div className="absolute inset-0 bg-linear-to-t from-brand-950/95 via-brand-950/55 to-transparent" />
              )}

              <div className="relative p-5">
                <card.icon
                  aria-hidden="true"
                  className="mb-2 h-5 w-5 text-brand-200"
                />
                <h3 className="font-heading text-lg font-bold text-white">
                  {card.name}
                </h3>

                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {card.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
                    >
                      {chip}
                    </li>
                  ))}
                  {card.rest > 0 && (
                    <li className="rounded-full px-2.5 py-1 text-[11px] font-medium text-brand-100">
                      +{card.rest} más
                    </li>
                  )}
                </ul>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
