"use client";

/**
 * Modal de cotización (#cotizacion-modal en el spec estructural).
 *
 * FLUJO CRÍTICO: alimenta las 2 campañas de Google Ads activas. El copy y los
 * campos deben mantenerse idénticos al sitio actual.
 *
 * Este archivo expone:
 *  - <QuoteModalProvider>  envuelve la página y monta el modal
 *  - <QuoteButton>         cualquier botón que abre el modal
 *  - useQuoteModal()       acceso programático a abrir/cerrar
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { WHATSAPP_URL, buildWhatsAppUrl } from "@/lib/site";

/**
 * Opciones del selector "Tipo de Solicitud".
 * Las etiquetas son las exactas del spec. Los `value` son slugs propuestos:
 * TODO: confirmar los valores que espera el webhook de studio.scndal.com
 * (¿slug, etiqueta literal, id numérico?) cuando llegue su spec.
 */
const REQUEST_TYPES = [
  { value: "maritimo", label: "Marítimo" },
  { value: "aereo", label: "Aéreo" },
  { value: "terrestre", label: "Terrestre" },
  { value: "especializado", label: "Especializado" },
  { value: "otros", label: "Otros" },
] as const;

export type QuoteFormData = {
  tipo: string;
  detalles: string;
};

/** Mensaje prellenado que se manda a WhatsApp tras enviar el formulario. */
function buildWhatsAppMessage(tipoServicioSeleccionado: string): string {
  return `Hola Compass Solutions, necesito información sobre ${tipoServicioSeleccionado}.`;
}

/**
 * STUB del POST al webhook — el endpoint real todavía no existe.
 *
 * TODO(sprint siguiente): implementar el POST real.
 *   1. Mandarlo a una Route Handler propia (p. ej. `/api/cotizacion`) que a su
 *      vez reenvíe al webhook de studio.scndal.com. No exponer la URL ni el
 *      secreto del webhook en el cliente.
 *   2. Definir el contrato del payload (ver también el TODO de REQUEST_TYPES).
 *   3. Añadir el evento de conversión de Google Ads.
 */
async function postToWebhook(data: QuoteFormData): Promise<void> {
  console.info("[QuoteModal] POST al webhook (stub, sin conectar):", data);
}

type QuoteModalContextValue = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null);

export function useQuoteModal(): QuoteModalContextValue {
  const context = useContext(QuoteModalContext);
  if (!context) {
    throw new Error("useQuoteModal debe usarse dentro de <QuoteModalProvider>");
  }
  return context;
}

export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openModal, closeModal }),
    [isOpen, openModal, closeModal],
  );

  return (
    <QuoteModalContext.Provider value={value}>
      {children}
      <QuoteModal />
    </QuoteModalContext.Provider>
  );
}

/** Botón que abre el modal. Se usa en el Header y en Soluciones Integrales. */
export function QuoteButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { openModal } = useQuoteModal();

  return (
    <button type="button" className={className} onClick={openModal}>
      {children}
    </button>
  );
}

function QuoteModal() {
  const { isOpen } = useQuoteModal();

  // Se monta sólo mientras está abierto, así el estado del formulario (y el
  // mensaje de error) se reinicia solo en cada apertura.
  if (!isOpen) return null;
  return <QuoteDialog />;
}

function QuoteDialog() {
  const { closeModal } = useQuoteModal();
  const titleId = useId();
  const errorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const typeGroupRef = useRef<HTMLFieldSetElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cerrar con Escape y bloquear el scroll del body mientras está abierto.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      // Focus trap: Tab no debe salirse del diálogo.
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [closeModal]);

  /** Flujo confirmado: validar -> POST al webhook -> redirect a WhatsApp. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tipo = String(formData.get("tipo") ?? "");

    // 1. Validar. El tipo de servicio es obligatorio: alimenta el mensaje de
    // WhatsApp.
    // TODO: confirmar si "Detalles de la Consulta" debe ser obligatorio — hoy
    // el sitio actual no lo exige, así que se deja opcional.
    const selectedType = REQUEST_TYPES.find((type) => type.value === tipo);
    if (!selectedType) {
      setError("Selecciona un tipo de solicitud para continuar.");
      typeGroupRef.current
        ?.querySelector<HTMLInputElement>('input[name="tipo"]')
        ?.focus();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const payload: QuoteFormData = {
      tipo,
      detalles: String(formData.get("detalles") ?? ""),
    };

    // 2. POST al webhook. Si falla NO se aborta el flujo: perder el handoff a
    // WhatsApp costaría el lead, que es lo que realmente convierte.
    try {
      await postToWebhook(payload);
    } catch (webhookError) {
      console.error("[QuoteModal] falló el POST al webhook:", webhookError);
    }

    // 3. Redirect a WhatsApp con el mensaje prellenado.
    // No se limpia `isSubmitting` a propósito: evita un doble envío mientras
    // el navegador sale de la página.
    window.location.href = buildWhatsAppUrl(
      buildWhatsAppMessage(selectedType.label),
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 sm:p-8"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeModal}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <h3
          id={titleId}
          className="mb-2 pr-10 text-2xl font-bold text-brand-navy-900"
        >
          El Freight Forwarder Que Su Carga Necesita
        </h3>
        <p className="mb-6 text-slate-500">
          Solicite una cotización y descubra cómo nuestras soluciones logísticas
          integrales pueden transformar su cadena de suministro.
        </p>
        <p className="mb-6 text-sm text-slate-500">
          Si necesita atención urgente, siempre puede contactarnos por{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-accent hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <fieldset
            ref={typeGroupRef}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          >
            <legend className="mb-2 block text-sm font-medium">
              Tipo de Solicitud
            </legend>
            <div className="flex flex-wrap gap-2 text-sm">
              {REQUEST_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="flex cursor-pointer items-center rounded-full border border-slate-300 px-4 py-1.5 transition-colors has-[:checked]:border-brand-accent has-[:checked]:text-brand-accent has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-accent"
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={type.value}
                    onChange={() => setError(null)}
                    className="mr-1.5 accent-brand-accent focus-visible:outline-none"
                  />
                  {type.label}
                </label>
              ))}
            </div>
            {error && (
              <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </fieldset>

          <div>
            <label
              htmlFor="cotizacion-detalles"
              className="mb-2 block text-sm font-medium"
            >
              Detalles de la Consulta
            </label>
            <textarea
              id="cotizacion-detalles"
              name="detalles"
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-brand-navy-900 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Enviando…" : "Solicitar Cotización"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          ¡Atención! Este formulario es de cotizaciones. Para proveedores o
          vacantes, usa el espacio correspondiente.
        </p>
      </div>
    </div>
  );
}
