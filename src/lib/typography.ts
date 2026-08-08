/**
 * Utilidades tipográficas de texto plano.
 *
 * SIN DEPENDENCIAS DE NODE a propósito. Aquí vivía sólo `bindHeadingTail`,
 * dentro de `lib/blog.ts`, y eso lo dejaba fuera del alcance de la mitad del
 * sitio: ese módulo importa `node:fs` y gray-matter, así que llamarlo desde un
 * componente cliente —o desde cualquier página que no sea la de artículo—
 * arrastraba el lector de MDX entero al grafo. Por eso <ImportHero> acabó con
 * un \u00A0 escrito a mano en vez de reutilizar la función.
 *
 * Este módulo es texto entrando y texto saliendo: se puede importar desde
 * donde sea, servidor o cliente.
 */

/**
 * Une las DOS ÚLTIMAS PALABRAS de un texto con un espacio duro, para que la
 * última línea nunca quede con una sola palabra colgando.
 *
 * POR QUÉ UNA UTILIDAD Y NO UN \u00A0 A MANO EN CADA TEXTO: el problema no es
 * de una frase concreta sino de cualquiera que parta en varias líneas, y
 * depende del ancho de pantalla — el mismo texto puede estar bien en desktop y
 * dejar huérfana en un móvil estrecho. Resolverlo a mano obligaría a revisar
 * cada texto nuevo y a acertar para todos los breakpoints.
 *
 * SÓLO DOS PALABRAS, nunca tres. El bloque resultante es INDIVISIBLE: el
 * navegador no puede partirlo, así que si se pasa del ancho del contenedor lo
 * desborda en vez de reajustarlo. Cuantas más palabras se encadenen, más largo
 * el bloque y más probable el desbordamiento en pantallas estrechas. Al aplicar
 * esto a un texto nuevo hay que medir su peor caso —las dos últimas palabras
 * más largas— contra la caja a 320px de viewport, que es el suelo razonable.
 *
 * Si el texto ya trae un \u00A0 escrito a mano, no se toca: `lastIndexOf` busca
 * un espacio NORMAL, así que ese bloque ya unido cuenta como una palabra y no
 * se encadena otra encima. Un texto de una sola palabra se devuelve intacto.
 */
export function bindTail(text: string): string {
  const limpio = text.trim();
  const ultimoEspacio = limpio.lastIndexOf(" ");
  if (ultimoEspacio === -1) return limpio; // una sola palabra: nada que unir
  return `${limpio.slice(0, ultimoEspacio)}\u00A0${limpio.slice(ultimoEspacio + 1)}`;
}
