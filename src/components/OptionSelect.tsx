"use client";

/**
 * Desplegable de una sola opción, con íconos y texto de apoyo.
 *
 * EXISTE PORQUE NO PODÍA SER UN `<select>` NATIVO: las opciones del paso 1 del
 * cotizador llevan ícono (barco, avión, camión…) y las de Terrestre una línea de
 * explicación debajo, y dentro de un `<option>` no cabe más que texto plano.
 *
 * SÓLO SE MONTA EN MÓVIL. No lo decide este componente sino quien lo usa, con un
 * `sm:hidden` alrededor y un `hidden sm:grid` alrededor de las rejillas de
 * botones de siempre. Las dos versiones existen en el DOM y CSS elige: `hidden`
 * es `display:none`, así que la que no toca no es enfocable ni la ve un lector
 * de pantalla — no hay controles duplicados anunciados.
 *
 * PATRÓN ARIA: LISTBOX DESPLEGABLE, no combobox.
 *
 * El combobox de ARIA 1.2 —incluida su variante "select only"— describe un
 * control que acepta ENTRADA DE TEXTO o que al menos se comporta como tal ante
 * el lector de pantalla. Aquí no hay nada que escribir ni que filtrar: hay una
 * lista cerrada de tres a seis opciones. Anunciarlo como combobox prometería una
 * caja de texto que no existe. El disparador es un `<button>` con
 * `aria-haspopup="listbox"` y `aria-expanded`, y el panel un `role="listbox"`
 * con sus `role="option"` y `aria-selected` — que es exactamente lo que esto es.
 *
 * FOCO REAL EN LAS OPCIONES (roving tabindex), no `aria-activedescendant`. Las
 * dos formas son válidas para un listbox, pero esto vive únicamente en móvil y
 * ahí manda VoiceOver de iOS y TalkBack: el foco de verdad del DOM lo siguen sin
 * fallar, mientras que el soporte de `aria-activedescendant` en esos dos es
 * notoriamente más flojo.
 *
 * NO CIERRA POR SCROLL, y es a propósito: el panel es `absolute` dentro del
 * flujo, colgado del propio disparador, así que al desplazar la página se mueve
 * CON él y nunca queda huérfano en mitad de la pantalla. Cerrar por scroll sólo
 * hace falta cuando el panel va en un portal o en `position: fixed`, que no es
 * el caso. Sí cierra al tocar fuera y al salir el foco del conjunto.
 *
 * `data-lenis-prevent` en el panel: el scroll suave del sitio (Lenis) captura el
 * gesto y movería la página en vez de la lista cuando hay más opciones de las
 * que caben. Lenis busca ese atributo por el composedPath del evento.
 */

import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  /** Lo que se guarda. La cadena vacía es un valor legítimo ("sin preferencia"). */
  value: string;
  label: string;
  /** Segunda línea de apoyo. Hoy sólo la usan LTL y FTL, que son jerga. */
  hint?: string;
  Icon?: LucideIcon;
};

