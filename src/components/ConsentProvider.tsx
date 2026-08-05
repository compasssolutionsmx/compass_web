"use client";

/**
 * Estado del consentimiento de cookies, compartido por toda la app.
 *
 * Este archivo expone:
 *  - <ConsentProvider>   envuelve la app en el root layout
 *  - useConsent()        estado y acciones
 *  - <ConsentGate>       monta a sus hijos sólo si su categoría está concedida
 *
 * ─── CÓMO ENCHUFAR LAS ETIQUETAS QUE FALTAN ───────────────────────────────
 *
 * Hoy el sitio no carga NINGÚN script de terceros. La plomería ya está puesta
 * para que respeten el consentimiento desde el día uno, y hay dos formas de
 * conectarse según cómo se comporte la herramienta:
 *
 * 1. GOOGLE (GA4, Google Ads) — soportan Consent Mode v2, así que el script se
 *    puede cargar SIEMPRE y él solo se limita: sin consentimiento manda pings
 *    sin cookies y no identifica a nadie. El estado por defecto denegado ya lo
 *    fija `consentBootstrapScript()` antes de la hidratación, y cada cambio de
 *    preferencia se publica aquí con `gtag('consent','update')`. Basta con
 *    añadir el <Script> de gtag.js al layout; no hay que envolverlo.
 *
 * 2. META PIXEL y demás — no entienden Consent Mode: si el script carga, pone
 *    cookies. Ése SÍ hay que envolverlo, para que ni siquiera se descargue:
 *
 *      <ConsentGate category="marketing">
 *        <Script id="meta-pixel" ... />
 *      </ConsentGate>
 *
 * Además, cada decisión emite el evento `compass:consentchange` en `window`
 * (detalle: las preferencias), por si algún script de terceros necesita
 * engancharse por fuera de React.
 *
 * ─── POR QUÉ useSyncExternalStore Y NO useState + useEffect ───────────────
 *
 * La decisión vive en `localStorage`, que es exactamente lo que
 * `useSyncExternalStore` sabe modelar: una fuente de verdad fuera de React, con
 * suscripción. Leerla en un efecto y volcarla con `setState` provoca el render
 * en cascada que marca la regla `react-hooks/set-state-in-effect`, y además
 * duplicaría el estado en dos sitios. Así hay una sola copia, la sincronización
 * entre pestañas sale gratis por el mismo canal, y el servidor recibe siempre
 * `null` —sin decisión— que es lo único que puede saber.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  CONSENT_STORAGE_KEY,
  DENY_ALL,
  GRANT_ALL,
  consentModeSignals,
  readConsent,
  writeConsent,
  type ConsentDecision,
  type ConsentPreferences,
  type OptionalCategory,
} from "@/lib/consent";

export const CONSENT_CHANGE_EVENT = "compass:consentchange";

/* ─────────────── Store: `localStorage` visto como fuente externa ─────────── */

/**
 * `getSnapshot` DEBE devolver la misma referencia mientras nada cambie, o React
 * entra en bucle de renders. Por eso la decisión se cachea aquí y sólo se
 * vuelve a leer cuando algo la invalida (una escritura nuestra o un evento
 * `storage` de otra pestaña).
 */
let cachedDecision: ConsentDecision | null = null;
let hasReadStorage = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function refreshFromStorage() {
  cachedDecision = readConsent();
  hasReadStorage = true;
  emit();
}

function onStorageEvent(event: StorageEvent) {
  // `key === null` es el `localStorage.clear()` de otra pestaña.
  if (event.key !== null && event.key !== CONSENT_STORAGE_KEY) return;
  refreshFromStorage();
}

function subscribeToConsent(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorageEvent);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorageEvent);
    }
  };
}

function getConsentSnapshot(): ConsentDecision | null {
  if (!hasReadStorage) {
    cachedDecision = readConsent();
    hasReadStorage = true;
  }
  return cachedDecision;
}

/** El servidor no puede saber qué eligió este navegador: no hay decisión. */
function getServerConsentSnapshot(): ConsentDecision | null {
  return null;
}

function persist(preferences: ConsentPreferences) {
  cachedDecision = writeConsent(preferences);
  hasReadStorage = true;
  emit();
}

/**
 * "¿Ya estamos en el cliente?" resuelto por el mismo mecanismo: en el servidor
 * y durante la hidratación devuelve `false`, después `true`. Sirve para no
 * pintar el banner en el HTML inicial —cuando todavía no se sabe si hay
 * decisión— y ahorrarse el parpadeo a quien ya eligió.
 */
const subscribeToNothing = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

/* ───────────────────────────── Contexto ──────────────────────────────────── */

