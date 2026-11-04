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
 * arquitectura de información (ramas de alcance, modos, opciones anidadas),
 * que anidaría por rama y por modo, y ya no genera rutas. Estas 18
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
 * EL COPY DE LAS 18 ENTRADAS YA ES REAL. Entró por tandas (las cinco
 * terrestres, las siete marítimas, las seis restantes y, después, los
 * cierres y las descripciones de los pasos de `flujo`) y no queda ni un
 * marcador de posición en este archivo. La regla para comprobarlo de un
 * vistazo sigue sirviendo al revés: si algún texto de aquí vuelve a traer
 * corchetes, es que quedó a medias.
 *
 * LO QUE SIGUE PENDIENTE ES LA FOTO DEL HERO. Lleva todavía el degradado de
 * marca en la medida exacta que tendrá la foto, sin archivo real detrás ni
 * borde punteado ni etiqueta: el hueco no se anuncia como hueco en una
 * página que ya se indexa. Cada bloque sin `flujo` ya trae su foto en
 * `imagen` (en `public/servicios/<slug>/`) con su `imagenAlt`; los bloques
 * con `flujo` van a ancho completo, sin imagen.
 *
 * LAS 18 PÁGINAS YA SON INDEXABLES. El `noindex, nofollow` que llevaban se
 * puso cuando el texto era de relleno y se retiró al quedar el copy real:
 * `app/servicios/[slug]/page.tsx` ya no declara `robots` (hereda el indexable
 * por defecto) y `app/sitemap.ts` las lista derivándolas de
 * `allServicioSlugs()`. Cada una conserva su `canonical`, que ahora ya no
 * contradice a nada.
 *
 * QUEDA UNA COSA DE ESA MISMA LISTA (los enlaces internos ya se resolvieron:
 * mega menú, footer, home e índice /servicios enlazan a estas rutas desde
 * `GRUPOS_SERVICIOS`):
 *  - EL ARTE DEL HERO. <ServiceHero> sigue con el degradado de marca en
 *    lugar de la foto; los bloques ya tienen la suya. Ni este archivo ni la página
 *    renderizada tienen ya ningún marcador de posición visible: nada entre
 *    corchetes ni ningún "Pendiente".
 */

/**
 * Uno de los bloques de la página (de dos a cinco). Sin `flujo` alterna
 * imagen y texto; con `flujo` va a ancho completo, sin imagen.
 */
export type ServicioBloque = {
  eyebrow: string;
  titulo: string;
  parrafo: string;
  /** Lista con viñetas debajo del párrafo, con el estilo de lista del blog. */
  vinetas?: string[];
  /**
   * Secuencia de pasos. Si el bloque la trae, se pinta a ancho completo, sin
   * imagen, con los pasos como rejilla de tarjetas numeradas.
   */
  flujo?: ServicioPaso[];
  /**
   * Ruta pública de la foto del bloque (`/servicios/<slug>/<slug>-bloque-<n>.webp`).
   * Sólo en bloques sin `flujo`: los de flujo van a ancho completo, sin imagen.
   * Sin ella, el bloque conserva el degradado de marca en la misma medida.
   */
  imagen?: string;
  /** Texto alternativo de `imagen`: describe el contenido de la foto. */
  imagenAlt?: string;
};

/** Un paso de `flujo`: tarjeta con número de orden, título y descripción. */
export type ServicioPaso = {
  titulo: string;
  descripcion: string;
};

/** Una de las preguntas frecuentes de la página (de tres a siete). */
export type ServicioPregunta = {
  pregunta: string;
  respuesta: string;
};

/**
 * Bloque de cierre con botón de cotización: va después de las preguntas
 * frecuentes y antes del carrusel. `textoBoton` es la etiqueta del botón.
 */
export type ServicioCierre = {
  titulo: string;
  parrafo: string;
  textoBoton: string;
};

/**
 * Longitudes permitidas como UNIÓN DE TUPLAS y no como `T[]`: el compilador
 * sigue atrapando una entrada con un bloque de menos o una pregunta de más.
 */
type ServicioBloques =
  | [ServicioBloque, ServicioBloque]
  | [ServicioBloque, ServicioBloque, ServicioBloque]
  | [ServicioBloque, ServicioBloque, ServicioBloque, ServicioBloque]
  | [
      ServicioBloque,
      ServicioBloque,
      ServicioBloque,
      ServicioBloque,
      ServicioBloque,
    ];

type ServicioPreguntas =
  | [ServicioPregunta, ServicioPregunta, ServicioPregunta]
  | [ServicioPregunta, ServicioPregunta, ServicioPregunta, ServicioPregunta]
  | [
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
    ]
  | [
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
    ]
  | [
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
      ServicioPregunta,
    ];

/**
 * El contenido completo de una página de servicio.
 *
 * `bloques` (de 2 a 5) y `preguntas` (de 3 a 7) admiten longitud variable,
 * acotada con uniones de tuplas: la banda de certificaciones va siempre
 * entre el primer y el segundo bloque, así que hacen falta al menos dos. Con
 * tuplas los límites los atrapa el compilador al escribir el contenido, no el
 * navegador al revisarlo.
 */
export type ServicioContenido = {
  /** Segmento de URL. Único en la lista. La ruta es `/servicios/<slug>`. */
  slug: string;
  /**
   * Nombre corto del servicio, para la navegación: mega menú, migas de pan,
   * tarjetas del índice, chips de la home y footer. Sale del texto que ya
   * existía (el prefijo de `heroTitulo` o el nombre en `lib/services.ts`).
   */
  nombre: string;
  /** Categoría real del servicio. Va como Eyebrow, encima del <h1>. */
  heroEyebrow: string;
  /** Título del hero, el <h1> de la página. Real en las 18 entradas. */
  heroTitulo: string;
  heroParrafo: string;
  /** Sin el sufijo de marca: se lo añade la página. */
  seoTitulo: string;
  seoDescripcion: string;
  bloques: ServicioBloques;
  /**
   * Rótulo <h2> de la sección de preguntas. TIENE QUE EMPEZAR por "Preguntas
   * frecuentes": ese prefijo es el que reconoce `extractFaq()` (lib/blog.ts) y
   * es lo que haría que la marcación calce el día que estas páginas ganen su
   * propio pipeline de datos estructurados.
   */
  preguntasRotulo: string;
  preguntas: ServicioPreguntas;
  cierre: ServicioCierre;
};

