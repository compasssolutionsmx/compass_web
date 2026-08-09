"use client";

/**
 * Envío compartido de leads: correo de respaldo -> webhook (stub) -> pantalla
 * de confirmación.
 *
 * Es el único sitio donde vive ese patrón. Lo usan los formularios del sitio,
 * que capturan cosas distintas pero terminan igual:
 *   - <QuoteWizard>     vía `useQuoteRequest`, pasos con ramificación
 *   - <WhatsAppModal>   captura corta de los accesos rápidos a WhatsApp
 *   - <ProviderForm>    registro de proveedores, el único SIN salida a
 *                       WhatsApp (ver el parámetro `whatsappMessage`)
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
import { pushEvent } from "@/lib/analytics";
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

/**
 * Evento de conversión que le corresponde a cada origen.
 *
 * SÓLO LOS DOS QUE SON LEADS DE VENTA. `proveedor` es una empresa ofreciéndose
 * y `vacante` una persona postulándose: contarlos como conversión inflaría
 * justo la métrica con la que se juzgan las campañas, y son formularios que las
 * campañas no pagan. Por eso el mapa es `Partial` y los dos que faltan faltan a
 * propósito — un origen sin entrada simplemente no dispara nada.
 */
const CONVERSION_EVENT: Partial<Record<LeadSource, string>> = {
  cotizador: "lead_cotizador",
  whatsapp: "lead_whatsapp",
};

export type LeadStatus = "idle" | "submitting" | "success" | "error";

export function useLeadSubmit() {
  const [status, setStatus] = useState<LeadStatus>("idle");
  /** URL de WhatsApp del último envío; la ofrece la pantalla de confirmación. */
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  /** Guardado para poder reintentar sin que el formulario vuelva a armarlo. */
  const ultimoEnvio = useRef<{
    payload: LeadPayload;
    whatsappMessage: string | null;
    formulario: LeadSource;
  } | null>(null);

  const submitLead = useCallback(
    async (
      payload: LeadPayload,
      /**
       * `null` para los formularios que NO tienen salida por WhatsApp — hoy el
       * registro de proveedores: ese canal es de atención a clientes, y
       * ofrecerlo ahí mandaría a un proveedor a la cola de ventas. Con `null`,
       * `whatsappUrl` se queda en null y las pantallas de confirmación omiten
       * la tarjeta solas, sin que cada formulario tenga que acordarse de
       * esconderla.
       */
      whatsappMessage: string | null,
      formulario: LeadSource,
    ) => {
      ultimoEnvio.current = { payload, whatsappMessage, formulario };
      setWhatsappUrl(
        whatsappMessage ? buildWhatsAppUrl(whatsappMessage) : null,
      );
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

      /**
       * CONVERSIÓN. Éste es el ÚNICO punto de disparo del sitio, y tiene que
       * seguir siéndolo: por aquí pasan los cuatro formularios —cotizador,
       * modal corto, proveedores y vacantes—, así que ningún montaje se queda
       * sin cubrir y ninguno puede contar doble. Añadir un push en
       * <QuoteWizard> o en <WhatsAppModal> duplicaría el evento del cotizador,
       * que se monta DOS VECES a la vez en el home (sección del hero y modal).
       *
       * VA DESPUÉS DEL POST Y ANTES DEL ÉXITO, no al entrar: sólo se llega aquí
       * si `/api/lead` respondió 2xx. Un 400 de validación, el 429 del
       * limitador, el 503 sin RESEND_KEY o el timeout salen todos por el
       * `return` de arriba sin tocar esta línea. Se dispara una vez por envío
       * conseguido, así que un segundo formulario en la misma sesión —o un
       * reintento que por fin sale bien— cuenta otra vez, que es lo correcto.
       */
      const evento = CONVERSION_EVENT[formulario];
      if (evento) {
        pushEvent(evento, {
          form_origin: formulario,
          service_type: payload.tipo,
          service_sub: payload.sub,
          contact_preference: payload.contactoPreferido,
          // La ruta se lee del navegador y no del payload: es la página desde
          // la que se envió, y el modal del cotizador vive en casi todas.
          page_path: window.location.pathname,
        });
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
