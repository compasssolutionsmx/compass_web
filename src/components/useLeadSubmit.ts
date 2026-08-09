"use client";

/**
 * Envío compartido de leads: POST a `/api/lead` -> pantalla de confirmación.
 *
 * Este hook ya no habla con ningún destino más. El correo, el acuse al cliente
 * y el envío al CRM salen los tres del servidor, desde `/api/lead`; aquí sólo
 * se manda el formulario y se traduce la respuesta a un estado de pantalla.
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

import { useCallback, useEffect, useRef, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/site";
import { pushEvent } from "@/lib/analytics";
import { MIN_FILL_MS } from "@/lib/bot-trap";
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
  trampas: { website: string; elapsedMs: number },
): Promise<void> {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Las dos trampas viajan FUERA de `datos`, al mismo nivel que `formulario`.
    // Si fueran dentro acabarían en el correo: `orderedFields` pinta al final
    // cualquier clave que no reconozca, así que el equipo comercial recibiría
    // un "website:" vacío y un "elapsedMs: 8123" en cada aviso.
    body: JSON.stringify({ formulario, datos, ...trampas }),
    keepalive: true,
    signal: AbortSignal.timeout(TIMEOUT_CORREO_MS),
  });

  if (!response.ok) {
    throw new Error(`/api/lead respondió ${response.status}`);
  }
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
    website: string;
  } | null>(null);

  /**
   * TIME-TRAP, mitad cliente. Momento en que el formulario apareció en
   * pantalla; el hook se monta con él, así que este ref lo fecha sin que cada
   * formulario tenga que acordarse de nada.
   *
   * NO SE REINICIA con "Hacer otra cotización" ni con un reintento, y es
   * deliberado: el tiempo sólo puede crecer, así que quien ya lleva un rato en
   * la página nunca vuelve a acercarse al umbral. Reiniciarlo obligaría a
   * esperar otros tres segundos por cada envío adicional, castigando justo al
   * usuario que más está usando el sitio.
   *
   * SE FECHA EN UN EFECTO, no en el valor inicial del ref. Dos razones, y la
   * primera es que `useRef(Date.now())` es una llamada impura en render y la
   * regla `react-hooks/purity` la rechaza. La segunda es que así se mide mejor:
   * el efecto corre después del primer pintado en el navegador, o sea cuando el
   * formulario existe de verdad para el usuario, en vez de cuando el servidor
   * generó el HTML.
   */
  const montadoEn = useRef<number | null>(null);

  useEffect(() => {
    montadoEn.current = Date.now();
  }, []);

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
      /**
       * Contenido del campo trampa, leído del <form> con `readHoneypot`. Los
       * cuatro formularios lo pasan; va vacío salvo que algo no humano lo haya
       * rellenado.
       */
      website: string,
    ) => {
      ultimoEnvio.current = { payload, whatsappMessage, formulario, website };
      setWhatsappUrl(
        whatsappMessage ? buildWhatsAppUrl(whatsappMessage) : null,
      );
      setStatus("submitting");

      /**
       * TIME-TRAP, la otra mitad: si el envío llega antes del umbral, el
       * cliente ESPERA lo que falte en vez de dejar que el servidor lo rechace.
       *
       * Es la diferencia entre una trampa que sólo pilla bots y una que además
       * roza a personas. Quien usa el autorrelleno del navegador puede llenar
       * el modal corto y pulsar enviar en menos de dos segundos, y ése es un
       * cliente, no un atacante: lo único que ve es el botón en "Enviando…" un
       * momento más. El servidor sigue exigiendo el mínimo sin ceder nada,
       * porque a él llegan también los POST que nunca pasaron por este código.
       *
       * El tope de espera es el propio umbral, así que en el peor caso son 3 s.
       */
      // Si el efecto no llegó a correr —no debería, pero un ref nulo no puede
      // decidir nada— se toma este instante como origen: la espera de abajo
      // sale entonces completa y el envío cumple el mínimo igual. El fallo, si
      // lo hay, cae del lado de esperar de más y nunca del de rechazar a nadie.
      const desde = montadoEn.current ?? Date.now();

      const falta = MIN_FILL_MS - (Date.now() - desde);
      if (falta > 0) {
        await new Promise((resolve) => setTimeout(resolve, falta));
      }

      // EL CORREO ES LO QUE DECIDE. Antes daba igual que fallara porque el
      // usuario se iba a WhatsApp de todos modos; ahora la pantalla de éxito
      // afirma que la solicitud "quedó registrada", y eso sólo es cierto si
      // este POST salió bien. Si falla, se muestra el error con reintento.
      try {
        await postLeadEmail(formulario, payload, {
          website,
          elapsedMs: Date.now() - desde,
        });
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

      /**
       * AQUÍ ESTABA `postToWebhook`, el stub del CRM. Ya no hace falta: el
       * envío al CRM lo hace `/api/lead` desde el servidor (ver `lib/crm`),
       * que es lo que su propio TODO pedía — la URL y el secreto del CRM son
       * configuración privada y en el cliente habrían viajado en el bundle.
       *
       * No queda nada que esperar en este punto. Que el CRM falle no cambia lo
       * que ve el usuario: para cuando el POST de arriba respondió, el correo
       * ya salió y el lead está registrado.
       */
      setStatus("success");
    },
    [],
  );

  /** Reintenta el último envío tal cual. Lo usa la pantalla de error. */
  const retryLead = useCallback(() => {
    const ultimo = ultimoEnvio.current;
    if (!ultimo) return;
    // Se reenvía el honeypot TAL CUAL, sin limpiarlo. Si un bot cayó, sigue
    // cayendo; y si algo lo rellenó por error, el reintento falla igual y queda
    // en el log en vez de colarse por la puerta de atrás.
    void submitLead(
      ultimo.payload,
      ultimo.whatsappMessage,
      ultimo.formulario,
      ultimo.website,
    );
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
