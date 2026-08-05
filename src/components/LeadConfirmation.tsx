"use client";

/**
 * Pantallas de cierre de los dos formularios: éxito y error.
 *
 * Sustituyen al `window.location.href` a wa.me con el que antes terminaba todo
 * envío. El usuario ya no sale del sitio sin saber si su solicitud quedó
 * registrada: se le dice, y WhatsApp pasa a ser una opción más.
 *
 * Van en un archivo aparte porque las montan los DOS formularios —el cotizador
 * de 4 pasos y el modal corto—, que no comparten nada más que esto y el hook de
 * envío. Las dos superficies son tarjetas blancas, así que un solo juego de
 * estilos vale para ambas.
 *
 * ACCESIBILIDAD: el contenedor es `role="status"` (que implica
 * `aria-live="polite"`) y además recibe el foco al montarse. Lo primero cubre a
 * quien está leyendo en otra parte de la página; lo segundo, a quien navega con
 * teclado y necesita que el punto de partida sea el mensaje y no el principio
 * del documento. El foco va al CONTENEDOR y no al título para que el anuncio y
 * el foco caigan en el mismo sitio y no se dupliquen.
 */

import { Check, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import WhatsAppIcon from "./WhatsAppIcon";

/**
 * Texto de la tarjeta de WhatsApp, igual en éxito y en error.
 *
 * Va en una constante y no repetido en los dos sitios porque es literalmente el
 * mismo mensaje: duplicado, ya se había desincronizado una vez del trato de
 * usted que usa el resto del sitio ("Déjenos sus datos", "Escriba su nombre",
 * "Solicite una Cotización"). Con una sola fuente, corregirlo es corregirlo en
 * las tres superficies a la vez.
 */
const TEXTO_WHATSAPP =
  "Si lo necesita, también puede contactarnos por WhatsApp";

/**
 * Bloque de WhatsApp. Va deliberadamente como TARJETA APARTE —fondo brand-100
 * dentro de la tarjeta blanca— para que se lea como una alternativa y no como
 * la continuación del mensaje: el registro ya terminó, esto es opcional.
 *
 * `target="_blank"` + `rel="noopener noreferrer"`: el usuario no debe perder el
 * sitio por consultar WhatsApp, y `noopener` evita que la pestaña abierta pueda
 * tocar la nuestra vía `window.opener`.
 */
function WhatsAppCard({ url, texto }: { url: string; texto: string }) {
  return (
    // UNA SOLA LÍNEA: texto a la izquierda, botón a la derecha. Antes eran dos
    // filas —párrafo arriba y botón a todo lo ancho debajo— y entre eso y los
    // botones de abajo la pantalla ofrecía tres bloques apilados de acción.
    // `flex-wrap` para que en pantallas angostas caiga a dos renglones en vez
    // de comprimir el botón.
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-100 px-5 py-4 text-left">
      <p className="text-sm text-brand-900">{texto}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-brand-900 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {/* Mismo criterio de color que el botón flotante: navy con el glyph en
            el verde de WhatsApp. El verde de marca como fondo con texto blanco
            encima da 1.98:1 y no pasa AA. */}
        <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25D366]" />
        Abrir WhatsApp
      </a>
    </div>
  );
}

/** Mueve el foco al contenedor en cuanto aparece la pantalla. */
function useFocusOnMount() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}

export function LeadSuccess({
  whatsappUrl,
  onReset,
  resetLabel,
  onClose,
}: {
  whatsappUrl: string | null;
  /** Vuelve al formulario vacío. En el cotizador inline es la salida principal. */
  onReset?: () => void;
  resetLabel?: string;
  /** Sólo cuando esto vive dentro de un modal, que es lo que se puede cerrar. */
  onClose?: () => void;
}) {
  const ref = useFocusOnMount();

  return (
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className="py-4 text-center outline-none"
    >
      <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-900">
        <Check
          className="h-8 w-8 text-white"
          aria-hidden="true"
          strokeWidth={3}
        />
      </span>

      <h3 className="font-heading text-2xl font-bold text-brand-900 md:text-3xl">
        Su solicitud quedó registrada
      </h3>
      {/* Sin plazos concretos: prometer "24 horas" es una promesa que este
          equipo no ha confirmado que pueda cumplir. */}
      <p className="mx-auto mt-3 max-w-md text-slate-500">
        Ya tenemos sus datos. Nuestro equipo revisará la solicitud y se pondrá
        en contacto con usted.
      </p>

      {whatsappUrl && <WhatsAppCard url={whatsappUrl} texto={TEXTO_WHATSAPP} />}

      {(onReset || onClose) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-slate-300 px-6 py-3 font-heading text-sm font-semibold text-slate-600 transition-colors hover:border-brand-900 hover:text-brand-900"
            >
              {resetLabel ?? "Enviar otra solicitud"}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-brand-900 px-6 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Volver al sitio
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function LeadError({
  whatsappUrl,
  onRetry,
  isRetrying,
}: {
  whatsappUrl: string | null;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const ref = useFocusOnMount();

  return (
    // `role="alert"` y no `status`: esto interrumpe, que es lo que corresponde
    // cuando algo salió mal y hay que actuar. Es el mismo tratamiento que ya
    // usan los errores de validación de los dos formularios.
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="py-4 text-center outline-none"
    >
      <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <TriangleAlert className="h-8 w-8 text-red-600" aria-hidden="true" />
      </span>

      <h3 className="font-heading text-2xl font-bold text-brand-900 md:text-3xl">
        No pudimos registrar su solicitud
      </h3>
      <p className="mx-auto mt-3 max-w-md text-slate-500">
        Hubo un problema al enviarla. Puede intentarlo de nuevo o escribirnos
        directamente por WhatsApp — sus datos ya están listos en el mensaje.
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-6 rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isRetrying ? "Reintentando…" : "Reintentar"}
      </button>

      {/* Aquí WhatsApp deja de ser un extra y pasa a ser la vía de rescate: si
          el registro falló, es lo único que queda para no perder el lead. */}
      {whatsappUrl && <WhatsAppCard url={whatsappUrl} texto={TEXTO_WHATSAPP} />}
    </div>
  );
}
