import Image from "next/image";
import Link from "next/link";
import { Plane, Ship, Truck, Warehouse } from "lucide-react";
import Eyebrow from "./Eyebrow";
import { SCOPE_BRANCHES, publishedModes } from "@/lib/services";
import { gruposServicios } from "@/lib/servicios-contenido";

/**
 * Sección de soluciones de la home.
 *
 * FILA 1 (las dos ramas de alcance) sigue saliendo del árbol de
 * `lib/services.ts`. No hay páginas de rama (`/solucion/nacional` y
 * `/solucion/internacional` redirigen al índice), así que el título de cada
 * tarjeta enlaza al destino más cercano —la landing de importaciones para la
 * internacional y el grupo terrestre del índice para la nacional— y cada chip
 * de modo a su grupo en `/servicios`.
 *
 * FILA 2 (las cuatro tarjetas de modo) sale de `GRUPOS_SERVICIOS`, la
 * agrupación oficial de `lib/servicios-contenido.ts`, la misma del índice, el
 * mega menú y el footer. El título de cada tarjeta enlaza a
 * `/servicios#<grupo>` y cada chip a `/servicios/<slug>`, con TODOS los
 * servicios del grupo (ya no hay "+N más").
 *
 * SIN ENLACES ANIDADOS: la tarjeta no es un <Link>. El enlace al grupo es el
 * <h3> y los chips son enlaces hermanos, no hijos de otro enlace.
 */

const [INTERNACIONAL, NACIONAL] = SCOPE_BRANCHES;

/**
 * El copy es de marketing y vive AQUÍ, no en `services.ts`: el árbol describe
 * la arquitectura de servicios, no el mensaje comercial. Los chips sí salen del
 * árbol — son los modos publicables de cada rama, así que el cabotaje nacional
 * no aparece mientras siga en `draft`.
 */
const SCOPE_COPY: Record<string, string> = {
  "servicio-internacional":
    "Traemos su carga desde China, Estados Unidos y cualquier parte del mundo, y llevamos sus exportaciones a donde su negocio necesite crecer. Importación y exportación por aire, mar y tierra, con despacho aduanal y un solo punto de contacto.",
  "servicio-nacional":
    "Movemos su mercancía a cualquier rincón de México con la seguridad y los tiempos que su operación exige. Cobertura terrestre y aérea nacional, flota propia y monitoreo en tiempo real de principio a fin.",
};

/** Destino del título de cada tarjeta de rama. */
const SCOPE_HREF: Record<string, string> = {
  "servicio-internacional": "/importaciones-a-mexico",
  "servicio-nacional": "/servicios#terrestre",
};

/** Grupo de `GRUPOS_SERVICIOS` al que lleva cada modo del árbol. */
const GRUPO_POR_MODO: Record<string, string> = {
  maritimo: "maritimo",
  aereo: "aereo-y-urgentes",
  terrestre: "terrestre",
};

const SCOPE_CARDS = [INTERNACIONAL, NACIONAL].map((branch) => ({
  branch,
  href: SCOPE_HREF[branch.slug],
  copy: SCOPE_COPY[branch.slug],
  chips: publishedModes(branch).map((m) => {
    const grupo = GRUPO_POR_MODO[m.slug];
    if (!grupo) throw new Error(`ServicesGrid: modo sin grupo "${m.slug}"`);
    return { nombre: m.name, href: `/servicios#${grupo}` };
  }),
}));

/** Mismo chip en las dos filas: 14px, 44px de alto, hover y foco visibles. */
const CHIP_CLASS =
  "inline-flex min-h-11 items-center rounded-full bg-white/15 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-brand-900 focus-visible:bg-white focus-visible:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** Título enlazado de una tarjeta (el <h3> contiene el enlace, no al revés). */
const TITLE_LINK_CLASS =
  "rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * Ícono y foto de cada grupo, por slug de `GRUPOS_SERVICIOS`. El nombre y los
 * servicios salen de la agrupación oficial; aquí sólo va lo visual.
 */
const VISUAL_POR_GRUPO: Record<
  string,
  {
    icon: typeof Ship;
    image: { src: string; w: number; h: number } | null;
  }
