/**
 * Núcleo de la preferencia de cookies. Sin React y sin DOM más allá de
 * `localStorage`, para que lo puedan compartir el provider de cliente y el
 * script inline que corre antes de la hidratación.
 *
 * MODELO: hay una sola fuente de verdad —la decisión guardada— y dos formas de
 * leerla. El provider la lee al montar, para pintar la UI; el script de arranque
 * la lee en el primer byte de JS, para que Google Consent Mode ya sepa a qué
 * atenerse antes de que cargue cualquier etiqueta. Las constantes de este
 * archivo alimentan a los dos, así que no pueden desincronizarse.
 *
 * ─── ESTO ES OPT-OUT, NO OPT-IN. LÉASE ANTES DE TOCAR NADA ────────────────
 *
 * Sin decisión guardada, medición y publicidad están CONCEDIDAS: el
 * `consent default` sale en `granted` y las etiquetas miden desde la primera
 * carga. El usuario se opone después, y esa oposición es lo que se persiste.
 *
 * Es un cambio de modelo pedido de forma explícita, y tiene una consecuencia
 * jurídica que conviene tener escrita donde vive el código y no sólo en un
 * chat: encaja con la LFPDPPP mexicana —dato no sensible, con aviso previo y
 * mecanismo de oposición permanente, que es el enlace del pie— y NO cumple el
 * GDPR ni la ePrivacy europea, que exigen consentimiento previo y expreso
 * antes de escribir cualquier cookie que no sea necesaria. Si algún día el
 * sitio se dirige a la UE, esto hay que revertirlo: basta con volver a poner
 * `DENY_ALL` en `DEFAULT_PREFERENCES` y en el `default` del bootstrap.
 */

/** Categorías que el usuario puede apagar. Las necesarias no se negocian. */
export type OptionalCategory = "analytics" | "marketing";

export type ConsentPreferences = Record<OptionalCategory, boolean>;

export type ConsentDecision = {
  version: number;
  preferences: ConsentPreferences;
  /** ISO. Sirve para caducar la decisión y para poder probar el consentimiento. */
  decidedAt: string;
};

export const CONSENT_STORAGE_KEY = "compass:consent";

/**
 * Subir esta versión invalida todas las decisiones guardadas y vuelve a mostrar
 * el banner. Hay que subirla SIEMPRE que cambie el alcance de lo que se
 * informó: una categoría nueva, una herramienta nueva dentro de una categoría
 * existente o un cambio de finalidad.
 *
 * SE QUEDA EN 1 al pasar a opt-out, a propósito. Subirla borraría las
 * oposiciones ya registradas y volvería a medir a quien había dicho que no, que
 * es el único efecto que este cambio de modelo NO debe tener.
 */
export const CONSENT_VERSION = 1;

/**
 * A los 180 días se vuelve a preguntar. No es un plazo del reglamento —el GDPR
 * no fija uno— sino la recomendación de la CNIL que el resto de autoridades
 * europeas ha ido adoptando: el consentimiento no es indefinido.
 */
export const CONSENT_MAX_AGE_DAYS = 180;

export const DENY_ALL: ConsentPreferences = {
  analytics: false,
  marketing: false,
};
export const GRANT_ALL: ConsentPreferences = {
  analytics: true,
  marketing: true,
};

/**
 * Lo que rige MIENTRAS NO HAY DECISIÓN guardada. Es la pieza que define el
 * modelo: apuntando a `GRANT_ALL` el sitio es opt-out, apuntando a `DENY_ALL`
 * vuelve a ser opt-in.
 *
 * Tiene que valer lo mismo que el `consent default` del bootstrap de abajo, o
 * la UI y las etiquetas contarían cosas distintas: el banner mostraría los
 * interruptores apagados mientras Google ya estaría midiendo.
 */
export const DEFAULT_PREFERENCES: ConsentPreferences = GRANT_ALL;

/**
 * Señales de Google Consent Mode v2 que corresponden a cada categoría.
 *
 * `functionality_storage` y `security_storage` van siempre concedidas: son las
 * cookies necesarias, que se amparan en el interés legítimo y no requieren
 * consentimiento. Las otras cuatro arrancan denegadas.
 *
 * Se devuelve el objeto ya armado para pasárselo tal cual a
 * `gtag('consent', ...)`.
 */
export function consentModeSignals(preferences: ConsentPreferences) {
  const analytics = preferences.analytics ? "granted" : "denied";
  const marketing = preferences.marketing ? "granted" : "denied";
  return {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    personalization_storage: marketing,
    analytics_storage: analytics,
    functionality_storage: "granted",
    security_storage: "granted",
  } as const;
}

