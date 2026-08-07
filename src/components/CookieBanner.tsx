"use client";

/**
 * Banner de consentimiento de cookies.
 *
 * NO ES UN MODAL. Se ancla abajo, sin overlay, sin bloquear el scroll y sin
 * atrapar el foco: el sitio se sigue leyendo y navegando con el banner puesto.
 * Por eso lleva `aria-modal="false"` — es un diálogo en el sentido de que pide
 * una decisión, pero no secuestra la página, y anunciarlo como modal mentiría
 * sobre lo que un lector de pantalla puede hacer.
 *
 * TAMPOCO TIENE BOTÓN DE CERRAR, ni se cierra con Escape, y es a propósito. Un
 * banner que se puede descartar sin elegir deja al usuario en un limbo: o se
 * interpreta como aceptación —prohibido, el GDPR no admite consentimiento
 * tácito— o se queda sin decisión y reaparece en cada carga. Las tres salidas
 * son las tres respuestas legítimas.
 *
 * "Aceptar" y "Rechazar" comparten EXACTAMENTE el mismo estilo (mismo tamaño,
 * mismo peso, uno relleno y el otro contorno pero del mismo ancho): el EDPB
 * considera oscuro el patrón de hacer el rechazo menos visible que la
 * aceptación, y la forma más defendible de cumplirlo es que ninguno de los dos
 * parezca el camino sugerido.
 *
 * DOS VISTAS EN EL MISMO COMPONENTE:
 *   - COMPACTA (por defecto): tarjeta chica, un párrafo corto y las dos
 *     pastillas. Sin "Personalizar" — el panel granular de categorías ya no se
 *     abre desde aquí.
 *   - PANEL (sólo cuando `isPanelOpen`): la lista de categorías con sus
 *     interruptores, "Guardar mi selección" y "Cancelar". Se llega a esta
 *     vista ÚNICAMENTE desde "Preferencias de cookies" en el footer
 *     (`reopenSettings()`), nunca desde un botón de este banner — por eso no
 *     hace falta un toggle interno para entrar y salir del panel.
 */

import { useEffect, useRef } from "react";
import { useConsent } from "./ConsentProvider";
import type { OptionalCategory } from "@/lib/consent";

/** Aire entre el borde de arriba del banner y el botón flotante de WhatsApp. */
const SEPARACION_FAB_PX = 16;

/**
 * Ancho de la franja derecha que ocupa el botón flotante, contando su versión
 * ancha con texto. Si la tarjeta llega hasta ahí, hay que apartar el botón.
 */
const ZONA_BOTON_PX = 260;

/**
 * Variable que lee el botón flotante de WhatsApp para apartarse. Se publica en
 * <html> y no por contexto de React a propósito: así el botón —que se monta por
 * página, no en el layout— no necesita conocer el consentimiento para nada, y
 * los dos componentes quedan acoplados sólo por una medida en píxeles.
 */
const VARIABLE_ALTURA = "--consent-banner-lift";

const CATEGORIAS: {
  key: OptionalCategory;
  titulo: string;
  descripcion: string;
}[] = [
  {
    key: "analytics",
    titulo: "Analíticas",
    descripcion:
      "Nos dicen qué páginas se visitan y cómo se navega, de forma agregada. Se usarán cuando se active Google Analytics 4.",
  },
  {
    key: "marketing",
    titulo: "Marketing y publicidad",
    descripcion:
      "Permiten medir el resultado de las campañas y mostrarle anuncios relevantes en otros sitios. Se usarán cuando se activen Google Ads y Meta Pixel.",
  },
];

/**
 * Interruptor accesible: el control real es un checkbox `role="switch"` en
 * `sr-only`, y lo que se ve es su hermano estilizado. Se mantiene el input
 * nativo —en vez de un <button> con aria— para no reimplementar el teclado, el
 * anuncio de estado ni el envío de formularios.
 *
 * El anillo de foco se traslada al riel con `peer-focus-visible`, porque el
 * input escondido no puede mostrar el suyo.
 */
