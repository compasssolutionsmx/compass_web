/**
 * CONTENIDO DE LAS PÁGINAS DE SERVICIO — fuente única de su copy.
 *
 * Una entrada por página bajo `/servicios/<slug>`. La ruta dinámica
 * `app/servicios/[slug]/page.tsx` saca de aquí sus `generateStaticParams`, su
 * metadata y todo el texto que pinta; los componentes de
 * `components/servicios/` reciben ese texto por props y ya no traen copy
 * propio.
 *
 * SEPARADO DEL ÁRBOL DE `lib/services.ts` A PROPÓSITO. Ese archivo modela la
 * arquitectura de información (ramas de alcance, modos, opciones anidadas) y
 * sus rutas salen de `servicePath()`, que anida por rama y por modo. Estas 18
 * páginas son PLANAS bajo `/servicios/` y su lista de slugs vino dada por la
 * tarea, no derivada del árbol. Los dos modelos conviven sin tocarse hasta que
 * se decida el esquema de URL definitivo, que es una tarea aparte que
 * `lib/services.ts` ya documenta.
 *
 * DONDE LOS DOS MODELOS NO COINCIDEN (para quien tenga que reconciliarlos):
 *  - `carga-aerea` aquí es UNA página; el árbol tiene el modo `aereo` en cada
 *    rama, los dos sin opciones y pendientes de confirmar con el cliente.
 *  - `expeditado` aquí; `prioritario-expeditado` en el árbol.
 *  - `seguro-de-carga` aquí; `seguro` en el árbol.
 *  - LTL, FTL, Lowboy, Plataformas y Unidades con rampa: el árbol los duplica
 *    en las dos ramas de alcance; aquí hay UNA sola página por servicio.
 *  - Aquí sólo hay hojas. Las ramas de alcance y los grupos (`almacenaje`,
 *    `valor-agregado`) no tienen página propia en esta lista.
 *  - `servicio-nacional/maritimo` (cabotaje, en draft) no tiene página aquí.
 *
 * EL COPY DE LAS 18 ENTRADAS YA ES REAL. Entró en tres tandas (las cinco
 * terrestres, las siete marítimas y las seis restantes) y no queda ni un
 * marcador de posición en este archivo. La regla para comprobarlo de un
 * vistazo sigue sirviendo al revés: si algún texto de aquí vuelve a traer
 * corchetes, es que quedó a medias.
 *
 * LO QUE SIGUE PENDIENTE SON LAS IMÁGENES. Las tres de cada página (el hero y
 * una por bloque alternado) son todavía las cajas con borde punteado que
 * traen los componentes, sin archivo real detrás. Los números de la banda de
 * métricas siguen igual: el componente pinta "Pendiente" porque `ServicioMetrica`
 * no lleva cifra.
 *
 * LAS 18 PÁGINAS YA SON INDEXABLES. El `noindex, nofollow` que llevaban se
 * puso cuando el texto era de relleno y se retiró al quedar el copy real:
 * `app/servicios/[slug]/page.tsx` ya no declara `robots` (hereda el indexable
 * por defecto) y `app/sitemap.ts` las lista derivándolas de
 * `allServicioSlugs()`. Cada una conserva su `canonical`, que ahora ya no
 * contradice a nada.
 *
 * QUEDAN DOS COSAS DE ESA MISMA LISTA, y ahora pesan más porque las páginas
 * ya se pueden indexar:
 *  - LOS ENLACES INTERNOS. Ninguna navegación del sitio apunta a estas rutas:
 *    ni el nav, ni el pie (que sigue listando `/tipo-solucion/*` como texto
 *    inerte), ni el blog. Un buscador sólo llega a ellas por el sitemap.
 *  - EL ARTE Y LAS CIFRAS. Los componentes de `components/servicios/` siguen
 *    pintando sus marcadores: las tres cajas de imagen con borde punteado, el
 *    "Pendiente" de la banda de métricas y los dos textos entre corchetes de
 *    <ServiceFaq> y <RelatedServicesCarousel>. Este archivo ya no tiene ni un
 *    marcador, pero la página renderizada sí.
 */

/** Uno de los dos bloques alternados de imagen y texto. */
export type ServicioBloque = {
  eyebrow: string;
  titulo: string;
  parrafo: string;
};

/**
 * Una de las tres tarjetas de la banda de métricas.
 *
 * `cifra` ES OPCIONAL Y HOY NO LA TRAE NINGUNA DE LAS 18 ENTRADAS. Mientras
 * falte, <ServiceMetrics> no renderiza la sección: antes pintaba la palabra
 * "Pendiente" en lugar del número, que es un marcador visible en una página
 * ya indexable. El día que el cliente confirme números reales, se escriben
 * aquí y la banda aparece sola, sin tocar el componente.
 *
 * NO SE INVENTA NI SE PONE UN 0 DE RELLENO: un cero se leería como un dato
 * real y negativo, y la regla del proyecto es que ningún dato salga sin venir
 * del cliente o de fuente oficial.
 */
export type ServicioMetrica = {
  nombre: string;
  descripcion: string;
  cifra?: string;
};

/** Una de las tres preguntas frecuentes de la página. */
export type ServicioPregunta = {
  pregunta: string;
  respuesta: string;
};

/**
 * El contenido completo de una página de servicio.
 *
 * `bloques`, `metricas` y `preguntas` son TUPLAS de longitud fija (2, 3 y 3),
 * no arrays sueltos: el diseño de la plantilla tiene exactamente esos huecos
 * —dos bloques alternados separados por la banda de certificaciones, tres
 * tarjetas en una rejilla `sm:grid-cols-3`, tres preguntas— y una entrada con
 * una métrica de menos o cuatro preguntas rompería la maqueta. Con tuplas eso
 * lo atrapa el compilador al escribir el contenido, no el navegador al
 * revisarlo.
 */
export type ServicioContenido = {
  /** Segmento de URL. Único en la lista. La ruta es `/servicios/<slug>`. */
  slug: string;
  /** Categoría real del servicio. Va como Eyebrow, encima del <h1>. */
  heroEyebrow: string;
  /** Título del hero, el <h1> de la página. Real en las 18 entradas. */
  heroTitulo: string;
  heroParrafo: string;
  /** Sin el sufijo de marca: se lo añade la página. */
  seoTitulo: string;
  seoDescripcion: string;
  bloques: [ServicioBloque, ServicioBloque];
  /** Título de la banda de métricas. */
  metricasTitulo: string;
  metricas: [ServicioMetrica, ServicioMetrica, ServicioMetrica];
  /**
   * Rótulo <h2> de la sección de preguntas. TIENE QUE EMPEZAR por "Preguntas
   * frecuentes": ese prefijo es el que reconoce `extractFaq()` (lib/blog.ts) y
   * es lo que haría que la marcación calce el día que estas páginas ganen su
   * propio pipeline de datos estructurados.
   */
  preguntasRotulo: string;
  preguntas: [ServicioPregunta, ServicioPregunta, ServicioPregunta];
};

