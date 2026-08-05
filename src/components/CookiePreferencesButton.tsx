"use client";

/**
 * Enlace del footer para reabrir el banner de cookies con el panel desplegado.
 *
 * No es un extra: el GDPR pide que retirar el consentimiento sea tan fácil como
 * darlo, y sin esto la única forma de cambiar de opinión sería borrar el
 * `localStorage` a mano. Vive en el footer, que es donde el usuario ya busca lo
 * legal, junto al Aviso de Privacidad.
 *
 * Es un <button> y no un <Link>: no navega a ninguna parte, sólo cambia el
 * estado de la página. Se estiliza como el resto de enlaces de la lista.
 */

import { useConsent } from "./ConsentProvider";

export default function CookiePreferencesButton() {
  const { reopenSettings } = useConsent();

  return (
    <button
      type="button"
      onClick={reopenSettings}
      className="text-left hover:text-white"
    >
      Preferencias de Cookies
    </button>
  );
}
