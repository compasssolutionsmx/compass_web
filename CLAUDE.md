@AGENTS.md

# Reglas de trabajo

## Git
- No ejecutes git add, git commit, git push ni ningún comando de git.
- No despliegues a producción bajo ninguna circunstancia, ni con aprobación verbal.
- Al terminar una tarea, deja los cambios en el working directory y lista los archivos que tocaste. El commit y el push los hace el equipo manualmente.

## Flujo de trabajo
- Ejecuta directamente. No entregues plan previo ni esperes aprobación, salvo que la tarea sea ambigua o que ejecutarla implique una decisión que no está en la instrucción.
- Si durante la ejecución encuentras algo que la instrucción no contemplaba, detente y repórtalo antes de improvisar una solución.
- No repitas contexto ya establecido en el proyecto.

## Alcance
- Haz solo lo que se pide. No agregues elementos, secciones ni mejoras no solicitadas.
- Si algo se ve duplicado, mal escrito o mejorable fuera del alcance, repórtalo. No lo corrijas.

## Verificación
- No hagas comprobaciones repetidas ni ciclos de validación por tu cuenta. Ejecuta la tarea una vez y reporta.
- Para cambios visuales, la revisión la hace el equipo. No abras el navegador para valorar cómo se ve algo.
- Para diagnosticar un fallo reportado, sí levanta el servidor y mide en el navegador. No deduzcas la causa leyendo el código: reprodúcela.
- Si detectas un error real que impide que la tarea funcione, repórtalo.

## Stack y sistema de diseño
- Next.js 16 con App Router, TypeScript, Tailwind CSS v4. El proyecto sí usa Tailwind.
- La marca es estrictamente monocromática: brand-900 (#012A3A) como primario y brand-100 (#E6EEF1) como fondo claro. No hay acento cian ni ningún otro color de marca.
- Tipografía: Archivo semi-expandida bold (wdth 112.5) para encabezados, DM Sans para cuerpo.
- Un componente sube a src/components compartido cuando lo piden dos páginas, no antes. Lo que solo usa una página se queda acotado a ella.
- Si un cambio toca un componente compartido y afectaría a otras páginas, no lo toques: aplica el ajuste acotado y repórtalo.

## Assets
- Nombres de archivo en ASCII, minúsculas, sin espacios ni acentos. macOS tolera variantes que Linux y Vercel no: esto ya causó 404 en producción dos veces.
- Las portadas del blog van como cover.webp dentro de public/blog/{slug}/.

## Contenido y copy
- Compass es un freight forwarder u operador de logística internacional. Nunca "agente de carga", "agencia" ni "agente".
- Compass coordina proveedores. No es dueño de camiones ni los renta.
- Todo el copy va en usted, nunca tú. Sentence case en todos los encabezados. Sin em-dashes: usar paréntesis.
- No inventes cifras, datos regulatorios ni copy. Todo dato debe venir de fuente oficial (SAT, DOF, RGCE, Ley Aduanera) o estar confirmado por el cliente.
- Las certificaciones ISO 9001 e ISO 28000 están en proceso. No mencionarlas sin autorización explícita.

## SEO y datos estructurados
- Todo campo declarado en JSON-LD debe ser visible como texto renderizado en la misma página. Ocultar información marcada es señal de spam.
- Las preguntas frecuentes se escriben con un H2 de rótulo que empiece con "Preguntas frecuentes" y cada pregunta en H3 debajo. extractFaq reconoce ese patrón y también preguntas sueltas en H2 sin H3 anidado.
- Cada respuesta necesita al menos 25 palabras para calificar. Las respuestas más cortas se descartan del FAQPage sin aviso.
- Una nota solo genera FAQPage si declara faq true en el frontmatter.
- No cambies el texto de un encabezado sin verificar que no rompa anclas ni enlaces internos: el id se deriva del texto.
- No cambies slugs sin plan de 301.
