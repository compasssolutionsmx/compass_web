"use client";

/**
 * Google Tag Manager, montado SÓLO con consentimiento.
 *
 * No es un `<GoogleTagManager>` suelto en el layout: mientras el usuario no
 * haya decidido, este componente devuelve `null` y el script de gtm.js ni
 * siquiera se pide. Si rechaza, nunca se pide.
 *
 * SE MONTA SI HAY ANALÍTICAS **O** MARKETING. El contenedor es un paraguas: de
 * él cuelgan tanto GA4 como las etiquetas de Ads/Meta, así que exigir las dos
 * dejaría sin medición a quien aceptó sólo una. Qué se dispara DENTRO del
 * contenedor lo sigue gobernando Consent Mode v2, que ya está inicializado en
 * denegado desde `consentBootstrapScript()` —antes de la hidratación— y se
 * actualiza en cada cambio de preferencia desde <ConsentProvider>. O sea: dos
 * capas, una que decide si GTM carga y otra que decide qué puede hacer una vez
 * cargado.
 *
 * ORDEN, que es lo que hace que esto funcione: el script de arranque crea
 * `window.dataLayer` y le empuja el `consent default` mucho antes de que GTM
 * exista. Cuando GTM carga, encuentra esa cola ya escrita y la procesa en
 * orden, así que nunca ve un estado "sin definir".
 *
 * LIMITACIÓN CONOCIDA — no se puede "descargar". Si el usuario retira el
 * consentimiento, este componente deja de renderizarse, pero eso NO quita el
 * <script> ya inyectado, ni las cookies puestas, ni los listeners del
 * contenedor: React desmonta su árbol, no lo que el script hizo en el
 * documento. Por eso <ConsentProvider> recarga la página cuando detecta una
 * revocación (ver el `window.location.reload()` de su `commit`), que es la
 * única forma honesta de volver a un documento sin GTM. Al recargar, este gate
 * ya no lo monta.
 */

import { GoogleTagManager } from "@next/third-parties/google";
import { useConsent } from "./ConsentProvider";
import { GTM_ID } from "@/lib/analytics";

export default function GoogleTagManagerGate() {
  const { preferences, hasDecided } = useConsent();

  if (!hasDecided) return null;
  if (!preferences.analytics && !preferences.marketing) return null;

  return <GoogleTagManager gtmId={GTM_ID} />;
}
