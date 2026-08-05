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
 * "Aceptar todas" y "Rechazar todas" comparten EXACTAMENTE el mismo estilo: el
 * EDPB considera oscuro el patrón de hacer el rechazo menos visible que la
 * aceptación, y la forma más defendible de cumplirlo es que ninguno de los dos
 * parezca el camino sugerido.
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useConsent } from "./ConsentProvider";
import type { OptionalCategory } from "@/lib/consent";

/** Aire entre el borde de arriba del banner y el botón flotante de WhatsApp. */
const SEPARACION_FAB_PX = 16;

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
      "Permiten medir el resultado de las campañas y mostrarte anuncios relevantes en otros sitios. Se usarán cuando se activen Google Ads y Meta Pixel.",
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
        className="h-6 w-11 rounded-full bg-white/25 transition-colors peer-checked:bg-white peer-disabled:opacity-40 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-[translate,background-color] duration-200 peer-checked:translate-x-5 peer-checked:bg-brand-900 peer-disabled:opacity-40 motion-reduce:transition-none"
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
    openPanel,
    closePanel,
    dismiss,
  } = useConsent();

  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Publica la altura real del banner para que el botón de WhatsApp se aparte.
  // Es un ResizeObserver y no una medida fija porque la altura cambia sola: al
  // abrir el panel, al girar el teléfono y con cada reflujo del texto.
  useEffect(() => {
    const raiz = document.documentElement;
    const nodo = bannerRef.current;

    if (!isBannerVisible || !nodo) {
      raiz.style.removeProperty(VARIABLE_ALTURA);
      return;
    }

    const observer = new ResizeObserver(([entrada]) => {
      const alto = entrada.borderBoxSize?.[0]?.blockSize ?? nodo.offsetHeight;
      raiz.style.setProperty(VARIABLE_ALTURA, `${alto + SEPARACION_FAB_PX}px`);
    });
    observer.observe(nodo);

    return () => {
      observer.disconnect();
      raiz.style.removeProperty(VARIABLE_ALTURA);
    };
  }, [isBannerVisible]);

  if (!isBannerVisible) return null;

  return (
    // `inset-x-0 bottom-0` con `pointer-events-none` en el contenedor y
    // `pointer-events-auto` en la tarjeta: la franja lateral que sobra a los
    // lados de la tarjeta no debe interceptar clics del contenido de abajo.
    // z-40 lo deja sobre el contenido y bajo los modales (z-50).
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6">
      <div
        ref={bannerRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-banner-titulo"
        className="glass-solid pointer-events-auto mx-auto max-w-5xl rounded-2xl p-5 text-white motion-safe:animate-fade-in sm:p-6"
      >
        <h2
          id="cookie-banner-titulo"
          className="font-heading text-base font-bold"
        >
          Cookies en este sitio
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
          Usamos cookies propias y de terceros para que el sitio funcione, medir
          cómo se usa y mostrarte publicidad relevante. Puedes aceptarlas,
          rechazarlas o elegir por categoría. Más detalle en el{" "}
          <Link
            href="/apartado-legal#privacidad"
            className="font-semibold text-white underline underline-offset-2 hover:opacity-80"
          >
            Aviso de Privacidad
          </Link>
          .
        </p>

        {isPanelOpen && (
          <ul
            id="cookie-banner-panel"
            className="mt-5 space-y-4 border-t border-white/15 pt-5"
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
                  <span className="font-sans font-normal text-slate-300">
                    · siempre activas
                  </span>
                </p>
                <p
                  id="cookie-cat-necessary"
                  className="mt-1 text-sm leading-relaxed text-slate-300"
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
                    className="mt-1 text-sm leading-relaxed text-slate-300"
                  >
                    {categoria.descripcion}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Aceptar y rechazar: mismo tamaño, mismo color, mismo peso. */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full bg-white px-6 py-3 font-heading text-sm font-semibold text-brand-900 transition-opacity hover:opacity-90"
          >
            Aceptar todas
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="rounded-full bg-white px-6 py-3 font-heading text-sm font-semibold text-brand-900 transition-opacity hover:opacity-90"
          >
            Rechazar todas
          </button>

          {isPanelOpen && (
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-full border border-white/40 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Guardar mi selección
            </button>
          )}

          {/* Un solo botón que abre y cierra, con `aria-expanded` reflejando el
              estado real: dos botones distintos obligarían a un lector de
              pantalla a deducir la relación con el panel. */}
          <button
            type="button"
            onClick={isPanelOpen ? closePanel : openPanel}
            aria-expanded={isPanelOpen}
            aria-controls="cookie-banner-panel"
            className="font-heading text-sm font-semibold text-white underline underline-offset-4 transition-opacity hover:opacity-80 sm:px-2"
          >
            {isPanelOpen ? "Ocultar opciones" : "Personalizar"}
          </button>

          {/* Sólo aparece cuando el banner se reabrió desde el footer, o sea
              cuando YA hay una decisión guardada a la que volver. En la primera
              visita no existe: cerrar sin elegir sería consentimiento tácito. */}
          {dismiss && (
            <button
              type="button"
              onClick={dismiss}
              className="font-heading text-sm font-semibold text-slate-300 underline underline-offset-4 transition-opacity hover:opacity-80 sm:px-2"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