export default function OptionSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  /**
   * Nombre accesible del control. Va en un `<span class="sr-only">` propio y no
   * en un `<label>` visible: en todos los sitios donde esto se usa ya hay encima
   * la pregunta del paso o la etiqueta del campo, y repetirla en pantalla sería
   * ruido. Lo que no puede faltar es el nombre para quien no ve esa pregunta.
   */
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const labelId = useId();
  const valorId = useId();
  const listaId = useId();

  const [abierto, setAbierto] = useState(false);
  /** Opción con el foco mientras el panel está abierto. */
  const [activa, setActiva] = useState(0);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);
  const opcionesRef = useRef<(HTMLLIElement | null)[]>([]);

  const seleccion = options.findIndex((opcion) => opcion.value === value);
  const elegida = seleccion >= 0 ? options[seleccion] : null;

  function abrir(indice: number) {
    setActiva(indice);
    setAbierto(true);
  }

  function elegir(indice: number) {
    // El foco vuelve al disparador ANTES de cerrar. Si se cerrara primero, la
    // opción enfocada se desmontaría con el foco puesto y éste caería al
    // <body>: quien navega con teclado perdería el sitio y un lector de
    // pantalla se quedaría sin contexto.
    disparadorRef.current?.focus();
    setAbierto(false);
    onChange(options[indice].value);
  }

  /* El foco real se mueve a la opción activa cada vez que cambia — es el roving
     tabindex de la cabecera. Va en un efecto y no en el manejador de teclas
     porque el elemento al que hay que ir sólo existe después del render que
     abre el panel. */
  useEffect(() => {
    if (!abierto) return;
    opcionesRef.current[activa]?.focus();
  }, [abierto, activa]);

  /* Cierre al tocar fuera. `pointerdown` y no `click` para que cierre en cuanto
     se apoya el dedo, sin esperar a levantarlo; en fase de captura para que
     llegue aunque algo de por medio detenga la propagación. NO devuelve el foco
     al disparador: el usuario ya decidió irse a otro sitio de la pantalla. */
  useEffect(() => {
    if (!abierto) return;
    function fuera(evento: PointerEvent) {
      if (!contenedorRef.current?.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("pointerdown", fuera, true);
    return () => document.removeEventListener("pointerdown", fuera, true);
  }, [abierto]);

  function teclasDelDisparador(evento: React.KeyboardEvent) {
    if (
      evento.key === "ArrowDown" ||
      evento.key === "Enter" ||
      evento.key === " "
    ) {
      evento.preventDefault();
      abrir(seleccion >= 0 ? seleccion : 0);
      return;
    }
    if (evento.key === "ArrowUp") {
      evento.preventDefault();
      abrir(seleccion >= 0 ? seleccion : options.length - 1);
    }
  }

  function teclasDeLaLista(evento: React.KeyboardEvent, indice: number) {
    switch (evento.key) {
      // Sin ciclo: llegar al final no salta al principio, igual que un <select>
      // nativo. Un listbox que da la vuelta desorienta cuando no se ve.
      case "ArrowDown":
        evento.preventDefault();
        setActiva(Math.min(indice + 1, options.length - 1));
        break;
      case "ArrowUp":
        evento.preventDefault();
        setActiva(Math.max(indice - 1, 0));
        break;
      case "Home":
        evento.preventDefault();
        setActiva(0);
        break;
      case "End":
        evento.preventDefault();
        setActiva(options.length - 1);
        break;
      case "Enter":
      case " ":
        evento.preventDefault();
        elegir(indice);
        break;
      case "Escape":
        evento.preventDefault();
        disparadorRef.current?.focus();
        setAbierto(false);
        break;
      default:
        break;
    }
    // Tab NO se intercepta: lo resuelve el `onBlur` del contenedor, que cierra
    // el panel cuando el foco sale del conjunto. Así el tabulador sigue su
    // recorrido natural en vez de quedarse atrapado o costar una pulsación de
    // más.
  }

  return (
    <div
      ref={contenedorRef}
      /* Cierra cuando el foco abandona el conjunto (Tab hacia fuera, o el
         lector de pantalla saltando a otro control). Moverse ENTRE opciones, o
         del panel al disparador al elegir, deja `relatedTarget` dentro y no
         dispara nada. */
      onBlur={(evento) => {
        if (!contenedorRef.current?.contains(evento.relatedTarget as Node)) {
          setAbierto(false);
        }
      }}
      className="relative"
    >
      <span id={labelId} className="sr-only">
        {label}
      </span>

      {/* `aria-labelledby` con los DOS ids: se anuncia "Tipo de servicio,
          Marítimo, contraído, botón". Sólo con el valor no se sabría de qué
          campo es, y sólo con la etiqueta no se sabría qué hay elegido.

          `min-h-11` son 44px: el mínimo táctil cómodo. Mismo borde, radio y
          tipografía que los campos de texto del cotizador (la constante FIELD),
          para que se lea como un campo más del formulario y no como otra cosa. */}
      <button
        ref={disparadorRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? listaId : undefined}
        aria-labelledby={`${labelId} ${valorId}`}
        onClick={() =>
          abierto ? setAbierto(false) : abrir(seleccion >= 0 ? seleccion : 0)
        }
        onKeyDown={teclasDelDisparador}
        className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-500 px-3 py-2.5 text-left text-sm transition-colors focus:border-brand-900"
      >
        {elegida?.Icon && (
          <elegida.Icon
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-brand-900"
          />
        )}
        <span
          id={valorId}
          className={`flex-1 ${elegida ? "font-medium text-brand-900" : "text-slate-500"}`}
        >
          {elegida ? elegida.label : placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <ul
          id={listaId}
          role="listbox"
          aria-labelledby={labelId}
          data-lenis-prevent
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-500 bg-white py-1 shadow-xl shadow-brand-950/20"
        >
          {options.map((opcion, indice) => {
            const marcada = indice === seleccion;
            return (
              <li
                key={opcion.value || "sin-valor"}
                role="option"
                aria-selected={marcada}
                /* Roving tabindex: sólo la activa es tabulable. El foco se lo
                   pone el efecto de arriba. */
                tabIndex={indice === activa ? 0 : -1}
                ref={(elemento) => {
                  opcionesRef.current[indice] = elemento;
                }}
                onClick={() => elegir(indice)}
                onKeyDown={(evento) => teclasDeLaLista(evento, indice)}
                /* `min-h-11` otra vez: 44px de alto mínimo por opción.
                   El fondo cambia con el foco además del contorno, para que el
                   indicador se vea aunque el navegador no pinte el `outline`. */
                className={`flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-brand-900/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-900 ${
                  marcada ? "bg-brand-900/5" : ""
                }`}
              >
                {opcion.Icon && (
                  <opcion.Icon
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-brand-900"
                  />
                )}
                <span className="flex-1">
                  <span
                    className={
                      marcada
                        ? "font-semibold text-brand-900"
                        : "font-medium text-slate-600"
                    }
                  >
                    {opcion.label}
                  </span>
                  {/* `slate-600` y NO el `slate-500` que usa el chip
                      equivalente de escritorio: aquí el hint puede caer sobre
                      fondo teñido —brand-900 al 5% si está marcada, al 10% si
                      tiene el foco— y ahí el 500 se queda en 4.33:1 y 3.92:1,
                      por debajo del 4.5:1 que pide AA para texto de 12px. Con
                      el 600 sube a 6.90:1 y 6.24:1. */}
                  {opcion.hint && (
                    <span className="mt-0.5 block text-xs leading-snug text-slate-600">
                      {opcion.hint}
                    </span>
                  )}
                </span>
                {/* Decorativo: lo que anuncia la selección es `aria-selected`.
                    Ocupa su hueco siempre (`invisible`) para que la lista no se
                    reacomode al cambiar de opción. */}
                <Check
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 text-brand-900 ${marcada ? "" : "invisible"}`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
