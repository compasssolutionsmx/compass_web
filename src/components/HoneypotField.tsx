"use client";

/**
 * Campo trampa. Va dentro de los cuatro <form> del sitio y no lo ve nadie.
 *
 * ─── CÓMO SE OCULTA, QUE ES LO ÚNICO DELICADO ─────────────────────────────
 *
 * NI `display:none` NI `type="hidden"`. Los dos son la primera comprobación de
 * cualquier bot que se haya escrito en los últimos diez años: si el campo está
 * oculto de una de esas dos formas, lo salta, y la trampa no atrapa a nadie.
 *
 * Lo que se usa es POSICIONAMIENTO FUERA DE PANTALLA: el envoltorio se saca a
 * `left: -9999px` con una caja de 1x1 y `overflow-hidden`. Para el bot, que lee
 * el DOM y no calcula geometría, es un input de texto normal con su <label>. No
 * genera scroll horizontal porque <html> lleva `overflow-x: clip` (globals.css).
 *
 * ─── POR QUÉ NO ROMPE LA ACCESIBILIDAD ────────────────────────────────────
 *
 * Tres cosas, y hacen falta las tres:
 *   - `aria-hidden="true"` en el envoltorio saca al campo y a su etiqueta del
 *     árbol de accesibilidad, así que ningún lector de pantalla los anuncia.
 *   - `tabIndex={-1}` lo saca del orden de tabulación. Sin esto, `aria-hidden`
 *     sobre un control enfocable es una trampa de verdad: el teclado llegaría a
 *     un campo que el lector no sabe nombrar.
 *   - NO lleva `required`. Con `noValidate` en los cuatro formularios daría
 *     igual, pero un campo obligatorio invisible es la clase de cosa que rompe
 *     el día que alguien quite ese atributo.
 *
 * `autoComplete="off"` más los `data-*` de 1Password y LastPass son otra cosa:
 * no son accesibilidad, son evitar que un gestor de contraseñas autorrellene
 * "website" con la URL guardada y convierta a un cliente real en un bot a ojos
 * del servidor. Es el único falso positivo plausible de esta capa.
 *
 * El `id` sale de `useId` porque hay pantallas donde esto se monta dos veces a
 * la vez: <QuoteWizard> vive en la sección del hero y en el modal al mismo
 * tiempo, y dos <label for> apuntando al mismo id sería marcado inválido.
 */

import { useId } from "react";
import { HONEYPOT_FIELD } from "@/lib/bot-trap";

export default function HoneypotField() {
  const id = useId();

  return (
    <div
      aria-hidden="true"
      className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden"
    >
      <label htmlFor={id}>Sitio web</label>
      <input
        id={id}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
        data-lpignore="true"
        data-1p-ignore=""
        data-form-type="other"
      />
    </div>
  );
}
