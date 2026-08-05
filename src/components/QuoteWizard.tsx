"use client";

/**
 * Cotizador de 4 pasos con ramificación condicional en el paso 2.
 *
 * Es SÓLO la tarjeta: no trae contenedor de ancho ni posicionamiento. De eso se
 * encarga quien lo monta, que hoy son dos sitios con el mismo código:
 *   - <QuoteSection>  barra ancha sobrepuesta al borde inferior del hero
 *   - <QuoteModal>    modal a pantalla completa del botón "Contáctenos"
 *
 * NO calcula tarifas. Es un formulario de contacto cualificado que termina en
 * el flujo de `useQuoteRequest`: correo de respaldo -> webhook stub -> pantalla
 * de confirmación DENTRO de la propia tarjeta. Ya no saca al usuario del sitio.
 *
 * La tarjeta es blanca en los dos contextos a propósito. En el modal el fondo
 * es el degradado azul oscuro, y una tarjeta clara encima da mejor contraste
 * (texto brand-900 sobre blanco = 15.07:1) que adaptar cada campo a fondo
 * oscuro, además de mantener un solo juego de estilos para el formulario.
 */

import { Boxes, Ellipsis, Plane, Ship, Truck } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { REQUEST_TYPES, useQuoteRequest } from "./useQuoteRequest";
import { LeadError, LeadSuccess } from "./LeadConfirmation";

type TypeValue = (typeof REQUEST_TYPES)[number]["value"];

/** Un ícono por tipo de solicitud, en el mismo orden de REQUEST_TYPES. */
const TYPE_ICONS: Record<TypeValue, typeof Ship> = {
  maritimo: Ship,
  aereo: Plane,
  terrestre: Truck,
  especializado: Boxes,
  otros: Ellipsis,
};

/**
 * `label` es el nombre corto del indicador de pasos; `prompt` es lo que se le
 * pide al usuario dentro del paso. Antes el encabezado del paso repetía la
 * etiqueta seca ("Servicio"), que no pedía nada.
 */
const STEPS = [
  { id: 1, label: "Servicio", prompt: "¿Qué tipo de servicio necesita?" },
  { id: 2, label: "Ruta", prompt: "¿Cuál es la ruta de su carga?" },
  { id: 3, label: "Embarque", prompt: "¿Qué va a mover y cuándo?" },
  { id: 4, label: "Contacto", prompt: "¿A quién le respondemos?" },
] as const;

/**
 * El paso 1 avanza solo al elegir servicio. El retraso deja ver la tarjeta ya
 * marcada antes del salto; sin él la selección se pierde de vista.
 */
const AUTO_ADVANCE_MS = 250;

/**
 * Configuración del paso 2, que ramifica según lo elegido en el paso 1.
 *
 * TODO(cliente): los listados de puertos y aeropuertos están PENDIENTES DE
 * VALIDAR. Son los de mayor movimiento en México, puestos como punto de
 * partida, no una lista confirmada por Compass. Confirmar antes del cutover:
 *   - ¿opera en los 5 puertos / 5 aeropuertos listados?
 *   - ¿falta alguno (p. ej. Progreso, Tampico, Tijuana)?
 *   - ¿el orden debe reflejar el volumen real de operación?
 */
const ROUTE_STEP = {
  maritimo: {
    kind: "options" as const,
    legend: "Puerto de operación",
    options: [
      "Manzanillo",
      "Lázaro Cárdenas",
      "Veracruz",
      "Altamira",
      "Ensenada",
      "Otro",
    ],
  },
  aereo: {
    kind: "options" as const,
    legend: "Aeropuerto de operación",
    options: [
      "AIFA / CDMX",
      "Guadalajara",
      "Monterrey",
      "Bajío",
      "Cancún",
      "Otro",
    ],
  },
  terrestre: {
    kind: "terrestre" as const,
    legend: "Tipo de servicio terrestre",
    options: ["LTL consolidado", "FTL dedicado"],
  },
  especializado: {
    kind: "text" as const,
    legend: "Describa su carga especializada",
    placeholder:
      "Sobredimensionada, refrigerada, project cargo, materiales peligrosos…",
  },
  otros: {
    kind: "text" as const,
    legend: "Describa su necesidad",
    placeholder: "Cuéntenos qué necesita mover y le proponemos una solución.",
  },
};

