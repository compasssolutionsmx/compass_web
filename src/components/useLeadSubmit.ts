"use client";

/**
 * Envío compartido de leads: POST al webhook (stub) -> redirect a WhatsApp.
 *
 * Es el único sitio donde vive ese patrón. Lo usan los dos formularios del
 * sitio, que capturan cosas distintas pero terminan igual:
 *   - <QuoteWizard>     vía `useQuoteRequest`, 4 pasos con ramificación
 *   - <WhatsAppModal>   captura corta de los accesos rápidos a WhatsApp
 */

import { useCallback, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/site";

/** Cada formulario aporta sus propios campos; todos son texto plano. */
export type LeadPayload = Record<string, string | undefined>;

/**
 * STUB del POST al webhook — el endpoint real todavía no existe.
 *
 * TODO(integración CRM): implementar el POST real. Falta para eso, así que de
 * momento sólo se deja el payload listo.
 *   1. Mandarlo a una Route Handler propia (p. ej. `/api/lead`) que a su vez
 *      reenvíe al webhook de studio.scndal.com. No exponer la URL ni el secreto
 *      del webhook en el cliente.
 *   2. Definir el contrato del payload — hoy cada formulario manda sus campos
 *      con los nombres que usa internamente.
 *   3. Añadir el evento de conversión de Google Ads.
 */
async function postToWebhook(data: LeadPayload): Promise<void> {
  console.info("[lead] POST al webhook (stub, sin conectar):", data);
}

export function useLeadSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLead = useCallback(
    async (payload: LeadPayload, whatsappMessage: string) => {
      setIsSubmitting(true);

      // Si el POST falla NO se aborta el flujo: perder el handoff a WhatsApp
      // costaría el lead, que es lo que realmente convierte.
      try {
        await postToWebhook(payload);
      } catch (webhookError) {
        console.error("[lead] falló el POST al webhook:", webhookError);
      }

      // No se limpia `isSubmitting` a propósito: evita un doble envío mientras
      // el navegador sale de la página.
      window.location.href = buildWhatsAppUrl(whatsappMessage);
    },
    [],
  );

  return { isSubmitting, submitLead };
}
