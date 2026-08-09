"use client";

/**
 * Cotizador por pasos con ramificación condicional en el paso 2. Son 4 pasos
 * en casi todas las ramas y 5 en Terrestre, que separa la modalidad del
 * origen-destino; el conteo sale de `stepsFor`, no de un número fijo.
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

import {
  ArrowLeftRight,
  Boxes,
  Ellipsis,
  Plane,
  Ship,
  Truck,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { REQUEST_TYPES, useQuoteRequest } from "./useQuoteRequest";
import { LeadError, LeadSuccess } from "./LeadConfirmation";
import OptionSelect from "./OptionSelect";
import { useSmoothScroll } from "./SmoothScroll";

type TypeValue = (typeof REQUEST_TYPES)[number]["value"];

/**
 * Un ícono por tipo de solicitud, en el mismo orden de REQUEST_TYPES.
 *
 * "Integral" usa `ArrowLeftRight` y no un compuesto avión+barco+flechas: a los
 * 20px del slot del chip, superponer dos o tres glifos de lucide se vuelve
 * ilegible — se probó y no se distinguía nada. `ArrowLeftRight` es justo el
 * primer nombre que se sugirió, comunica "intercambiable/combinado" con un
 * solo trazo limpio, y mantiene la consistencia visual con el resto de los
 * íconos del paso (todos son un solo glifo de lucide a este tamaño).
 */
const TYPE_ICONS: Record<TypeValue, typeof Ship> = {
  maritimo: Ship,
  aereo: Plane,
  terrestre: Truck,
  integral: ArrowLeftRight,
  especializado: Boxes,
  otros: Ellipsis,
};

/**
 * Pasos del cotizador.
 *
 * `key` es lo que decide QUÉ se renderiza (antes era la posición numérica);
 * `label` es el nombre corto del indicador de pasos, y `prompt` lo que se le
 * pide al usuario dentro del paso. Antes el encabezado del paso repetía la
 * etiqueta seca ("Servicio"), que no pedía nada.
 *
 * El total NO es fijo: Terrestre separa la modalidad (LTL/FTL/Otro) de su
 * origen-destino en dos pantallas, así que tiene 5 pasos donde las demás ramas
 * tienen 4 — ver `stepsFor`. Por eso la posición numérica dejó de servir para
 * decidir el contenido: el paso 3 es "Trayecto" en Terrestre y "Embarque" en
 * todo lo demás.
 */
type StepKey = "servicio" | "ruta" | "trayecto" | "embarque" | "contacto";

type Step = { key: StepKey; label: string; prompt: string };

const PASO_SERVICIO: Step = {
  key: "servicio",
  label: "Servicio",
  prompt: "Seleccione el tipo de transporte que está buscando",
};
/** Paso 2 de las ramas que eligen puerto/aeropuerto o describen su necesidad. */
const PASO_RUTA: Step = {
  key: "ruta",
  label: "Ruta",
  prompt: "¿Cuál es la ruta de su carga?",
};
/** Mismo `key` que PASO_RUTA —es el mismo selector de rama— con la pregunta
 *  específica de Terrestre, que aquí ya sólo elige modalidad. */
const PASO_MODALIDAD: Step = {
  key: "ruta",
  label: "Modalidad",
  prompt: "¿Qué modalidad de transporte terrestre necesita?",
};
/** Exclusivo de Terrestre: el origen-destino que antes compartía pantalla con
 *  la modalidad, ahora con su propia pregunta. */
const PASO_TRAYECTO: Step = {
  key: "trayecto",
  label: "Ruta",
  prompt: "¿De dónde a dónde va su carga?",
};
const PASO_EMBARQUE: Step = {
  key: "embarque",
  label: "Embarque",
  prompt: "¿Qué va a mover y cuándo?",
};
const PASO_CONTACTO: Step = {
  key: "contacto",
  label: "Contacto",
  prompt: "¿Cómo lo contactamos?",
};

/**
 * Pasos reales de la rama elegida. Sin tipo todavía (paso 1) se usa la forma
 * de 4 pasos, que es la de la mayoría: es lo que el indicador muestra antes de
 * saber a dónde va el usuario.
 */
function stepsFor(tipo: TypeValue | ""): Step[] {
  if (tipo === "terrestre") {
    return [
      PASO_SERVICIO,
      PASO_MODALIDAD,
      PASO_TRAYECTO,
      PASO_EMBARQUE,
      PASO_CONTACTO,
    ];
  }
  return [PASO_SERVICIO, PASO_RUTA, PASO_EMBARQUE, PASO_CONTACTO];
}

/**
 * El paso 1 avanza solo al elegir servicio. El retraso deja ver la tarjeta ya
 * marcada antes del salto; sin él la selección se pierde de vista.
 */
const AUTO_ADVANCE_MS = 250;

/**
 * Valor del chip que abre el campo de texto libre en las ramas de tipo
 * "options". Vive en una constante porque la comparación contra él decide tres
 * cosas: si se revela el input, si se suprime el auto-avance y qué se manda en
 * el correo.
 */