export const SERVICIOS: ServicioContenido[] = [
  {
    slug: "fcl",
    nombre: "FCL",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "FCL: contenedor marítimo completo",
    heroParrafo:
      "Cuando su carga ocupa un contenedor completo, el FCL permite trasladarla de origen a destino en un espacio exclusivo, sin compartirlo con otras mercancías. La carga viaja sellada desde origen, reduciendo manipulaciones durante el trayecto. Coordinamos la naviera, el despacho aduanal y el transporte terrestre hasta su almacén.",
    seoTitulo: "FCL: contenedor marítimo completo",
    seoDescripcion:
      "Importe en contenedor completo por vía marítima. Coordinamos naviera, despacho aduanal y entrega terrestre hasta su almacén en México.",
    bloques: [
      {
        eyebrow: "Contenedor exclusivo",
        titulo: "Su carga viaja sola, de origen a destino",
        parrafo:
          "En un embarque FCL, el contenedor se cierra en origen y se abre en destino, sin compartir espacio con mercancía de otros embarcadores. Al reducir las manipulaciones durante el trayecto, disminuye el riesgo de daños o faltantes y se mantiene un mayor control sobre la carga.",
        imagen: "/servicios/fcl/fcl-bloque-1.webp",
        imagenAlt:
          "Puertas de un contenedor marítimo cerradas con barras de seguridad y candado",
      },
      {
        eyebrow: "Operación completa",
        titulo: "De la naviera a su almacén, con un solo interlocutor",
        parrafo:
          "Un embarque marítimo requiere coordinar naviera, documentación, despacho aduanal y transporte terrestre. Integramos estas etapas en una sola operación y damos seguimiento de origen a destino. Así tiene un solo punto de contacto para coordinar su embarque y mantener el control de cada etapa.",
        imagen: "/servicios/fcl/fcl-bloque-2.webp",
        imagenAlt:
          "Vista aérea de una terminal portuaria con contenedores apilados, grúas pórtico y un tractocamión en circulación",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre FCL",
    preguntas: [
      {
        pregunta: "¿Cuándo conviene FCL frente a LCL?",
        respuesta:
          "El FCL conviene cuando su carga requiere un contenedor completo, cuando busca reducir la manipulación o cuando las características de la mercancía hacen conveniente viajar sin compartir espacio con otras cargas.",
      },
      {
        pregunta: "¿Qué tamaños de contenedor existen?",
        respuesta:
          "Los tamaños más utilizados son 20 y 40 pies, además de contenedores de 40 pies High Cube. La elección depende del volumen, peso y características de la carga.",
      },
      {
        pregunta: "¿Compass realiza el despacho aduanal?",
        respuesta:
          "El despacho aduanal lo realiza un agente aduanal. Nosotros coordinamos su participación, la documentación y el seguimiento del proceso para mantener un solo punto de contacto durante la operación.",
      },
    ],
    cierre: {
      titulo: "Cotice su próximo embarque en contenedor completo",
      parrafo:
        "Para cotizar un FCL necesitamos el origen, el destino, el tipo y tamaño de contenedor, el peso bruto y la fecha estimada de embarque. Con esa información evaluamos la naviera, el itinerario y la coordinación terrestre hasta su almacén.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "lcl",
    nombre: "LCL",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "LCL: transporte marítimo consolidado",
    heroParrafo:
      "Envíe su mercancía sin esperar a llenar un contenedor. El servicio LCL permite transportar mercancía que no requiere un contenedor completo, compartiendo el espacio con otros embarques compatibles. Coordinamos su operación de origen a destino, desde la recolección y consolidación en origen hasta el transporte marítimo, desconsolidación, liberación y entrega en destino.",
    seoTitulo: "LCL: transporte marítimo consolidado",
    seoDescripcion:
      "Carga consolidada por vía marítima cuando el volumen no justifica un contenedor completo. Consolidación en origen, despacho aduanal y entrega.",
    bloques: [
      {
        eyebrow: "Costo por espacio ocupado",
        titulo: "Pague solo por el espacio que ocupa su carga",
        parrafo:
          "Si no cuenta con suficiente mercancía para llenar un contenedor, no necesita esperar a reunir un FCL para realizar su embarque. Con el servicio LCL puede transportar cargas pequeñas y medianas compartiendo espacio con otros embarques, optimizando el uso del contenedor y evitando contratar la capacidad completa cuando no la necesita.",
        vinetas: [
          "Cargas pequeñas y medianas",
          "Embarques de prueba o primeras operaciones internacionales",
          "Compras internacionales con volúmenes reducidos",
          "Mercancía que no justifica un contenedor completo",
          "Operaciones que requieren embarques marítimos de manera recurrente",
        ],
        imagen: "/servicios/lcl/lcl-bloque-1.webp",
        imagenAlt:
          "Interior de un contenedor con tarimas emplayadas de cajas de distintos tamaños, como en un embarque consolidado",
      },
      {
        eyebrow: "Red de consolidadores",
        titulo: "Conectamos su carga con diferentes destinos del mundo",
        parrafo:
          "Contamos con una red de aliados y consolidadores internacionales que nos permite acceder a diferentes alternativas de servicio y rutas para sus embarques LCL. Esta red nos permite buscar opciones de consolidación de acuerdo con el origen, destino, volumen y fecha requerida para su mercancía, combinando frecuencia, tiempos de tránsito y costo logístico según las necesidades de su operación.",
        imagen: "/servicios/lcl/lcl-bloque-2.webp",
        imagenAlt:
          "Centro de consolidación con un montacargas moviendo tarimas y cajas de distintos embarques",
      },
      {
        eyebrow: "Coordinación por etapas",
        titulo: "De origen a destino, coordinamos cada etapa",
        parrafo:
          "Un embarque LCL requiere una coordinación adicional debido a los procesos de consolidación y desconsolidación de la mercancía. Damos seguimiento a las principales etapas de su operación, de manera que cuente con un solo equipo coordinando el embarque.",
        flujo: [
          {
            titulo: "Recolección",
            descripcion:
              "Retiramos la mercancía en las instalaciones del proveedor y la trasladamos al centro de consolidación.",
          },
          {
            titulo: "Consolidación en origen",
            descripcion:
              "La carga se agrupa con otros embarques compatibles dentro del mismo contenedor.",
          },
          {
            titulo: "Transporte marítimo",
            descripcion:
              "El contenedor viaja hacia el puerto de destino según el itinerario del servicio contratado.",
          },
          {
            titulo: "Desconsolidación en destino",
            descripcion:
              "El contenedor se abre y cada embarque se separa para continuar su proceso individual.",
          },
          {
            titulo: "Liberación",
            descripcion:
              "Se completa el despacho aduanal y la mercancía queda disponible para su retiro.",
          },
          {
            titulo: "Entrega",
            descripcion:
              "Coordinamos el transporte terrestre hasta el punto final indicado por usted.",
          },
        ],
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre LCL",
    preguntas: [
      {
        pregunta: "¿Cómo se cobra el flete en un embarque LCL?",
        respuesta:
          "El costo de un embarque LCL se determina de acuerdo con las características de la carga y la tarifa aplicable a la operación. Dependiendo del servicio, pueden considerarse el volumen y el peso de la mercancía. Por esta razón, necesitamos conocer las medidas y el peso bruto de su carga para calcular la cotización correctamente.",
      },
      {
        pregunta: "¿LCL es más barato que FCL?",
        respuesta:
          "No necesariamente. La conveniencia de LCL o FCL depende principalmente del volumen, peso, ruta, costos asociados y características de la operación. Cuando la carga ocupa una parte pequeña de un contenedor, LCL puede ser una alternativa eficiente. Conforme aumenta el volumen, puede ser conveniente comparar el costo total contra un contenedor completo.",
      },
      {
        pregunta: "¿Cuánto tarda un embarque LCL?",
        respuesta:
          "El tiempo de tránsito marítimo depende de la ruta y del servicio contratado. Sin embargo, el LCL puede requerir procesos adicionales de consolidación en origen y desconsolidación en destino, por lo que el tiempo total de la operación puede ser diferente al de un FCL. Contamos con diferentes alternativas de servicio y salidas según el origen y destino.",
      },
      {
        pregunta: "¿Qué tipo de mercancía puedo enviar por LCL?",
        respuesta:
          "El LCL puede utilizarse para diferentes tipos de mercancía siempre que sus características sean compatibles con el servicio y con las condiciones de manejo y transporte. Si su mercancía es frágil, peligrosa, perecedera o sobredimensionada, es importante informarlo antes de cotizar para determinar la viabilidad del embarque.",
      },
      {
        pregunta: "¿Puedo utilizar LCL para importaciones y exportaciones?",
        respuesta:
          "Sí. Podemos coordinar operaciones LCL tanto de importación como de exportación, dependiendo del origen, destino y características de la carga, manteniendo comunicación con el agente aduanal y los demás participantes de la cadena logística.",
      },
    ],
    cierre: {
      titulo: "Cotice su próximo embarque consolidado",
      parrafo:
        "Para cotizar un LCL necesitamos el tipo de mercancía, sus dimensiones y peso bruto, el origen, el destino y la fecha estimada de embarque. Las medidas son especialmente importantes, porque el costo puede determinarse por volumen o por peso según cuál resulte mayor.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "flat-rack",
    nombre: "Flat rack",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Flat rack: solución para carga sobredimensionada",
    heroParrafo:
      "Cuando su mercancía no cabe en un contenedor convencional, buscamos una solución. El flat rack es un equipo especializado para transportar mercancías que, por sus dimensiones, peso o características, no pueden cargarse de manera convencional dentro de un contenedor estándar. Cuenta con una plataforma abierta sin paredes laterales ni techo, lo que permite realizar la carga por la parte superior o por los costados.",
    seoTitulo: "Flat rack para carga fuera de medidas",
    seoDescripcion:
      "Transporte marítimo en flat rack para mercancía que excede las medidas de un contenedor convencional, con amarre y trincado especializado.",
    bloques: [
      {
        eyebrow: "Cargas fuera de dimensiones",
        titulo:
          "Diseñado para cargas que salen de las dimensiones convencionales",
        parrafo:
          "El flat rack puede utilizarse para transportar diferentes tipos de mercancía que requieren condiciones especiales de carga y estiba. Cada operación debe evaluarse individualmente para determinar la factibilidad del equipo, método de carga, estiba, sujeción y ruta.",
        vinetas: [
          "Maquinaria industrial",
          "Equipos y componentes industriales",
          "Maquinaria para plantas y proyectos",
          "Estructuras metálicas",
          "Equipo pesado y maquinaria",
          "Cargas sobredimensionadas",
          "Piezas industriales de grandes dimensiones",
        ],
        imagen: "/servicios/flat-rack/flat-rack-bloque-1.webp",
        imagenAlt:
          "Pieza de maquinaria industrial sujeta con cadenas sobre un contenedor flat rack en una terminal portuaria",
      },
      {
        eyebrow: "Métodos de carga",
        titulo: "Carga por arriba o por los costados",
        parrafo:
          "Una de las principales ventajas del flat rack es la posibilidad de cargar mercancía que no puede ingresar por las puertas de un contenedor convencional. Dependiendo del equipo seleccionado, la carga puede realizarse por la parte superior mediante maniobras de izaje, por los costados cuando el ancho o la geometría dificultan el ingreso convencional, o por los extremos en equipos con extremos abatibles. Esto permite transportar determinadas mercancías sin necesidad de desarmarlas.",
        imagen: "/servicios/flat-rack/flat-rack-bloque-2.webp",
        imagenAlt:
          "Grúa de pórtico colocando una pieza pesada sobre un contenedor flat rack en el puerto",
      },
      {
        eyebrow: "Coordinación de la operación",
        titulo: "Coordinamos su carga especial de origen a destino",
        parrafo:
          "Una operación en flat rack requiere una planeación más detallada que un embarque convencional. Antes de programar el embarque analizamos las características de la carga para identificar los requerimientos específicos de la operación.",
        flujo: [
          {
            titulo: "Evaluación de carga",
            descripcion:
              "Revisamos dimensiones, peso, centro de gravedad y puntos de apoyo de la pieza.",
          },
          {
            titulo: "Selección de equipo",
            descripcion:
              "Definimos el tipo de flat rack adecuado según las características de la mercancía.",
          },
          {
            titulo: "Recolección",
            descripcion:
              "Trasladamos la carga desde su origen hasta el punto de embarque acordado.",
          },
          {
            titulo: "Carga y estiba",
            descripcion:
              "La pieza se coloca sobre la plataforma y se asegura con el método que corresponda.",
          },
          {
            titulo: "Transporte marítimo",
            descripcion:
              "El equipo viaja en la posición asignada del buque hacia el puerto de destino.",
          },
          {
            titulo: "Liberación",
            descripcion:
              "Se completa el despacho aduanal y la carga queda disponible para continuar.",
          },
          {
            titulo: "Transporte terrestre",
            descripcion:
              "Coordinamos la unidad adecuada para el tramo desde el puerto hasta el destino.",
          },
          {
            titulo: "Entrega",
            descripcion:
              "La carga llega al punto final con la maniobra de descarga coordinada previamente.",
          },
        ],
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre flat rack",
    preguntas: [
      {
        pregunta: "¿Qué tipo de mercancía se transporta en flat rack?",
        respuesta:
          "Principalmente mercancías que, por sus dimensiones, peso o características, no pueden transportarse adecuadamente dentro de un contenedor convencional. Entre ellas pueden encontrarse maquinaria, estructuras, equipos industriales y diferentes tipos de carga sobredimensionada.",
      },
      {
        pregunta:
          "¿Toda carga sobredimensionada puede transportarse en flat rack?",
        respuesta:
          "No necesariamente. Cada embarque debe evaluarse considerando las dimensiones, peso, centro de gravedad, puntos de apoyo, método de carga, estiba, sujeción, ruta y disponibilidad del equipo. Nuestro equipo puede analizar la información de su mercancía para determinar la alternativa adecuada.",
      },
      {
        pregunta: "¿Cómo se carga un flat rack?",
        respuesta:
          "Dependiendo de las características del equipo y de la mercancía, la carga puede realizarse mediante izaje por la parte superior o carga lateral, entre otras alternativas. El método adecuado depende del peso, dimensiones, geometría y puntos de sujeción de la carga.",
      },
      {
        pregunta: "¿La mercancía puede sobresalir del flat rack?",
        respuesta:
          "En determinadas operaciones puede existir carga que sobresalga de las dimensiones del equipo. Sin embargo, esto debe evaluarse y declararse previamente, ya que puede generar requerimientos especiales de transporte, estiba, permisos, ruta y costos adicionales.",
      },
      {
        pregunta:
          "¿Qué diferencia hay entre un flat rack y un contenedor open top?",
        respuesta:
          "El open top conserva las paredes laterales de un contenedor convencional y está diseñado principalmente para mercancías que requieren carga por la parte superior. El flat rack ofrece una plataforma mucho más abierta, adecuada para determinadas cargas que exceden las dimensiones convencionales. La elección depende de las características específicas de la mercancía.",
      },
      {
        pregunta:
          "¿Compass Solutions coordina el transporte terrestre de la carga?",
        respuesta:
          "Sí. Podemos coordinar las diferentes etapas de la operación, incluyendo transporte terrestre, maniobras y entrega, de acuerdo con las características y requerimientos de la carga.",
      },
    ],
    cierre: {
      titulo: "Evaluemos su carga sobredimensionada",
      parrafo:
        "Para cotizar un flat rack necesitamos las dimensiones completas, el peso, el tipo de mercancía, el origen, el destino y los puntos de carga. Si cuenta con fotografías, planos o fichas técnicas, nos ayudan a evaluar la operación con mayor precisión.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "open-top",
    nombre: "Open top",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Open top: contenedor de techo abierto",
    heroParrafo:
      "El open top cuenta con una cubierta removible que permite cargar la mercancía desde arriba mediante grúa. Es adecuado para cargas que exceden la altura de la puerta o requieren carga vertical. Conviene utilizarlo cuando la mercancía necesita mayor altura de carga, pero puede mantenerse contenida dentro de las paredes del contenedor.",
    seoTitulo: "Open top: contenedor con techo abierto",
    seoDescripcion:
      "Transporte marítimo en contenedor open top para carga que excede la altura estándar y debe cargarse por la parte superior con grúa.",
    bloques: [
      {
        eyebrow: "Carga vertical",
        titulo: "Cuando la pieza no entra por la puerta",
        parrafo:
          "Hay carga que cabe dentro del contenedor pero no puede ingresar por la puerta trasera, sea por su altura o porque requiere maniobra vertical. El open top resuelve ese caso: se retira la lona, se carga con grúa desde arriba y se vuelve a cubrir para el tránsito.",
        imagen: "/servicios/open-top/open-top-bloque-1.webp",
        imagenAlt:
          "Vista superior de un contenedor open top sin lona con maquinaria en su interior, entre contenedores apilados",
      },
      {
        eyebrow: "Protección y altura",
        titulo: "Paredes de contenedor con acceso superior",
        parrafo:
          "A diferencia del flat rack, el open top mantiene las cuatro paredes, lo que ofrece más protección durante el tránsito y facilita la sujeción de la carga. Cuando la mercancía sobresale por encima del marco superior, aplica un cargo por sobrealtura que Compass calcula antes de cotizar.",
        imagen: "/servicios/open-top/open-top-bloque-2.webp",
        imagenAlt:
          "Contenedor open top cubierto con lona sobre arcos metálicos en un patio de contenedores",
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
    cierre: {
      titulo: "Cotice su embarque en contenedor de techo abierto",
      parrafo:
        "Para cotizar un open top necesitamos las dimensiones y el peso de la carga, el origen, el destino y la fecha estimada de embarque. Si la mercancía sobresale del marco superior, conviene declararlo desde el inicio para validar las condiciones de estiba.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "isotanques",
    nombre: "Isotanques",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Isotanques: transporte de carga líquida",
    heroParrafo:
      "El isotanque es un tanque cilíndrico montado en una estructura con las dimensiones de un contenedor estándar. Permite transportar líquidos a granel por vía marítima y terrestre sin trasvase, manteniendo el producto en el mismo recipiente desde origen hasta destino. Su selección depende de las características del producto, capacidad requerida, requisitos de seguridad y condiciones de transporte.",
    seoTitulo: "Isotanques para carga líquida a granel",
    seoDescripcion:
      "Transporte de líquidos a granel en isotanque, con la documentación, los protocolos y el manejo que exige cada tipo de producto.",
    bloques: [
      {
        eyebrow: "Sin trasvase",
        titulo: "El producto viaja en un solo recipiente",
        parrafo:
          "Al conservar las dimensiones de un contenedor, el isotanque se maneja con el mismo equipo portuario y se transporta en el mismo chasis. Eso elimina el trasvase entre modos, que es donde se concentra el riesgo de contaminación, derrame y pérdida de producto.",
        imagen: "/servicios/isotanques/isotanques-bloque-1.webp",
        imagenAlt:
          "Isotanque de acero inoxidable dentro de su marco estructural en un patio industrial",
      },
      {
        eyebrow: "Documentación y protocolos",
        titulo: "Cada producto tiene sus requisitos",
        parrafo:
          "El transporte de líquidos a granel está regulado según la naturaleza del producto, y las mercancías peligrosas tienen requisitos específicos de clasificación, documentación y manejo. Compass verifica que el embarque cumpla con lo aplicable antes de la reserva, no cuando la carga ya está en puerto.",
        imagen: "/servicios/isotanques/isotanques-bloque-2.webp",
        imagenAlt:
          "Vista superior de un isotanque con escotilla, válvulas y pasarela de acceso",
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
    cierre: {
      titulo: "Cotice el transporte de su carga líquida",
      parrafo:
        "Para cotizar un isotanque necesitamos la ficha técnica del producto, el volumen requerido, el origen, el destino y la fecha estimada de embarque. La naturaleza del producto determina el tipo de tanque y los requisitos documentales aplicables.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "ro-ro",
    nombre: "Ro-Ro",
    heroEyebrow: "Transporte marítimo",
    heroTitulo: "Ro-Ro: transporte marítimo de carga rodante",
    heroParrafo:
      "Su vehículo o maquinaria puede embarcar sin necesidad de un contenedor. El Ro-Ro es una modalidad de transporte marítimo diseñada para vehículos, maquinaria y equipos que pueden entrar y salir del buque mediante rampas de acceso, rodando o siendo remolcados. Coordinamos la operación considerando las características de cada unidad, incluyendo dimensiones, peso, movilidad, puntos de embarque, ruta y condiciones de entrega.",
    seoTitulo: "Ro-Ro: transporte de carga rodante",
    seoDescripcion:
      "Transporte en buque Ro-Ro para vehículos y maquinaria que embarcan por sus propios medios mediante rampas, sin necesidad de contenedor.",
    bloques: [
      {
        eyebrow: "Sistema de carga",
        titulo: "La carga entra y sale rodando",
        parrafo:
          "La principal característica del servicio Ro-Ro es su sistema de carga y descarga. Las unidades ingresan al buque mediante rampas de acceso y son colocadas en las áreas destinadas para su transporte. Cuando la unidad no puede desplazarse por sus propios medios, puede requerir arrastre, plataforma rodante u otro equipo auxiliar, dependiendo de las condiciones del servicio.",
        vinetas: [
          "Automóviles y vehículos",
          "Tractores y maquinaria agrícola",
          "Maquinaria de construcción",
          "Equipos industriales",
          "Camiones y vehículos comerciales",
          "Maquinaria autopropulsada",
          "Equipos sobre ruedas",
        ],
        imagen: "/servicios/ro-ro/ro-ro-bloque-1.webp",
        imagenAlt:
          "Buque Ro-Ro atracado en el muelle con la rampa de popa abierta",
      },
      {
        eyebrow: "Unidades con movilidad",
        titulo: "Para vehículos y maquinaria que necesitan movilidad",
        parrafo:
          "El Ro-Ro es una alternativa diseñada para mercancías que cuentan con ruedas, sistemas de rodamiento o características que permiten su movimiento mediante arrastre. Esto puede simplificar determinadas operaciones de embarque y desembarque y evitar que la mercancía tenga que ser cargada dentro de un contenedor. La selección de esta modalidad depende de la movilidad, las dimensiones, el peso, la ruta, el tipo de unidad y las condiciones del buque, por lo que cada operación debe evaluarse antes de confirmar el embarque.",
        imagen: "/servicios/ro-ro/ro-ro-bloque-2.webp",
        imagenAlt:
          "Fila de tractores agrícolas en el muelle junto a un buque Ro-Ro",
      },
      {
        eyebrow: "Coordinación de la operación",
        titulo: "Coordinamos su operación de origen a destino",
        parrafo:
          "El transporte Ro-Ro requiere conocer las características exactas de cada unidad antes de programar el embarque. Nuestro equipo da seguimiento a la operación para coordinar las diferentes partes involucradas y facilitar el movimiento de su unidad hasta el destino final.",
        flujo: [
          {
            titulo: "Evaluación de la unidad",
            descripcion:
              "Validamos dimensiones, peso y movilidad para confirmar que la unidad es elegible.",
          },
          {
            titulo: "Reserva",
            descripcion:
              "Aseguramos el espacio en el buque conforme al itinerario y la ruta disponible.",
          },
          {
            titulo: "Recolección",
            descripcion:
              "Trasladamos la unidad desde su ubicación de origen hacia el punto de embarque.",
          },
          {
            titulo: "Traslado a puerto",
            descripcion:
              "La unidad llega a la terminal portuaria dentro de la ventana asignada.",
          },
          {
            titulo: "Embarque Ro-Ro",
            descripcion:
              "La unidad ingresa al buque por la rampa de acceso y se asegura en cubierta.",
          },
          {
            titulo: "Transporte marítimo",
            descripcion:
              "La travesía se realiza según el itinerario del servicio hacia el puerto de destino.",
          },
          {
            titulo: "Desembarque",
            descripcion:
              "La unidad sale del buque rodando y se concentra en la terminal de destino.",
          },
          {
            titulo: "Transporte terrestre",
            descripcion:
              "Coordinamos el traslado desde el puerto hasta el punto de entrega indicado.",
          },
          {
            titulo: "Entrega",
            descripcion:
              "La unidad llega a su destino final con la documentación correspondiente.",
          },
        ],
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre Ro-Ro",
    preguntas: [
      {
        pregunta: "¿Qué significa Ro-Ro?",
        respuesta:
          "Ro-Ro significa roll-on roll-off y describe un sistema de transporte marítimo en el que la carga ingresa y sale del buque mediante rampas, rodando o siendo remolcada.",
      },
      {
        pregunta: "¿Qué tipo de carga puede transportarse en Ro-Ro?",
        respuesta:
          "Principalmente vehículos, maquinaria y equipos con ruedas o sistemas de rodamiento, siempre que sus características sean compatibles con el servicio y la ruta disponible. Cada unidad debe evaluarse de forma individual antes de confirmar el embarque, considerando sus dimensiones, peso y movilidad.",
      },
      {
        pregunta: "¿La maquinaria tiene que ser autopropulsada?",
        respuesta:
          "No necesariamente. Si la unidad no puede desplazarse por sus propios medios, puede ser posible utilizar arrastre, plataforma rodante u otro equipo auxiliar, dependiendo de las condiciones del servicio.",
      },
      {
        pregunta: "¿El Ro-Ro utiliza contenedores?",
        respuesta:
          "El servicio Ro-Ro está diseñado para transportar determinadas unidades sin necesidad de colocarlas dentro de un contenedor convencional. La unidad ingresa al buque por sus propios medios o mediante arrastre y se asegura en la cubierta destinada para ello, lo que evita las maniobras de izaje y el costo del contenedor.",
      },
      {
        pregunta: "¿Es mejor Ro-Ro que transportar la maquinaria en flat rack?",
        respuesta:
          "Depende de las características de la carga. El Ro-Ro puede ser una alternativa para unidades con movilidad o que pueden ser remolcadas, mientras que el flat rack puede ser más adecuado para determinadas cargas sobredimensionadas que requieren una plataforma abierta. La decisión depende del tipo de unidad, dimensiones, peso, ruta, disponibilidad y costo total de la operación.",
      },
      {
        pregunta: "¿Puedo transportar maquinaria que no funciona?",
        respuesta:
          "Puede ser posible, pero debe informarse desde la cotización. Una unidad que no puede desplazarse por sus propios medios puede requerir arrastre, equipo auxiliar o condiciones especiales de manejo.",
      },
      {
        pregunta: "¿Compass Solutions coordina el transporte terrestre?",
        respuesta:
          "Sí. Podemos coordinar el transporte terrestre de la unidad desde el origen hasta el puerto y posteriormente desde el puerto de destino hasta el punto de entrega, sujeto a las características de la operación.",
      },
    ],
    cierre: {
      titulo: "Embarque su vehículo o maquinaria",
      parrafo:
        "Para cotizar un Ro-Ro necesitamos el tipo de unidad, sus dimensiones y peso, si es autopropulsada o requiere arrastre, el origen, el destino y la fecha estimada de embarque. Las fotografías y la ficha técnica ayudan a validar la elegibilidad de la unidad.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "portacontenedor",
    nombre: "Portacontenedor",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "Transporte terrestre de contenedores",
    heroParrafo:
      "Del puerto a su almacén, con una operación coordinada y segura. Coordinamos el transporte terrestre de contenedores desde las principales aduanas marítimas de México hacia el destino que necesite. Contamos con unidades portacontenedores propias y una red de proveedores especializados, lo que nos permite atender el movimiento de contenedores generales y, de acuerdo con las condiciones y requisitos aplicables, mercancías peligrosas.",
    seoTitulo: "Transporte terrestre de contenedores",
    seoDescripcion:
      "Transporte terrestre de contenedores desde las principales aduanas marítimas de México hasta su almacén, planta o centro de distribución.",
    bloques: [
      {
        eyebrow: "Configuración del servicio",
        titulo: "Transporte sencillo y full",
        parrafo:
          "Adaptamos el servicio a las características de su operación. El servicio sencillo transporta un contenedor por unidad, adecuado para operaciones individuales o cargas que por sus características requieren una unidad dedicada. El servicio full transporta dos contenedores en una misma operación, sujeto a las condiciones de peso, ruta, equipo y normatividad aplicable. En ambos casos, la operación se planifica considerando las restricciones de peso y las condiciones de tránsito.",
        imagen: "/servicios/portacontenedor/portacontenedor-bloque-1.webp",
        imagenAlt:
          "Tractocamión con dos contenedores marítimos en configuración full circulando por carretera",
      },
      {
        eyebrow: "Tipos de carga",
        titulo: "Contenedores generales y mercancías peligrosas",
        parrafo:
          "Atendemos el transporte de contenedores generales y podemos coordinar operaciones que involucren mercancías peligrosas, siempre sujetas a la disponibilidad de equipo, ruta, documentación, clasificación de la mercancía y requisitos normativos aplicables. Para mercancías peligrosas es importante proporcionar la información correspondiente desde la cotización para validar las condiciones necesarias para su transporte.",
        imagen: "/servicios/portacontenedor/portacontenedor-bloque-2.webp",
        imagenAlt:
          "Detalle del seguro de esquina que fija un contenedor al chasis portacontenedor",
      },
      {
        eyebrow: "Restricciones de peso",
        titulo: "El peso máximo depende de la configuración y la ruta",
        parrafo:
          "El peso máximo depende del tipo de contenedor, la configuración del equipo, la ruta y las restricciones de peso aplicables. Antes de programar el traslado validamos el peso bruto de la carga y las condiciones de la operación para determinar el equipo adecuado y evitar exceder los límites permitidos.",
        imagen: "/servicios/portacontenedor/portacontenedor-bloque-3.webp",
        imagenAlt:
          "Tractocamión con contenedor saliendo por la garita de acceso de una terminal portuaria",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre transporte de contenedores",
    preguntas: [
      {
        pregunta: "¿Cuál es la diferencia entre un servicio sencillo y full?",
        respuesta:
          "En un servicio sencillo se transporta un contenedor por unidad. En un servicio full se transportan dos contenedores en una misma operación, siempre que las condiciones de peso, equipo, ruta y normatividad aplicable lo permitan.",
      },
      {
        pregunta: "¿Puedo transportar dos contenedores en un mismo viaje?",
        respuesta:
          "Sí, mediante una operación full, siempre que las características de los contenedores, pesos, ruta y equipo sean compatibles con las condiciones aplicables al servicio. La validación se realiza antes de programar el traslado.",
      },
      {
        pregunta: "¿Pueden transportar mercancías peligrosas?",
        respuesta:
          "Podemos coordinar el transporte de mercancías peligrosas sujeto a la clasificación de la mercancía conforme a su hoja de datos de seguridad, documentación, disponibilidad de equipo, ruta y requisitos normativos aplicables. Es importante informar desde la cotización que se trata de mercancía peligrosa.",
      },
      {
        pregunta: "¿Desde qué puertos pueden transportar mi contenedor?",
        respuesta:
          "Podemos analizar servicios desde las principales aduanas y puertos marítimos de México, dependiendo del origen, destino, disponibilidad de equipo y características de la operación. La cobertura de cada ruta se confirma al momento de cotizar, considerando el tipo de contenedor y la fecha requerida.",
      },
      {
        pregunta: "¿Pueden entregar el contenedor directamente en mi almacén?",
        respuesta:
          "Sí. Podemos coordinar el transporte desde el puerto hasta el almacén, planta, centro de distribución o punto de entrega indicado, de acuerdo con las condiciones de la operación.",
      },
    ],
    cierre: {
      titulo: "Coordine el traslado de su contenedor desde puerto",
      parrafo:
        "Para cotizar necesitamos el origen, el destino, el tipo y tamaño de contenedor, el número de unidades, el peso bruto y la fecha requerida de recolección. Si se trata de mercancía peligrosa, es importante indicar su clasificación desde el inicio.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "ltl",
    nombre: "LTL",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "LTL: transporte terrestre consolidado",
    heroParrafo:
      "Mueva su mercancía sin contratar una unidad completa. Con un servicio LTL, su carga comparte capacidad con otros embarques que siguen rutas compatibles, permitiéndole aprovechar mejor el espacio disponible y evitar contratar una unidad completa cuando su volumen no lo requiere. Es una alternativa para embarques pequeños y medianos con cierta flexibilidad en sus tiempos de entrega.",
    seoTitulo: "LTL: transporte terrestre consolidado",
    seoDescripcion:
      "Carga consolidada por carretera cuando no se requiere una unidad completa. Su embarque comparte capacidad en rutas compatibles.",
    bloques: [
      {
        eyebrow: "Costo por capacidad",
        titulo: "Pague solo por la capacidad que necesita",
        parrafo:
          "En un servicio LTL su mercancía comparte la unidad con otros embarques. El costo se determina considerando factores como peso, volumen, dimensiones, ruta, tipo de mercancía y condiciones de manejo. Esto permite aprovechar la capacidad disponible sin asumir el costo de una unidad completa. Si su carga ocupa una parte importante de la unidad o necesita una entrega directa, conviene comparar el LTL contra el FTL.",
        vinetas: [
          "Su embarque no requiere una unidad completa",
          "Tiene volúmenes pequeños o medianos",
          "Busca optimizar el costo de transporte",
          "Puede trabajar con una ventana de entrega flexible",
          "La ruta cuenta con servicio consolidado disponible",
          "La mercancía puede ser manipulada durante los procesos de consolidación",
        ],
        imagen: "/servicios/ltl/ltl-bloque-1.webp",
        imagenAlt:
          "Interior de una caja seca con tarimas de distintos embarques cubiertas y emplayadas",
      },
      {
        eyebrow: "Seguimiento de la operación",
        titulo: "Consolidar no significa perder el control",
        parrafo:
          "Aunque su mercancía comparta espacio con otros embarques, la operación puede mantenerse bajo seguimiento y coordinación durante todo el recorrido. Nuestro objetivo es que tenga un solo equipo coordinando su embarque, aun cuando la mercancía viaje dentro de una operación consolidada.",
        flujo: [
          {
            titulo: "Solicitud",
            descripcion:
              "Recibimos los datos de su embarque y confirmamos la disponibilidad del servicio consolidado.",
          },
          {
            titulo: "Análisis de carga",
            descripcion:
              "Revisamos piezas, peso, dimensiones y embalaje para validar las condiciones de manejo.",
          },
          {
            titulo: "Selección del servicio",
            descripcion:
              "Identificamos la ruta consolidada que mejor se ajusta a su origen y destino.",
          },
          {
            titulo: "Recolección",
            descripcion:
              "Retiramos la mercancía en el punto de origen dentro de la fecha acordada.",
          },
          {
            titulo: "Consolidación",
            descripcion:
              "La carga se agrupa con otros embarques que siguen una ruta compatible.",
          },
          {
            titulo: "Transporte",
            descripcion:
              "El embarque avanza hacia la zona de destino dentro de la unidad consolidada.",
          },
          {
            titulo: "Desconsolidación",
            descripcion:
              "La mercancía se separa del resto de la carga para su distribución final.",
          },
          {
            titulo: "Entrega",
            descripcion:
              "El embarque llega al punto de destino con la evidencia de entrega correspondiente.",
          },
        ],
      },
      {
        eyebrow: "Preparación de la carga",
        titulo: "Preparamos su embarque para una operación segura",
        parrafo:
          "La mercancía debe contar con un embalaje adecuado para las maniobras de carga, descarga, consolidación y desconsolidación que puede involucrar un servicio LTL. Si se trata de mercancía frágil, sobredimensionada, peligrosa o con requerimientos especiales de manejo, es importante indicarlo desde la cotización.",
        vinetas: [
          "Tarima o pallet",
          "Película stretch",
          "Fleje o sujeción",
          "Protección en esquinas",
          "Embalaje adecuado al peso y dimensiones",
          "Identificación visible del embarque",
        ],
        imagen: "/servicios/ltl/ltl-bloque-3.webp",
        imagenAlt:
          "Tarima emplayada con esquineros de cartón lista para su envío en un almacén",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre LTL",
    preguntas: [
      {
        pregunta: "¿Cuál es el volumen mínimo para un embarque LTL?",
        respuesta:
          "No existe un volumen mínimo universal. La conveniencia del LTL depende del peso, volumen, dimensiones, ruta y características de la mercancía. Cuando el espacio requerido se acerca a la capacidad de una unidad completa, conviene comparar el costo y las condiciones de un servicio FTL.",
      },
      {
        pregunta: "¿Cuánto tarda un embarque LTL?",
        respuesta:
          "El tiempo de tránsito depende de la ruta, la frecuencia de salidas y la operación del servicio. A diferencia de un transporte dedicado, el LTL puede involucrar procesos de consolidación y desconsolidación, por lo que estos factores deben considerarse en la programación de entrega.",
      },
      {
        pregunta: "¿Qué embalaje requiere la carga consolidada?",
        respuesta:
          "La mercancía debe estar preparada para las maniobras propias de un servicio consolidado. Para que su mercancía viaje segura es recomendable enviarla paletizada, con película plástica y esquineros para evitar daños. Si la carga no puede estibarse, es importante informarlo para cotizar considerando esa restricción.",
      },
      {
        pregunta: "¿Puedo enviar mercancía internacional mediante LTL?",
        respuesta:
          "Sí. Dependiendo de la ruta y las condiciones de la operación, podemos coordinar servicios terrestres internacionales consolidados, incluyendo operaciones de comercio exterior. La disponibilidad del servicio consolidado varía según el corredor, por lo que se confirma al cotizar.",
      },
      {
        pregunta: "¿El LTL es siempre más barato que el FTL?",
        respuesta:
          "No necesariamente. El LTL puede ser más eficiente cuando su carga ocupa una parte de la capacidad disponible, pero cuando el volumen aumenta puede resultar más conveniente contratar una unidad completa. Por eso es importante comparar ambas opciones antes de tomar una decisión.",
      },
    ],
    cierre: {
      titulo: "Cotice su embarque consolidado terrestre",
      parrafo:
        "Para cotizar un LTL necesitamos el origen y destino, el tipo de mercancía, el número de piezas, el peso total, las dimensiones de cada pieza y el tipo de embalaje. Si la carga no puede estibarse, es importante informarlo para considerarlo en la cotización.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "ftl",
    nombre: "FTL",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "FTL: transporte terrestre dedicado",
    heroParrafo:
      "Una unidad exclusiva para su carga, de origen a destino. El servicio FTL utiliza una unidad de transporte dedicada exclusivamente a un embarque, permitiendo que la mercancía viaje directamente desde el punto de origen hasta el destino. Al no compartir la unidad con otros embarques, se reducen las maniobras de consolidación y desconsolidación, proporcionando mayor control sobre la operación, la ruta y la programación de entrega.",
    seoTitulo: "FTL: transporte terrestre dedicado",
    seoDescripcion:
      "Unidad dedicada en exclusiva a su embarque, de origen a destino, en operaciones nacionales y de comercio exterior, con monitoreo en ruta.",
    bloques: [
      {
        eyebrow: "Unidad dedicada",
        titulo: "Su carga viaja en una unidad dedicada",
        parrafo:
          "Cuando su operación requiere control, continuidad y una ventana de entrega definida, el FTL puede ser la alternativa adecuada. La unidad se asigna exclusivamente a su embarque y la mercancía permanece en ella durante el trayecto, evitando las transferencias asociadas a un servicio consolidado.",
        vinetas: [
          "Cargas de alto volumen",
          "Mercancía que requiere menor manipulación",
          "Embarques con ventanas de entrega definidas",
          "Operaciones sensibles al tiempo",
          "Rutas directas entre origen y destino",
          "Mercancía que requiere condiciones específicas de transporte",
          "Operaciones de importación y exportación con transporte terrestre dedicado",
        ],
        imagen: "/servicios/ftl/ftl-bloque-1.webp",
        imagenAlt:
          "Tractocamión con caja seca estacionado junto a los andenes de un almacén en una mañana con niebla",
      },
      {
        eyebrow: "Planeación anticipada",
        titulo: "Planeamos su transporte antes de que la carga esté lista",
        parrafo:
          "Una operación FTL requiere coordinar previamente unidad, operador, ruta, horarios y condiciones de entrega. Trabajamos con una red de proveedores especializados para identificar la alternativa de transporte adecuada para cada operación. La programación anticipada ayuda a reducir el riesgo de falta de disponibilidad, especialmente durante temporadas de alta demanda o en rutas con capacidad limitada.",
        flujo: [
          {
            titulo: "Tipo de unidad",
            descripcion:
              "Definimos el equipo según la naturaleza de la mercancía y sus condiciones de manejo.",
          },
          {
            titulo: "Peso",
            descripcion:
              "El peso bruto determina la configuración vehicular y las restricciones aplicables en ruta.",
          },
          {
            titulo: "Volumen",
            descripcion:
              "El espacio que ocupa la carga define si una unidad completa resulta adecuada.",
          },
          {
            titulo: "Ruta",
            descripcion:
              "Analizamos el trayecto, sus condiciones y los tiempos reales de recorrido.",
          },
          {
            titulo: "Ventana de carga",
            descripcion:
              "Confirmamos el día y horario en que la unidad debe presentarse en origen.",
          },
          {
            titulo: "Ventana de entrega",
            descripcion:
              "Establecemos el plazo comprometido para la llegada al punto de destino.",
          },
          {
            titulo: "Requerimientos especiales",
            descripcion:
              "Identificamos condiciones de temperatura, manejo o documentación específica de la mercancía.",
          },
        ],
      },
      {
        eyebrow: "Selección de equipo",
        titulo: "La unidad adecuada para su carga",
        parrafo:
          "No todas las mercancías requieren el mismo tipo de equipo. Dependiendo de las características de su operación, podemos analizar diferentes alternativas de transporte terrestre. La selección depende de la mercancía, peso, dimensiones, ruta y requisitos de entrega.",
        vinetas: [
          "Caja seca, para mercancía general que requiere protección contra las condiciones ambientales",
          "Caja refrigerada, para mercancías que requieren condiciones controladas de temperatura",
          "Plataformas, para cargas que requieren acceso lateral o superior",
          "Equipos especializados, para mercancías que por sus dimensiones, peso o características requieren condiciones particulares",
        ],
        imagen: "/servicios/ftl/ftl-bloque-3.webp",
        imagenAlt:
          "Caja seca, caja refrigerada y plataforma estacionadas en un patio de maniobras",
      },
      {
        eyebrow: "Coordinación de la operación",
        titulo: "Coordinamos su operación de origen a destino",
        parrafo:
          "No solamente buscamos una unidad. Coordinamos el transporte de acuerdo con las necesidades de su operación y durante el trayecto damos seguimiento manteniendo comunicación con los participantes involucrados.",
        flujo: [
          {
            titulo: "Solicitud",
            descripcion:
              "Recibimos los datos de su embarque y las condiciones que debe cumplir la operación.",
          },
          {
            titulo: "Análisis de carga",
            descripcion:
              "Revisamos peso, dimensiones y requerimientos para determinar el equipo adecuado.",
          },
          {
            titulo: "Selección de unidad",
            descripcion:
              "Asignamos la unidad y el proveedor que corresponden a las características del embarque.",
          },
          {
            titulo: "Programación",
            descripcion:
              "Definimos fechas, horarios y puntos de carga y descarga con todas las partes.",
          },
          {
            titulo: "Recolección",
            descripcion:
              "La unidad se presenta en origen y la mercancía se carga conforme a lo programado.",
          },
          {
            titulo: "Seguimiento en tránsito",
            descripcion:
              "Damos seguimiento al avance del embarque y le informamos cualquier variación.",
          },
          {
            titulo: "Entrega",
            descripcion:
              "La mercancía llega a destino y se documenta la recepción correspondiente.",
          },
        ],
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre FTL",
    preguntas: [
      {
        pregunta: "¿Cuándo conviene FTL frente a LTL?",
        respuesta:
          "El FTL puede ser conveniente cuando la carga requiere una unidad completa, cuando se busca reducir la manipulación o cuando el tiempo y la programación de entrega son factores importantes. El LTL permite compartir la capacidad de transporte con otros embarques y puede ser una alternativa para cargas de menor volumen. La decisión debe considerar el volumen, peso, ruta, tiempos y costo total de la operación.",
      },
      {
        pregunta: "¿Compass Solutions es dueño de las unidades?",
        respuesta:
          "Compass Solutions cuenta con unidades propias y, como freight forwarder, trabaja además con una red de asociados de negocio para cubrir la demanda de sus clientes. Seleccionamos y coordinamos la unidad de acuerdo con las características de la carga, la ruta y las condiciones requeridas para cada servicio.",
      },
      {
        pregunta: "¿Qué tipos de unidades pueden utilizarse para un FTL?",
        respuesta:
          "La unidad depende de las características de la mercancía. Podemos analizar alternativas como caja seca, caja refrigerada, plataforma y equipos especializados, entre otras opciones disponibles para cada operación.",
      },
      {
        pregunta:
          "¿Qué documentación se requiere para un embarque FTL nacional?",
        respuesta:
          "El traslado de mercancías por territorio nacional requiere la documentación fiscal y de transporte correspondiente, incluyendo el CFDI con complemento carta porte cuando resulte aplicable. Dependiendo de la mercancía, ruta y características del servicio pueden requerirse permisos o documentación adicional. La documentación debe estar completa antes del inicio del traslado.",
      },
      {
        pregunta: "¿Puedo utilizar FTL para transporte internacional?",
        respuesta:
          "Sí. Podemos coordinar transporte terrestre dedicado para operaciones nacionales e internacionales, sujeto a la ruta, aduana, tipo de mercancía, documentación y condiciones del servicio. En operaciones de comercio exterior la coordinación incluye los tiempos de cruce y la documentación correspondiente.",
      },
      {
        pregunta: "¿Puedo solicitar una unidad con características especiales?",
        respuesta:
          "Sí. Si su mercancía requiere condiciones específicas de transporte, es importante indicarlo desde la cotización para analizar la disponibilidad del equipo adecuado y programar la operación con el tiempo necesario.",
      },
    ],
    cierre: {
      titulo: "¿Necesita una unidad exclusiva para su carga?",
      parrafo:
        "Compártanos origen, destino, tipo de mercancía, peso, dimensiones y fecha requerida, y nuestro equipo analizará la alternativa de transporte dedicada más adecuada.",
      textoBoton: "Solicitar cotización FTL",
    },
  },
  {
    slug: "lowboy",
    nombre: "Lowboy",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "Lowboy: transporte de carga sobredimensionada",
    heroParrafo:
      "Más capacidad para transportar maquinaria de gran altura y peso. El lowboy, también conocido como cama baja, es una configuración de transporte diseñada para movilizar maquinaria, equipos y cargas especiales que requieren una altura de plataforma reducida. Su menor altura de carga ayuda a disminuir la altura total de la unidad, lo que puede facilitar el tránsito de equipos de gran altura y ofrecer mayor margen frente a los gálibos de la ruta.",
    seoTitulo: "Lowboy para maquinaria pesada",
    seoDescripcion:
      "Transporte en lowboy o cama baja para maquinaria y equipos de gran altura y peso, con estudio de ruta y permisos coordinados.",
    bloques: [
      {
        eyebrow: "Altura de plataforma reducida",
        titulo: "Cuando una plataforma convencional no es suficiente",
        parrafo:
          "El lowboy coloca la carga a una altura menor que una plataforma convencional. Esto puede ser especialmente útil cuando necesita transportar equipos altos y reducir la altura total del conjunto. La selección del equipo depende de las dimensiones y peso de la carga, así como de la ruta y las condiciones específicas del traslado.",
        vinetas: [
          "Maquinaria de construcción",
          "Excavadoras y maquinaria pesada",
          "Transformadores",
          "Equipos industriales",
          "Maquinaria agrícola",
          "Componentes para proyectos industriales",
          "Equipos de gran altura o peso",
        ],
        imagen: "/servicios/lowboy/lowboy-bloque-1.webp",
        imagenAlt:
          "Excavadora de orugas cargada sobre un remolque cama baja en un patio",
      },
      {
        eyebrow: "Planeación previa",
        titulo: "El transporte especializado empieza antes de cargar",
        parrafo:
          "Una carga sobredimensionada no se puede tratar como un embarque convencional. Coordinamos estos elementos con proveedores especializados para que el movimiento sea planeado antes de que la unidad llegue a cargar.",
        vinetas: [
          "Análisis o estudio de ruta",
          "Permisos correspondientes",
          "Señalización especial",
          "Vehículos piloto o de apoyo",
          "Escoltas, cuando sean requeridas",
          "Restricciones o ventanas de circulación",
          "Coordinación con autoridades y terceros",
          "Planeación de maniobras de carga y descarga",
        ],
        flujo: [
          {
            titulo: "Carga",
            descripcion:
              "Identificamos el tipo de maquinaria o equipo y sus condiciones de manejo.",
          },
          {
            titulo: "Dimensiones",
            descripcion:
              "Medimos largo, ancho y altura para determinar si exceden los límites de circulación ordinaria.",
          },
          {
            titulo: "Peso",
            descripcion:
              "El peso total define la configuración vehicular y los permisos que pueden aplicar.",
          },
          {
            titulo: "Equipo",
            descripcion:
              "Seleccionamos la configuración de transporte adecuada a las características de la carga.",
          },
          {
            titulo: "Ruta",
            descripcion:
              "Analizamos gálibos, restricciones y condiciones del trayecto antes de confirmar el movimiento.",
          },
          {
            titulo: "Permisos",
            descripcion:
              "Gestionamos las autorizaciones que correspondan según dimensiones, peso y jurisdicciones involucradas.",
          },
          {
            titulo: "Apoyos",
            descripcion:
              "Definimos si la operación requiere señalización, vehículos piloto o escoltas.",
          },
          {
            titulo: "Traslado",
            descripcion:
              "El movimiento se ejecuta dentro de las ventanas de circulación autorizadas.",
          },
        ],
      },
      {
        eyebrow: "Selección de equipo",
        titulo: "Elegimos el equipo de acuerdo con su carga",
        parrafo:
          "No todas las cargas sobredimensionadas necesitan un lowboy. Antes de cotizar un equipo específico analizamos las características de la carga y las condiciones del recorrido. Si no sabe qué equipo necesita, podemos ayudarle a determinar la alternativa adecuada.",
        vinetas: [
          "Peso total",
          "Largo, ancho y altura",
          "Centro de gravedad",
          "Puntos de apoyo y sujeción",
          "Tipo de maquinaria o equipo",
          "Distancia del traslado",
          "Condiciones de la ruta",
          "Restricciones de circulación",
          "Requerimientos de carga y descarga",
        ],
        imagen: "/servicios/lowboy/lowboy-bloque-3.webp",
        imagenAlt:
          "Remolque cama baja vacío con cuello desmontable en un patio de terracería",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre lowboy",
    preguntas: [
      {
        pregunta: "¿Lowboy y cama baja son lo mismo?",
        respuesta:
          "Sí. Lowboy es el término utilizado en inglés y cama baja es una denominación común en México. Se refiere a una configuración cuya plataforma de carga se encuentra a menor altura que una plataforma convencional, permitiendo reducir la altura total de la unidad.",
      },
      {
        pregunta: "¿Cuándo se considera que una carga es sobredimensionada?",
        respuesta:
          "Cuando sus dimensiones o peso exceden los límites establecidos para una circulación ordinaria, de acuerdo con la configuración vehicular y las condiciones de la ruta. Los requerimientos pueden variar dependiendo del peso, dimensiones, vehículo, ruta y jurisdicciones involucradas.",
      },
      {
        pregunta: "¿Qué tipo de maquinaria puedo transportar en lowboy?",
        respuesta:
          "Puede utilizarse para diferentes tipos de maquinaria pesada y equipos industriales, como maquinaria de construcción, agrícola, transformadores y otros equipos que requieran una plataforma de baja altura. La viabilidad debe evaluarse de acuerdo con las dimensiones y peso de cada carga.",
      },
      {
        pregunta:
          "¿Se requieren permisos para transportar carga sobredimensionada?",
        respuesta:
          "Dependiendo de las dimensiones, peso, configuración vehicular y ruta, pueden requerirse permisos y condiciones especiales de circulación. Por eso es importante analizar la operación antes de programar el traslado.",
      },
      {
        pregunta: "¿Cuánto tiempo toma tramitar los permisos?",
        respuesta:
          "El tiempo depende de la autoridad, ruta, dimensiones, peso y permisos requeridos. Los movimientos que atraviesan diferentes entidades pueden involucrar requisitos adicionales. Por ello recomendamos iniciar la planeación con anticipación.",
      },
      {
        pregunta: "¿Compass Solutions cuenta con lowboys propios?",
        respuesta:
          "Compass Solutions cuenta con unidades propias y, como freight forwarder, trabaja además con una red de proveedores especializados en transporte de carga sobredimensionada. Esto nos permite seleccionar el equipo adecuado para cada operación de acuerdo con las características de la carga y la ruta requerida.",
      },
      {
        pregunta: "¿Pueden transportar maquinaria que no está operativa?",
        respuesta:
          "Sí, dependiendo de sus características. Si la maquinaria no puede desplazarse por sus propios medios, deben analizarse previamente las maniobras de carga, descarga, sujeción y equipo auxiliar requerido.",
      },
    ],
    cierre: {
      titulo: "Planeemos el traslado de su maquinaria",
      parrafo:
        "Para cotizar un lowboy necesitamos el origen y destino, el tipo de carga, sus dimensiones completas, el peso total y fotografías del equipo. Los permisos y el estudio de ruta requieren tiempo, por lo que conviene iniciar la planeación con anticipación.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "plataformas",
    nombre: "Plataformas",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "Plataformas: transporte de carga abierta",
    heroParrafo:
      "Mayor flexibilidad para transportar mercancía que no requiere una caja cerrada. Las plataformas son unidades de transporte de carga abierta que permiten realizar maniobras por los costados y por la parte superior. Son una alternativa para mercancías que, por sus dimensiones, forma, peso o características de manipulación, no requieren las paredes de un vehículo cerrado.",
    seoTitulo: "Plataformas: transporte de carga abierta",
    seoDescripcion:
      "Transporte en plataforma para estructuras, tubería, maquinaria y materiales que requieren maniobras laterales o superiores.",
    bloques: [
      {
        eyebrow: "Acceso a la carga",
        titulo: "Acceso por los costados y por arriba",
        parrafo:
          "La configuración abierta de una plataforma permite adaptar la maniobra a la forma y dimensiones de cada pieza. La carga puede colocarse directamente sobre la superficie mediante grúa, montacargas, equipo de izaje o rampas y medios auxiliares, dependiendo de la carga. Esto resulta especialmente útil cuando la mercancía requiere maniobras verticales, laterales o equipos de carga que no pueden utilizarse dentro de una caja cerrada.",
        vinetas: [
          "Peso",
          "Dimensiones",
          "Centro de gravedad",
          "Puntos de apoyo",
          "Forma de la mercancía",
          "Características de la ruta",
          "Condiciones de carga y descarga",
        ],
        imagen: "/servicios/plataformas/plataformas-bloque-1.webp",
        imagenAlt:
          "Montacargas cargando tubería de acero sobre una plataforma en un patio industrial",
      },
      {
        eyebrow: "Tipos de mercancía",
        titulo: "Qué tipo de mercancía puede transportarse en plataforma",
        parrafo:
          "Las plataformas son una alternativa versátil para diferentes tipos de carga abierta. La viabilidad del servicio debe analizarse de acuerdo con las características específicas de cada embarque.",
        vinetas: [
          "Estructuras metálicas",
          "Tubería",
          "Perfiles y materiales de acero",
          "Maquinaria y equipos",
          "Materiales de construcción",
          "Equipos industriales",
          "Madera y productos de grandes dimensiones",
          "Componentes para proyectos",
          "Cargas que requieren maniobras superiores o laterales",
        ],
        imagen: "/servicios/plataformas/plataformas-bloque-2.webp",
        imagenAlt:
          "Plataforma cargada con tubos y perfiles de acero asegurados con cinchas",
      },
      {
        eyebrow: "Sujeción y protección",
        titulo: "Protegemos y aseguramos su carga durante el traslado",
        parrafo:
          "Transportar mercancía en una plataforma requiere una correcta planeación de la distribución, apoyo y sujeción de la carga. Dependiendo de las características del embarque, pueden utilizarse cadenas, tensores, estrobos, amarres u otros elementos de sujeción adecuados para la operación. Cuando la mercancía necesita protección contra lluvia, polvo u otros factores ambientales, pueden evaluarse soluciones como lonas o coberturas especiales. La protección y sujeción deben definirse antes de iniciar el traslado.",
        imagen: "/servicios/plataformas/plataformas-bloque-3.webp",
        imagenAlt:
          "Cadenas y tensores asegurando una viga de acero sobre la cubierta de una plataforma",
      },
      {
        eyebrow: "Coordinación de la operación",
        titulo: "Coordinamos su operación de origen a destino",
        parrafo:
          "No se trata únicamente de asignar una plataforma. Coordinamos los diferentes elementos necesarios para que su carga pueda ser transportada de acuerdo con sus características, trabajando con proveedores especializados y dando seguimiento a las condiciones necesarias para el traslado.",
        flujo: [
          {
            titulo: "Solicitud",
            descripcion:
              "Recibimos los datos de su carga y las condiciones de la operación requerida.",
          },
          {
            titulo: "Análisis de carga",
            descripcion:
              "Revisamos dimensiones, peso, forma y puntos de apoyo de cada pieza.",
          },
          {
            titulo: "Selección de plataforma",
            descripcion:
              "Definimos la configuración de unidad que corresponde a las características del embarque.",
          },
          {
            titulo: "Planeación",
            descripcion:
              "Coordinamos ruta, ventanas de maniobra y condiciones de carga y descarga.",
          },
          {
            titulo: "Carga y sujeción",
            descripcion:
              "La mercancía se coloca y se asegura con los elementos adecuados para el trayecto.",
          },
          {
            titulo: "Transporte",
            descripcion:
              "La unidad avanza hacia el destino bajo las condiciones definidas para la operación.",
          },
          {
            titulo: "Seguimiento",
            descripcion:
              "Damos seguimiento al avance del traslado y mantenemos comunicación durante el recorrido.",
          },
          {
            titulo: "Entrega",
            descripcion:
              "La carga llega a destino y se coordina la maniobra de descarga correspondiente.",
          },
        ],
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre plataformas",
    preguntas: [
      {
        pregunta: "¿Qué diferencia hay entre una plataforma y un lowboy?",
        respuesta:
          "La plataforma mantiene una altura de carga convencional, mientras que el lowboy cuenta con una cama más baja para reducir la altura total de la unidad. La selección depende de las dimensiones, peso y características de la carga, así como de las condiciones de la ruta.",
      },
      {
        pregunta: "¿Qué tipo de carga puedo transportar en una plataforma?",
        respuesta:
          "Puede utilizarse para estructuras, tubería, maquinaria, materiales de construcción, acero, equipos industriales y otras mercancías que puedan transportarse de forma segura sobre una superficie abierta.",
      },
      {
        pregunta: "¿La carga en plataforma requiere algún tipo de sujeción?",
        respuesta:
          "Sí. La mercancía debe asegurarse de acuerdo con su peso, dimensiones, centro de gravedad, puntos de apoyo y características físicas. El sistema puede incluir cadenas, tensores, estrobos u otros elementos adecuados para cada operación.",
      },
      {
        pregunta: "¿La carga en plataforma puede viajar descubierta?",
        respuesta:
          "Sí, cuando las características de la mercancía lo permiten. Si requiere protección contra lluvia, polvo u otros factores externos, pueden evaluarse lonas u otras soluciones de cobertura definidas antes del traslado.",
      },
      {
        pregunta: "¿Puedo transportar maquinaria en plataforma?",
        respuesta:
          "Sí, dependiendo de las dimensiones, peso, forma, condiciones de carga y características de la ruta. Cuando la maquinaria requiere una altura de carga menor, puede ser conveniente analizar una alternativa como el lowboy.",
      },
      {
        pregunta: "¿Una plataforma es adecuada para carga sobredimensionada?",
        respuesta:
          "Puede serlo, dependiendo de las dimensiones y peso de la mercancía y de las condiciones de circulación. Si las dimensiones exceden los límites permitidos para circulación ordinaria, pueden requerirse permisos y condiciones especiales.",
      },
      {
        pregunta:
          "¿Qué información se necesita para cotizar una carga en plataforma?",
        respuesta:
          "Como mínimo necesitamos origen, destino, dimensiones, peso y características de la mercancía. También es importante conocer cómo se realizará la carga y descarga, así como los puntos disponibles para su apoyo y sujeción.",
      },
    ],
    cierre: {
      titulo: "Su carga no necesita una caja cerrada",
      parrafo:
        "Si tiene maquinaria, estructuras, tubería o mercancía que requiere una unidad abierta, compártanos origen, destino, dimensiones, peso y fotografías de su carga. Analizamos la unidad y las condiciones necesarias para transportarla.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "unidades-con-rampa",
    nombre: "Unidades con rampa",
    heroEyebrow: "Transporte terrestre",
    heroTitulo: "Unidades con rampa hidráulica",
    heroParrafo:
      "Carga y descarga a nivel de piso, sin necesidad de un andén. Una unidad con rampa hidráulica facilita la carga y descarga de maquinaria, equipos y mercancías directamente desde el nivel del piso, siempre que las características de la carga permitan realizar la maniobra por rodamiento. Es una solución práctica para maquinaria autopropulsada, equipos sobre ruedas u orugas y cargas que pueden acceder a la unidad mediante una rampa.",
    seoTitulo: "Unidades con rampa hidráulica",
    seoDescripcion:
      "Transporte con rampa hidráulica para maquinaria y equipos que se cargan por rodamiento, sin necesidad de andén, grúa ni maniobra de izaje.",
    bloques: [
      {
        eyebrow: "Sin infraestructura especializada",
        titulo: "Carga a nivel de piso, sin depender de un andén",
        parrafo:
          "La rampa hidráulica crea un acceso entre el nivel del piso y la superficie de carga de la unidad. Cuando el equipo puede desplazarse por sus propios medios o mediante un sistema de rodamiento compatible, la rampa permite realizar la carga y descarga sin depender necesariamente de equipo externo. Esto puede reducir o evitar costos adicionales de maniobra, dependiendo de las condiciones de la operación.",
        vinetas: [
          "Andén",
          "Grúa",
          "Montacargas adecuado",
          "Equipo especializado para maniobras de izaje",
        ],
        imagen: "/servicios/unidades-con-rampa/unidades-con-rampa-bloque-1.webp",
        imagenAlt:
          "Camión con rampa trasera desplegada en un patio de maniobras",
      },
      {
        eyebrow: "Equipos elegibles",
        titulo: "Para maquinaria que puede cargarse por rodamiento",
        parrafo:
          "Las unidades con rampa hidráulica son especialmente útiles para equipos que pueden subir y bajar de la unidad mediante rodamiento. La viabilidad depende principalmente del peso, dimensiones, capacidad de la rampa, altura de acceso, pendiente y condiciones del punto de carga y descarga.",
        vinetas: [
          "Maquinaria autopropulsada",
          "Montacargas",
          "Equipos sobre ruedas",
          "Maquinaria sobre orugas",
          "Plataformas de trabajo",
          "Generadores",
          "Equipos industriales móviles",
          "Maquinaria especializada",
        ],
        imagen: "/servicios/unidades-con-rampa/unidades-con-rampa-bloque-2.webp",
        imagenAlt:
          "Minicargador de orugas subiendo por la rampa de un camión plataforma",
      },
      {
        eyebrow: "Evaluación previa",
        titulo: "Rampa o grúa, primero evaluamos su carga",
        parrafo:
          "No todos los equipos requieren la misma maniobra. Si el equipo puede desplazarse mediante rodamiento y la rampa tiene capacidad suficiente, una unidad con rampa puede ser una alternativa eficiente. Si la carga no puede desplazarse, es demasiado pesada para la rampa o requiere una maniobra de izaje, puede ser necesario utilizar grúa, montacargas u otro equipo especializado.",
        flujo: [
          {
            titulo: "Equipo",
            descripcion:
              "Identificamos el tipo de maquinaria y su sistema de rodamiento.",
          },
          {
            titulo: "Peso",
            descripcion:
              "Validamos que el peso del equipo no exceda la capacidad de la rampa.",
          },
          {
            titulo: "Dimensiones",
            descripcion:
              "Confirmamos que las medidas sean compatibles con la superficie de carga de la unidad.",
          },
          {
            titulo: "Movilidad",
            descripcion:
              "Determinamos si el equipo se desplaza por sus propios medios o requiere asistencia.",
          },
          {
            titulo: "Acceso",
            descripcion:
              "Revisamos el espacio, la superficie y la pendiente disponibles en origen y destino.",
          },
          {
            titulo: "Maniobra",
            descripcion:
              "Definimos cómo se realizará la carga y si se requiere equipo auxiliar.",
          },
          {
            titulo: "Unidad",
            descripcion:
              "Asignamos la unidad con la rampa y la capacidad adecuadas para la operación.",
          },
        ],
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre unidades con rampa",
    preguntas: [
      {
        pregunta: "¿Qué equipo se puede cargar con rampa hidráulica?",
        respuesta:
          "Principalmente maquinaria autopropulsada, equipos sobre ruedas u orugas y otras cargas que puedan acceder a la unidad mediante rodamiento. La viabilidad depende del peso, dimensiones, capacidad de la rampa y condiciones de acceso.",
      },
      {
        pregunta: "¿Qué capacidad tiene una rampa hidráulica?",
        respuesta:
          "La capacidad depende del tipo de unidad y de las especificaciones de la rampa. Antes de programar el servicio deben validarse el peso y las dimensiones del equipo, así como las condiciones de acceso y la maniobra.",
      },
      {
        pregunta: "¿Necesito un andén para utilizar este servicio?",
        respuesta:
          "No necesariamente. Una de las principales ventajas de este tipo de unidad es precisamente facilitar la carga y descarga desde el nivel del piso, cuando las condiciones del lugar lo permiten.",
      },
      {
        pregunta: "¿Necesito una grúa para cargar mi equipo?",
        respuesta:
          "No necesariamente. Si el equipo puede desplazarse mediante rodamiento y la rampa tiene capacidad suficiente, puede realizarse la carga sin utilizar una grúa. Si el equipo no puede desplazarse por sus propios medios, debe evaluarse si se requiere equipo auxiliar para realizar la maniobra.",
      },
      {
        pregunta: "¿Puedo cargar maquinaria que no funciona?",
        respuesta:
          "Puede ser posible, pero debe evaluarse previamente. Si la maquinaria no puede desplazarse, será necesario determinar cómo será colocada sobre la unidad y si se requiere un equipo auxiliar para realizar la carga.",
      },
      {
        pregunta:
          "¿La rampa hidráulica sirve para cualquier tipo de mercancía?",
        respuesta:
          "No. Deben evaluarse el peso, dimensiones, estabilidad, movilidad y características de la mercancía, además de las condiciones de acceso en origen y destino. Una carga que no puede desplazarse por rodamiento requiere otro tipo de unidad o equipo auxiliar para la maniobra.",
      },
      {
        pregunta: "¿La rampa puede utilizarse en cualquier lugar?",
        respuesta:
          "Debe existir un acceso adecuado y condiciones suficientes para realizar la maniobra de manera segura. La pendiente, superficie, espacio disponible, altura de acceso y capacidad de la rampa son factores que deben revisarse antes de programar el servicio.",
      },
    ],
    cierre: {
      titulo: "Evaluemos la maniobra de su equipo",
      parrafo:
        "Para cotizar necesitamos el tipo de equipo, su peso y dimensiones, si se desplaza por sus propios medios y las condiciones de acceso en origen y destino. Fotografías o videos del punto de carga nos ayudan a validar si la rampa es la alternativa adecuada.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "carga-aerea",
    nombre: "Carga aérea",
    heroEyebrow: "Transporte aéreo",
    heroTitulo:
      "Carga aérea: cuando el tiempo de entrega es parte de su negocio",
    heroParrafo:
      "Cuando necesita mover mercancía entre países con mayor rapidez y coordinación, el transporte aéreo puede ser la alternativa adecuada. Coordinamos embarques de carga aérea desde la recolección en origen hasta la entrega en destino, integrando transporte terrestre, documentación, despacho aduanal, espacio aéreo y entrega final. Analizamos las características de cada embarque para seleccionar la alternativa que mejor se adapte a su urgencia, tipo de mercancía, peso, volumen, ruta y presupuesto.",
    seoTitulo: "Carga aérea: fletes aéreos a México",
    seoDescripcion:
      "Fletes aéreos del extranjero a México y rutas nacionales, con recolección en origen, despacho aduanal y entrega en destino.",
    bloques: [
      {
        eyebrow: "Cuándo conviene",
        titulo: "Cuando el tiempo importa, elija transporte aéreo",
        parrafo:
          "El transporte aéreo es una alternativa especialmente útil cuando necesita reducir los tiempos de tránsito frente a otras modalidades o cuando el valor de la mercancía justifica una solución más rápida.",
        vinetas: [
          "Embarques urgentes",
          "Refacciones críticas",
          "Componentes industriales",
          "Productos de alto valor",
          "Muestras y prototipos",
          "Mercancía para proyectos",
          "Reposición de inventarios",
          "Productos con ciclos de entrega cortos",
          "Embarques de importación y exportación",
        ],
        imagen: "/servicios/carga-aerea/carga-aerea-bloque-1.webp",
        imagenAlt:
          "Avión de carga con la nariz abierta y una plataforma elevadora lista para cargar en la pista",
      },
      {
        eyebrow: "Operación completa",
        titulo: "Más que un vuelo, coordinamos toda la operación",
        parrafo:
          "Un embarque aéreo no comienza cuando la mercancía llega al aeropuerto. Para que la carga llegue correctamente a destino es necesario coordinar diferentes etapas, incluyendo los requerimientos de comercio exterior para la importación o exportación y el transporte terrestre hasta las instalaciones del destinatario.",
        flujo: [
          {
            titulo: "Recolección",
            descripcion:
              "Retiramos la mercancía en el punto de origen y la trasladamos hacia el aeropuerto.",
          },
          {
            titulo: "Preparación",
            descripcion:
              "Validamos el embalaje, el marcado y las condiciones de aceptación de la carga.",
          },
          {
            titulo: "Documentación",
            descripcion:
              "Integramos la guía aérea y los documentos que exige la operación.",
          },
          {
            titulo: "Aduana",
            descripcion:
              "Se realiza el despacho de exportación conforme a la normativa aplicable.",
          },
          {
            titulo: "Aeropuerto",
            descripcion:
              "La carga ingresa a la terminal y se entrega a la aerolínea para su embarque.",
          },
          {
            titulo: "Transporte aéreo",
            descripcion:
              "El embarque viaja en el vuelo asignado hacia el aeropuerto de destino.",
          },
          {
            titulo: "Aduana en destino",
            descripcion:
              "Se completa el despacho de importación y la mercancía queda liberada.",
          },
          {
            titulo: "Entrega final",
            descripcion:
              "Coordinamos el transporte terrestre hasta las instalaciones del destinatario.",
          },
        ],
      },
      {
        eyebrow: "Alternativas de servicio",
        titulo: "Elija la solución de transporte adecuada",
        parrafo:
          "No todos los embarques aéreos tienen las mismas necesidades. Podemos analizar diferentes alternativas de servicio para encontrar el equilibrio adecuado entre tiempo de tránsito, costo y condiciones de operación.",
        vinetas: [
          "Peso y volumen",
          "Origen y destino",
          "Urgencia",
          "Frecuencia de vuelos",
          "Tipo de mercancía",
          "Disponibilidad de espacio",
          "Requisitos especiales de manejo",
          "Presupuesto",
        ],
        imagen: "/servicios/carga-aerea/carga-aerea-bloque-3.webp",
        imagenAlt:
          "Contenedores aéreos y una tarima asegurada con red en la plataforma junto a un avión de carga",
      },
      {
        eyebrow: "Tipos de carga",
        titulo: "Carga general y soluciones especiales",
        parrafo:
          "Dependiendo de las características del embarque, podemos analizar alternativas para diferentes tipos de mercancía. Para mercancías peligrosas, perecederas o con condiciones especiales es necesario validar previamente los requisitos de aceptación, documentación, embalaje y manejo.",
        vinetas: [
          "Carga general",
          "Mercancía de alto valor",
          "Refacciones y componentes",
          "Maquinaria y equipos",
          "Muestras",
          "Carga urgente",
          "Mercancía con requerimientos especiales de manejo",
          "Carga que requiere condiciones específicas de transporte",
        ],
        imagen: "/servicios/carga-aerea/carga-aerea-bloque-4.webp",
        imagenAlt:
          "Terminal de carga aérea con tarimas aseguradas con red sobre transportadores de rodillos",
      },
      {
        eyebrow: "Preparación de la carga",
        titulo: "El embalaje también importa",
        parrafo:
          "Una carga aérea puede pasar por diferentes procesos de manipulación antes de llegar a su destino. Un buen embalaje protege la mercancía y puede ayudar a optimizar el espacio utilizado durante el transporte. Si su carga requiere preparación especial, también podemos coordinar soluciones de empaque y embalaje para transporte internacional.",
        vinetas: [
          "Peso y dimensiones",
          "Fragilidad",
          "Tipo de mercancía",
          "Número de piezas",
          "Manipulación aeroportuaria",
          "Protección contra impactos",
          "Aprovechamiento del espacio",
          "Requisitos especiales del producto",
        ],
        imagen: "/servicios/carga-aerea/carga-aerea-bloque-5.webp",
        imagenAlt:
          "Tarima de carga aérea cubierta con plástico y asegurada con red en la plataforma de una terminal",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre carga aérea",
    preguntas: [
      {
        pregunta: "¿Cuándo conviene utilizar transporte aéreo?",
        respuesta:
          "Cuando el tiempo de tránsito es un factor importante, necesita una reposición urgente o el valor de la mercancía justifica una alternativa de transporte más rápida. También puede ser conveniente para muestras, refacciones, componentes críticos y embarques de menor volumen.",
      },
      {
        pregunta: "¿Qué peso máximo puedo enviar por avión?",
        respuesta:
          "No existe un límite único para todos los embarques. La capacidad depende de la aerolínea, aeronave, ruta, aeropuerto, dimensiones y tipo de mercancía. Para cargas de gran peso o dimensiones especiales es necesario validar previamente la disponibilidad.",
      },
      {
        pregunta: "¿La carga aérea se cobra por peso o por volumen?",
        respuesta:
          "Puede considerarse tanto el peso bruto como el peso volumétrico, aplicando el que resulte mayor. Por esa razón es importante conocer las dimensiones reales de cada pieza, ya que una mercancía ligera con volumen considerable puede generar un costo mayor al esperado.",
      },
      {
        pregunta: "¿Puedo importar y exportar mercancía por vía aérea?",
        respuesta:
          "Sí. Podemos coordinar operaciones aéreas tanto de importación como de exportación, sujetas a las condiciones de la mercancía, ruta, documentación y requisitos aduanales aplicables. En ambos casos damos seguimiento al despacho y a la entrega en destino.",
      },
      {
        pregunta: "¿Puedo transportar mercancía peligrosa por vía aérea?",
        respuesta:
          "Es posible para determinadas mercancías, pero están sujetas a requisitos específicos de clasificación, embalaje, marcado, documentación y aceptación por parte de la aerolínea. La carga debe validarse mediante su hoja de datos de seguridad antes de proceder con la reserva.",
      },
      {
        pregunta: "¿Pueden recoger mi mercancía en mi almacén?",
        respuesta:
          "Sí. Podemos coordinar el transporte terrestre desde el punto de origen hasta el aeropuerto y posteriormente la entrega en destino, dependiendo de las condiciones de la operación.",
      },
      {
        pregunta: "¿Puedo solicitar solamente el transporte aéreo?",
        respuesta:
          "Sí. Podemos cotizar únicamente el tramo aéreo o coordinar una solución integral puerta a puerta, dependiendo de lo que necesite su operación y del alcance que prefiera contratar.",
      },
    ],
    cierre: {
      titulo: "Cotice su embarque aéreo",
      parrafo:
        "Para cotizar carga aérea necesitamos el origen y destino, el tipo de mercancía, el número de piezas, el peso bruto y las dimensiones de cada una. El costo se calcula sobre el peso real o el volumétrico, según cuál resulte mayor, por eso las medidas son determinantes.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "almacenaje-y-distribucion",
    nombre: "Almacenaje y distribución",
    heroEyebrow: "Almacenaje",
    heroTitulo: "Almacenaje y distribución",
    heroParrafo:
      "La mercancía no siempre va directo del puerto a su planta. Cuando necesita consolidar, fraccionar o esperar el momento correcto para distribuir, el almacenaje es parte de la cadena y no un servicio aparte. Compass coordina el espacio, el manejo y la salida hacia cada destino.",
    seoTitulo: "Almacenaje y distribución de mercancía",
    seoDescripcion:
      "Almacenaje y distribución coordinados con su operación de comercio exterior, desde la salida de la aduana hasta el punto de entrega final.",
    bloques: [
      {
        eyebrow: "Entre la aduana y el destino",
        titulo: "El punto donde se decide cómo sale la mercancía",
        parrafo:
          "Un embarque que llega completo muchas veces se distribuye fraccionado hacia varios destinos. El almacén es donde ocurre esa transformación: recepción, verificación, acomodo y preparación de cada salida. Coordinar ese punto con el resto de la cadena evita que la mercancía se detenga justo antes de llegar.",
        imagen: "/servicios/almacenaje-y-distribucion/almacenaje-y-distribucion-bloque-1.webp",
        imagenAlt:
          "Pasillo de almacén con racks altos llenos de cajas y un trabajador con chaleco de seguridad revisando la mercancía",
      },
      {
        eyebrow: "Distribución",
        titulo: "De un solo arribo a múltiples entregas",
        parrafo:
          "Desde el almacén, la mercancía sale hacia sucursales, clientes o plantas según su programación. Compass coordina el transporte de cada salida con la misma trazabilidad que el tramo internacional, para que usted tenga visibilidad continua desde el origen hasta la entrega final.",
        imagen: "/servicios/almacenaje-y-distribucion/almacenaje-y-distribucion-bloque-2.webp",
        imagenAlt:
          "Andenes de un centro de distribución con camiones estacionados y tarimas emplayadas en el patio",
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
    cierre: {
      titulo: "Coordine su almacenaje y distribución",
      parrafo:
        "Para evaluar el servicio necesitamos conocer el tipo de producto, el volumen estimado, la frecuencia de movimiento y los destinos de distribución. Con esa información definimos el esquema de recepción, resguardo y salidas que su operación requiere.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "empaque-y-embalaje",
    nombre: "Empaque y embalaje",
    heroEyebrow: "Almacenaje",
    heroTitulo: "Empaque y embalaje para transporte internacional",
    heroParrafo:
      "Una carga bien protegida reduce riesgos durante la manipulación, el tránsito y la entrega. El tipo de empaque y embalaje debe considerar las características de la mercancía, el medio de transporte, las maniobras y el destino. En operaciones internacionales, una mala protección puede generar daños, retrasos o costos adicionales, por lo que cada embarque requiere una solución de embalaje acorde con su recorrido y condiciones de manejo.",
    seoTitulo: "Empaque y embalaje para exportación",
    seoDescripcion:
      "Empaque y embalaje conforme a los requisitos de cada modo de transporte y destino, para que su mercancía llegue en las mismas condiciones.",
    bloques: [
      {
        eyebrow: "Según el recorrido",
        titulo: "Cada trayecto exige un embalaje distinto",
        parrafo:
          "Una carga consolidada que pasa por dos transbordos no requiere lo mismo que un contenedor sellado en origen. La estiba, la humedad, la vibración y el número de manipulaciones definen qué protección necesita el producto. Diseñar el embalaje conociendo el recorrido evita daños que después nadie puede reparar.",
        imagen: "/servicios/empaque-y-embalaje/empaque-y-embalaje-bloque-1.webp",
        imagenAlt:
          "Operario envolviendo con película plástica una tarima de cajas en un área de embalaje",
      },
      {
        eyebrow: "Requisitos normativos",
        titulo: "La madera y el marcado tienen reglas",
        parrafo:
          "Cuando una operación internacional utiliza embalaje de madera, no basta con que la mercancía esté bien protegida. La madera debe cumplir con los requisitos fitosanitarios y de marcado aplicables al país de destino. Un incumplimiento puede generar inspecciones, retenciones, costos adicionales o demoras en la liberación de la carga. Por eso, estos requisitos deben revisarse antes de embarcar y no cuando la mercancía ya llegó a destino.",
        imagen: "/servicios/empaque-y-embalaje/empaque-y-embalaje-bloque-2.webp",
        imagenAlt:
          "Caja de madera reforzada con flejes y esquineros metálicos en una nave industrial",
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
    cierre: {
      titulo: "Proteja su carga desde el origen",
      parrafo:
        "Para evaluar la solución de embalaje necesitamos el tipo de mercancía, sus dimensiones y peso, el modo de transporte y el país de destino. El recorrido completo determina qué protección necesita la carga y qué requisitos normativos aplican.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "expeditado",
    nombre: "Expeditado",
    heroEyebrow: "Valor agregado",
    heroTitulo: "Servicio expeditado: cuando no hay margen",
    heroParrafo:
      "Cuando una carga no puede esperar, el tiempo se convierte en un factor operativo y económico. Un paro de línea, una refacción crítica o una entrega comprometida pueden requerir una solución fuera de los tiempos habituales. El servicio expeditado permite evaluar alternativas de transporte con prioridad en tiempo de tránsito, disponibilidad y ruta. La cotización se trabaja con la información disponible de la operación para identificar una opción viable en el menor tiempo posible.",
    seoTitulo: "Servicio expeditado para urgencias",
    seoDescripcion:
      "Servicio expeditado con cotización en menos de tres horas para paros de línea, entregas críticas y embarques que no admiten demora.",
    bloques: [
      {
        eyebrow: "Respuesta inmediata",
        titulo: "Cotización en menos de tres horas",
        parrafo:
          "En una urgencia, el tiempo que tarda la cotización es tiempo perdido. El servicio expeditado tiene un canal propio: se recibe el requerimiento, se evalúan las opciones disponibles y se entrega la propuesta con tiempos y costo en menos de tres horas, para que la decisión se tome el mismo día.",
        imagen: "/servicios/expeditado/expeditado-bloque-1.webp",
        imagenAlt:
          "Operador frente a pantallas de monitoreo con mapas y rutas en un centro de seguimiento",
      },
      {
        eyebrow: "Todas las rutas sobre la mesa",
        titulo: "La mejor opción, no la habitual",
        parrafo:
          "En una operación urgente se evalúan alternativas que normalmente no se considerarían: cambio de modo, aeropuerto alterno, ruta terrestre directa o combinación de tramos. Compass compara las opciones reales disponibles en ese momento y presenta la que resuelve, con su costo y su tiempo.",
        imagen: "/servicios/expeditado/expeditado-bloque-2.webp",
        imagenAlt:
          "Camioneta de carga junto al andén de una terminal aérea al anochecer",
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
    cierre: {
      titulo: "Su carga no puede esperar",
      parrafo:
        "Compártanos origen, destino, características de la carga y la fecha límite real. Con esa información evaluamos las alternativas disponibles en ese momento y le presentamos la opción viable en el menor tiempo posible.",
      textoBoton: "Solicitar servicio expeditado",
    },
  },
  {
    slug: "seguro-de-carga",
    nombre: "Seguro de carga",
    heroEyebrow: "Valor agregado",
    heroTitulo: "Seguro de carga: proteja el valor de su mercancía",
    heroParrafo:
      "Transportar mercancía implica asumir determinados riesgos durante la carga, manipulación, tránsito, almacenamiento y entrega. La responsabilidad del transportista no necesariamente equivale al valor comercial de su mercancía. Coordinamos opciones de seguro de carga de acuerdo con las características de su embarque, su valor y el recorrido que realizará, así como lo necesario para que el seguro surta efecto en caso de un siniestro.",
    seoTitulo: "Seguro de carga para su mercancía",
    seoDescripcion:
      "Cobertura de mercancía en tránsito internacional y nacional, dimensionada al valor real del embarque y al riesgo de cada ruta.",
    bloques: [
      {
        eyebrow: "El límite del transportista",
        titulo: "La responsabilidad legal no equivale al valor de su carga",
        parrafo:
          "Los convenios internacionales establecen límites de responsabilidad calculados por peso, no por valor. En la práctica eso significa que un embarque de alto valor y poco peso queda cubierto por una fracción mínima de lo que realmente cuesta. El seguro de carga es lo que cubre la diferencia.",
        imagen: "/servicios/seguro-de-carga/seguro-de-carga-bloque-1.webp",
        imagenAlt:
          "Estuche de transporte reforzado con ruedas en el piso de una nave industrial vacía",
      },
      {
        eyebrow: "Alcance de la cobertura",
        titulo: "Dimensionada al trayecto, no genérica",
        parrafo:
          "El riesgo de un contenedor sellado en tránsito directo no es el mismo que el de una carga consolidada con dos transbordos. La cobertura se define según el modo, el recorrido, el tipo de mercancía y el embalaje. Compass coordina la contratación con el alcance que corresponde a cada embarque.",
        imagen: "/servicios/seguro-de-carga/seguro-de-carga-bloque-2.webp",
        imagenAlt:
          "Persona revisando documentos frente a una laptop en una oficina con vista al almacén",
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
    cierre: {
      titulo: "Proteja el valor de su mercancía",
      parrafo:
        "Para evaluar una cobertura necesitamos la descripción y el valor de la mercancía, el origen, el destino, el medio de transporte y el tipo de embalaje. El seguro debe contratarse antes de iniciar el embarque para que surta efecto.",
      textoBoton: "Solicitar cotización",
    },
  },
  {
    slug: "previo-en-origen",
    nombre: "Previo en origen",
    heroEyebrow: "Valor agregado",
    heroTitulo: "Previo en origen: verificar antes de que zarpe",
    heroParrafo:
      "Detectar un error en destino puede generar demoras, almacenajes y costos adicionales. El previo en origen permite verificar la mercancía antes de su salida y detectar inconsistencias a tiempo. Se revisan aspectos como cantidad, características de la mercancía, embalaje y correspondencia con la documentación disponible, de acuerdo con el alcance solicitado para la inspección. Compass coordina el previo en origen con el proveedor correspondiente, da seguimiento a la revisión y comparte los resultados.",
    seoTitulo: "Previo en origen antes de embarcar",
    seoDescripcion:
      "Verificación de la mercancía en origen antes del embarque, para detectar faltantes, daños o discrepancias antes de que salga el barco.",
    bloques: [
      {
        eyebrow: "Antes del embarque",
        titulo: "El momento en que corregir todavía es sencillo",
        parrafo:
          "Una discrepancia entre la factura y la mercancía puede corregirse en origen antes de que el embarque salga. Detectarla hasta llegar a la aduana de destino puede generar multas, demoras y costos de almacenaje. Verificar la carga antes de embarcar permite detectar inconsistencias a tiempo y corregirlas antes de que afecten el despacho y la operación.",
        imagen: "/servicios/previo-en-origen/previo-en-origen-bloque-1.webp",
        imagenAlt:
          "Inspector con chaleco de seguridad revisando tarimas de mercancía con una tabla de registro",
      },
      {
        eyebrow: "Qué se revisa",
        titulo: "Cantidad, condición y documentación",
        parrafo:
          "La verificación en origen permite revisar que la cantidad y características de la mercancía correspondan con lo declarado, que se encuentre en la condición esperada y que el embalaje sea adecuado para el trayecto. También se valida que el marcado y la documentación disponible sean consistentes con la carga. El resultado de la revisión se documenta y se comparte antes de la salida del embarque, para identificar cualquier inconsistencia y atenderla oportunamente.",
        imagen: "/servicios/previo-en-origen/previo-en-origen-bloque-2.webp",
        imagenAlt:
          "Caja abierta sobre una tarima con una cámara y una cinta métrica al lado para documentar la revisión",
      },
    ],
    preguntasRotulo: "Preguntas frecuentes sobre el previo en origen",
    preguntas: [
      {
        pregunta: "¿Qué se revisa en un previo en origen?",
        respuesta:
          "Se verifica que la cantidad y características de la mercancía correspondan con lo declarado, así como su condición aparente y el estado del embalaje para el trayecto previsto. También se revisa la correspondencia entre el marcado, la documentación disponible y la carga. La revisión se documenta con evidencia fotográfica y se comparte antes del embarque.",
      },
      {
        pregunta: "¿Cuándo conviene contratar este servicio?",
        respuesta:
          "Es recomendable cuando se trabaja con proveedores nuevos, mercancía de alto valor o embarques donde una discrepancia puede generar costos y demoras en destino. También es útil cuando una demora en el despacho puede afectar una producción, una fecha de entrega o el cumplimiento de un compromiso comercial.",
      },
      {
        pregunta: "¿El previo sustituye la inspección de calidad?",
        respuesta:
          "No. El previo se enfoca en la verificación física y documental de la carga desde una perspectiva logística y aduanal. Una inspección de calidad evalúa el producto contra especificaciones técnicas, estándares o requisitos previamente definidos. Son servicios distintos y, cuando la operación lo requiere, ambos pueden coordinarse.",
      },
    ],
    cierre: {
      titulo: "Verifique su carga antes de que salga",
      parrafo:
        "Para coordinar un previo en origen necesitamos la ubicación del proveedor, el tipo de mercancía, la documentación disponible y el alcance de revisión que requiere. El resultado se documenta con evidencia fotográfica antes de autorizar el embarque.",
      textoBoton: "Solicitar servicio",
    },
  },
];

/**
 * AGRUPACIÓN OFICIAL DE LOS SERVICIOS, fuente única para el índice
 * `/servicios`, el mega menú del header, el footer y la sección de soluciones
 * de la home. Ninguno de esos sitios repite la lista: todos leen de aquí.
 *
 * `slug` es el id de la sección en `/servicios` (`/servicios#maritimo`), sin
 * acentos. `nombre` es el texto visible. `servicios` va en el orden en que se
 * pintan, y cada slug tiene que existir en `SERVICIOS` (lo comprueba
 * `gruposServicios()` al compilar).
 */
export const GRUPOS_SERVICIOS = [
  {
    slug: "maritimo",
    nombre: "Marítimo",
    servicios: ["fcl", "lcl", "flat-rack", "open-top", "isotanques", "ro-ro"],
  },
  {
    slug: "terrestre",
    nombre: "Terrestre",
    servicios: [
      "ftl",
      "ltl",
      "portacontenedor",
      "lowboy",
      "plataformas",
      "unidades-con-rampa",
    ],
  },
  {
    slug: "aereo-y-urgentes",
    nombre: "Aéreo y urgentes",
    servicios: ["carga-aerea", "expeditado"],
  },
  {
    slug: "almacenaje-y-valor-agregado",
    nombre: "Almacenaje y valor agregado",
    servicios: [
      "almacenaje-y-distribucion",
      "empaque-y-embalaje",
      "seguro-de-carga",
      "previo-en-origen",
    ],
  },
] as const satisfies readonly {
  slug: string;
  nombre: string;
  servicios: readonly string[];
}[];

/** Un grupo con sus servicios ya resueltos a `{ slug, nombre }`. */
export type GrupoServiciosResuelto = {
  slug: string;
  nombre: string;
  servicios: { slug: string; nombre: string }[];
};

/**
 * `GRUPOS_SERVICIOS` con el nombre de cada servicio resuelto. Es la forma
 * ligera que se le pasa al header (componente de cliente) desde el layout:
 * sólo slugs y nombres, para no meter todo el copy de `SERVICIOS` en el
 * bundle del navegador. Lanza si un slug no existe, así que una errata en la
 * agrupación rompe el build en vez de dejar un enlace a un 404.
 */
export function gruposServicios(): GrupoServiciosResuelto[] {
  return GRUPOS_SERVICIOS.map((grupo) => ({
    slug: grupo.slug,
    nombre: grupo.nombre,
    servicios: grupo.servicios.map((slug) => {
      const servicio = getServicioBySlug(slug);
      if (!servicio) {
        throw new Error(`GRUPOS_SERVICIOS: slug desconocido "${slug}"`);
      }
      return { slug, nombre: servicio.nombre };
    }),
  }));
}


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
