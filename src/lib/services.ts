/**
 * ARQUITECTURA DE INFORMACIÓN DE SERVICIOS — fuente única de verdad.
 *
 * De aquí salen (o deben salir) el nav, el mega-menú, los breadcrumbs, los
 * links internos y, cuando existan, las páginas de servicio. Ninguna de esas
 * páginas está construida todavía: esto es sólo el árbol.
 *
 * Los slugs se guardan por SEGMENTO, no como rutas completas, y la ruta la arma
 * `servicePath()`. Así, si mañana cambia el patrón de URL, se cambia en un solo
 * sitio en vez de en cada nodo.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PENDIENTE DE CONFIRMAR CON EL CLIENTE — tres puntos abiertos:
 *
 *  (a) MARÍTIMO NACIONAL / CABOTAJE. La rama nacional tiene el modo marítimo
 *      declarado pero SIN opciones, porque no está confirmado que Compass opere
 *      cabotaje. Si no lo opera, hay que borrar el modo entero de la rama
 *      nacional; si sí, hay que llenar sus opciones.
 *
 *  (b) OPCIONES AÉREAS. Ninguna de las dos ramas tiene opciones bajo aéreo: la
 *      información de partida sólo describe el modo ("carga aérea internacional"
 *      y "carga aérea nacional por vuelos comerciales"), sin desglose. Falta
 *      saber si el aéreo se desglosa en opciones —como el marítimo y el
 *      terrestre— o si es una sola página por rama.
 *
 *  (c) OPCIONES REPETIDAS EN AMBAS RAMAS. LTL, FTL, Lowboy, Plataformas y
 *      Unidades con Rampa aparecen idénticas en internacional y en nacional.
 *      Tal como está modelado hoy son NODOS DISTINTOS con rutas distintas
 *      (.../servicio-internacional/terrestre/ltl y
 *       .../servicio-nacional/terrestre/ltl), o sea dos páginas separadas.
 *      Hay que decidir si es eso lo que se quiere o si deben ser una sola
 *      página compartida. Es una decisión con impacto de SEO: dos páginas casi
 *      idénticas compiten entre sí salvo que el contenido difiera de verdad.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Hoja del árbol: una opción concreta dentro de un modo de transporte. */
export type ServiceOption = {
  /** Segmento de URL. Único dentro de su modo. */
  slug: string;
  name: string;
  /** Sólo se rellena cuando la información de partida lo aporta. */
  description?: string;
};

/** Modo de transporte dentro de una rama de alcance. */
export type TransportMode = {
  slug: string;
  name: string;
  description?: string;
  options: ServiceOption[];
  /**
   * `true` mientras el nodo no esté confirmado con el cliente. La UI pública
   * NO debe mostrarlo. Es una marca explícita en vez de deducirlo del texto de
   * `description`, que sería frágil.
   */
  draft?: boolean;
};

/** Rama de primer nivel: el alcance del servicio. */
export type ScopeBranch = {
  slug: string;
  name: string;
  modes: TransportMode[];
};

/** Modos publicables de una rama: descarta los que siguen sin confirmar. */
export function publishedModes(branch: ScopeBranch): TransportMode[] {
  return branch.modes.filter((mode) => !mode.draft);
}

/** Grupo que no cuelga de ninguna rama de alcance. */
export type ServiceGroup = {
  slug: string;
  name: string;
  description?: string;
  options: ServiceOption[];
};

/** Opciones terrestres. Idénticas en las dos ramas — ver el punto (c). */
const OPCIONES_TERRESTRES: ServiceOption[] = [
  { slug: "ltl", name: "LTL", description: "Consolidado" },
  { slug: "ftl", name: "FTL", description: "Dedicado" },
  { slug: "lowboy", name: "Lowboy" },
  { slug: "plataformas", name: "Plataformas" },
  { slug: "unidades-con-rampa", name: "Unidades con rampa" },
];

