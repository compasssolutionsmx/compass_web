"use client";

/**
 * Lógica compartida del flujo de cotización.
 *
 * FLUJO CRÍTICO: alimenta las 2 campañas de Google Ads activas.
 * Lo consume <QuoteWizard>, que se monta tanto en la sección del hero como en
 * el modal a pantalla completa. Cualquier cambio de validación, payload o
 * mensaje de WhatsApp se hace aquí una sola vez.
 */

import { useCallback, useState } from "react";
import { useLeadSubmit } from "./useLeadSubmit";
import { attributionFields } from "@/lib/attribution";

// REQUEST_TYPES se mudó a `lib/request-types` para que el Route Handler del
// correo pueda traducir el slug a etiqueta sin importar un módulo de cliente.
// Se reexporta para no romper a quien ya lo importaba desde aquí.
export { REQUEST_TYPES } from "@/lib/request-types";

/**
 * Payload que se manda al webhook.
 *
 * `tipo` y `detalles` son obligatorios en el payload; el resto depende de la
 * rama del paso 2 y de lo que el usuario haya llenado, así que van opcionales.
 */
export type QuoteFormData = {
  tipo: string;
  detalles: string;
  /**
   * Sub-dato corto del paso "Ruta": puerto, aeropuerto o modalidad terrestre
   * (LTL/FTL). Es lo que va entre paréntesis en el mensaje de WhatsApp.
   * Especializado y Otros no tienen: ahí la info va en `descripcion`.
   */
  sub?: string;
  origen?: string;
  destino?: string;
  fecha?: string;
  /** Texto libre de Especializado / Otros. */
  descripcion?: string;
  nombre?: string;
  empresa?: string;
  correo?: string;
  telefono?: string;
  /** "Correo" · "WhatsApp" · "Llamada". Opcional, no bloquea el envío. */
  contactoPreferido?: string;
  /**
   * Atribución: cómo se enteró de nosotros. El CAMPO es opcional en pantalla,
   * pero la propiedad NO lo es en el payload — cuando se deja en blanco viaja
   * "No especificado", para que el correo del lead tenga siempre la misma
   * forma. Ver `lib/referral-sources`.
   *
   * Si se eligió "Otro", aquí llega el texto que escribió el usuario, no la
   * palabra "Otro".
   */
  comoNosConocio: string;
};

/**
 * Mensaje prellenado que se manda a WhatsApp tras enviar el formulario.
 * Con sub-dato: "...sobre Marítimo (Manzanillo)."
 * Sin sub-dato:  "...sobre Especializado."
 */
function buildWhatsAppMessage(
  tipoServicioSeleccionado: string,
  sub?: string,
): string {
  const detalle = sub?.trim() ? ` (${sub.trim()})` : "";
  return `Hola Compass Solutions, necesito información sobre ${tipoServicioSeleccionado}${detalle}.`;
}

/**
 * Estado + envío del formulario de cotización.
 *
 * Lo consume <QuoteWizard>, que a su vez se monta en dos sitios (la sección del
 * hero y el modal a pantalla completa). `submitQuote` es imperativo porque el
 * estado del cotizador vive en React —es multi-paso con ramificación— y no en
 * el DOM.
 */
export function useQuoteRequest() {
  const {
    status,
    isSubmitting,
    whatsappUrl,
    submitLead,
    retryLead,
    resetLead,
  } = useLeadSubmit();
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Arma el mensaje de WhatsApp y delega el envío en `useLeadSubmit`, que es
   * quien manda el correo, llama al stub del webhook y expone el estado que
   * <QuoteWizard> usa para pintar la confirmación. La validación por paso la
   * hace <QuoteWizard> antes de llamar aquí.
   */
  const submitQuote = useCallback(
    async (payload: QuoteFormData, tipoLabel: string, website: string) => {
      setError(null);
      await submitLead(
        /**
         * ATRIBUCIÓN DE CAMPAÑA (`click_id`, `click_source`, los tres UTM y
         * `referrer`), leída de `localStorage` al enviar. Va DETRÁS de
         * `payload`: la genera el sistema, así que prevalece sobre cualquier
         * campo homónimo del formulario. Sin registro, o con uno caducado, no añade ninguna
         * clave y el envío sale igual. Ver `lib/attribution`.
         *
         * OJO CON EL TOPE: `parseLead` rechaza el lead ENTERO si `datos` trae
         * más de 30 claves (`MAX_CAMPOS` en `lib/lead-email`). El cotizador
         * usa 13 y la atribución puede sumar 6: 19 de 30. Quien añada campos
         * al cotizador tiene margen para 11 más antes de que los leads con
         * atribución completa empiecen a rebotar.
         */
        { ...payload, ...attributionFields() },
        buildWhatsAppMessage(tipoLabel, payload.sub),
        "cotizador",
        // Campo trampa, tal cual salió del <form>. Este hook no lo mira: sólo
        // lo transporta hasta `useLeadSubmit`, que es quien lo manda al
        // servidor. Ver `lib/bot-trap`.
        website,
      );
    },
    [submitLead],
  );

  return {
    status,
    isSubmitting,
    whatsappUrl,
    error,
    setError,
    clearError,
    submitQuote,
    retryLead,
    resetLead,
  };
}