const OTRA_OPCION = "Otro";

/**
 * Configuración del paso 2, que ramifica según lo elegido en el paso 1.
 *
 * `legend` es el nombre accesible del fieldset del paso. Se VE sólo en las
 * ramas `text`, donde es la instrucción de qué escribir; en las de chips va
 * sr-only, porque ahí repetía la pregunta del paso (ver el <legend> del
 * render).
 *
 * Las ramas de tipo "options" listan sólo las plazas principales de Compass;
 * `otherLabel`/`otherPlaceholder` describen el campo que se revela al elegir
 * "Otro", y `otherSuggestions` son plazas que sí se operan pero no lo bastante
 * como para gastar espacio en la vista principal: se ofrecen ahí dentro como
 * atajos de un clic, para no obligar a escribirlas.
 *
 * TODO(cliente): el listado de aeropuertos sigue PENDIENTE DE VALIDAR. Son los
 * de mayor movimiento en México, puestos como punto de partida, no una lista
 * confirmada por Compass. Confirmar antes del cutover:
 *   - ¿falta alguno (p. ej. Tijuana)?
 *   - ¿el orden debe reflejar el volumen real de operación?
 */
const ROUTE_STEP = {
  maritimo: {
    kind: "options" as const,
    legend: "Puerto de operación",
    options: ["Manzanillo", "Lázaro Cárdenas", "Veracruz", OTRA_OPCION],
    otherLabel: "Nombre del puerto",
    otherPlaceholder: "Escriba el puerto de operación",
    otherSuggestions: ["Altamira", "Ensenada"],
  },
  aereo: {
    kind: "options" as const,
    legend: "Aeropuerto de operación",
    options: ["AIFA / CDMX", "Guadalajara", "Monterrey", OTRA_OPCION],
    otherLabel: "Nombre del aeropuerto",
    otherPlaceholder: "Escriba el aeropuerto de operación",
    otherSuggestions: ["Bajío", "Cancún"],
  },
  /**
   * Terrestre es la única rama que explica sus opciones: "LTL" y "FTL" son
   * jerga del gremio y quien cotiza por primera vez no tiene por qué saberla.
   * Por eso sus opciones son objetos con `hint` y no cadenas sueltas como las
   * de puertos/aeropuertos, cuyos nombres ya se explican solos.
   *
   * `value` es lo que viaja en el correo —ahí sí conviene el nombre largo— y
   * `label` lo que se ve en el chip.
   */
  terrestre: {
    kind: "terrestre" as const,
    // Ya no se ve (va sr-only, ver el <legend> del render), así que puede ser
    // explícita en vez de corta: es lo que oye quien no ve la pantalla.
    legend: "Modalidad de transporte terrestre",
    options: [
      {
        value: "LTL consolidado",
        label: "LTL",
        hint: "Carga consolidada: su mercancía comparte camión con otros envíos. Ideal para volúmenes menores.",
      },
      {
        value: "FTL dedicado",
        label: "FTL",
        hint: "Camión dedicado: la unidad completa es para su carga. Ideal para volúmenes grandes o carga sensible.",
      },
      {
        value: OTRA_OPCION,
        label: OTRA_OPCION,
        hint: "Su caso no encaja en ninguna de las dos: descríbalo y le proponemos una solución.",
      },
    ],
    otherLabel: "¿Qué necesita mover?",
    otherPlaceholder:
      "Ej. mudanza de planta, última milla, cruce fronterizo, carga que no cabe en un camión estándar…",
    otherSuggestions: [] as string[],
  },
  /**
   * "Integral" combina modos (aéreo+terrestre, marítimo+terrestre, etc.), así
   * que no tiene un selector de puerto/aeropuerto propio — es texto libre,
   * igual que Especializado y Otros, describiendo la combinación.
   */
  integral: {
    kind: "text" as const,
    legend: "Describa su necesidad de transporte combinado",
    placeholder:
      "Ej. marítimo + terrestre, aéreo + terrestre, cambio de modo a media ruta…",
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

/** Opciones del chip "¿Cómo prefiere que lo contactemos?" (paso 4, opcional). */
const CONTACT_PREFERENCES = ["Correo", "WhatsApp", "Llamada"];

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
      /* `break-words` es una RED DE SEGURIDAD, no un efecto buscado: las
         etiquetas son palabras sueltas ("Especializado", "Guadalajara") y una
         palabra que no cabe no se parte sola — se sale de la caja y pisa al chip
         vecino. Con esto, en el peor ancho se parte en vez de desbordarse.
         Medido, no debería llegar a activarse en ningún ancho ≥320px. */
      className={`rounded-xl border text-sm font-medium break-words transition-colors ${
        selected
          ? "border-brand-900 bg-brand-900/5 text-brand-900"
          : "border-slate-200 text-slate-600 hover:border-brand-900 hover:text-brand-900"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Campo de texto libre que revela el chip "Otro", con sus atajos opcionales.
 *
 * Lo comparten las tres ramas que ofrecen "Otro" (Marítimo, Aéreo y Terrestre),
 * que sólo se diferencian en el texto de la etiqueta, el placeholder y las
 * sugerencias — todo eso vive en `ROUTE_STEP`. Cuando esto estaba escrito a
 * mano dentro de una sola rama, las demás se quedaron sin el campo y el dato
 * se perdía en silencio.
 *
 * Escribir aquí NO auto-avanza (lo evita `pickSub`): el "Continuar" de la barra
 * de abajo es la salida. Los atajos sí avanzan, porque un clic ya es una
 * selección completa.
 */
function OtroTextoLibre({
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  onPickSuggestion,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  onPickSuggestion: (value: string) => void;
}) {
  // `useId` y no un id fijo: <QuoteWizard> se monta DOS VECES a la vez en las
  // páginas que llevan el cotizador inline y además el modal del header. Con
  // ids literales, los `htmlFor` apuntaban al primero que encontrara el
  // navegador y el segundo formulario se quedaba sin etiquetas asociadas.
  const inputId = useId();

  return (
    <div className="mt-3">
      <label htmlFor={inputId} className={LABEL}>
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className={FIELD}
      />

      {/* Atajos a las plazas que Compass opera sin ser principales: escriben el
          nombre en el mismo campo de arriba, así que el resto del flujo
          (validación y `subResuelto` en el envío) no distingue si se eligió con
          clic o se tecleó. Hoy sólo Marítimo trae sugerencias; donde la lista
          está vacía el bloque simplemente no se monta. */}
      {suggestions.length > 0 && (
        <>
          {/* MÓVIL: los atajos también pasan a desplegable, por coherencia con
              el resto del cotizador.

              OJO CON EL VALOR: estos atajos no tienen estado propio — escriben
              en el campo de texto de arriba, que es el único dato real. Por eso
              el `value` del desplegable se DERIVA de lo escrito y sólo se marca
              como elegida la plaza si el texto coincide exactamente con una de
              la lista. Si la persona escribe otra cosa, el desplegable vuelve
              solo a su estado sin marcar, que es la verdad: lo que vale es lo
              que está escrito arriba. */}
          <div className="mt-3 sm:hidden">
            <OptionSelect
              label="Otras plazas que operamos"
              placeholder="O elija una de estas"
              value={suggestions.includes(value.trim()) ? value.trim() : ""}
              onChange={onPickSuggestion}
              options={suggestions.map((sugerencia) => ({
                value: sugerencia,
                label: sugerencia,
              }))}
            />
          </div>

          <div className="mt-2 hidden flex-wrap items-center gap-2 sm:flex">
            <span className="text-xs text-slate-500">
              O elija uno de estos:
            </span>
            {suggestions.map((sugerencia) => (
              <Chip
                key={sugerencia}
                selected={value.trim() === sugerencia}
                onClick={() => onPickSuggestion(sugerencia)}
                className="px-3 py-1.5"
              >
                {sugerencia}
              </Chip>
            ))}
          </div>
        </>
      )}
    </div>
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
  /**
   * Prefijo de los ids de campo, ÚNICO POR INSTANCIA. Antes eran literales
   * ("cot-nombre", "cot-correo"...), y eso rompía las páginas donde conviven el
   * cotizador inline y el del modal: al abrir el modal había dos formularios
   * montados con los mismos ids, así que cada `label` quedaba asociado al campo
   * de la otra instancia. Pasa en el home desde siempre y volvería a pasar en
   * /importaciones-a-mexico.
   */
  const campoId = useId();
  const idDe = (campo: string) => `${campoId}-${campo}`;
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
  const router = useRouter();
  const { scrollToCenter } = useSmoothScroll();

  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState<TypeValue | "">("");
  const [sub, setSub] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [otroLugar, setOtroLugar] = useState("");
  const [fecha, setFecha] = useState("");
  const [detalles, setDetalles] = useState("");
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contactoPreferido, setContactoPreferido] = useState("");

  const wizardRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLParagraphElement>(null);
  const isFirstRender = useRef(true);
  const advanceTimer = useRef<number | null>(null);
  /**
   * Marca si el próximo cambio de `step` debe centrar la tarjeta en el
   * viewport. Sólo se enciende para el auto-avance de paso 1 -> 2 en la
   * instancia INLINE (home). El modal ya está centrado por ser modal, y las
   * demás transiciones (Continuar/Atrás) son un clic explícito del usuario,
   * que ya sabe dónde está mirando — no hace falta re-centrar la vista ahí.
   */
  const shouldCenterOnNextStep = useRef(false);

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

    if (shouldCenterOnNextStep.current) {
      shouldCenterOnNextStep.current = false;
      if (wizardRef.current) scrollToCenter(wizardRef.current);
    }
  }, [step, scrollToCenter]);

  /**
   * Saca al usuario del cotizador SIN enviar nada: sin POST de correo, sin
   * pantalla de confirmación, sin evento de conversión (hoy no existe ninguno
   * atado al éxito del formulario, así que aquí no hay nada que suprimir a
   * propósito — sólo que quede documentado que esta salida no debe disparar
   * uno si algún día se añade).
   *
   * `onClose?.()` cierra el modal primero cuando aplica; en la instancia
   * inline no hay nada que cerrar y la navegación reemplaza la página entera.
   */
  function exitTo(path: string) {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
    }
    onClose?.();
    router.push(path);
  }

  const selectedType = REQUEST_TYPES.find((t) => t.value === tipo);
  const route = tipo ? ROUTE_STEP[tipo] : null;

  // Los pasos dependen de la rama (Terrestre tiene uno más), así que el total
  // y el contenido salen de aquí y no de una constante global. El `?? [0]` no
  // debería hacer falta —`step` nunca supera el largo de su propia rama, que
  // sólo cambia en el paso 1—, pero deja el render a salvo de un desfase.
  const steps = stepsFor(tipo);
  const currentStep = steps[step - 1] ?? steps[0];
  const stepKey = currentStep.key;

  /**
   * ¿Esta opción es el "Otro" que abre el campo de texto libre?
   *
   * Se decide por la CONFIGURACIÓN de la rama —tener `otherLabel`— y no por el
   * tipo concreto: así, cualquier rama que declare ese campo hereda el patrón
   * completo (revelar el input, no auto-avanzar y mandar lo escrito en vez del
   * literal "Otro"). Cuando esto preguntaba por `tipo === "maritimo"`, Aéreo
   * quedó sin campo y su auto-avance se comía el dato.
   *
   * Las ramas "text" (Integral, Especializado, Otros) no lo declaran: ya son
   * texto libre completo, ahí no hay nada que revelar.
   */
  function esperaTextoDeOtro(option: string) {
    return option === OTRA_OPCION && !!route && "otherLabel" in route;
  }

  function pickTipo(value: TypeValue) {
    setTipo(value);
    // El sub-dato pertenece al tipo anterior: si se cambia de servicio, la rama
    // del paso 2 es otra y lo que hubiera quedado ahí ya no aplica.
    setSub("");
    setOrigen("");
    setDestino("");
    setDescripcion("");
    setOtroLugar("");
    setError(null);

    // El paso 1 no tiene botón "Continuar": elegir servicio ES avanzar. Como
    // las tarjetas son <button>, esto también funciona con Enter y Espacio, y
    // el foco salta al encabezado del paso 2, que es lo que anuncia el cambio
    // al lector de pantalla.
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
    }
    // Sólo en la instancia INLINE (sin `onClose`): la tarjeta crece hacia abajo
    // al entrar al paso 2 y, sin recentrar, el borde superior queda pegado al
    // header en vez de centrada en pantalla. El modal ya está centrado por ser
    // modal, así que ahí este re-centrado sobraría.
    if (!onClose) shouldCenterOnNextStep.current = true;
    advanceTimer.current = window.setTimeout(() => {
      setStep(2);
    }, AUTO_ADVANCE_MS);
  }

  /**
   * Selección de puerto/aeropuerto (paso 2, ramas Marítimo y Aéreo).
   *
   * Auto-avanza igual que el paso 1, EXCEPTO en "Otro": ahí se revela un campo
   * de texto para el nombre de la plaza, y hay que esperar a que el usuario
   * termine de escribir. El botón "Continuar" de la barra de abajo —que ya
   * existe para este paso— es el que cubre esa espera; no hace falta un botón
   * nuevo.
   *
   * La espera depende de la RAMA, no del tipo concreto: cualquier rama de tipo
   * "options" con "Otro" abre el mismo campo. Cuando esto preguntaba por
   * `tipo === "maritimo"`, Aéreo + "Otro" auto-avanzaba sin dejar escribir el
   * aeropuerto y el dato se perdía.
   */
  function pickSub(option: string) {
    setSub(option);
    setError(null);

    if (esperaTextoDeOtro(option)) return;

    advanceToNextStep();
  }

  /**
   * Atajo a una plaza de `otherSuggestions` desde dentro de "Otro". Un clic
   * aquí es una selección completa —el nombre ya quedó escrito por el usuario
   * en la práctica—, así que auto-avanza igual que un chip principal. Lo que no
   * auto-avanza sigue siendo el texto libre: escribir a mano no dispara nada, y
   * de eso se encarga el "Continuar" de la barra de abajo.
   */
  function pickSugerencia(valor: string) {
    setOtroLugar(valor);
    setError(null);
    advanceToNextStep();
  }

  function advanceToNextStep() {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
    }
    advanceTimer.current = window.setTimeout(() => {
      setStep((s) => Math.min(s + 1, steps.length));
    }, AUTO_ADVANCE_MS);
  }

  function goNext() {
    if (stepKey === "servicio" && !selectedType) {
      setError("Seleccione un tipo de servicio para continuar.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, steps.length));
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
    setOtroLugar("");
    setFecha("");
    setDetalles("");
    setNombre("");
    setEmpresa("");
    setCorreo("");
    setTelefono("");
    setContactoPreferido("");
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

    // La plaza escrita a mano (puerto o aeropuerto) reemplaza al literal "Otro"
    // en el payload y en el correo; si el usuario no llegó a escribir nada, se
    // manda "Otro" tal cual en vez de perder el dato.
    const subResuelto = esperaTextoDeOtro(sub)
      ? otroLugar.trim() || OTRA_OPCION
      : sub;

    void submitQuote(
      {
        tipo,
        sub: subResuelto || undefined,
        origen: origen || undefined,
        destino: destino || undefined,
        fecha: fecha || undefined,
        descripcion: descripcion || undefined,
        detalles,
        nombre: nombre.trim(),
        empresa: empresa.trim() || undefined,
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
        contactoPreferido: contactoPreferido || undefined,
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
      <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-10">
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
    // `p-8` (32px) en móvil, era `p-6` (24px): el contenido quedaba pegado al
    // borde de una tarjeta que en un teléfono ya es casi todo el ancho de la
    // pantalla. El `md:p-10` de escritorio no se toca. Los 8px que se comen por
    // lado salen del ancho de los chips, y eso obligó a soltarles el suyo — ver
    // la rejilla del paso 1.
    <div
      ref={wizardRef}
      className="rounded-3xl bg-white p-8 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-10"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        {showHeading ? (
          <h2
            id={headingId}
            /* Un escalón por debajo de lo que era (text-2xl/3xl). Sigue
               mandando en la tarjeta: 24px bold contra los 18px semibold de la
               pregunta del paso, que es el siguiente nivel. */
            className="font-heading text-xl font-bold text-brand-900 md:text-2xl"
          >
            Solicite una cotización
          </h2>
        ) : (
          <span />
        )}
        {/* Indicador combinado: un guión por paso (el actual más ancho y en
            color) más el conteo. Sustituye a la fila de círculos numerados, que
            ocupaba un renglón entero. El nombre de cada paso sigue disponible
            en `sr-only`, así que un lector de pantalla no pierde orientación
            aunque en pantalla sólo se vean guiones.

            El total sale de `steps`, no de una constante: Terrestre son 5 pasos
            y el resto 4. Antes decía "de 4" siempre, así que al separar la
            modalidad del origen-destino habría mentido en esa rama. */}
        <div className="flex items-center gap-3">
          <ol className="flex items-center gap-1.5" aria-label="Progreso">
            {steps.map((s, i) => (
              <li
                key={s.key}
                aria-current={i + 1 === step ? "step" : undefined}
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 === step
                      ? "w-5 bg-brand-900"
                      : i + 1 < step
                        ? "w-1.5 bg-brand-900/40"
                        : "w-1.5 bg-slate-200"
                  }`}
                />
                <span className="sr-only">{s.label}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">
            Paso {step} de {steps.length}
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
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* La pregunta del paso y, sólo en el paso 1, la salida a proveedores
            en el extremo opuesto de la misma fila. Sustituye al enlace de texto
            "¿Busca ser proveedor o trabajar con nosotros?" que iba al pie de
            los pasos 1 y 2: era tan discreto que no cumplía su función de
            desvío. Va únicamente en el paso 1 —antes de que nadie invierta
            tiempo en el formulario— y no se repite en los siguientes.

            `flex-wrap`: en pantallas angostas el botón cae bajo la pregunta en
            vez de estrujarla. */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* TAMAÑO PROPIO EN MÓVIL. A `text-lg` con el interlineado que trae
              de fábrica (18/28px, factor 1.56) y el ancho semiexpandido de
              Archivo, la pregunta más larga —"Seleccione el tipo de transporte
              que está buscando"— ocupaba 3 líneas y 84px de alto a 320px, y se
              leía como un segundo titular compitiendo con "Solicite una
              cotización" a dos dedos por encima.

              A 16px con `leading-snug` (1.375 -> 22px) y `tracking-tight` baja a
              66px a 320px y a 44px de 375 en adelante, sin ganar ninguna línea.
              De `md` para arriba se restituye lo de siempre: `md:leading-7` son
              los mismos 28px que `text-lg` aplica por defecto, así que en
              escritorio no cambia ni un píxel. */}
          <p
            ref={stepHeadingRef}
            tabIndex={-1}
            className="font-heading text-base font-semibold leading-snug tracking-tight text-brand-900 outline-none md:text-lg md:leading-7 md:tracking-normal"
          >
            {currentStep.prompt}
          </p>

          {stepKey === "servicio" && (
            /* DELIBERADAMENTE PEQUEÑO: es una salida secundaria, no una acción
               del formulario. El rojo ya lo hace visible de sobra; con el
               tamaño de antes (text-sm, px-5 py-2.5) competía con la pregunta
               del paso y con los chips de servicio.
               Mide 28px de alto en pantalla, por debajo del mínimo táctil, así
               que el `after` estira el ÁREA CLICABLE 8px arriba y abajo hasta
               los 44px sin ocupar más espacio en el layout: el pseudo-elemento
               es hijo del botón y recibe los eventos, pero al ser `absolute` no
               empuja nada de la fila. */
            <button
              type="button"
              onClick={() => exitTo("/proveedores")}
              className="relative shrink-0 rounded-full bg-accent-red px-3.5 py-1.5 font-heading text-xs font-semibold text-white transition-opacity after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] hover:opacity-90"
            >
              ¿Eres proveedor?
            </button>
          )}
        </div>

        {/* ---------- PASO 1 · Servicio ----------
            Tarjetas horizontales (ícono a la izquierda) y no apiladas: en
            vertical medían 98px de alto cada una y el paso 1 empujaba la
            tarjeta fuera del pliegue. Así bajan a 46px.

            `sm:grid-cols-3` SIN override en `lg`: con 6 tipos (se sumó
            "Integral"), 5 columnas dejaba un sexto chip huérfano en su propia
            fila. 3 columnas da dos filas parejas de tres, con de sobra ancho
            por columna incluso para "Especializado" —la etiqueta más larga—
            dentro del modal (max-w-4xl, el contexto más estrecho). */}
        {stepKey === "servicio" && (
          /* Sin encabezado propio: la pregunta de arriba ya dice qué elegir, y
             el nombre del grupo para lectores de pantalla lo pone `aria-label`
             —invisible, sin repetir nada en pantalla. */
          <>
            {/* MÓVIL: desplegable. Las seis tarjetas en rejilla de dos columnas
                ocupaban ~150px de alto y a 320px la etiqueta "Especializado" ni
                siquiera cabía en su chip. Ver <OptionSelect> para el patrón
                ARIA y por qué no es un <select> nativo: estas opciones llevan
                ícono. */}
            <div className="sm:hidden">
              <OptionSelect
                label="Tipo de servicio"
                placeholder="Seleccione un tipo de servicio"
                value={tipo}
                onChange={(valor) => pickTipo(valor as TypeValue)}
                options={REQUEST_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                  Icon: TYPE_ICONS[type.value],
                }))}
              />
            </div>

            {/* DESKTOP: la rejilla de siempre, intacta. `hidden` la deja fuera
                del DOM accesible por debajo de `sm`, así que no hay dos
                controles anunciando lo mismo. Los ajustes de `gap` y `px` que
                se le habían hecho para móvil se revirtieron: por debajo de 640px
                ya no se ve. */}
            <div
              role="group"
              aria-label="Tipo de servicio"
              className="hidden gap-3 sm:grid sm:grid-cols-3"
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
          </>
        )}

        {/* ---------- PASO 2 · Ruta / Modalidad (condicional) ---------- */}
        {stepKey === "ruta" && route && (
          <fieldset>
            {/* La leyenda NO SE BORRA: es el nombre accesible del fieldset, y
                sin ella el grupo de chips se anunciaría suelto. Lo que cambia
                es si se VE.

                En las ramas de chips (`options` y `terrestre`) se va a
                `sr-only`: ahí sólo repetía la pregunta de arriba —"¿Qué
                modalidad de transporte terrestre necesita?" seguido de un
                "Modalidad"— y las propias opciones dicen ya qué se está
                eligiendo.

                En las ramas `text` se queda VISIBLE, y no por inercia: ahí la
                leyenda ("Describa su carga especializada", "Describa su
                necesidad de transporte combinado") es lo único que dice qué
                escribir. La pregunta del paso, genérica, no lo cubre. */}
            <legend
              className={
                route.kind === "text"
                  ? "mb-3 text-sm font-medium text-slate-700"
                  : "sr-only"
              }
            >
              {route.legend}
            </legend>

            {route.kind === "options" && (
              <>
                {/* La rejilla se ajusta al número de chips: con 4 caben en una
                    fila a partir de `sm` sin dejar huecos, y una lista más
                    larga vuelve a repartirse en 3 y 6 columnas. */}
                {/* MÓVIL: desplegable. `route.legend` —"Puerto de operación",
                    "Aeropuerto de operación"— es el nombre accesible; en
                    escritorio ese mismo texto es el <legend> sr-only del
                    fieldset, así que el control se nombra igual en las dos
                    versiones. */}
                <div className="sm:hidden">
                  <OptionSelect
                    label={route.legend}
                    placeholder="Seleccione una opción"
                    value={sub}
                    onChange={pickSub}
                    options={route.options.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                  />
                </div>

                <div
                  className={`hidden gap-3 sm:grid ${
                    route.options.length <= 4
                      ? "sm:grid-cols-4"
                      : "sm:grid-cols-3 lg:grid-cols-6"
                  }`}
                >
                  {route.options.map((option) => (
                    <Chip
                      key={option}
                      selected={sub === option}
                      onClick={() => pickSub(option)}
                      className="px-3 py-3"
                    >
                      {option}
                    </Chip>
                  ))}
                </div>

                {sub === OTRA_OPCION && (
                  <OtroTextoLibre
                    label={route.otherLabel}
                    placeholder={route.otherPlaceholder}
                    value={otroLugar}
                    onChange={setOtroLugar}
                    suggestions={route.otherSuggestions}
                    onPickSuggestion={pickSugerencia}
                  />
                )}
              </>
            )}

            {/* Terrestre: SÓLO la modalidad. El origen-destino se mudó a su
                propio paso ("trayecto"): tenerlos juntos mezclaba dos preguntas
                distintas en una pantalla y no se entendía qué se estaba
                eligiendo.

                Chips en columna con la explicación debajo del nombre, porque
                LTL/FTL son siglas del gremio: sin el texto de apoyo, quien
                cotiza por primera vez elige a ciegas. */}
            {route.kind === "terrestre" && (
              <>
                {/* Sin `role="group"` propio: el <fieldset> con su leyenda
                    sr-only ya agrupa y nombra estos chips. Anidar un segundo
                    grupo con casi el mismo nombre los haría anunciarse dos
                    veces. */}
                {/* MÓVIL: desplegable. La explicación de cada modalidad viaja
                    como `hint` y se pinta bajo su etiqueta dentro de la opción,
                    que es justo lo que un <select> nativo no permite y por lo
                    que este control existe. En el disparador sólo se ve la sigla
                    elegida: los hints son de dos líneas y no caben ahí. */}
                <div className="sm:hidden">
                  <OptionSelect
                    label={route.legend}
                    placeholder="Seleccione una modalidad"
                    value={sub}
                    onChange={pickSub}
                    options={route.options.map((option) => ({
                      value: option.value,
                      label: option.label,
                      hint: option.hint,
                    }))}
                  />
                </div>

                <div className="hidden gap-3 sm:grid sm:grid-cols-3">
                  {route.options.map((option) => (
                    <Chip
                      key={option.value}
                      selected={sub === option.value}
                      onClick={() => pickSub(option.value)}
                      className="flex h-full flex-col items-start gap-1 px-4 py-3 text-left"
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs font-normal leading-snug text-slate-500">
                        {option.hint}
                      </span>
                    </Chip>
                  ))}
                </div>

                {sub === OTRA_OPCION && (
                  <OtroTextoLibre
                    label={route.otherLabel}
                    placeholder={route.otherPlaceholder}
                    value={otroLugar}
                    onChange={setOtroLugar}
                    suggestions={route.otherSuggestions}
                    onPickSuggestion={pickSugerencia}
                  />
                )}
              </>
            )}

            {route.kind === "text" && (
              <>
                <textarea
                  id={idDe("descripcion")}
                  aria-label={route.legend}
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder={route.placeholder}
                  className={FIELD}
                />

                {/* Sólo en "Otros": accesos directos para sacar del flujo de
                    cotización a quien en realidad busca ser proveedor o
                    trabajar en Compass, ANTES de que llene el resto del
                    formulario. Ninguno de los dos manda nada — `exitTo` sólo
                    navega, no dispara el POST del correo ni la pantalla de
                    confirmación. Sustituyen al aviso "Este formulario es de
                    cotizaciones..." que había aquí antes: eso era una
                    advertencia pasiva; esto es la salida en sí. */}
                {tipo === "otros" && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs text-slate-500">
                      ¿Busca algo distinto?
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {/* Los dos destinos ya EXISTEN: /proveedores y /vacantes.
                          El primero apuntaba a /nosotros#contactanos, que sigue
                          siendo 404; el segundo llevaba a /vacantes desde antes
                          de que la página se construyera. Hoy los dos llegan a
                          algo. */}
                      <button
                        type="button"
                        onClick={() => exitTo("/proveedores")}
                        className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-900 hover:text-brand-900"
                      >
                        Quiero ser proveedor de Compass Solutions
                      </button>
                      <button
                        type="button"
                        onClick={() => exitTo("/vacantes")}
                        className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-900 hover:text-brand-900"
                      >
                        Quiero trabajar en Compass Solutions
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </fieldset>
        )}

        {/* ---------- Trayecto · sólo Terrestre ----------
            Origen y destino en su propia pantalla. Antes vivían pegados a los
            chips de modalidad, en una rejilla de 4 columnas donde la pregunta
            del paso ("¿Cuál es la ruta de su carga?") no correspondía a la
            mitad de los campos. */}
        {stepKey === "trayecto" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={idDe("origen")} className={LABEL}>
                Origen
              </label>
              <input
                id={idDe("origen")}
                type="text"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Ciudad o planta"
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor={idDe("destino")} className={LABEL}>
                Destino
              </label>
              <input
                id={idDe("destino")}
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ciudad o planta"
                className={FIELD}
              />
            </div>
          </div>
        )}

        {/* ---------- Embarque ---------- */}
        {stepKey === "embarque" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={idDe("fecha")} className={LABEL}>
                Fecha tentativa de embarque
              </label>
              <input
                id={idDe("fecha")}
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                aria-describedby={idDe("fecha-ayuda")}
                /* En un `input[type=date]` el navegador sólo abre el calendario
                   al pulsar su ícono; el resto del campo —que es la mayor parte
                   de su superficie— no hace nada. `showPicker()` lo abre desde
                   cualquier clic dentro.
                   Va con dos guardas: el método no existe en navegadores viejos,
                   y donde sí existe lanza `InvalidStateError` si la llamada no
                   viene de un gesto del usuario. En ambos casos se cae al
                   comportamiento nativo, que es el de hoy. */
                onClick={(event) => {
                  const input = event.currentTarget;
                  if (typeof input.showPicker !== "function") return;
                  try {
                    input.showPicker();
                  } catch {
                    // Se queda el comportamiento nativo del navegador.
                  }
                }}
                className={FIELD}
              />
              <p
                id={idDe("fecha-ayuda")}
                className="mt-1.5 text-xs text-slate-500"
              >
                Si no tiene fecha definida, puede dejarlo en blanco.
              </p>
            </div>
            <div>
              <label htmlFor={idDe("detalles")} className={LABEL}>
                Detalles de la carga
              </label>
              <textarea
                id={idDe("detalles")}
                rows={3}
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                placeholder="Número de paquetes, peso(kg), dimensiones, commodity, cargas peligrosas, etc."
                className={FIELD}
              />
            </div>
          </div>
        )}

        {/* ---------- Contacto ---------- */}
        {stepKey === "contacto" && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label htmlFor={idDe("nombre")} className={LABEL}>
                  Nombre <span aria-hidden="true">*</span>
                </label>
                <input
                  id={idDe("nombre")}
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor={idDe("empresa")} className={LABEL}>
                  Empresa
                </label>
                <input
                  id={idDe("empresa")}
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor={idDe("correo")} className={LABEL}>
                  Correo <span aria-hidden="true">*</span>
                </label>
                <input
                  id={idDe("correo")}
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor={idDe("telefono")} className={LABEL}>
                  Teléfono
                </label>
                <input
                  id={idDe("telefono")}
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={FIELD}
                />
              </div>
            </div>

            {/* Opcional: no bloquea el envío si queda sin elegir. El aviso
                "Este formulario es de cotizaciones..." que vivía aquí se quitó
                por completo — la desviación a proveedores ahora ocurre ANTES,
                en el paso 1 (el botón "¿Eres proveedor?" junto a la pregunta) y
                en los dos botones de la rama "Otros", que es donde de verdad
                sirve de algo: aquí, en el último paso, el usuario ya recorrió
                todo el formulario. */}
            <div className="mt-4">
              <span className={LABEL}>
                ¿Cómo prefiere que lo contactemos?{" "}
                <span className="font-normal text-slate-500">(opcional)</span>
              </span>
              {/* MÓVIL: desplegable, con "Sin preferencia" COMO OPCIÓN.
                  Los chips se deseleccionan volviendo a pulsar el que ya estaba
                  marcado, y eso en un listbox no existe: una lista de opciones
                  no se "despulsa". Como el campo es opcional, hacía falta un
                  camino de vuelta a vacío, y una entrada explícita lo dice mejor
                  de lo que lo diría un gesto escondido. Su `value` es la cadena
                  vacía, o sea exactamente el estado inicial: sin elegir nada, el
                  disparador ya muestra "Sin preferencia" y no un hueco. */}
              <div className="sm:hidden">
                <OptionSelect
                  label="Medio de contacto preferido"
                  placeholder="Sin preferencia"
                  value={contactoPreferido}
                  onChange={setContactoPreferido}
                  options={[
                    { value: "", label: "Sin preferencia" },
                    ...CONTACT_PREFERENCES.map((medio) => ({
                      value: medio,
                      label: medio,
                    })),
                  ]}
                />
              </div>

              <div
                role="group"
                aria-label="Medio de contacto preferido"
                className="hidden flex-wrap gap-3 sm:flex"
              >
                {CONTACT_PREFERENCES.map((medio) => (
                  <Chip
                    key={medio}
                    selected={contactoPreferido === medio}
                    onClick={() =>
                      setContactoPreferido((actual) =>
                        actual === medio ? "" : medio,
                      )
                    }
                    className="px-4 py-2"
                  >
                    {medio}
                  </Chip>
                ))}
              </div>
            </div>
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
            "Atrás" a la izquierda y "Continuar" a la derecha. */}
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
            </div>

            {step < steps.length ? (
              <button
                type="button"
                onClick={goNext}
                aria-describedby={error ? errorId : undefined}
                /* Mismo `px-8 sm:px-12` que el botón de envío de al lado, por
                   simetría: los dos ocupan el mismo sitio de la fila y uno
                   sustituye al otro en el último paso. Aquí el ancho nunca
                   apretó —"Continuar" son 70px—, pero verlos con padding
                   distinto al pasar de un paso a otro sí se nota. */
                className="rounded-full bg-brand-900 px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:px-12"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                aria-describedby={error ? errorId : undefined}
                /* `px-8` en móvil, `px-12` desde `sm`. "Solicitar cotización"
                   mide 138px a text-sm: con los 96px de `px-12` el botón pedía
                   234px y, tras subir la tarjeta a `p-8`, a 320px sólo quedan
                   224 de contenido — se salía 10px por la derecha. Con 64px de
                   padding pide 202 y entra con 22 de margen. De `sm` para
                   arriba nada cambia. */
                className="rounded-full bg-brand-900 px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:px-12 disabled:opacity-60"
              >
                {isSubmitting ? "Enviando…" : "Solicitar cotización"}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
