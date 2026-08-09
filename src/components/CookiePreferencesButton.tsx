"use client";

/**
 * Enlace del footer para reabrir el banner de cookies con el panel desplegado.
 *
 * ES LA PIEZA QUE SOSTIENE EL MODELO OPT-OUT, no un extra. Como el banner ya no
 * bloquea y se cierra sin elegir, éste pasa a ser la vía por la que el usuario
 * se opone después: sin él, cambiar de opinión exigiría borrar el
 * `localStorage` a mano. Vive en el footer, que está en todas las páginas y es
 * donde el usuario ya busca lo legal, junto al aviso de privacidad.
 *
 * Es un <button> y no un <Link>: no navega a ninguna parte, sólo cambia el
 * estado de la página. Se estiliza como el resto de enlaces de la lista.
 */

import { useConsent } from "./ConsentProvider";

export default function CookiePreferencesButton() {
  const { reopenBanner } = useConsent();

  return (
    <button
      type="button"
      onClick={reopenBanner}
      className="text-left transition-colors hover:text-white"
    >
      Preferencias de cookies
    </button>
  );
}
