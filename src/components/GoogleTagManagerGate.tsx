"use client";

/**
 * Google Tag Manager, montado SIEMPRE.
 *
 * YA NO HAY PUERTA. El contenedor se pide en todas las cargas, haya decisión de
 * cookies o no. Quien gobierna la privacidad es Consent Mode v2 —y sólo él—:
 * arranca DENEGADO desde `consentBootstrapScript()`, antes de la hidratación, y
 * se actualiza en cada cambio de preferencia desde <ConsentProvider>. Con las
 * señales en denegado las etiquetas de Google mandan pings sin cookies y no
 * identifican a nadie, que es exactamente para lo que existe ese mecanismo.
 *
 * POR QUÉ SE QUITÓ LA PUERTA: mientras el montaje dependía del consentimiento,
 * el contenedor no existía en la carga inicial, así que NADA anterior a la
 * decisión llegaba nunca — ni el page_view, ni la conversión de quien envía un
 * formulario sin llegar a tocar el banner. La cola del `dataLayer` sí se
 * escribía, pero sin GTM montado no había quien la procesara.
 *
 * ORDEN, que es lo que hace que esto sea correcto: el script de arranque crea
 * `window.dataLayer` y le empuja el `consent default` al parsear el <body>,
 * mucho antes de que este componente hidrate. Cuando GTM carga, encuentra esa
 * cola ya escrita y la procesa en orden, así que nunca ve un estado "sin
 * definir".
 *
 * Sigue siendo componente de cliente porque <GoogleTagManager> lo es.
 */

import { GoogleTagManager } from "@next/third-parties/google";
import { GTM_ID } from "@/lib/analytics";

export default function GoogleTagManagerGate() {
  return <GoogleTagManager gtmId={GTM_ID} />;
}