export const SERVICIOS: ServicioContenido[] = [
  {
    slug: "fcl",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "FCL: contenedor marítimo completo",
    heroParrafo:
      "Cuando el volumen justifica un contenedor entero, el FCL es la opción más eficiente en costo por unidad y la más segura para la mercancía. Su carga viaja sola, sellada desde origen, sin consolidación ni desconsolidación en el camino. Compass coordina la naviera, el despacho aduanal y el transporte terrestre hasta su almacén.",
    seoTitulo: "FCL: contenedor completo para importación y exportación",
    seoDescripcion:
      "Servicio FCL con contenedor exclusivo para su carga. Coordinamos naviera, despacho aduanal y entrega hasta su almacén.",
    bloques: [
      {
        eyebrow: "Contenedor exclusivo",
        titulo: "Un solo sello desde origen hasta destino",
        parrafo:
          "En un embarque FCL el contenedor se cierra en la planta de origen y se abre en destino. No hay manipulación intermedia ni carga de terceros compartiendo espacio. Eso reduce el riesgo de daño, de faltante y de contaminación cruzada, y simplifica la revisión aduanera porque el contenido corresponde a un solo embarcador.",
      },
      {
        eyebrow: "Operación completa",
        titulo: "De la naviera a su almacén, con un solo interlocutor",
        parrafo:
          "Un embarque marítimo tiene varios eslabones: reserva con la naviera, documentación, despacho aduanal a través de agente y transporte terrestre desde puerto. Compass coordina todos y responde por el conjunto, para que usted no tenga que perseguir a cuatro proveedores cuando algo se mueve de fecha.",
      },
    ],
    metricasTitulo: "El impacto de FCL en su operación",
    metricas: [
      {
        nombre: "Puertos atendidos",
        descripcion:
          "Cobertura en los principales puertos de contenedores del país.",
      },
      {
        nombre: "Coordinación puerta a puerta",
        descripcion:
          "Naviera, aduana y transporte terrestre en una sola operación.",
      },
      {
        nombre: "Visibilidad del embarque",
        descripcion:
          "Seguimiento desde la reserva hasta la entrega en destino.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre FCL",
    preguntas: [
      {
        pregunta: "¿Cuándo conviene FCL frente a LCL?",
        respuesta:
          "El FCL conviene cuando el volumen se acerca a llenar un contenedor, cuando la mercancía no admite manipulación adicional o cuando el tiempo de tránsito es crítico. Por debajo de cierto volumen, el costo de un contenedor completo deja de justificarse frente al consolidado.",
      },
      {
        pregunta: "¿Qué tamaños de contenedor existen?",
        respuesta:
          "Los más utilizados en comercio internacional son el de veinte pies y el de cuarenta pies, este último también en versión de mayor altura. La elección depende del volumen y del peso de la carga, ya que un contenedor puede llenarse por espacio antes que por peso o al revés.",
      },
      {
        pregunta: "¿Compass realiza el despacho aduanal?",
        respuesta:
          "El despacho lo realiza un agente aduanal, que es la figura autorizada para ello. Compass coordina al agente, reúne la documentación necesaria y da seguimiento al proceso, de modo que usted trate con un solo interlocutor durante toda la operación.",
      },
    ],
  },
  {
    slug: "lcl",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "LCL: transporte marítimo consolidado",
    heroParrafo:
      "No todo embarque justifica un contenedor completo. El servicio LCL le permite pagar solo por el volumen que ocupa su carga, compartiendo contenedor con otros embarques hacia el mismo destino. Es la puerta de entrada al comercio marítimo para volúmenes que no llenan un contenedor.",
    seoTitulo: "LCL: carga marítima consolidada desde origen",
    seoDescripcion:
      "Servicio LCL para embarques que no llenan un contenedor. Consolidación en origen, despacho aduanal y entrega coordinada.",
    bloques: [
      {
        eyebrow: "Costo por volumen",
        titulo: "Pague por lo que embarca, no por el contenedor",
        parrafo:
          "En un embarque consolidado el flete se calcula por metro cúbico o por tonelada, según cuál resulte mayor. Para volúmenes pequeños y medianos esa diferencia frente al contenedor completo es sustancial, y permite importar con frecuencia sin acumular inventario esperando llenar un contenedor.",
      },
      {
        eyebrow: "Consolidación y desconsolidación",
        titulo: "Los puntos donde el consolidado se gana o se pierde",
        parrafo:
          "La carga se consolida en origen y se desconsolida en destino, y en cada uno de esos puntos hay manipulación y tiempo. Un embalaje adecuado y una documentación correcta evitan que su embarque sea el que retrasa al contenedor completo. Compass coordina ambos extremos y le informa el estado real de cada etapa.",
      },
    ],
    metricasTitulo: "El impacto de LCL en su operación",
    metricas: [
      {
        nombre: "Orígenes consolidados",
        descripcion:
          "Frecuencia de salidas desde los principales orígenes de importación.",
      },
      {
        nombre: "Volumen mínimo",
        descripcion:
          "Servicio disponible para embarques que no llenan un contenedor.",
      },
      {
        nombre: "Seguimiento por embarque",
        descripcion:
          "Trazabilidad individual dentro de un contenedor compartido.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre LCL",
    preguntas: [
      {
        pregunta: "¿Cómo se cobra el flete en un embarque LCL?",
        respuesta:
          "Se cobra por metro cúbico o por tonelada, aplicando el que resulte mayor entre volumen y peso. Por eso una carga ligera pero voluminosa puede costar más de lo esperado. Conocer las medidas y el peso real antes de cotizar evita diferencias entre lo presupuestado y lo facturado.",
      },
      {
        pregunta: "¿Cuánto más tarda un embarque LCL que uno FCL?",
        respuesta:
          "El tránsito marítimo es el mismo, la diferencia está en los extremos. La consolidación en origen espera a completar el contenedor y la desconsolidación en destino toma días adicionales. Ese tiempo se estima al cotizar según el origen y la frecuencia de salidas.",
      },
      {
        pregunta: "¿Qué embalaje requiere la carga consolidada?",
        respuesta:
          "La mercancía debe soportar manipulación en consolidación y desconsolidación, y convivir con carga de terceros. Eso implica tarima en buen estado, embalaje resistente a estiba y marcado visible. Compass revisa estos requisitos antes del embarque para evitar rechazos o daños.",
      },
    ],
  },
  {
    slug: "flat-rack",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Flat rack: carga que excede el contenedor",
    heroParrafo:
      "Cuando la mercancía no cabe por las puertas de un contenedor estándar, el flat rack resuelve. Es una plataforma con paredes en los extremos y sin techo ni laterales, que permite cargar por arriba y por los costados. Es la unidad para maquinaria, estructura y equipo de gran dimensión.",
    seoTitulo: "Flat rack: contenedor para carga sobredimensionada",
    seoDescripcion:
      "Transporte marítimo en flat rack para carga que excede las dimensiones de un contenedor estándar.",
    bloques: [
      {
        eyebrow: "Sin laterales ni techo",
        titulo: "Carga por arriba y por los costados",
        parrafo:
          "El flat rack elimina la restricción de la puerta del contenedor. La carga se coloca con grúa desde arriba o se ingresa lateralmente, lo que permite mover piezas que superan el ancho o la altura de un contenedor cerrado. Los extremos abatibles de algunos modelos amplían aún más el margen.",
      },
      {
        eyebrow: "Sujeción y sobremedida",
        titulo: "La estiba determina el costo del embarque",
        parrafo:
          "La carga en flat rack se amarra directamente a la plataforma y queda expuesta durante el tránsito. Cuando la pieza excede el largo o el ancho de la unidad, la naviera cobra el espacio adicional que bloquea. Compass calcula ese impacto antes de cotizar para que el costo real no aparezca después.",
      },
    ],
    metricasTitulo: "El impacto del flat rack en su operación",
    metricas: [
      {
        nombre: "Dimensiones admisibles",
        descripcion: "Capacidad para carga que excede el contenedor estándar.",
      },
      {
        nombre: "Cálculo de sobremedida",
        descripcion: "Estimación del espacio adicional antes de la cotización.",
      },
      {
        nombre: "Coordinación de maniobra",
        descripcion: "Grúa y sujeción gestionadas en origen y destino.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre flat rack",
    preguntas: [
      {
        pregunta: "¿Cuándo se necesita un flat rack en lugar de un contenedor?",
        respuesta:
          "Cuando la carga excede el ancho o la altura de la puerta de un contenedor estándar, o cuando por su forma no puede ingresar por la parte trasera. También cuando la pieza requiere maniobra con grúa desde arriba y no admite deslizamiento hacia el interior.",
      },
      {
        pregunta: "¿Cómo se cobra la carga que sobresale de la plataforma?",
        respuesta:
          "Cuando la pieza excede las dimensiones del flat rack, la naviera cobra los espacios contiguos que quedan bloqueados. Ese cargo se calcula según cuántas posiciones ocupa la carga en el buque, y puede modificar de forma importante el costo total del embarque.",
      },
      {
        pregunta: "¿La carga en flat rack viaja descubierta?",
        respuesta:
          "La plataforma no tiene techo ni laterales, así que la carga queda expuesta a la intemperie durante el tránsito. Cuando la mercancía lo requiere se utiliza lona o protección adicional, que debe considerarse desde el embalaje en origen.",
      },
    ],
  },
  {
    slug: "open-top",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Open top: contenedor de techo abierto",
    heroParrafo:
      "El contenedor open top conserva las paredes y el piso de un contenedor estándar, pero sustituye el techo rígido por una lona removible. Eso permite cargar con grúa desde arriba y transportar mercancía que excede la altura de la puerta. Es la opción intermedia entre el contenedor cerrado y el flat rack.",
    seoTitulo: "Open top: contenedor con techo abierto",
    seoDescripcion:
      "Transporte marítimo en contenedor open top para carga que excede la altura del contenedor estándar.",
    bloques: [
      {
        eyebrow: "Carga vertical",
        titulo: "Cuando la pieza no entra por la puerta",
        parrafo:
          "Hay carga que cabe dentro del contenedor pero no puede ingresar por la puerta trasera, sea por su altura o porque requiere maniobra vertical. El open top resuelve ese caso: se retira la lona, se carga con grúa desde arriba y se vuelve a cubrir para el tránsito.",
      },
      {
        eyebrow: "Protección y altura",
        titulo: "Paredes de contenedor con acceso superior",
        parrafo:
          "A diferencia del flat rack, el open top mantiene las cuatro paredes, lo que ofrece más protección durante el tránsito y facilita la sujeción de la carga. Cuando la mercancía sobresale por encima del marco superior, aplica un cargo por sobrealtura que Compass calcula antes de cotizar.",
      },
    ],
    metricasTitulo: "El impacto del open top en su operación",
    metricas: [
      {
        nombre: "Altura disponible",
        descripcion:
          "Capacidad para carga que no ingresa por la puerta del contenedor.",
      },
      {
        nombre: "Protección lateral",
        descripcion: "Paredes completas frente a una plataforma abierta.",
      },
      {
        nombre: "Cálculo de sobrealtura",
        descripcion: "Estimación del cargo adicional antes de la cotización.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre open top",
    preguntas: [
      {
        pregunta: "¿Qué diferencia hay entre open top y flat rack?",
        respuesta:
          "El open top conserva las cuatro paredes y solo abre el techo, mientras que el flat rack es una plataforma con paredes únicamente en los extremos. El open top protege más la carga y sirve cuando la limitación es la altura de ingreso; el flat rack sirve cuando la pieza excede también el ancho.",
      },
      {
        pregunta: "¿Se puede transportar carga que sobresale del contenedor?",
        respuesta:
          "Sí, siempre que se declare y se autorice. Cuando la mercancía sobrepasa el marco superior aplica un cargo por sobrealtura y pueden existir restricciones de estiba en el buque. Declararlo desde la cotización evita rechazos y sobrecostos en puerto.",
      },
      {
        pregunta: "¿La lona protege la carga de la lluvia?",
        respuesta:
          "La lona ofrece protección básica contra la intemperie, pero no equivale al techo rígido de un contenedor cerrado. Para mercancía sensible a la humedad se recomienda embalaje impermeable adicional, definido desde el origen del embarque.",
      },
    ],
  },
  {
    slug: "isotanques",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Isotanques: transporte de carga líquida",
    heroParrafo:
      "El isotanque es un tanque cilíndrico montado en una estructura con las dimensiones de un contenedor estándar. Permite transportar líquidos a granel por vía marítima y terrestre sin trasvase, manteniendo el producto en el mismo recipiente desde origen hasta destino.",
    seoTitulo: "Isotanques: transporte marítimo de carga líquida",
    seoDescripcion:
      "Transporte de líquidos a granel en isotanque, con la documentación y los protocolos que exige cada tipo de producto.",
    bloques: [
      {
        eyebrow: "Sin trasvase",
        titulo: "El producto viaja en un solo recipiente",
        parrafo:
          "Al conservar las dimensiones de un contenedor, el isotanque se maneja con el mismo equipo portuario y se transporta en el mismo chasis. Eso elimina el trasvase entre modos, que es donde se concentra el riesgo de contaminación, derrame y pérdida de producto.",
      },
      {
        eyebrow: "Documentación y protocolos",
        titulo: "Cada producto tiene sus requisitos",
        parrafo:
          "El transporte de líquidos a granel está regulado según la naturaleza del producto, y las mercancías peligrosas tienen requisitos específicos de clasificación, documentación y manejo. Compass verifica que el embarque cumpla con lo aplicable antes de la reserva, no cuando la carga ya está en puerto.",
      },
    ],
    metricasTitulo: "El impacto de los isotanques en su operación",
    metricas: [
      {
        nombre: "Capacidad por unidad",
        descripcion: "Volumen de producto transportado sin trasvase.",
      },
      {
        nombre: "Compatibilidad del equipo",
        descripcion: "Selección de tanque según la naturaleza del producto.",
      },
      {
        nombre: "Revisión documental",
        descripcion: "Verificación normativa previa a la reserva del embarque.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre isotanques",
    preguntas: [
      {
        pregunta: "¿Qué productos se transportan en isotanque?",
        respuesta:
          "Líquidos a granel de uso industrial y alimentario, incluyendo algunos clasificados como mercancía peligrosa. Cada producto determina el tipo de tanque, el revestimiento interior y los requisitos de manejo, por lo que la ficha técnica es el punto de partida de cualquier cotización.",
      },
      {
        pregunta: "¿El isotanque requiere limpieza entre embarques?",
        respuesta:
          "Sí. El tanque debe limpiarse y certificarse conforme al producto anterior y al siguiente, para evitar contaminación cruzada. Ese proceso tiene un costo y un tiempo que forman parte de la planeación del embarque y deben considerarse en la programación.",
      },
      {
        pregunta:
          "¿Qué documentación exige el transporte de líquidos peligrosos?",
        respuesta:
          "Depende de la clasificación del producto conforme a la normativa aplicable. En general se requiere la hoja de datos de seguridad, la clasificación correspondiente y el marcado de la unidad. Compass revisa estos elementos antes de la reserva para evitar rechazos en puerto.",
      },
    ],
  },
  {
    slug: "ro-ro",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Ro-Ro: transporte de carga rodante",
    heroParrafo:
      "Ro-Ro significa roll-on roll-off: la carga sube al buque rodando por sus propios medios y baja de la misma forma. Es el método estándar para vehículos, maquinaria autopropulsada y equipo sobre ruedas, que no requiere contenedor ni maniobra con grúa.",
    seoTitulo: "Ro-Ro: transporte marítimo de carga rodante",
    seoDescripcion:
      "Transporte en buque Ro-Ro para vehículos y maquinaria que embarca rodando, sin contenedor ni maniobra con grúa.",
    bloques: [
      {
        eyebrow: "Sin izaje",
        titulo: "La carga entra y sale rodando",
        parrafo:
          "El buque Ro-Ro tiene rampas y cubiertas continuas que permiten desplazar la carga hasta su posición de estiba. Eso elimina la maniobra con grúa, reduce el riesgo de daño por izaje y acorta los tiempos de carga y descarga frente a un embarque en contenedor.",
      },
      {
        eyebrow: "Equipo elegible",
        titulo: "Para lo que se desplaza por sus propios medios",
        parrafo:
          "El Ro-Ro está pensado para vehículos, tractores, maquinaria de construcción y equipo con tren rodante. Cuando la unidad no se desplaza por sí sola puede embarcarse sobre plataforma rodante, según el servicio. Compass valida la elegibilidad del equipo antes de reservar.",
      },
    ],
    metricasTitulo: "El impacto del Ro-Ro en su operación",
    metricas: [
      {
        nombre: "Servicios disponibles",
        descripcion:
          "Rutas con buque de carga rodante hacia los destinos requeridos.",
      },
      {
        nombre: "Tiempo de maniobra",
        descripcion: "Carga y descarga sin izaje ni contenedor.",
      },
      {
        nombre: "Validación del equipo",
        descripcion: "Revisión de elegibilidad previa a la reserva.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre Ro-Ro",
    preguntas: [
      {
        pregunta: "¿Qué carga puede embarcarse en Ro-Ro?",
        respuesta:
          "Vehículos, maquinaria autopropulsada, equipo agrícola y de construcción, y en general unidades con tren rodante que puedan desplazarse hasta su posición de estiba. Algunos servicios admiten carga estática sobre plataforma rodante, lo que se confirma según la naviera y la ruta.",
      },
      {
        pregunta: "¿El Ro-Ro es más económico que el contenedor?",
        respuesta:
          "Depende del equipo. Para unidades que ruedan, el Ro-Ro evita el costo del contenedor, del trincado y de la maniobra con grúa. Para carga que cabe holgadamente en un contenedor, el embarque convencional suele resultar más eficiente. La comparación se hace caso por caso.",
      },
      {
        pregunta: "¿La carga viaja expuesta a la intemperie?",
        respuesta:
          "Depende del buque y de la cubierta asignada. Muchos servicios cuentan con cubiertas cerradas que protegen la carga durante el tránsito. Para equipo sensible conviene confirmar el tipo de cubierta al momento de la reserva y considerar protección adicional.",
      },
    ],
  },
  {
    slug: "portacontenedor",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Transporte en buque portacontenedor",
    heroParrafo:
      "El buque portacontenedor es la columna vertebral del comercio internacional. Mueve la mayor parte de la carga que entra y sale de México por vía marítima, con salidas regulares hacia los principales orígenes y destinos. Compass coordina la reserva, la documentación y el seguimiento del embarque.",
    seoTitulo: "Transporte en buque portacontenedor",
    seoDescripcion:
      "Servicio de flete marítimo en buque portacontenedor hacia y desde los principales puertos de México.",
    bloques: [
      {
        eyebrow: "Frecuencia y rutas",
        titulo: "Salidas regulares hacia los principales orígenes",
        parrafo:
          "Las navieras operan servicios con itinerario y frecuencia establecidos, lo que permite planear con anticipación. La elección del servicio no depende solo del precio: el número de escalas, los transbordos y la confiabilidad del itinerario determinan cuándo llega realmente su carga.",
      },
      {
        eyebrow: "Reserva y documentación",
        titulo: "El espacio se asegura antes de que la carga esté lista",
        parrafo:
          "En temporadas de alta demanda el espacio en buque se agota semanas antes de la salida. Compass gestiona la reserva con anticipación y prepara la documentación en paralelo, para que un requisito faltante no deje su carga en puerto esperando el siguiente zarpe.",
      },
    ],
    metricasTitulo:
      "El impacto del transporte en portacontenedor en su operación",
    metricas: [
      {
        nombre: "Servicios disponibles",
        descripcion:
          "Opciones de naviera e itinerario según origen y urgencia.",
      },
      {
        nombre: "Anticipación de reserva",
        descripcion: "Gestión de espacio antes del cierre de documentación.",
      },
      {
        nombre: "Seguimiento del itinerario",
        descripcion: "Monitoreo de zarpe, tránsito y arribo del embarque.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre transporte en portacontenedor",
    preguntas: [
      {
        pregunta: "¿Con cuánta anticipación se debe reservar espacio?",
        respuesta:
          "Depende de la ruta y de la temporada. En periodos de alta demanda el espacio puede agotarse varias semanas antes del zarpe. La recomendación general es iniciar la reserva en cuanto se confirme la orden de compra, no cuando la mercancía ya está lista para embarcar.",
      },
      {
        pregunta: "¿Qué es un transbordo y cómo afecta mi carga?",
        respuesta:
          "Un transbordo es el cambio de contenedor de un buque a otro en un puerto intermedio. Suma tiempo al tránsito y añade un punto donde el embarque puede perder conexión. Un servicio directo cuesta más pero reduce la variabilidad del tiempo de entrega.",
      },
      {
        pregunta: "¿Qué pasa si el buque se retrasa?",
        respuesta:
          "Los retrasos de itinerario son parte de la operación marítima y pueden deberse a congestión portuaria, condiciones climáticas o cancelaciones de zarpe. Compass da seguimiento al itinerario e informa los cambios en cuanto ocurren, para que usted ajuste su planeación con tiempo.",
      },
    ],
  },
  {
    slug: "ltl",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "LTL: transporte terrestre consolidado",
    heroParrafo:
      "No toda la carga justifica una unidad completa. El servicio LTL le permite pagar solo por el espacio que ocupa su mercancía, compartiendo unidad con otros embarques que van en la misma dirección. Es la opción eficiente para volúmenes medianos con tiempos de entrega flexibles.",
    seoTitulo: "LTL: transporte terrestre consolidado",
    seoDescripcion:
      "Servicio LTL para embarques que no ocupan una unidad completa. Consolidación, seguimiento y entrega en las principales rutas del país.",
    bloques: [
      {
        eyebrow: "Costo proporcional",
        titulo: "Paga por el espacio que usa, no por la unidad completa",
        parrafo:
          "En un servicio consolidado el costo se distribuye entre los embarques que comparten la unidad. Para volúmenes que no llenan un camión, esa diferencia frente al servicio dedicado es considerable. La contrapartida es el tiempo: la carga pasa por centros de consolidación antes de llegar a destino.",
      },
      {
        eyebrow: "Manejo y trazabilidad",
        titulo: "Consolidar no significa perder el control",
        parrafo:
          "El riesgo del consolidado está en la manipulación: cada transbordo es un punto donde la carga se mueve. Compass coordina el embalaje adecuado, la documentación por embarque y el seguimiento en cada etapa, para que usted sepa dónde está su mercancía aunque viaje acompañada.",
      },
    ],
    metricasTitulo: "El impacto de LTL en su operación",
    metricas: [
      {
        nombre: "Rutas consolidadas",
        descripcion:
          "Frecuencia de salidas en los corredores de mayor demanda.",
      },
      {
        nombre: "Ahorro frente a unidad completa",
        descripcion: "Costo proporcional al espacio ocupado por su carga.",
      },
      {
        nombre: "Trazabilidad por embarque",
        descripcion:
          "Seguimiento individual aunque la unidad transporte varios embarques.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre LTL",
    preguntas: [
      {
        pregunta: "¿Cuál es el volumen mínimo para un embarque LTL?",
        respuesta:
          "El mínimo depende de la ruta y del tipo de mercancía. Como referencia general, el LTL es conveniente cuando la carga ocupa menos de la mitad de una unidad. Por encima de ese punto conviene evaluar si el servicio dedicado resulta más eficiente en costo por tonelada.",
      },
      {
        pregunta: "¿Cuánto más tarda un embarque consolidado?",
        respuesta:
          "El tránsito depende de la ruta y de la frecuencia de salidas hacia el destino. La diferencia frente a un servicio dedicado viene del paso por centros de consolidación, donde la carga espera a completar unidad. Ese tiempo se estima al cotizar, no se descubre en el camino.",
      },
      {
        pregunta: "¿Qué embalaje requiere la carga consolidada?",
        respuesta:
          "La mercancía debe soportar manipulación en cada transbordo. Eso implica embalaje adecuado al peso, tarima en buen estado cuando aplique, y etiquetado visible por embarque. Compass revisa estos puntos antes de aceptar la carga para evitar daños en tránsito.",
      },
    ],
  },
  {
    slug: "ftl",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "FTL: transporte terrestre dedicado",
    heroParrafo:
      "Cuando su carga necesita una unidad completa, el servicio FTL elimina los transbordos y las paradas intermedias. La mercancía sube en origen y baja en destino, sin manipulación adicional. Coordinamos la unidad, la ruta y el monitoreo para que usted tenga un solo interlocutor durante toda la operación.",
    seoTitulo: "FTL: transporte terrestre dedicado en México",
    seoDescripcion:
      "Servicio FTL con unidad exclusiva para su carga. Coordinamos transportistas certificados, monitoreo satelital y entrega directa sin transbordos.",
    bloques: [
      {
        eyebrow: "Sin transbordos",
        titulo: "Su carga viaja sola, de principio a fin",
        parrafo:
          "En un servicio dedicado la unidad se asigna a un solo embarque. Eso reduce el riesgo de daño por manipulación, elimina los tiempos muertos en centros de consolidación y acorta el tránsito frente a un servicio consolidado. Para operaciones con ventanas de entrega ajustadas o mercancía sensible, esa diferencia es la que evita un paro de línea.",
      },
      {
        eyebrow: "Coordinación de la red",
        titulo: "La unidad se asigna antes de que la necesite",
        parrafo:
          "Compass coordina una red de transportistas con capacidad en los principales corredores del país. La asignación se trabaja con anticipación al arribo, no cuando la mercancía ya está liberada y el reloj del almacenaje corriendo. Usted recibe la confirmación de unidad, el seguimiento del tránsito y la evidencia de entrega desde un mismo canal.",
      },
    ],
    metricasTitulo: "El impacto de FTL en su operación",
    metricas: [
      {
        nombre: "Corredores atendidos",
        descripcion:
          "Cobertura terrestre en las principales rutas industriales del país.",
      },
      {
        nombre: "Tiempo de asignación",
        descripcion:
          "Confirmación de unidad para embarques programados con anticipación.",
      },
      {
        nombre: "Visibilidad del tránsito",
        descripcion: "Seguimiento documentado desde la carga hasta la entrega.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre FTL",
    preguntas: [
      {
        pregunta: "¿Cuándo conviene FTL frente a LTL?",
        respuesta:
          "El FTL conviene cuando el volumen ocupa la unidad completa, cuando la mercancía no admite manipulación intermedia o cuando el tiempo de entrega es crítico. El LTL conviene para volúmenes menores donde compartir unidad reduce el costo y los tiempos permiten el paso por centros de consolidación.",
      },
      {
        pregunta: "¿Compass es dueño de las unidades?",
        respuesta:
          "No. Compass es un freight forwarder: coordina una red de transportistas verificados y responde por la operación completa ante usted. Eso permite asignar la unidad adecuada a cada tipo de carga y ruta, en lugar de forzar la operación al equipo disponible de una flota propia.",
      },
      {
        pregunta:
          "¿Qué documentación se requiere para un embarque FTL nacional?",
        respuesta:
          "Todo traslado de mercancía por territorio nacional requiere carta porte con complemento vigente ante el SAT. Según el tipo de mercancía pueden aplicar permisos adicionales. Compass revisa la documentación antes del embarque para evitar que la unidad se detenga en tránsito por un requisito faltante.",
      },
    ],
  },
  {
    slug: "lowboy",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "Lowboy: transporte de carga sobredimensionada",
    heroParrafo:
      "Cuando la carga excede las dimensiones o el peso que admite una plataforma convencional, el lowboy es la unidad que resuelve. Su cama baja permite transportar maquinaria y equipo de gran altura respetando los gálibos de la ruta. Compass coordina la unidad, los permisos y el estudio de ruta como una sola operación.",
    seoTitulo: "Lowboy: transporte de carga sobredimensionada",
    seoDescripcion:
      "Transporte de maquinaria y carga sobredimensionada en plataforma lowboy. Permisos, escoltas y estudio de ruta coordinados por Compass.",
    bloques: [
      {
        eyebrow: "Cama baja",
        titulo: "Altura disponible donde una plataforma no alcanza",
        parrafo:
          "El lowboy, también conocido como cama baja, tiene la plataforma de carga más cerca del piso que una plataforma convencional. Eso libera altura útil y permite mover equipo que de otro modo no pasaría bajo puentes ni pasos a desnivel. Es la unidad estándar para maquinaria de construcción, transformadores y equipo industrial pesado.",
      },
      {
        eyebrow: "Permisos y ruta",
        titulo: "El transporte especializado empieza antes de cargar",
        parrafo:
          "Un embarque sobredimensionado requiere permiso de la autoridad correspondiente, estudio de ruta y, según las dimensiones, escolta. Ese trabajo se hace antes de que la unidad llegue. Compass coordina los permisos, valida el trayecto y programa la operación para que la carga salga cuando todo está autorizado.",
      },
    ],
    metricasTitulo: "El impacto del lowboy en su operación",
    metricas: [
      {
        nombre: "Dimensiones atendidas",
        descripcion:
          "Capacidad para carga que excede los límites de una plataforma estándar.",
      },
      {
        nombre: "Gestión de permisos",
        descripcion:
          "Tramitación ante autoridad previa a la salida de la unidad.",
      },
      {
        nombre: "Estudio de ruta",
        descripcion:
          "Validación de gálibos y restricciones en el trayecto completo.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre lowboy",
    preguntas: [
      {
        pregunta: "¿Lowboy y cama baja son lo mismo?",
        respuesta:
          "Sí, son el mismo tipo de unidad. Lowboy es el término en inglés y cama baja es como se le conoce comúnmente en México. Se refiere a la plataforma cuya superficie de carga queda más baja que en una plataforma convencional, para ganar altura libre en el trayecto.",
      },
      {
        pregunta: "¿Cuándo se considera que una carga es sobredimensionada?",
        respuesta:
          "Una carga es sobredimensionada cuando excede las dimensiones o el peso máximo autorizado para circular sin permiso especial. Los límites varían según el tipo de camino y la configuración vehicular. Compass evalúa las medidas y el peso de su equipo para determinar qué permisos aplican.",
      },
      {
        pregunta: "¿Cuánto tiempo toma tramitar los permisos?",
        respuesta:
          "El plazo depende de la autoridad, del trayecto y de las dimensiones de la carga. Un embarque que cruza varios estados requiere más gestión que uno local. Por eso la planeación empieza semanas antes del embarque y no cuando la unidad ya está lista.",
      },
    ],
  },
  {
    slug: "plataformas",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "Plataformas: transporte de carga abierta",
    heroParrafo:
      "Hay carga que no cabe en una caja cerrada o que no la necesita. La plataforma permite cargar por los costados y por arriba, lo que facilita el manejo de estructura, tubería, maquinaria y material voluminoso. Compass coordina la unidad adecuada y el amarre correspondiente a cada tipo de carga.",
    seoTitulo: "Plataformas: transporte de carga de gran volumen",
    seoDescripcion:
      "Transporte en plataforma para carga que no requiere caja cerrada. Maquinaria, estructura, tubería y material de construcción.",
    bloques: [
      {
        eyebrow: "Carga y descarga",
        titulo: "Acceso por los costados y por arriba",
        parrafo:
          "A diferencia de una caja cerrada, la plataforma se carga con grúa o montacargas desde cualquier ángulo. Eso reduce el tiempo de maniobra en planta y permite mover piezas que por su forma no entrarían por una puerta trasera. Es la unidad habitual para acero, tubería, estructura metálica y equipo industrial.",
      },
      {
        eyebrow: "Sujeción de la carga",
        titulo: "El amarre es parte del servicio, no un extra",
        parrafo:
          "En carga abierta, la sujeción es lo que garantiza que la mercancía llegue completa y que la unidad circule sin riesgo. Cada tipo de carga requiere su método: cadenas, bandas, esquineros o lonas según el caso. Compass verifica que la unidad asignada traiga el equipo de sujeción correspondiente antes de la maniobra.",
      },
    ],
    metricasTitulo: "El impacto de las plataformas en su operación",
    metricas: [
      {
        nombre: "Configuraciones disponibles",
        descripcion:
          "Distintos tipos de plataforma según dimensiones y peso de la carga.",
      },
      {
        nombre: "Tiempo de maniobra",
        descripcion:
          "Carga y descarga por costados y por arriba con grúa o montacargas.",
      },
      {
        nombre: "Equipo de sujeción",
        descripcion:
          "Amarre verificado según el tipo de mercancía transportada.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre plataformas",
    preguntas: [
      {
        pregunta: "¿Qué diferencia hay entre plataforma y lowboy?",
        respuesta:
          "La plataforma tiene la superficie de carga a la altura estándar, mientras que el lowboy la tiene más baja para ganar altura libre. Se usa plataforma cuando la carga cabe dentro de los gálibos normales, y lowboy cuando la altura del equipo obligaría a exceder el límite permitido.",
      },
      {
        pregunta: "¿La carga en plataforma va cubierta?",
        respuesta:
          "Depende de la mercancía. Material que no se afecta por la intemperie puede viajar descubierto con el amarre correspondiente. Cuando la carga requiere protección se utiliza lona. Esa definición se toma al cotizar, en función del tipo de producto y del trayecto.",
      },
      {
        pregunta: "¿Qué mercancía se transporta habitualmente en plataforma?",
        respuesta:
          "Acero, tubería, estructura metálica, maquinaria, material de construcción y equipo que por su forma o dimensiones no entra en una caja cerrada. También carga paletizada de gran volumen cuando la maniobra en planta se resuelve mejor con acceso lateral.",
      },
    ],
  },
  {
    slug: "unidades-con-rampa",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "Unidades con rampa hidráulica",
    heroParrafo:
      "No todos los puntos de carga tienen grúa o andén. La unidad con rampa hidráulica permite subir y bajar equipo rodando, directamente desde el piso. Es la solución para maquinaria autopropulsada, equipo sobre ruedas y cargas que no admiten izaje.",
    seoTitulo: "Unidades con rampa hidráulica para maniobra en piso",
    seoDescripcion:
      "Transporte con rampa hidráulica para equipo que se carga rodando. Maniobra sin grúa en origen y destino.",
    bloques: [
      {
        eyebrow: "Maniobra sin grúa",
        titulo: "Carga a nivel de piso, sin equipo adicional",
        parrafo:
          "La rampa hidráulica convierte la plataforma en una superficie continua desde el suelo. Eso permite cargar equipo que se desplaza por sus propios medios o con maniobra menor, sin depender de una grúa en sitio. Reduce el costo de la maniobra y elimina la coordinación con un tercero en cada punto.",
      },
      {
        eyebrow: "Tipo de carga",
        titulo: "Para equipo que no admite izaje",
        parrafo:
          "Hay maquinaria que por su diseño no tiene puntos de izaje seguros, y equipo cuyo valor hace preferible evitar la maniobra con grúa. En esos casos la rampa es la opción correcta. Compass evalúa el peso, las dimensiones y el modo de desplazamiento del equipo para asignar la unidad con la capacidad adecuada.",
      },
    ],
    metricasTitulo: "El impacto de las unidades con rampa en su operación",
    metricas: [
      {
        nombre: "Capacidad de la rampa",
        descripcion:
          "Peso máximo admisible según la configuración de la unidad.",
      },
      {
        nombre: "Puntos sin infraestructura",
        descripcion:
          "Operación en sitios sin grúa, andén ni equipo de maniobra.",
      },
      {
        nombre: "Reducción de maniobra",
        descripcion: "Menor dependencia de terceros en origen y destino.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre unidades con rampa",
    preguntas: [
      {
        pregunta: "¿Qué equipo se puede cargar con rampa hidráulica?",
        respuesta:
          "Maquinaria autopropulsada, equipo sobre ruedas u orugas, vehículos y en general cualquier carga que pueda desplazarse hasta la plataforma sin izaje. El límite lo marca el peso admisible de la rampa y las dimensiones de la unidad, que se validan antes de programar la maniobra.",
      },
      {
        pregunta: "¿Se requiere personal especializado para la maniobra?",
        respuesta:
          "La operación de la rampa la realiza el operador de la unidad. Cuando el equipo se desplaza por sus propios medios, se requiere que alguien lo conduzca durante la maniobra. Esa coordinación se define al programar el servicio para que no haya sorpresas en sitio.",
      },
      {
        pregunta: "¿Conviene rampa o grúa para mi equipo?",
        respuesta:
          "Depende de si el equipo puede rodar y de si tiene puntos de izaje seguros. La rampa evita el costo y la coordinación de una grúa en cada punto, pero exige que la carga se desplace. Compass revisa la ficha técnica del equipo para recomendar la opción adecuada.",
      },
    ],
  },
  {
    slug: "carga-aerea",
    heroEyebrow: "Transporte aéreo",
    heroTitulo: "Carga aérea: cuando el tiempo define la operación",
    heroParrafo:
      "El flete aéreo no compite con el marítimo en costo, compite en tiempo. Cuando un paro de línea cuesta más que el flete, cuando la mercancía es de alto valor o cuando el volumen no justifica un contenedor, la vía aérea es la decisión correcta. Compass coordina la aerolínea, la documentación y el despacho.",
    seoTitulo: "Carga aérea internacional y nacional",
    seoDescripcion:
      "Flete aéreo para embarques urgentes y mercancía de alto valor. Coordinación de aerolínea, documentación y despacho aduanal.",
    bloques: [
      {
        eyebrow: "Tiempo de tránsito",
        titulo: "Días en lugar de semanas",
        parrafo:
          "Un embarque marítimo desde Asia toma semanas. El mismo embarque por vía aérea llega en días. Esa diferencia deja de ser un lujo cuando la alternativa es detener una línea de producción, incumplir una entrega o perder una temporada comercial completa.",
      },
      {
        eyebrow: "Alto valor y volumen reducido",
        titulo: "Cuando el flete pesa menos que la mercancía",
        parrafo:
          "El costo aéreo se calcula sobre el peso real o el volumétrico, el que resulte mayor. Para mercancía compacta y de alto valor, el flete representa una fracción pequeña del valor del embarque. Componentes electrónicos, refacciones críticas y productos regulados suelen justificar la vía aérea con holgura.",
      },
    ],
    metricasTitulo: "El impacto de la carga aérea en su operación",
    metricas: [
      {
        nombre: "Orígenes atendidos",
        descripcion:
          "Conexiones hacia los principales hubs de carga internacional.",
      },
      {
        nombre: "Tiempo de tránsito",
        descripcion: "Días de vuelo frente a semanas de tránsito marítimo.",
      },
      {
        nombre: "Coordinación documental",
        descripcion: "Guía aérea, despacho y entrega en una sola operación.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre carga aérea",
    preguntas: [
      {
        pregunta: "¿Cómo se calcula el costo de un embarque aéreo?",
        respuesta:
          "Se calcula sobre el peso real o el peso volumétrico, aplicando el que resulte mayor. El peso volumétrico considera el espacio que ocupa la carga en la aeronave. Por eso una mercancía ligera pero voluminosa puede pagar más de lo que su peso real sugiere.",
      },
      {
        pregunta: "¿Cuándo conviene aéreo frente a marítimo?",
        respuesta:
          "Conviene cuando el tiempo de entrega es crítico, cuando la mercancía es de alto valor respecto a su peso, o cuando el volumen es tan reducido que un contenedor no se justifica. En operaciones estacionales, muchas empresas combinan ambos modos según el momento del año.",
      },
      {
        pregunta: "¿La carga aérea también requiere despacho aduanal?",
        respuesta:
          "Sí. Toda importación requiere despacho aduanal, sin importar el modo de transporte. La diferencia es que en aéreo los tiempos de aduana pesan proporcionalmente más, porque el tránsito es corto. Preparar la documentación antes del arribo evita perder la ventaja de tiempo.",
      },
    ],
  },
  {
    slug: "almacenaje-y-distribucion",
    heroEyebrow: "Almacenaje",
    heroTitulo: "Almacenaje y distribución",
    heroParrafo:
      "La mercancía no siempre va directo del puerto a su planta. Cuando necesita consolidar, fraccionar o esperar el momento correcto para distribuir, el almacenaje es parte de la cadena y no un servicio aparte. Compass coordina el espacio, el manejo y la salida hacia cada destino.",
    seoTitulo: "Almacenaje y distribución de mercancía",
    seoDescripcion:
      "Servicio de almacenaje y distribución coordinado con su operación de comercio exterior.",
    bloques: [
      {
        eyebrow: "Entre la aduana y el destino",
        titulo: "El punto donde se decide cómo sale la mercancía",
        parrafo:
          "Un embarque que llega completo muchas veces se distribuye fraccionado hacia varios destinos. El almacén es donde ocurre esa transformación: recepción, verificación, acomodo y preparación de cada salida. Coordinar ese punto con el resto de la cadena evita que la mercancía se detenga justo antes de llegar.",
      },
      {
        eyebrow: "Distribución",
        titulo: "De un solo arribo a múltiples entregas",
        parrafo:
          "Desde el almacén, la mercancía sale hacia sucursales, clientes o plantas según su programación. Compass coordina el transporte de cada salida con la misma trazabilidad que el tramo internacional, para que usted tenga visibilidad continua desde el origen hasta la entrega final.",
      },
    ],
    metricasTitulo: "El impacto del almacenaje en su operación",
    metricas: [
      {
        nombre: "Cobertura de distribución",
        descripcion: "Salidas hacia los principales destinos del país.",
      },
      {
        nombre: "Manejo de inventario",
        descripcion: "Recepción, verificación y preparación de salidas.",
      },
      {
        nombre: "Continuidad de la cadena",
        descripcion:
          "Coordinación entre el tramo internacional y la entrega final.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre almacenaje y distribución",
    preguntas: [
      {
        pregunta: "¿Qué incluye el servicio de almacenaje?",
        respuesta:
          "Incluye recepción de la mercancía, verificación contra documentación, acomodo, resguardo y preparación de las salidas programadas. El alcance específico se define según el tipo de producto, el volumen y la frecuencia de movimiento que requiera su operación.",
      },
      {
        pregunta: "¿Se puede almacenar mercancía antes del despacho aduanal?",
        respuesta:
          "La mercancía que aún no ha sido despachada permanece bajo el régimen que corresponda en recintos autorizados para ello. Una vez liberada, puede trasladarse a almacén para su distribución. Compass coordina ambos momentos según la situación de cada embarque.",
      },
      {
        pregunta: "¿Cómo se coordina la distribución desde el almacén?",
        respuesta:
          "Las salidas se programan según el calendario de entregas que usted defina. Cada movimiento genera su documentación de traslado y su seguimiento correspondiente, de modo que la trazabilidad no se interrumpe al pasar del tramo internacional a la distribución nacional.",
      },
    ],
  },
  {
    slug: "empaque-y-embalaje",
    heroEyebrow: "Almacenaje",
    heroTitulo: "Empaque y embalaje para transporte internacional",
    heroParrafo:
      "El embalaje no es un detalle, es lo que determina si la mercancía llega completa. Cada modo de transporte impone exigencias distintas, y algunos destinos tienen requisitos normativos específicos. Compass coordina el embalaje adecuado al recorrido real que hará su carga.",
    seoTitulo: "Empaque y embalaje para exportación",
    seoDescripcion:
      "Servicio de empaque y embalaje conforme a los requisitos de cada modo de transporte y destino.",
    bloques: [
      {
        eyebrow: "Según el recorrido",
        titulo: "Cada trayecto exige un embalaje distinto",
        parrafo:
          "Una carga consolidada que pasa por dos transbordos no requiere lo mismo que un contenedor sellado en origen. La estiba, la humedad, la vibración y el número de manipulaciones definen qué protección necesita el producto. Diseñar el embalaje conociendo el recorrido evita daños que después nadie puede reparar.",
      },
      {
        eyebrow: "Requisitos normativos",
        titulo: "La madera y el marcado tienen reglas",
        parrafo:
          "El embalaje de madera destinado a comercio internacional debe cumplir con el tratamiento y el marcado que exige la normativa fitosanitaria aplicable. Un embarque rechazado en destino por este motivo genera costos y demoras evitables. Compass verifica el cumplimiento antes de que la carga salga.",
      },
    ],
    metricasTitulo: "El impacto del embalaje en su operación",
    metricas: [
      {
        nombre: "Modos cubiertos",
        descripcion:
          "Soluciones de embalaje para transporte marítimo, aéreo y terrestre.",
      },
      {
        nombre: "Cumplimiento normativo",
        descripcion: "Verificación de requisitos fitosanitarios y de marcado.",
      },
      {
        nombre: "Reducción de incidencias",
        descripcion: "Menor riesgo de daño por manipulación y estiba.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre empaque y embalaje",
    preguntas: [
      {
        pregunta: "¿Qué requisitos tiene el embalaje de madera?",
        respuesta:
          "El embalaje de madera usado en comercio internacional debe recibir tratamiento y llevar el marcado que exige la normativa fitosanitaria internacional. Sin ese cumplimiento el embarque puede ser rechazado, tratado en destino a costo del importador o devuelto al origen.",
      },
      {
        pregunta: "¿El embalaje cambia según el modo de transporte?",
        respuesta:
          "Sí. La carga marítima enfrenta humedad y estiba prolongada, la aérea tiene restricciones de peso y la terrestre soporta vibración continua. Un embalaje diseñado para un modo puede ser insuficiente para otro, especialmente en operaciones que combinan varios tramos.",
      },
      {
        pregunta: "¿Quién responde si la mercancía llega dañada?",
        respuesta:
          "Depende de dónde ocurrió el daño y de qué cobertura tenga el embarque. Un embalaje inadecuado suele excluir la responsabilidad del transportista y limitar la cobertura del seguro. Por eso el embalaje correcto es la primera protección, antes que cualquier reclamación.",
      },
    ],
  },
  {
    slug: "expeditado",
    heroEyebrow: "Valor agregado",
    heroTitulo: "Servicio expeditado: cuando no hay margen",
    heroParrafo:
      "Hay operaciones donde el retraso no se mide en días sino en pesos por hora. Un paro de línea, una entrega comprometida, una refacción crítica. El servicio expeditado prioriza el tiempo sobre cualquier otra variable y entrega la mejor opción disponible en tiempos y rutas, con cotización en menos de tres horas.",
    seoTitulo: "Servicio expeditado para urgencias logísticas",
    seoDescripcion:
      "Servicio expeditado con cotización en menos de tres horas para paros de línea y entregas críticas.",
    bloques: [
      {
        eyebrow: "Respuesta inmediata",
        titulo: "Cotización en menos de tres horas",
        parrafo:
          "En una urgencia, el tiempo que tarda la cotización es tiempo perdido. El servicio expeditado tiene un canal propio: se recibe el requerimiento, se evalúan las opciones disponibles y se entrega la propuesta con tiempos y costo en menos de tres horas, para que la decisión se tome el mismo día.",
      },
      {
        eyebrow: "Todas las rutas sobre la mesa",
        titulo: "La mejor opción, no la habitual",
        parrafo:
          "En una operación urgente se evalúan alternativas que normalmente no se considerarían: cambio de modo, aeropuerto alterno, ruta terrestre directa o combinación de tramos. Compass compara las opciones reales disponibles en ese momento y presenta la que resuelve, con su costo y su tiempo.",
      },
    ],
    metricasTitulo: "El impacto del servicio expeditado en su operación",
    metricas: [
      {
        nombre: "Tiempo de cotización",
        descripcion: "Propuesta con tiempos y costo en menos de tres horas.",
      },
      {
        nombre: "Efectividad en expeditados",
        descripcion: "Porcentaje de operaciones urgentes resueltas en tiempo.",
      },
      {
        nombre: "Alternativas evaluadas",
        descripcion: "Comparación de modos y rutas disponibles en el momento.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre el servicio expeditado",
    preguntas: [
      {
        pregunta: "¿Qué se considera una operación expeditada?",
        respuesta:
          "Toda operación donde el tiempo de entrega es la variable crítica y el costo pasa a segundo plano. Los casos más frecuentes son paros de línea de producción, refacciones críticas, entregas comprometidas con penalización y mercancía que perdería su valor comercial con un retraso.",
      },
      {
        pregunta: "¿Cuánto más cuesta un servicio expeditado?",
        respuesta:
          "Depende de la ruta, del modo y de la disponibilidad en el momento. Lo relevante no es el costo absoluto sino la comparación contra el costo de no mover la carga a tiempo. Compass presenta las opciones con su costo para que esa comparación se haga con números concretos.",
      },
      {
        pregunta: "¿Cómo se solicita un servicio expeditado?",
        respuesta:
          "A través del canal de contacto directo, indicando origen, destino, características de la carga y la fecha límite real. Con esa información se evalúan las alternativas disponibles y se entrega la propuesta en menos de tres horas, para decidir el mismo día.",
      },
    ],
  },
  {
    slug: "seguro-de-carga",
    heroEyebrow: "Valor agregado",
    heroTitulo: "Seguro de carga: cobertura sobre el valor real",
    heroParrafo:
      "La responsabilidad del transportista está limitada por convenio y rara vez cubre el valor de la mercancía. El seguro de carga cierra esa brecha, con una cobertura dimensionada al valor real del embarque y al riesgo del trayecto. Compass coordina la contratación como parte de la operación.",
    seoTitulo: "Seguro de carga para transporte internacional",
    seoDescripcion:
      "Cobertura de mercancía en tránsito internacional y nacional, dimensionada al valor real del embarque.",
    bloques: [
      {
        eyebrow: "El límite del transportista",
        titulo: "La responsabilidad legal no equivale al valor de su carga",
        parrafo:
          "Los convenios internacionales establecen límites de responsabilidad calculados por peso, no por valor. En la práctica eso significa que un embarque de alto valor y poco peso queda cubierto por una fracción mínima de lo que realmente cuesta. El seguro de carga es lo que cubre la diferencia.",
      },
      {
        eyebrow: "Alcance de la cobertura",
        titulo: "Dimensionada al trayecto, no genérica",
        parrafo:
          "El riesgo de un contenedor sellado en tránsito directo no es el mismo que el de una carga consolidada con dos transbordos. La cobertura se define según el modo, el recorrido, el tipo de mercancía y el embalaje. Compass coordina la contratación con el alcance que corresponde a cada embarque.",
      },
    ],
    metricasTitulo: "El impacto del seguro de carga en su operación",
    metricas: [
      {
        nombre: "Cobertura sobre valor declarado",
        descripcion: "Protección dimensionada al valor real de la mercancía.",
      },
      {
        nombre: "Modos cubiertos",
        descripcion: "Cobertura para tramos marítimo, aéreo y terrestre.",
      },
      {
        nombre: "Gestión de siniestros",
        descripcion: "Acompañamiento documental en caso de incidencia.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre el seguro de carga",
    preguntas: [
      {
        pregunta: "¿La responsabilidad del transportista no es suficiente?",
        respuesta:
          "Rara vez lo es. Los convenios internacionales limitan la responsabilidad a un monto calculado por kilogramo, no por el valor de la mercancía. Para carga de alto valor esa limitación deja descubierta la mayor parte del embarque, incluso cuando el daño es atribuible al transportista.",
      },
      {
        pregunta: "¿Sobre qué monto se calcula la cobertura?",
        respuesta:
          "Se calcula sobre el valor declarado de la mercancía, que habitualmente incluye el valor facturado más el flete y otros costos asociados al embarque. Declarar un valor inferior al real reduce la prima pero también reduce proporcionalmente lo que se recupera ante un siniestro.",
      },
      {
        pregunta: "¿Qué pasa si la mercancía llega dañada?",
        respuesta:
          "Se documenta la incidencia al momento de la recepción, con evidencia fotográfica y las observaciones correspondientes en los documentos de entrega. Ese registro es la base de la reclamación. Compass acompaña la integración del expediente y el seguimiento ante la aseguradora.",
      },
    ],
  },
  {
    slug: "previo-en-origen",
    heroEyebrow: "Valor agregado",
    heroTitulo: "Previo en origen: verificar antes de que zarpe",
    heroParrafo:
      "Un error detectado en destino cuesta demoras, almacenaje y a veces la operación completa. El previo en origen verifica la mercancía antes de que salga: que corresponda a lo comprado, que esté correctamente embalada y que la documentación coincida con la carga real.",
    seoTitulo: "Previo en origen: verificación antes de embarcar",
    seoDescripcion:
      "Verificación de mercancía en origen antes del embarque, para evitar sorpresas al llegar a destino.",
    bloques: [
      {
        eyebrow: "Antes del embarque",
        titulo: "El momento en que corregir todavía es barato",
        parrafo:
          "Una discrepancia entre la factura y la mercancía se resuelve en origen con una corrección documental. La misma discrepancia detectada en la aduana de destino puede significar multa, demora y almacenaje. Verificar antes de embarcar convierte un problema costoso en un ajuste menor.",
      },
      {
        eyebrow: "Qué se revisa",
        titulo: "Cantidad, condición y documentación",
        parrafo:
          "La verificación cubre que la cantidad corresponda a lo declarado, que la mercancía esté en la condición esperada, que el embalaje sea adecuado para el trayecto y que el marcado y la documentación coincidan con la carga. El resultado se entrega documentado antes de autorizar el embarque.",
      },
    ],
    metricasTitulo: "El impacto del previo en origen en su operación",
    metricas: [
      {
        nombre: "Orígenes cubiertos",
        descripcion:
          "Verificación disponible en los principales orígenes de importación.",
      },
      {
        nombre: "Incidencias detectadas",
        descripcion: "Discrepancias identificadas antes del embarque.",
      },
      {
        nombre: "Evidencia documentada",
        descripcion: "Reporte con registro fotográfico previo a la salida.",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre el previo en origen",
    preguntas: [
      {
        pregunta: "¿Qué se revisa en un previo en origen?",
        respuesta:
          "Se verifica la cantidad contra lo declarado, la condición aparente de la mercancía, la calidad del embalaje frente al trayecto previsto, y la correspondencia entre el marcado, la documentación y la carga real. El resultado se entrega con evidencia fotográfica antes del embarque.",
      },
      {
        pregunta: "¿Cuándo conviene contratar este servicio?",
        respuesta:
          "Conviene con proveedores nuevos, con mercancía de alto valor, con embarques cuya discrepancia sería costosa de corregir en destino, y en operaciones donde una demora aduanal comprometería la producción o una fecha de entrega comprometida con su cliente.",
      },
      {
        pregunta: "¿El previo sustituye la inspección de calidad?",
        respuesta:
          "No. El previo verifica correspondencia, condición aparente, embalaje y documentación con fines logísticos y aduanales. Una inspección de calidad evalúa el producto contra especificaciones técnicas y es un servicio distinto, que puede coordinarse en paralelo cuando la operación lo requiere.",
      },
    ],
  },
];

/** Los 18 slugs, en el orden de la lista. Para `generateStaticParams`. */
export function allServicioSlugs(): string[] {
  return SERVICIOS.map((servicio) => servicio.slug);
}

/** `undefined` si el slug no está en la lista: la página responde 404. */
export function getServicioBySlug(
  slug: string,
): ServicioContenido | undefined {
  return SERVICIOS.find((servicio) => servicio.slug === slug);
}

/**
 * Los otros servicios que <RelatedServicesCarousel> pinta al pie de cada
 * página.
 *
 * EL CRITERIO ES MECÁNICO, NO EDITORIAL, y conviene saberlo antes de fiarse
 * de él: primero los que comparten `heroEyebrow` (la categoría real del
 * servicio: "Transporte marítimo", "Transporte terrestre", etc.) y después el
 * resto en el orden de la lista, hasta completar `cuantos`. Se excluye
 * siempre el servicio que se está viendo.
 *
 * NO HAY UNA TABLA DE AFINIDAD porque ninguna entrada declara con qué otros
 * servicios se opera en conjunto de verdad, y eso es una decisión de negocio
 * que no se puede derivar del contenido. Agrupar por categoría es lo más
 * cercano que permiten los datos de hoy y es defendible (un FCL junto a los
 * demás marítimos), pero si el cliente quiere pares concretos —FCL con previo
 * en origen, lowboy con seguro de carga— hay que añadir un campo
 * `relacionados` a `ServicioContenido` y leerlo aquí.
 *
 * EL RELLENO ROTA, Y ESO NO ES UN DETALLE. Con la lista recorrida siempre en
 * el mismo orden, los servicios del final no entraban en el carrusel de nadie:
 * `carga-aerea`, que además es el único de su categoría, se quedaba con CERO
 * enlaces internos entrantes aunque estuviera en el sitemap y fuera indexable.
 * Arrancando el recorrido justo después del servicio actual y dando la vuelta,
 * los 18 aparecen en el carrusel de alguien.
 */
export function serviciosRelacionados(
  slug: string,
  cuantos = 6,
): ServicioContenido[] {
  const actual = getServicioBySlug(slug);
  const indice = SERVICIOS.findIndex((servicio) => servicio.slug === slug);
  if (indice === -1) return SERVICIOS.slice(0, cuantos);

  // Los otros 17, empezando por el siguiente de la lista y dando la vuelta.
  const rotados = [
    ...SERVICIOS.slice(indice + 1),
    ...SERVICIOS.slice(0, indice),
  ];

  const mismaCategoria = rotados.filter(
    (servicio) => servicio.heroEyebrow === actual?.heroEyebrow,
  );
  const resto = rotados.filter(
    (servicio) => servicio.heroEyebrow !== actual?.heroEyebrow,
  );

  return [...mismaCategoria, ...resto].slice(0, cuantos);
}
