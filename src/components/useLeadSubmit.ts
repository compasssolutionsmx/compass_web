"use client";

/**
 * Envío compartido de leads: correo de respaldo -> webhook (stub) -> pantalla
 * de confirmación.
 *
 * Es el único sitio donde vive ese patrón. Lo usan los dos formularios del
 * sitio, que capturan cosas distintas pero terminan igual:
 *   - <QuoteWizard>     vía `useQuoteRequest`, 4 pasos con ramificación
 *   - <WhatsAppModal>   captura corta de los accesos rápidos a WhatsApp
 *
 * YA NO REDIRIGE. Antes el envío terminaba en un `window.location.href` a
 * wa.me y el usuario salía del sitio sin saber si su solicitud había quedado
 * registrada. Ahora este hook expone un ESTADO —idle / submitting / success /
 * error— y cada formulario pinta su propia pantalla de confirmación sin mover
 * al usuario de sitio. WhatsApp sigue estando, pero como opción en esa
 * pantalla y abriéndose en pestaña nueva, no como destino forzoso.
 */

import { useCallback, useRef, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/site";
// SÓLO EL TIPO. `lead-email` es un módulo `server-only`; un `import type` se
// borra al compilar, así que nada de ese archivo —ni su configuración, ni por
// arrastre la clave de Resend— acaba en el bundle del navegador.
import type { LeadSource } from "@/lib/lead-email";

/** Cada formulario aporta sus propios campos; todos son texto plano. */
export type LeadPayload = Record<string, string | undefined>;

/** Máximo que se espera al correo antes de dar el envío por fallido. */
const TIMEOUT_CORREO_MS = 10_000;

/**
 * Correo de respaldo, vía Route Handler propio. La clave de Resend vive allá;
 * aquí no se sabe nada de ella.
 *
 * `keepalive: true` ya no es imprescindible —nadie navega a mitad del envío—
 * pero se queda: cubre el caso de quien cierra la pestaña con el botón ya
 * pulsado, y ahí el respaldo igual llega. El límite de keepalive son 64 KB de
 * cuerpo; un lead son unos cientos de bytes.
 *
 * El `AbortSignal.timeout` importa MÁS que antes: agotarlo ya no es un
 * inconveniente invisible, es lo que decide que el usuario vea la pantalla de
 * error. Por eso son 10s y no 5: vale más esperar un segundo de más que
 * declarar fallido un envío que iba a salir bien.
 */
async function postLeadEmail(
  formulario: LeadSource,
  datos: LeadPayload,
): Promise<void> {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // `hp` es el honeypot: desde aquí va siempre vacío. Lo comprueba el
    // servidor, donde un bot que rellene todos los campos se delata solo.
    body: JSON.stringify({ formulario, datos, hp: "" }),
    keepalive: true,
    signal: AbortSignal.timeout(TIMEOUT_CORREO_MS),
  });

  if (!response.ok) {
    throw new Error(`/api/lead respondió ${response.status}`);
  }
}

/**
 * STUB del POST al webhook — el endpoint real todavía no existe.
 *
 * TODO(integración CRM): implementar el POST real. Falta para eso, así que de
 * momento sólo se deja el payload listo.
 *   1. Reenviarlo DESDE EL SERVIDOR —`/api/lead` ya está montado y puede
 *      hacerlo— al webhook de studio.scndal.com. No exponer la URL ni el
 *      secreto del webhook en el cliente.
 *   2. Definir el contrato del payload — hoy cada formulario manda sus campos
 *      con los nombres que usa internamente.
 *   3. Añadir el evento de conversión de Google Ads.
 */
async function postToWebhook(data: LeadPayload): Promise<void> {
  console.info("[lead] POST al webhook (stub, sin conectar):", data);
}

export type LeadStatus = "idle" | "submitting" | "success" | "error";

export function useLeadSubmit() {
  const [status, setStatus] = useState<LeadStatus>("idle");
  /** URL de WhatsApp del último envío; la ofrece la pantalla de confirmación. */
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  /** Guardado para poder reintentar sin que el formulario vuelva a armarlo. */
  const ultimoEnvio = useRef<{
    payload: LeadPayload;
    whatsappMessage: string;
    formulario: LeadSource;
  } | null>(null);

  const submitLead = useCallback(
    async (
      payload: LeadPayload,
      whatsappMessage: string,
      formulario: LeadSource,
    ) => {
      ultimoEnvio.current = { payload, whatsappMessage, formulario };
      setWhatsappUrl(buildWhatsAppUrl(whatsappMessage));
      setStatus("submitting");

      // EL CORREO ES LO QUE DECIDE. Antes daba igual que fallara porque el
      // usuario se iba a WhatsApp de todos modos; ahora la pantalla de éxito
      // afirma que la solicitud "quedó registrada", y eso sólo es cierto si
      // este POST salió bien. Si falla, se muestra el error con reintento.
      try {
        await postLeadEmail(formulario, payload);
      } catch (emailError) {
        console.error("[lead] falló el correo de respaldo:", emailError);
        setStatus("error");
        return;
      }

      // El webhook NO decide: hoy es un stub que no puede fallar, y cuando se
      // conecte seguirá siendo un destino secundario. Si algún día se cae, el
      // lead ya está en el correo, así que la confirmación sigue siendo cierta.
      try {
        await postToWebhook(payload);
      } catch (webhookError) {
        console.error("[lead] falló el POST al webhook:", webhookError);
      }

      setStatus("success");
    },
    [],
  );

  /** Reintenta el último envío tal cual. Lo usa la pantalla de error. */
  const retryLead = useCallback(() => {
    const ultimo = ultimoEnvio.current;
    if (!ultimo) return;
    void submitLead(ultimo.payload, ultimo.whatsappMessage, ultimo.formulario);
  }, [submitLead]);

  /** Vuelve al formulario en blanco ("hacer otra cotización"). */
  const resetLead = useCallback(() => {
    ultimoEnvio.current = null;
    setWhatsappUrl(null);
    setStatus("idle");
  }, []);

  return {
    status,
    isSubmitting: status === "submitting",
    whatsappUrl,
    submitLead,
    retryLead,
    resetLead,
  };
}