type ConsentContextValue = {
  /**
   * Preferencias EFECTIVAS. Mientras no haya decisión son las denegadas: hasta
   * que el usuario diga que sí, la respuesta es que no.
   */
  preferences: ConsentPreferences;
  hasDecided: boolean;
  /** Si el banner debe estar en pantalla ahora mismo. */
  isBannerVisible: boolean;
  isPanelOpen: boolean;
  /** Selección en curso dentro del panel; no aplica hasta "Guardar". */
  draft: ConsentPreferences;
  setDraftCategory: (category: OptionalCategory, value: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  saveDraft: () => void;
  openPanel: () => void;
  closePanel: () => void;
  /** Reabre el banner con el panel desplegado. Lo usa el enlace del footer. */
  reopenSettings: () => void;
  /**
   * Cerrar sin tocar nada. Sólo existe cuando YA hay una decisión previa a la
   * que volver: sin ella, descartar el banner equivaldría a un consentimiento
   * tácito, que el GDPR no admite.
   */
  dismiss: (() => void) | null;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent debe usarse dentro de <ConsentProvider>");
  }
  return context;
}

/** Publica el cambio fuera de React: Consent Mode primero, evento después. */
function broadcast(preferences: ConsentPreferences) {
  const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    // Se empuja el objeto `arguments` —array-LIKE, no array— porque es lo que
    // gtag.js sabe leer de la cola; un array normal lo ignoraría. De ahí el
    // rodeo: se escribe la función clásica y se le pone tipo por fuera, en vez
    // de usar parámetros rest (que romperían el `arguments` que hace falta).
    // Así tampoco hay que depender de que gtag.js ya se haya cargado.
    const gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    } as (...args: unknown[]) => void;
    gtag("consent", "update", consentModeSignals(preferences));
  }

  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGE_EVENT, { detail: preferences }),
  );
}

export default function ConsentProvider({ children }: { children: ReactNode }) {
  const decision = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToNothing,
    getTrue,
    getFalse,
  );

  const preferences = decision?.preferences ?? DENY_ALL;
  const hasDecided = decision !== null;

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  /** El usuario volvió a abrir el banner teniendo ya una decisión guardada. */
  const [isReopened, setIsReopened] = useState(false);
  const [draft, setDraft] = useState<ConsentPreferences>(DENY_ALL);

  const isBannerVisible = isHydrated && (!hasDecided || isReopened);

  const commit = useCallback(
    (next: ConsentPreferences) => {
      // Se compara contra lo GUARDADO antes de escribir: si una categoría pasa
      // de concedida a denegada, es una revocación.
      const revoked = (Object.keys(next) as OptionalCategory[]).some(
        (category) => preferences[category] && !next[category],
      );

      persist(next);
      broadcast(next);
      setIsPanelOpen(false);
      setIsReopened(false);

      // Un script de terceros ya cargado no se descarga solo: sus cookies están
      // puestas y sus listeners vivos. Consent Mode corta el envío de datos de
      // Google, pero para el resto la única forma honesta de que "rechazar"
      // signifique algo es recargar y volver a montar la página sin ellos.
      // Conceder no lo necesita: montar scripts sí se puede hacer en caliente.
      if (revoked) window.location.reload();
    },
    [preferences],
  );

  const acceptAll = useCallback(() => commit(GRANT_ALL), [commit]);
  const rejectAll = useCallback(() => commit(DENY_ALL), [commit]);
  const saveDraft = useCallback(() => commit(draft), [commit, draft]);

  const setDraftCategory = useCallback(
    (category: OptionalCategory, value: boolean) =>
      setDraft((actual) => ({ ...actual, [category]: value })),
    [],
  );

  // El borrador se siembra al ABRIR el panel, no en un efecto que persiga al
  // estado: quien abre sabe con qué valores debe arrancar.
  const openPanel = useCallback(() => {
    setDraft(hasDecided ? preferences : DENY_ALL);
    setIsPanelOpen(true);
  }, [hasDecided, preferences]);

  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const reopenSettings = useCallback(() => {
    setDraft(preferences);
    setIsPanelOpen(true);
    setIsReopened(true);
  }, [preferences]);

  const dismiss = useCallback(() => {
    setIsPanelOpen(false);
    setIsReopened(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      preferences,
      hasDecided,
      isBannerVisible,
      isPanelOpen,
      draft,
      setDraftCategory,
      acceptAll,
      rejectAll,
      saveDraft,
      openPanel,
      closePanel,
      reopenSettings,
      dismiss: hasDecided ? dismiss : null,
    }),
    [
      preferences,
      hasDecided,
      isBannerVisible,
      isPanelOpen,
      draft,
      setDraftCategory,
      acceptAll,
      rejectAll,
      saveDraft,
      openPanel,
      closePanel,
      reopenSettings,
      dismiss,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

/**
 * Monta a sus hijos sólo si la categoría está concedida. Para etiquetas que no
 * entienden Consent Mode y hay que impedir que carguen (ver la cabecera).
 */
export function ConsentGate({
  category,
  children,
}: {
  category: OptionalCategory;
  children: ReactNode;
}) {
  const { preferences, hasDecided } = useConsent();
  if (!hasDecided || !preferences[category]) return null;
  return <>{children}</>;
}