const FIELD =
  "w-full rounded-lg border border-slate-500 px-3 py-2.5 text-sm transition-colors focus:border-brand-900";

const LABEL = "mb-1.5 block text-sm font-medium text-slate-700";

/** Chip seleccionable. Botón real con aria-pressed, no un radio disfrazado. */
function Chip({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-xl border text-sm font-medium transition-colors ${
        selected
          ? "border-brand-900 bg-brand-900/5 text-brand-900"
          : "border-slate-200 text-slate-600 hover:border-brand-900 hover:text-brand-900"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function QuoteWizard({
  /** El modal ya tiene su propio título, así que ahí se oculta el de la tarjeta. */
  showHeading = true,
  headingId,
  /**
   * Sólo lo pasa <QuoteModal>. Su presencia es lo que le dice a la pantalla de
   * éxito que hay un modal que cerrar; montado inline en el home no hay nada
   * que cerrar y la salida es "Hacer otra cotización".
   */
  onClose,
}: {
  showHeading?: boolean;
  headingId?: string;
  onClose?: () => void;
}) {
  const errorId = useId();
  const {
    status,
    isSubmitting,
    whatsappUrl,
    error,
    setError,
    submitQuote,
    retryLead,
    resetLead,
  } = useQuoteRequest();

  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState<TypeValue | "">("");
  const [sub, setSub] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [detalles, setDetalles] = useState("");
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  const stepHeadingRef = useRef<HTMLParagraphElement>(null);
  const isFirstRender = useRef(true);
  const advanceTimer = useRef<number | null>(null);

  // Si el componente se desmonta durante el retraso del auto-avance (p. ej. al
  // cerrar el modal), el timer no debe seguir vivo.
  useEffect(
    () => () => {
      if (advanceTimer.current !== null) {
        window.clearTimeout(advanceTimer.current);
      }
    },
    [],
  );

  // Al cambiar de paso se mueve el foco al título del paso, para que un lector
  // de pantalla anuncie dónde quedó. No corre en el render inicial: robaría el
  // foco al cargar la página.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  const selectedType = REQUEST_TYPES.find((t) => t.value === tipo);
  const route = tipo ? ROUTE_STEP[tipo] : null;

  function pickTipo(value: TypeValue) {
    setTipo(value);
    // El sub-dato pertenece al tipo anterior: si se cambia de servicio, la rama
    // del paso 2 es otra y lo que hubiera quedado ahí ya no aplica.
    setSub("");
    setOrigen("");
    setDestino("");
    setDescripcion("");
    setError(null);

    // El paso 1 no tiene botón "Continuar": elegir servicio ES avanzar. Como
    // las tarjetas son <button>, esto también funciona con Enter y Espacio, y
    // el foco salta al encabezado del paso 2, que es lo que anuncia el cambio
    // al lector de pantalla.
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
    }
    advanceTimer.current = window.setTimeout(() => {
      setStep(2);
    }, AUTO_ADVANCE_MS);
  }

  function goNext() {
    if (step === 1 && !selectedType) {
      setError("Seleccione un tipo de servicio para continuar.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  /**
   * "Hacer otra cotización": deja el cotizador como recién montado. Hay que
   * limpiar TODOS los campos además del estado del envío — si no, la segunda
   * cotización saldría con los datos de la primera ya escritos.
   */
  function restartWizard() {
    setStep(1);
    setTipo("");
    setSub("");
    setOrigen("");
    setDestino("");
    setDescripcion("");
    setFecha("");
    setDetalles("");
    setNombre("");
    setEmpresa("");
    setCorreo("");
    setTelefono("");
    setError(null);
    resetLead();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedType) {
      setError("Seleccione un tipo de servicio para continuar.");
      setStep(1);
      return;
    }
    if (!nombre.trim() || !correo.trim()) {
      setError("Nombre y correo son obligatorios.");
      return;
    }
    // Validación deliberadamente laxa: un correo con formato raro pero real
    // vale más que un lead perdido por una regex estricta.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError("Revise el correo: no parece una dirección válida.");
      return;
    }

    void submitQuote(
      {
        tipo,
        sub: sub || undefined,
        origen: origen || undefined,
        destino: destino || undefined,
        fecha: fecha || undefined,
        descripcion: descripcion || undefined,
        detalles,
        nombre: nombre.trim(),
        empresa: empresa.trim() || undefined,
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
      },
      selectedType.label,
    );
  }

  // Terminado el envío, la tarjeta deja de ser un formulario. Se sustituye
  // entera —pasos, barra de progreso y campos incluidos— por la confirmación,
  // en el mismo sitio y con el mismo chasis blanco, para que el usuario no
  // pierda el contexto ni salga del sitio.
  if (status === "success" || status === "error") {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-10">
        {status === "success" ? (
          <LeadSuccess
            whatsappUrl={whatsappUrl}
            onReset={restartWizard}
            resetLabel="Hacer otra cotización"
            onClose={onClose}
          />
        ) : (
          <LeadError
            whatsappUrl={whatsappUrl}
            onRetry={retryLead}
            isRetrying={isSubmitting}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        {showHeading ? (
          <h2
            id={headingId}
            className="font-heading text-2xl font-bold text-brand-900 md:text-3xl"
          >
            Solicite una Cotización
          </h2>
        ) : (
          <span />
        )}
        {/* Indicador combinado: los 4 pasos como guiones (el actual más ancho
            y en color) más el conteo. Sustituye a la fila de círculos
            numerados, que ocupaba un renglón entero. El nombre de cada paso
            sigue disponible en `sr-only`, así que un lector de pantalla no
            pierde orientación aunque en pantalla sólo se vean guiones. */}
        <div className="flex items-center gap-3">
          <ol className="flex items-center gap-1.5" aria-label="Progreso">
            {STEPS.map((s) => (
              <li key={s.id} aria-current={s.id === step ? "step" : undefined}>
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    s.id === step
                      ? "w-5 bg-brand-900"
                      : s.id < step
                        ? "w-1.5 bg-brand-900/40"
                        : "w-1.5 bg-slate-200"
                  }`}
                />
                <span className="sr-only">{s.label}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">
            Paso {step} de {STEPS.length}
          </p>
        </div>
      </div>

      {/* Barra de progreso. El <ol> es lo que anuncia el lector de pantalla;
          la barra de color es puramente decorativa. */}
      <div className="mb-8">
        <div
          className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-brand-900 transition-[width] duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <p
          ref={stepHeadingRef}
          tabIndex={-1}
          className="mb-4 font-heading text-lg font-semibold text-brand-900 outline-none"
        >
          {STEPS[step - 1].prompt}
        </p>

        {/* ---------- PASO 1 · Servicio ----------
            Tarjetas horizontales (ícono a la izquierda) y no apiladas: en
            vertical medían 98px de alto cada una y el paso 1 empujaba la
            tarjeta fuera del pliegue. Así bajan a 46px.

            `px-3` y no `px-4`: la etiqueta más larga ("Especializado") mide
            90px a 14px en DM Sans, y con 5 columnas dentro del modal —que es
            max-w-4xl, más estrecho que la sección del hero— sólo quedan 154px
            por columna. Con px-4 el contenido pediría 150px y en móvil, a 2
            columnas, se desbordaría por 1px. */}
        {step === 1 && (
          <div
            role="group"
            aria-label="Tipo de servicio"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            {REQUEST_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type.value];
              return (
                <Chip
                  key={type.value}
                  selected={tipo === type.value}
                  onClick={() => pickTipo(type.value)}
                  className="flex items-center justify-center gap-2 px-3 py-3"
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                  {type.label}
                </Chip>
              );
            })}
          </div>
        )}

        {/* ---------- PASO 2 · Ruta (condicional) ---------- */}
        {step === 2 && route && (
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">
              {route.legend}
            </legend>

            {route.kind === "options" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {route.options.map((option) => (
                  <Chip
                    key={option}
                    selected={sub === option}
                    onClick={() => setSub(option)}
                    className="px-3 py-3"
                  >
                    {option}
                  </Chip>
                ))}
              </div>
            )}

            {route.kind === "terrestre" && (
              <div className="grid gap-4 md:grid-cols-4">
                {/* El <span> de "Modalidad" no es decorativo: iguala la
                    altura de los labels de Origen/Destino para que los
                    chips queden alineados con los inputs en la misma fila. */}
                <div className="md:col-span-2">
                  <span className={LABEL}>Modalidad</span>
                  <div
                    role="group"
                    aria-label="Modalidad terrestre"
                    className="grid grid-cols-2 gap-3"
                  >
                    {route.options.map((option) => (
                      <Chip
                        key={option}
                        selected={sub === option}
                        onClick={() => setSub(option)}
                        className="px-3 py-2.5"
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="cot-origen" className={LABEL}>
                    Origen
                  </label>
                  <input
                    id="cot-origen"
                    type="text"
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value)}
                    placeholder="Ciudad o planta"
                    className={FIELD}
                  />
                </div>
                <div>
                  <label htmlFor="cot-destino" className={LABEL}>
                    Destino
                  </label>
                  <input
                    id="cot-destino"
                    type="text"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ciudad o planta"
                    className={FIELD}
                  />
                </div>
              </div>
            )}

            {route.kind === "text" && (
              <textarea
                id="cot-descripcion"
                aria-label={route.legend}
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder={route.placeholder}
                className={FIELD}
              />
            )}
          </fieldset>
        )}

        {/* ---------- PASO 3 · Embarque ---------- */}
        {step === 3 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="cot-fecha" className={LABEL}>
                Fecha tentativa de embarque
              </label>
              <input
                id="cot-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="cot-detalles" className={LABEL}>
                Detalles de la carga
              </label>
              <textarea
                id="cot-detalles"
                rows={3}
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                placeholder="Número de paquetes, peso(kg), dimensiones, commodity, cargas peligrosas, etc."
                className={FIELD}
              />
            </div>
          </div>
        )}

        {/* ---------- PASO 4 · Contacto ---------- */}
        {step === 4 && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label htmlFor="cot-nombre" className={LABEL}>
                  Nombre <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cot-nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="cot-empresa" className={LABEL}>
                  Empresa
                </label>
                <input
                  id="cot-empresa"
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="cot-correo" className={LABEL}>
                  Correo <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cot-correo"
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="cot-telefono" className={LABEL}>
                  Teléfono
                </label>
                <input
                  id="cot-telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={FIELD}
                />
              </div>
            </div>

            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              ¡Atención! Este formulario es de cotizaciones. Para proveedores o
              vacantes, usa el espacio correspondiente.
            </p>
          </>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-4 text-sm font-medium text-red-600"
          >
            {error}
          </p>
        )}

        {/* ---------- Navegación ----------
            El paso 1 no la monta: no tiene "Continuar" (avanza al elegir) ni
            "Atrás" (no hay a dónde volver), así que la barra entera sobra. Eso
            le quita ~100px de alto justo al paso que se veía cortado.
            "Atrás" a la izquierda y "Continuar" a la derecha, con el resumen de
            la selección en medio. */}
        {step > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-900 hover:text-brand-900"
              >
                Atrás
              </button>

              {selectedType && (
                <p className="text-sm text-slate-500">
                  {selectedType.label}
                  {sub ? ` · ${sub}` : ""}
                </p>
              )}
            </div>

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={goNext}
                aria-describedby={error ? errorId : undefined}
                className="rounded-full bg-brand-900 px-12 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                aria-describedby={error ? errorId : undefined}
                className="rounded-full bg-brand-900 px-12 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? "Enviando…" : "Solicitar Cotización"}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
