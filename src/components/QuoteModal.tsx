"use client";

/**
 * Modal de cotización (#cotizacion-modal en el spec estructural).
 *
 * FLUJO CRÍTICO: alimenta las 2 campañas de Google Ads activas. El copy y los
 * campos deben mantenerse idénticos al sitio actual.
 *
 * Es un diálogo a PANTALLA COMPLETA, en vertical: arriba el pitch, abajo el
 * mismo <QuoteWizard> de 4 pasos que usa la sección del hero. Este archivo sólo
 * aporta el chasis del diálogo (fondo, cierre, focus trap, scroll); el
 * formulario y su lógica no se duplican.
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
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import QuoteWizard from "./QuoteWizard";
import { useSmoothScroll } from "./SmoothScroll";
import { useWhatsAppModal } from "./WhatsAppModal";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const { pause: pauseSmoothScroll, resume: resumeSmoothScroll } =
    useSmoothScroll();
  const { openModal: openWhatsAppModal } = useWhatsAppModal();

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

    // Lenis se pausa mientras el scroll del body está bloqueado: si sigue
    // vivo, el fondo se desplaza por debajo del modal.
    pauseSmoothScroll();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      resumeSmoothScroll();
      previouslyFocused.current?.focus();
    };
  }, [closeModal, pauseSmoothScroll, resumeSmoothScroll]);

  return (
    // Contenedor a pantalla completa. Lleva el scroll (`overflow-y-auto`) y el
    // fondo; el diálogo va dentro para que en móvil, con el cotizador de 4
    // pasos, el contenido pueda desbordar y hacer scroll en vez de recortarse.
    <div
      className="brand-gradient fixed inset-0 z-50 overflow-y-auto"
      data-lenis-prevent
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={closeModal}
        aria-label="Cerrar"
        className="fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-6 sm:top-6"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* `min-h-full` + `justify-center`: centrado vertical cuando cabe, y
          scroll natural desde arriba cuando no. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center px-4 py-20 sm:px-6"
      >
        {/* ---------- Arriba: el pitch ---------- */}
        <div className="mb-8 max-w-2xl">
          <h2
            id={titleId}
            className="font-heading text-3xl font-bold text-white md:text-4xl"
          >
            El freight forwarder que su carga necesita
          </h2>
          <p className="mt-4 text-lg text-brand-50">
            Solicite una cotización y descubra cómo nuestras soluciones
            logísticas integrales pueden transformar su cadena de suministro.
          </p>
          {/* Ya no enlaza a wa.me: abre la captura corta. Cierra ANTES este
              diálogo para no apilar dos modales — dos focus traps a la vez se
              pelean el foco. */}
          <p className="mt-4 text-sm text-brand-100">
            Si necesita atención urgente, siempre puede contactarnos por{" "}
            <button
              type="button"
              onClick={() => {
                closeModal();
                openWhatsAppModal();
              }}
              className="font-semibold text-white underline underline-offset-2 hover:no-underline"
            >
              WhatsApp
            </button>
            .
          </p>
        </div>

        {/* ---------- Abajo: el mismo cotizador de la sección del hero ----------
            Se oculta su título porque el <h2> de arriba ya nombra el diálogo.
            El banner de proveedores/vacantes viene dentro, en el paso 4. */}
        {/* `onClose` sólo se pasa aquí: es lo que hace que la pantalla de éxito
            ofrezca "Volver al sitio". Montado inline en el home no hay modal
            que cerrar y esa salida no aparece. */}
        <QuoteWizard showHeading={false} onClose={closeModal} />
      </div>
    </div>
  );
}
