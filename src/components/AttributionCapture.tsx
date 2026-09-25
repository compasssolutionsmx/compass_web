"use client";

/**
 * Captura la atribución de campaña de la URL de llegada. No pinta nada.
 *
 * Va en el layout raíz, así que corre en la carga inicial de CUALQUIER página.
 * El efecto se ejecuta una sola vez, al hidratar: las navegaciones de cliente
 * posteriores no vuelven a montar el layout, y para entonces la query string
 * de llegada ya quedó guardada.
 *
 * `window.location.search` y NO `useSearchParams`: éste obliga a envolver el
 * componente en un límite de Suspense o el prerender del build falla, y aquí
 * no hace falta reaccionar a cambios de la URL, sólo leer la de llegada.
 *
 * Dentro de `useEffect` porque `localStorage` no existe en el servidor.
 */

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution(window.location.search);
  }, []);

  return null;
}