function Interruptor({
  checked,
  disabled,
  onChange,
  label,
  describedBy,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
  describedBy: string;
}) {
  return (
    // El riel y la perilla son los DOS hermanos del input, no uno dentro del
    // otro: `peer-checked:` compila a un combinador de hermanos, así que sobre
    // un descendiente no aplicaría y la perilla nunca se movería.
    <span className="relative inline-flex shrink-0 items-center">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        aria-describedby={describedBy}
        onChange={(event) => onChange?.(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="h-6 w-11 rounded-full bg-brand-900/20 transition-colors peer-checked:bg-brand-900 peer-disabled:opacity-40 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-900"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-[translate,background-color] duration-200 peer-checked:translate-x-5 peer-disabled:opacity-40 motion-reduce:transition-none"
      />
    </span>
  );
}

export default function CookieBanner() {
  const {
    isBannerVisible,
    isPanelOpen,
    draft,
    setDraftCategory,
    acceptAll,
    rejectAll,
    saveDraft,
    dismiss,
  } = useConsent();

  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Publica la altura del banner para que el botón de WhatsApp se aparte, PERO
  // sólo cuando de verdad le estorba.
  //
  // Antes el banner era una barra a todo lo ancho y siempre le pasaba por
  // debajo. Ahora es una tarjeta anclada a la esquina INFERIOR IZQUIERDA, o sea
  // la contraria a la del botón: en escritorio no se tocan y levantarlo sería
  // moverlo por nada. En pantallas angostas la tarjeta sí ocupa casi todo el
  // ancho y vuelve a invadir esa esquina, así que ahí el levantón sigue
  // haciendo falta. La condición se mide, no se supone: se compara el borde
  // derecho de la tarjeta con la franja que ocupa el botón.
  useEffect(() => {
    const raiz = document.documentElement;
    const nodo = bannerRef.current;

    if (!isBannerVisible || !nodo) {
      raiz.style.removeProperty(VARIABLE_ALTURA);
      return;
    }

    const publicar = () => {
      const caja = nodo.getBoundingClientRect();
      const invadeLaEsquinaDelBoton =
        caja.right > window.innerWidth - ZONA_BOTON_PX;

      if (invadeLaEsquinaDelBoton) {
        raiz.style.setProperty(
          VARIABLE_ALTURA,
          `${caja.height + SEPARACION_FAB_PX}px`,
        );
      } else {
        raiz.style.removeProperty(VARIABLE_ALTURA);
      }
    };

    const observer = new ResizeObserver(publicar);
    observer.observe(nodo);
    window.addEventListener("resize", publicar);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publicar);
      raiz.style.removeProperty(VARIABLE_ALTURA);
    };
  }, [isBannerVisible]);

  if (!isBannerVisible) return null;

  return (
    // TARJETA ESQUINADA, no barra. La barra a todo lo ancho se cruzaba por
    // delante del contenido y de los formularios; anclada abajo a la izquierda
    // sólo tapa su propia esquina, y deja libre la de abajo a la derecha, que
    // es del botón de WhatsApp.
    //
    // z-40: por encima del contenido y POR DEBAJO de los modales (z-50). El
    // <QuoteModal> es opaco y a pantalla completa, así que mientras está
    // abierto el banner queda tapado por completo.
    //
    // `pointer-events-none` en el envoltorio y `auto` en la tarjeta: el hueco
    // que sobra al lado no debe interceptar clics del contenido de abajo.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6">
      <div
        ref={bannerRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-banner-titulo"
        /* `.glass` y no `.glass-solid`: vidrio claro translúcido con blur, que
           es el efecto que se pidió; el `solid` es navy al 92% y se lee como
           placa opaca. Sobre vidrio claro el texto va en brand-900/slate-600
           —5.37:1 en el peor caso realista (vídeo casi negro detrás), 7.58:1
           contra el blanco de página, medido con la fórmula de contraste
           relativo de WCAG, no a ojo—, en vez del blanco de antes.
           `max-w-sm` y `p-4`, más chicos que antes (`max-w-md`/`p-5`): es la
           tarjeta compacta que se pidió. `mr-auto` la ancla a la izquierda
           dentro del envoltorio. */
        className="glass pointer-events-auto mr-auto max-w-sm rounded-2xl p-4 text-brand-900 shadow-2xl shadow-brand-950/20 motion-safe:animate-fade-in"
      >
        {/* `sr-only`: la vista compacta no lleva título visible —es sólo
            párrafo + dos pastillas—, pero el diálogo necesita un nombre
            accesible para `aria-labelledby`. Sigue existiendo en el DOM,
            simplemente no ocupa espacio en pantalla. */}
        <h2 id="cookie-banner-titulo" className="sr-only">
          Cookies en este sitio
        </h2>

        <p className="text-xs leading-relaxed text-slate-600">
          {/* TODO(compliance): "Aviso de privacidad" va como texto, NO como
              enlace. La página /apartado-legal no existe todavía —confirmado
              al auditar enlaces internos del sitio, misma ruta que el Footer
              también dejó de enlazar en esa auditoría—, así que un
              <Link href="/apartado-legal#privacidad"> aquí sería otro 404 más,
              justo en el banner de consentimiento. En cuanto exista la
              página, se envuelve este span en <Link> y ya. */}
          Usamos cookies para mejorar su experiencia.{" "}
          <span className="font-semibold text-brand-900">
            Aviso de privacidad
          </span>
          .
        </p>

        {isPanelOpen && (
          <ul
            id="cookie-banner-panel"
            className="mt-5 space-y-4 border-t border-brand-900/10 pt-5"
          >
            <li className="flex items-start gap-4">
              <Interruptor
                checked
                disabled
                label="Cookies necesarias (siempre activas)"
                describedBy="cookie-cat-necessary"
              />
              <div>
                <p className="font-heading text-sm font-semibold">
                  Necesarias{" "}
                  <span className="font-sans font-normal text-slate-600">
                    · siempre activas
                  </span>
                </p>
                <p
                  id="cookie-cat-necessary"
                  className="mt-1 text-sm leading-relaxed text-slate-600"
                >
                  Hacen funcionar la navegación, los formularios y la seguridad
                  del sitio. Sin ellas la página no opera, así que no se pueden
                  desactivar.
                </p>
              </div>
            </li>

            {CATEGORIAS.map((categoria) => (
              <li key={categoria.key} className="flex items-start gap-4">
                <Interruptor
                  checked={draft[categoria.key]}
                  onChange={(value) => setDraftCategory(categoria.key, value)}
                  label={`Cookies de ${categoria.titulo.toLowerCase()}`}
                  describedBy={`cookie-cat-${categoria.key}`}
                />
                <div>
                  <p className="font-heading text-sm font-semibold">
                    {categoria.titulo}
                  </p>
                  <p
                    id={`cookie-cat-${categoria.key}`}
                    className="mt-1 text-sm leading-relaxed text-slate-600"
                  >
                    {categoria.descripcion}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Aceptar relleno, Rechazar en contorno — pedido así explícitamente.
            MISMO ancho (`flex-1`), MISMA altura, MISMO tamaño de texto, MISMO
            peso: lo único que cambia es el relleno, no el tamaño ni la
            posición. Es esa igualdad de tamaño/orden/prominencia —no que los
            dos tengan idéntico fill— lo que pide el criterio del EDPB contra
            patrones oscuros: que "rechazar" no quede más chico, más gris ni
            escondido detrás de un clic extra frente a "aceptar". El contorno
            en brand-900 sobre el vidrio da 10.75:1 (medido, ver el comentario
            de la tarjeta), muy por encima de AA.
            Ya no hay botón "Personalizar" aquí: el panel de categorías sólo
            se abre desde "Preferencias de cookies" en el footer. */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className="flex-1 rounded-full bg-brand-900 px-4 py-2 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {isPanelOpen ? "Aceptar todas" : "Aceptar"}
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="flex-1 rounded-full border border-brand-900/30 px-4 py-2 font-heading text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-900/5"
          >
            {isPanelOpen ? "Rechazar todas" : "Rechazar"}
          </button>
        </div>

        {isPanelOpen && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-full border border-brand-900/30 px-4 py-2 font-heading text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-900/5"
            >
              Guardar mi selección
            </button>

            {/* Sólo aparece cuando el banner se reabrió desde el footer, o sea
                cuando YA hay una decisión guardada a la que volver. En la
                primera visita no existe: cerrar sin elegir sería
                consentimiento tácito. */}
            {dismiss && (
              <button
                type="button"
                onClick={dismiss}
                className="font-heading text-sm font-semibold text-slate-600 underline underline-offset-4 transition-opacity hover:opacity-70 sm:px-1"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