/** Las dos ramas de alcance. */
export const SCOPE_BRANCHES: ScopeBranch[] = [
  {
    slug: "servicio-internacional",
    name: "Servicio internacional",
    modes: [
      {
        slug: "maritimo",
        name: "Marítimo",
        options: [
          { slug: "portacontenedor", name: "Portacontenedor" },
          {
            slug: "fcl",
            name: "FCL",
            description: "Transporte marítimo completo",
          },
          {
            slug: "lcl",
            name: "LCL",
            description: "Transporte marítimo consolidado",
          },
          { slug: "flat-rack", name: "Flat Rack" },
          { slug: "open-top", name: "Open Top" },
          { slug: "isotanques", name: "Isotanques" },
          { slug: "ro-ro", name: "Ro-Ro", description: "Roll-on/Roll-off" },
        ],
      },
      {
        slug: "aereo",
        name: "Aéreo",
        description: "Carga aérea internacional",
        // TODO(cliente) — punto (b): sin desglose confirmado.
        options: [],
      },
      {
        slug: "terrestre",
        name: "Terrestre",
        options: OPCIONES_TERRESTRES,
      },
    ],
  },
  {
    slug: "servicio-nacional",
    name: "Servicio nacional",
    modes: [
      {
        slug: "maritimo",
        name: "Marítimo",
        // TODO(cliente) — punto (a): ¿opera Compass cabotaje? Si no, este modo
        // se elimina de la rama nacional.
        description: "Cabotaje — por confirmar",
        draft: true,
        options: [],
      },
      {
        slug: "aereo",
        name: "Aéreo",
        description: "Carga aérea nacional por vuelos comerciales",
        // TODO(cliente) — punto (b): sin desglose confirmado.
        options: [],
      },
      {
        slug: "terrestre",
        name: "Terrestre",
        options: OPCIONES_TERRESTRES,
      },
    ],
  },
];

/**
 * Transversal: aplica a las dos ramas y no cuelga de ninguna, así que va fuera
 * del árbol de alcance y no lleva prefijo de rama en su ruta.
 */
export const TRANSVERSAL: ServiceGroup = {
  slug: "almacenaje",
  name: "Almacenaje",
  options: [
    { slug: "almacenaje-y-distribucion", name: "Almacenaje y distribución" },
    { slug: "empaque-y-embalaje", name: "Empaque y embalaje" },
  ],
};

/** Valor agregado: sección aparte del árbol principal. */
export const VALOR_AGREGADO: ServiceGroup = {
  slug: "valor-agregado",
  name: "Valor agregado",
  options: [
    {
      // Antes eran dos nodos. Se fusionaron para que el árbol coincida con la
      // tarjeta ya fusionada del home.
      slug: "prioritario-expeditado",
      name: "Servicio prioritario / expeditado",
      description:
        "Soluciones para urgencias y paros de línea, con la mejor opción en tiempos y rutas y cotización en menos de 3 horas.",
    },
    { slug: "seguro", name: "Seguro" },
    { slug: "previo-en-origen", name: "Previo en origen" },
  ],
};

/**
 * Arma la ruta de cualquier nodo a partir de sus segmentos.
 *
 * TODO: el prefijo `/servicios` es una propuesta, no está confirmado. El sitio
 * actual en WordPress publica bajo `/tipo-solucion/...`; decidir si se conserva
 * ese patrón por SEO o se migra con redirects. Al pasar todo por esta función,
 * el cambio es de una línea.
 */
export function servicePath(...segments: string[]): string {
  return `/servicios/${segments.join("/")}`;
}

/**
 * Todas las rutas del árbol, aplanadas. Sirve para el `generateStaticParams` y
 * el sitemap cuando existan las páginas.
 *
 * OJO: hoy incluye los duplicados del punto (c) — LTL, FTL, Lowboy, Plataformas
 * y Unidades con Rampa salen dos veces, una por rama, con rutas distintas.
 */
export function allServicePaths(): string[] {
  const paths: string[] = [];

  for (const branch of SCOPE_BRANCHES) {
    paths.push(servicePath(branch.slug));
    for (const mode of branch.modes) {
      paths.push(servicePath(branch.slug, mode.slug));
      for (const option of mode.options) {
        paths.push(servicePath(branch.slug, mode.slug, option.slug));
      }
    }
  }

  for (const group of [TRANSVERSAL, VALOR_AGREGADO]) {
    paths.push(servicePath(group.slug));
    for (const option of group.options) {
      paths.push(servicePath(group.slug, option.slug));
    }
  }

  return paths;
}
