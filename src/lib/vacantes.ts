/**
 * Vacantes publicadas, como DATOS y no como marcado.
 *
 * Mismo criterio que `lib/services.ts`: el contenido vive aquí y la página sólo
 * lo pinta. Así, publicar o retirar una vacante es editar este archivo — que es
 * lo que va a pasar seguido — sin tocar JSX.
 *
 * FUENTE: el WordPress actual (compasssolutions.com.mx/vacantes). Los campos
 * son los que ese sitio publica, ni uno más: no se inventan requisitos,
 * prestaciones, rangos de sueldo ni etapas de proceso.
 *
 * `activa` en vez de borrar la entrada: una vacante que se cierra suele volver
 * a abrirse, y conservarla apagada evita reescribirla desde cero. Todo lo que
 * consume esta lista pasa por `vacantesActivas()`, así que basta con el flag
 * para que desaparezca de la página y del selector del formulario.
 */

export type Vacante = {
  /** Identificador estable para el `key` de React y para futuros anclajes. */
  slug: string;
  puesto: string;
  ubicacion: string;
  escolaridad: string;
  edad: string;
  experiencia: string;
  /** Lista y no párrafo: en la tarjeta se leen como viñetas. */
  requisitos: string[];
  activa: boolean;
};

export const VACANTES: Vacante[] = [
  {
    slug: "operador-de-transporte",
    puesto: "Operador de Transporte",
    ubicacion: "Ciudad de México",
    escolaridad: "Secundaria o bachillerato concluido",
    edad: "Entre 25 y 49 años",
    experiencia:
      "Mínima de 2 a 3 años en puesto como operador de unidad (torton, rabón, camioneta de 1.5 toneladas, etc.), comprobable",
    requisitos: [
      "Licencia Federal Tipo B vigente",
      "Responsabilidad",
      "Sentido de urgencia",
      "Calidad",
      "Honestidad",
      "Disponibilidad para traslados locales y foráneos",
    ],
    activa: true,
  },
];

/** Las que se publican hoy. Es el único acceso que usa la página. */
export function vacantesActivas(): Vacante[] {
  return VACANTES.filter((vacante) => vacante.activa);
}
