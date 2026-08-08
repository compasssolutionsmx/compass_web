/**
 * Contenido de /nosotros: los diez compromisos de la política de seguridad y
 * calidad, y su entradilla.
 *
 * Va en `lib` y no dentro de la página, con el mismo criterio que
 * `lib/vacantes.ts` y `lib/services.ts`: es contenido del cliente, no marcado.
 *
 * AQUÍ VIVÍA `HISTORIA`, la cronología de la página. Se quitó al sustituir el
 * timeline por texto corrido: dejó de haber dato estructurado (año + texto) que
 * otra superficie pudiera reutilizar, y los cuatro párrafos que quedaron viven
 * en la propia página porque no los pinta nadie más.
 *
 * OJO CON LA POLÍTICA: este mismo texto existe, casi palabra por palabra, en el
 * /apartado-legal del sitio actual, que está en el backlog. Cuando esa página se
 * construya, debe IMPORTAR `COMPROMISOS_SEGURIDAD` de aquí en vez de volver a
 * escribirlo — si no, habrá dos copias que se desincronizan y dos URLs
 * compitiendo por el mismo contenido.
 */

export type Compromiso = {
  titulo: string;
  texto: string;
};

/**
 * Entradilla de la política. Vive aquí y no en la página porque la pintan DOS
 * rutas (/nosotros y /apartado-legal) y es el mismo párrafo en las dos.
 */
export const INTRO_SEGURIDAD =
  "Como agente de carga, Compass sabe que la confianza de sus clientes se construye con operaciones seguras y consistentes. Su política de seguridad y calidad se traduce en diez compromisos concretos.";

/**
 * El orden ES el contenido: son los compromisos 01 a 10 de la política, y así
 * los numera el documento del cliente. Por eso se pintan en un <ol> y el número
 * visible sale del índice, no de un campo que pueda quedar desalineado.
 */
export const COMPROMISOS_SEGURIDAD: Compromiso[] = [
  {
    titulo: "Servicio confiable y de calidad",
    texto:
      "Proporcionar servicios logísticos seguros, confiables y de calidad, cumpliendo la legislación y requisitos aplicables, así como las necesidades y expectativas de clientes y partes interesadas, promoviendo la satisfacción del cliente y la mejora continua.",
  },
  {
    titulo: "Protección de personas y activos",
    texto:
      "Proteger la integridad física, emocional y profesional de los colaboradores, así como la seguridad de procesos, instalaciones, servicios, información y activos frente a amenazas internas y externas.",
  },
  {
    titulo: "Cultura ética y transparente",
    texto:
      "Promover una cultura organizacional basada en la ética, la legalidad y la transparencia, previniendo actividades ilícitas o amenazas que afecten la continuidad de las operaciones, en estrecha participación con colaboradores y asociados de negocio.",
  },
  {
    titulo: "Gestión integral de riesgos",
    texto:
      "Gestionar de manera integral los riesgos e incidentes mediante procesos sistemáticos de identificación, análisis, tratamiento, investigación y mejora continua.",
  },
  {
    titulo: "Seguridad de la información",
    texto:
      "Garantizar el uso seguro y responsable de las tecnologías de información y comunicaciones, protegiendo confidencialidad, integridad y disponibilidad de los datos críticos.",
  },
  {
    titulo: "Responsabilidades y recursos",
    texto:
      "Asignar responsabilidades y recursos necesarios para alcanzar los objetivos del Sistema de Gestión de Seguridad y Calidad.",
  },
  {
    titulo: "Prevención del trabajo infantil y forzoso",
    texto:
      "Prevenir el trabajo infantil y forzoso en la organización, y fomentar su prevención y cumplimiento con los asociados de negocio.",
  },
  {
    titulo: "Capacitación y reporte de incidentes",
    texto:
      "Capacitar y sensibilizar al personal para reconocer y reportar incidentes, fomentando la participación de colaboradores y socios estratégicos.",
  },
  {
    titulo: "Continuidad y resiliencia operativa",
    texto:
      "Implementar controles de seguridad física y lógica para asegurar la continuidad del negocio, mediante planificación y respuesta ante emergencias, contingencias e interrupciones.",
  },
  {
    titulo: "Mejora continua",
    texto:
      "Mejorar continuamente la eficacia y el desempeño del Sistema de Gestión de Seguridad y Calidad mediante auditorías internas y revisión por la dirección. Política revisada periódicamente y comunicada a todo el personal y partes interesadas.",
  },
];