> = {
  maritimo: {
    icon: Ship,
    image: { src: "/servicios/transporte-maritimo-fcl.webp", w: 1920, h: 960 },
  },
  terrestre: {
    icon: Truck,
    image: { src: "/servicios/transporte-terrestre-ltl.webp", w: 1080, h: 720 },
  },
  "aereo-y-urgentes": {
    icon: Plane,
    image: { src: "/servicios/transportacion-aerea.webp", w: 1080, h: 720 },
  },
  // Sin foto: degradado de marca con el mismo formato que las otras tres.
  "almacenaje-y-valor-agregado": { icon: Warehouse, image: null },
};

const MODE_CARDS = gruposServicios().map((grupo) => {
  const visual = VISUAL_POR_GRUPO[grupo.slug];
  if (!visual) throw new Error(`ServicesGrid: grupo sin visual "${grupo.slug}"`);
  return { ...grupo, ...visual };
});

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
        desde ni a donde quiera llegar, nosotros lo podemos lograr.
      </p>

      {/* ---- Fila 1: las dos ramas de alcance, protagonistas ---- */}
      <ul className="grid gap-6 md:grid-cols-2">
        {SCOPE_CARDS.map(({ branch, href, copy, chips }) => (
          <li key={branch.slug}>
            {/* La tarjeta NO es un enlace: enlazan el título (dentro del
                <h3>) y cada chip, como hermanos, sin enlaces anidados. */}
            <div className="brand-gradient flex h-full flex-col rounded-3xl p-7 md:p-8">
              <h3 className="font-heading text-2xl font-bold text-white md:text-3xl">
                <Link href={href} className={TITLE_LINK_CLASS}>
                  {branch.name}
                </Link>
              </h3>

              {/* `flex-1` vive ahora aquí y no en el copy: iguala la altura de
                  las dos tarjetas dejando que los chips queden al ras de abajo,
                  sin abrir un hueco en medio. */}
              <p className="mt-5 flex-1 text-brand-50">{copy}</p>

              {/* Mismas pastillas que las tarjetas de modo de abajo, para que
                  las dos filas hablen el mismo idioma visual. */}
              <ul className="mt-6 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li key={chip.href}>
                    <Link href={chip.href} className={CHIP_CLASS}>
                      {chip.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      {/* ---- Fila 2: los cuatro modos, en formato póster ----
          `aspect-square` da la altura mínima de las cuatro; la que necesite
          más (por sus chips) crece, y el `h-full` iguala la fila. */}
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MODE_CARDS.map((card) => (
          <li key={card.slug}>
            {/* La tarjeta NO es un enlace: el título enlaza al grupo y los
                chips a cada servicio, como hermanos.

                `aspect-square` es la altura MÍNIMA: la tarjeta crece si los
                chips no caben (el grupo marítimo y el terrestre llevan seis).
                Por eso el `overflow-hidden` y el redondeo viven en la capa de
                la foto y no aquí: con `overflow-hidden` en la tarjeta, el
                aspecto fijaría el alto y recortaría los chips. */}
            <div
              className={`relative flex aspect-square h-full flex-col justify-end rounded-2xl border border-white/15 ${
                card.image ? "" : "brand-gradient"
              }`}
            >
              {card.image && (
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  {/* `alt=""`: la foto es decorativa y el nombre del grupo
                      ya está en el <h3>. */}
                  <Image
                    src={card.image.src}
                    alt=""
                    width={card.image.w}
                    height={card.image.h}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                  {/* Velo de abajo hacia arriba. Al 95% en la franja del
                      contenido garantiza el texto sin importar qué traiga la
                      foto: medido contra el píxel más claro de las tres,
                      15.6:1. */}
                  <div className="absolute inset-0 bg-linear-to-t from-brand-950/95 via-brand-950/55 to-transparent" />
                </div>
              )}

              <div className="relative p-5">
                <card.icon
                  aria-hidden="true"
                  className="mb-2 h-5 w-5 text-brand-200"
                />
                <h3 className="font-heading text-lg font-bold text-white">
                  <Link
                    href={`/servicios#${card.slug}`}
                    className={TITLE_LINK_CLASS}
                  >
                    {card.nombre}
                  </Link>
                </h3>

                {/* Chips: 14px de texto y 44px de alto mínimo, el mínimo
                    táctil. Hover y foco visibles sobre la foto. */}
                <ul className="mt-3 flex flex-wrap gap-2">
                  {card.servicios.map((servicio) => (
                    <li key={servicio.slug}>
                      <Link
                        href={`/servicios/${servicio.slug}`}
                        className={CHIP_CLASS}
                      >
                        {servicio.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
