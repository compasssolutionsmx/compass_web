"use client";

/**
 * Captura corta previa a WhatsApp.
 *
 * Todos los accesos "rápidos" a WhatsApp del sitio pasan por aquí en vez de ir
 * directo a wa.me: así el lead queda registrado antes del handoff. Hoy los
 * dispara el botón flotante y el link del pitch de <QuoteModal>.
 *
 * NO lo usa <QuoteWizard>: ese ya captura por pasos y arma su propio mensaje.
 *
 * Expone:
 *  - <WhatsAppModalProvider>  envuelve la página y monta el modal
 *  - <WhatsAppButton>         cualquier botón que lo abre
 *  - useWhatsAppModal()       acceso programático a abrir/cerrar
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
import { REQUEST_TYPES } from "./useQuoteRequest";
import { useLeadSubmit } from "./useLeadSubmit";
import { useSmoothScroll } from "./SmoothScroll";

type WhatsAppModalContextValue = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const WhatsAppModalContext = createContext<WhatsAppModalContextValue | null>(
  null,
);

export function useWhatsAppModal(): WhatsAppModalContextValue {
  const context = useContext(WhatsAppModalContext);
  if (!context) {
    throw new Error(
      "useWhatsAppModal debe usarse dentro de <WhatsAppModalProvider>",
    );
  }
  return context;
}

export function WhatsAppModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const value = useMemo(
    () => ({ isOpen, openModal, closeModal }),
    [isOpen, openModal, closeModal],
  );

  return (
    <WhatsAppModalContext.Provider value={value}>
      {children}
      {isOpen && <WhatsAppDialog />}
    </WhatsAppModalContext.Provider>
  );
}

/** Botón que abre el modal. */
export function WhatsAppButton({
  className,
  ariaLabel,
  children,
}: {
  className?: string;
  /**
   * Necesario cuando el texto visible se oculta (el botón flotante lo esconde
   * en móvil). Debe CONTENER el texto visible, no contradecirlo: si no, el
   * nombre accesible y la etiqueta visual dejan de coincidir (WCAG 2.5.3).
   */
  ariaLabel?: string;
  children: ReactNode;
}) {
  const { openModal } = useWhatsAppModal();
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onClick={openModal}
    >
      {children}
    </button>
  );
}

/**
 * Mensaje prellenado. Las dos partes opcionales sólo entran si el usuario las
 * llenó, para que no queden frases sueltas.
 */
function buildMessage(f: {
  nombre: string;
  correo: string;
  telefono: string;
  tipo: string;
  mensaje: string;
}): string {
  const tipoLabel = REQUEST_TYPES.find((t) => t.value === f.tipo)?.label;
  return [
    `Hola Compass Solutions, soy ${f.nombre.trim()}.`,
    `Mi correo es ${f.correo.trim()} y mi teléfono ${f.telefono.trim()}.`,
    tipoLabel ? `Me interesa el servicio ${tipoLabel}.` : "",
    f.mensaje.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

const FIELD =
  "w-full rounded-lg border border-slate-500 px-3 py-2.5 text-sm transition-colors focus:border-brand-900";
const LABEL = "mb-1.5 block text-sm font-medium text-slate-700";

function WhatsAppDialog() {
  const { closeModal } = useWhatsAppModal();
  const titleId = useId();
  const errorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const { pause: pauseSmoothScroll, resume: resumeSmoothScroll } =
    useSmoothScroll();

  const nombreRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const correoRef = useRef<HTMLInputElement>(null);

  const { isSubmitting, submitLead } = useLeadSubmit();
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipo, setTipo] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Escape, focus trap y bloqueo del scroll del body. Mismo estándar que
  // <QuoteModal>.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // El foco va al primer campo que falla, no sólo el mensaje de error.
    if (!nombre.trim()) {
      setError("Escriba su nombre para continuar.");
      nombreRef.current?.focus();
      return;
    }
    if (!telefono.trim()) {
      setError("Escriba su teléfono para continuar.");
      telefonoRef.current?.focus();
      return;
    }
    if (!correo.trim()) {
      setError("Escriba su correo para continuar.");
      correoRef.current?.focus();
      return;
    }
    // Validación deliberadamente laxa: un correo con formato raro pero real
    // vale más que un lead perdido por una regex estricta.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError("Revise el correo: no parece una dirección válida.");
      correoRef.current?.focus();
      return;
    }

    setError(null);
    void submitLead(
      {
        origen: "whatsapp-rapido",
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        tipo: tipo || undefined,
        mensaje: mensaje.trim() || undefined,
      },
      buildMessage({ nombre, correo, telefono, tipo, mensaje }),
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/70 p-4 backdrop-blur-sm sm:p-6"
      data-lenis-prevent
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeModal}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <h2
          id={titleId}
          className="mb-2 pr-10 font-heading text-2xl font-bold text-brand-900"
        >
          Hable con un agente
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Déjenos sus datos y continuamos la conversación por WhatsApp.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="wa-nombre" className={LABEL}>
                Nombre <span aria-hidden="true">*</span>
              </label>
              <input
                ref={nombreRef}
                id="wa-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="wa-telefono" className={LABEL}>
                Teléfono <span aria-hidden="true">*</span>
              </label>
              <input
                ref={telefonoRef}
                id="wa-telefono"
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label htmlFor="wa-correo" className={LABEL}>
              Correo <span aria-hidden="true">*</span>
            </label>
            <input
              ref={correoRef}
              id="wa-correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="wa-tipo" className={LABEL}>
              Tipo de servicio{" "}
              <span className="font-normal text-slate-500">(opcional)</span>
            </label>
            <select
              id="wa-tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={FIELD}
            >
              <option value="">Seleccione una opción</option>
              {REQUEST_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="wa-mensaje" className={LABEL}>
              Mensaje{" "}
              <span className="font-normal text-slate-500">(opcional)</span>
            </label>
            <textarea
              id="wa-mensaje"
              rows={2}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className={FIELD}
            />
          </div>

          {error && (
            <p
              id={errorId}
              role="alert"
              className="text-sm font-medium text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Abriendo WhatsApp…" : "Continuar por WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}
