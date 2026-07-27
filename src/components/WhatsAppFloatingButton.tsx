"use client";

import WhatsAppIcon from "./WhatsAppIcon";
import { WhatsAppButton } from "./WhatsAppModal";

/**
 * Botón flotante de WhatsApp. Abre <WhatsAppModal> para capturar el lead antes
 * del handoff; no enlaza a wa.me.
 *
 * COLOR: se queda en navy (`.glass-solid`) con el ícono en verde de WhatsApp,
 * y no al revés. El verde de marca de WhatsApp (#25D366) con texto blanco
 * encima da 1.98:1 y falla AA de largo; el único verde de su paleta que pasa
 * (#075E54) es tan oscuro que deja de leerse como WhatsApp. Así el texto
 * mantiene 11.95:1, el ícono verde da 6.03:1 —por encima del 3:1 que pide el
 * contenido no textual— y la señal de WhatsApp la dan el glyph y el pulso.
 *
 * MOVIMIENTO: el wiggle periódico y el pulso verde viven en `.wa-fab`
 * (globals.css), que también los detiene con prefers-reduced-motion.
 */
export default function WhatsAppFloatingButton() {
  return (
    <WhatsAppButton
      ariaLabel="¡Habla con un Agente!"
      className="wa-fab glass-solid fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 sm:h-auto sm:w-auto sm:gap-2.5 sm:px-5 sm:py-3"
    >
      <WhatsAppIcon className="h-7 w-7 shrink-0 text-[#25D366] sm:h-5 sm:w-5" />
      {/* En móvil sólo queda el ícono y el botón es circular: el nombre
          accesible lo aporta el aria-label de arriba. */}
      <span className="hidden font-heading font-semibold sm:inline">
        ¡Habla con un Agente!
      </span>
    </WhatsAppButton>
  );
}
