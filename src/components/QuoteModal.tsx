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
import { WHATSAPP_URL } from "@/lib/site";

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

/**
 * STUB — no conectar todavía.
 *
 * TODO(sprint siguiente): implementar el submit real.
 *   1. POST a la Route Handler propia (p. ej. `/api/cotizacion`) que a su vez
 *      reenvía al webhook de studio.scndal.com. No exponer la URL/secreto del
 *      webhook en el cliente.
 *   2. Conservar el flujo actual del sitio en producción:
 *      selector de tipo de servicio -> redirección a WhatsApp.
 *      TODO: falta la spec de esa redirección (¿mensaje prellenado?, ¿mismo
 *      número que el botón flotante?, ¿antes o después del webhook?).
 *   3. Definir estados de éxito/error y el evento de conversión de Google Ads.
 */
async function submitQuoteRequest(data: QuoteFormData): Promise<void> {
  console.info("[QuoteModal] submit stub — sin conectar todavía:", data);
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
  const { isOpen, closeModal } = useQuoteModal();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cerrar con Escape y bloquear el scroll del body mientras está abierto.
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, closeModal]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);
    try {
      await submitQuoteRequest({
        tipo: String(formData.get("tipo") ?? ""),
        detalles: String(formData.get("detalles") ?? ""),
      });
      // TODO: mostrar confirmación / disparar conversión / redirigir a WhatsApp
      // cuando exista la spec del webhook. Por ahora sólo cierra.
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset>
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
                    className="mr-1.5 accent-brand-accent focus-visible:outline-none"
                  />
                  {type.label}
                </label>
              ))}
            </div>
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
            Solicitar Cotización
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