/**
 * Valida lo que haya en `localStorage`. Devuelve `null` —o sea, "sin decisión",
 * o sea, mostrar el banner— ante cualquier cosa rara: JSON corrupto, versión
 * vieja, decisión caducada o storage bloqueado (Safari en privado lanza al
 * escribir, y algunos navegadores al leer).
 *
 * OJO CON LO QUE SIGNIFICA `null` DESDE QUE ESTO ES OPT-OUT: ya no es "no
 * medir hasta que responda", es "medir y avisar". Un storage bloqueado deja al
 * usuario en el estado por defecto —concedido— y volviendo a ver el banner en
 * cada carga, que es lo único que se puede hacer sin sitio donde recordar su
 * respuesta. Quien necesite garantías ahí tiene el rechazo del navegador.
 */
export function readConsent(): ConsentDecision | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const decision = parsed as Partial<ConsentDecision>;
    if (decision.version !== CONSENT_VERSION) return null;
    if (typeof decision.decidedAt !== "string") return null;

    const preferences = decision.preferences;
    if (
      typeof preferences !== "object" ||
      preferences === null ||
      typeof preferences.analytics !== "boolean" ||
      typeof preferences.marketing !== "boolean"
    ) {
      return null;
    }

    const ageMs = Date.now() - new Date(decision.decidedAt).getTime();
    if (!Number.isFinite(ageMs)) return null;
    if (ageMs > CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null;

    return {
      version: CONSENT_VERSION,
      decidedAt: decision.decidedAt,
      // Se reconstruye el objeto en vez de reenviar el del JSON: así no se
      // cuelan claves extra de una versión futura o manipulada.
      preferences: {
        analytics: preferences.analytics,
        marketing: preferences.marketing,
      },
    };
  } catch {
    return null;
  }
}

/** Persiste la decisión. Si el storage no deja escribir, se sigue adelante. */
export function writeConsent(preferences: ConsentPreferences): ConsentDecision {
  const decision: ConsentDecision = {
    version: CONSENT_VERSION,
    preferences,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision));
  } catch {
    // Storage bloqueado: la decisión vale para esta sesión y el banner volverá
    // a aparecer en la siguiente. Es el fallo correcto — lo contrario sería dar
    // por consentido algo que no se pudo registrar.
  }
  return decision;
}

/**
 * Script que corre ANTES de la hidratación (etiqueta cruda al principio del
 * <body>). Hace dos cosas, en este orden:
 *
 *  1. Fija el estado por defecto de Consent Mode v2 en CONCEDIDO, las siete
 *     señales. Sigue siendo obligatorio declararlo de forma explícita aunque
 *     coincida con lo que gtag.js asumiría por su cuenta: un `default` escrito
 *     es lo que hace que el estado sea auditable y lo que deja el hueco por el
 *     que entra el `update` de abajo.
 *  2. Reproduce la decisión guardada, si la hay, POR ENCIMA de ese default.
 *     Aquí es donde vive la oposición: quien rechazó en su día vuelve a quedar
 *     denegado antes de que ninguna etiqueta mande nada. Esto es lo que impide
 *     que el paso a opt-out reactive la medición de quien ya había dicho que no.
 *
 * SIN `wait_for_update`. Servía para que las etiquetas esperasen medio segundo
 * a un update que podía relajar un default denegado; con el default ya en
 * concedido no hay nada que esperar, y el replay del punto 2 corre de forma
 * síncrona en este mismo script, antes que cualquier etiqueta. Dejarlo sólo
 * retrasaría el primer hit.
 *
 * Se genera desde este módulo, y no a mano en el layout, para que la clave, la
 * versión, la caducidad y el mapeo de señales sean literalmente los mismos que
 * usa el resto del código.
 */
export function consentBootstrapScript(): string {
  return `(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('consent','default',${JSON.stringify(
    consentModeSignals(DEFAULT_PREFERENCES),
  )});
  try {
    var raw = window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});
    if (!raw) return;
    var saved = JSON.parse(raw);
    if (!saved || saved.version !== ${CONSENT_VERSION} || !saved.preferences) return;
    var age = Date.now() - new Date(saved.decidedAt).getTime();
    if (!(age >= 0) || age > ${CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000}) return;
    var marketing = saved.preferences.marketing === true ? 'granted' : 'denied';
    var analytics = saved.preferences.analytics === true ? 'granted' : 'denied';
    gtag('consent','update',{
      ad_storage: marketing,
      ad_user_data: marketing,
      ad_personalization: marketing,
      personalization_storage: marketing,
      analytics_storage: analytics,
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
  } catch (e) {}
})();`;
}
