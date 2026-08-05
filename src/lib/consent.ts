/**
 * Núcleo del consentimiento de cookies (GDPR). Sin React y sin DOM más allá de
 * `localStorage`, para que lo puedan compartir el provider de cliente y el
 * script inline que corre antes de la hidratación.
 *
 * MODELO: hay una sola fuente de verdad —la decisión guardada— y dos formas de
 * leerla. El provider la lee al montar, para pintar la UI; el script de arranque
 * la lee en el primer byte de JS, para que Google Consent Mode ya sepa a qué
 * atenerse antes de que cargue cualquier etiqueta. Las constantes de este
 * archivo alimentan a los dos, así que no pueden desincronizarse.
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
 * consintió: una categoría nueva, una herramienta nueva dentro de una categoría
 * existente o un cambio de finalidad. El GDPR pide consentimiento informado, y
 * una decisión tomada sobre otro conjunto de cookies no lo es.
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
 * Cualquier duda se resuelve a favor de volver a preguntar, nunca a favor de
 * asumir consentimiento.
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
 * Script que corre ANTES de la hidratación (`beforeInteractive` en el root
 * layout). Hace dos cosas, en este orden:
 *
 *  1. Fija el estado por defecto de Consent Mode v2 en "denegado". Esto tiene
 *     que ejecutarse antes que cualquier etiqueta de Google; si GA4 o Ads
 *     arrancan sin un `default` previo, asumen consentimiento y ya se disparó
 *     la primera petición con cookies. Por eso no puede vivir en el provider de
 *     React: para cuando React hidrata, ya sería tarde.
 *  2. Reproduce la decisión guardada, si la hay. Sin esto, quien ya aceptó
 *     tendría medio segundo de estado denegado en cada carga y se perderían
 *     eventos.
 *
 * `wait_for_update: 500` le da medio segundo a ese update antes de que las
 * etiquetas decidan qué mandar.
 *
 * Se genera desde este módulo, y no a mano en el layout, para que la clave, la
 * versión, la caducidad y el mapeo de señales sean literalmente los mismos que
 * usa el resto del código.
 */
export function consentBootstrapScript(): string {
  return `(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('consent','default',${JSON.stringify({
    ...consentModeSignals(DENY_ALL),
    wait_for_update: 500,
  })});
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
