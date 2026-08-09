"use client";

/**
 * Postulación de /vacantes.
 *
 * Gemelo de <ProviderForm>: mismo hook de envío, mismas pantallas de cierre y
 * las mismas tres desviaciones respecto de los formularios comerciales —
 * origen propio (`vacante`) con su asunto y su pie de "NO ES UNA COTIZACIÓN",
 * `null` como mensaje de WhatsApp (ese canal es de atención a clientes, no de
 * reclutamiento) y textos de éxito adaptados.
 *
 * NO PROMETE NADA: ni contacto de vuelta, ni plazos, ni etapas de proceso.
 * Nada de eso está confirmado por el cliente.
 *
 * SIN ADJUNTO DE CV, a propósito: `/api/lead` valida cadenas con un tope de
 * 2000 caracteres por campo, no binarios. Aceptar archivos exige decidir antes
 * límite de tamaño, tipos permitidos y validación real, y eso es un encargo
 * aparte. Mientras tanto, quien quiera compartirlo puede dejar el enlace en el
 * mensaje.
 *
 * YA NO HAY CAMPO "PUESTO DE INTERÉS". Era un <select> con las vacantes
 * publicadas, y el botón de cada tarjeta lo preseleccionaba. Ahora la referencia
 * al puesto viaja DENTRO DEL MENSAJE, como una frase que la persona ve, puede
 * corregir y puede continuar. Se gana que el dato sea legible y editable por
 * quien postula; se pierde que el asunto del correo lo traiga como campo aparte
 * (ver `buildSubject` en lib/lead-email.ts, que ya no depende de él).
 *
 * EXPONE UN `ref` IMPERATIVO (`aplicarPuesto`) para que <VacantesBoard> pueda
 * insertar esa frase desde el botón de una tarjeta. Es lo mínimo que hay que
 * abrir hacia fuera: el resto del estado sigue viviendo aquí dentro.
 */

import { useImperativeHandle, useRef, useState } from "react";
import { LeadError, LeadSuccess } from "./LeadConfirmation";
import HoneypotField from "./HoneypotField";
import { readHoneypot } from "@/lib/bot-trap";
import { useLeadSubmit } from "./useLeadSubmit";

/** Mismos estilos de campo que el cotizador, el modal corto y proveedores. */
const FIELD =
  "w-full rounded-lg border border-slate-500 px-3 py-2.5 text-sm transition-colors focus:border-brand-900";

const LABEL = "mb-1.5 block text-sm font-medium text-slate-700";

/**
 * Frase que el botón "Postularme a este puesto" inserta al PRINCIPIO del
 * mensaje. Cierra en punto y deja dos saltos detrás para que la persona siga
 * escribiendo debajo sin tener que abrir línea ella.
 */
function referenciaAVacante(puesto: string): string {
  return `Me interesa la vacante de ${puesto}.`;
}

/**
 * Reconoce una referencia ya insertada para SUSTITUIRLA en vez de apilar otra:
 * sin esto, pulsar dos botones distintos —o el mismo dos veces— dejaría el
 * mensaje encabezado por dos frases contradictorias.
 *
 * Ancla al principio y es deliberadamente laxa con el nombre del puesto: lo
 * único que tiene que reconocer es la forma de la frase, no un catálogo de
 * vacantes que cambia. Si alguien escribió esa misma frase a mano, se la
 * sustituye — que es justo lo que querría al pulsar el botón de otra tarjeta.
 */
const REFERENCIA_PREVIA = /^Me interesa la vacante de .+?\.(?:\r?\n)*/;

export type VacanteFormHandle = {
  /**
   * Encabeza el mensaje con la referencia al puesto —sin borrar lo que la
   * persona ya hubiera escrito— y manda el foco al primer campo que falte.
   */
  aplicarPuesto: (puesto: string) => void;
};

export default function VacanteForm({
  ref,
}: {
  ref?: React.Ref<VacanteFormHandle>;
}) {
  const { status, isSubmitting, whatsappUrl, submitLead, retryLead } =
    useLeadSubmit();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);

  const nombreRef = useRef<HTMLInputElement>(null);
  const correoRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const mensajeRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    aplicarPuesto(valor: string) {
      setError(null);

      /* LO ESCRITO NO SE PIERDE. La frase se ANTEPONE a lo que hubiera, no lo
         reemplaza: encabezar el mensaje es lo que se lee bien en el correo, y
         quien ya había contado su experiencia la conserva debajo. Si ya había
         una referencia puesta por otro botón, esa sí se sustituye — para eso
         está `REFERENCIA_PREVIA`.

         Se usa la forma funcional de `setMensaje` y no la variable `mensaje`
         del render: dos pulsaciones seguidas, antes de que React vuelva a
         pintar, leerían el mismo valor viejo y la segunda perdería a la
         primera. */
      const frase = referenciaAVacante(valor);
      setMensaje((actual) => {
        const resto = actual.replace(REFERENCIA_PREVIA, "");
        return resto.trim() ? `${frase}\n\n${resto}` : `${frase}\n\n`;
      });

      /* El foco va al primer campo VACÍO, no siempre al primero: si alguien ya
         escribió su nombre y luego pulsa otra vacante, devolverlo al nombre le
         borraría el sitio donde estaba. Sin esto, quien navega con teclado o
         lector de pantalla pulsa el botón de una tarjeta y no se entera de que
         algo cambió al otro lado de la página.

         `preventScroll`: mover el foco arrastra el scroll por defecto, y eso
         pelearía con el desplazamiento suave que <VacantesBoard> hace desde la
         lista de vacantes hasta aquí arriba, en todos los anchos. Quién y
         cuándo se mueve la página se decide allá, no aquí. */
      const pendiente = (
        [
          [nombre, nombreRef],
          [correo, correoRef],
          [telefono, telefonoRef],
        ] as const
      ).find(([valorActual]) => !valorActual.trim());

      if (pendiente) {
        pendiente[1].current?.focus({ preventScroll: true });
        return;
      }

      /* Con los datos ya llenos, el único sitio que queda por escribir es el
         mensaje — y antes también acababa aquí, porque estaba vacío y era el
         último de la lista de arriba. La diferencia es que ahora YA TIENE texto,
         así que hay que llevar el cursor AL FINAL a mano: un `focus()` a secas
         lo deja en la posición 0 y lo siguiente que se teclee entraría por
         delante de la frase, no debajo.

         Va en un `requestAnimationFrame` porque el `setMensaje` de arriba
         todavía no llegó al DOM: leer `el.value.length` en este mismo tick
         daría el largo del texto ANTERIOR. */
      requestAnimationFrame(() => {
        const el = mensajeRef.current;
        if (!el) return;
        el.focus({ preventScroll: true });
        el.setSelectionRange(el.value.length, el.value.length);
      });
    },
  }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const website = readHoneypot(event.currentTarget);

    if (!nombre.trim() || !correo.trim()) {
      setError("Nombre y correo son obligatorios.");
      return;
    }
    // Misma validación laxa que el resto del sitio: un correo con forma rara
    // pero real vale más que una postulación perdida por una regex estricta.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError("Revise el correo: no parece una dirección válida.");
      return;
    }

    setError(null);
    void submitLead(
      {
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
        mensaje: mensaje.trim() || undefined,
      },
      // Sin salida por WhatsApp: ver la nota de la cabecera.
      null,
      "vacante",
      website,
    );
  }

  if (status === "success" || status === "error") {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-8">
        {status === "success" ? (
          <LeadSuccess
            whatsappUrl={whatsappUrl}
            title="Su registro quedó recibido"
            description="Sus datos quedan a disposición del área correspondiente para vacantes actuales y futuras."
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
    <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-8">
      {/* EL AVISO DE ORIGEN SE FUE A LA COLUMNA IZQUIERDA, con el texto de
          introducción (ver <VacantesBoard>). Sigue cumpliendo su función —llegar
          ANTES de que nadie llene nada— porque esa columna se lee primero en las
          dos disposiciones: a la izquierda de la tarjeta en desktop y encima de
          ella en móvil. Aquí dentro le robaba el arranque al formulario. */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <HoneypotField />
        {/* La nota de obligatorios vive DENTRO de la tarjeta y pegada a los
            campos que describe, igual que en <ProviderForm>. Estaba fuera,
            encima de la tarjeta y bajo un titular que ya no existe, donde se
            leía como parte de la introducción de la página y no como una
            instrucción del formulario.

            Va DESPUÉS del aviso de origen: primero se aclara si este es el
            formulario correcto y sólo después cómo llenarlo. */}
        <p className="text-sm text-slate-500">
          Los campos marcados con asterisco son obligatorios.
        </p>

        {/* NOMBRE A ANCHO COMPLETO y no emparejado: los campos cortos son tres
            —nombre, correo y teléfono—, así que alguno se queda sin pareja. El
            que sobra es este, no el teléfono: correo y teléfono son las dos vías
            de contacto y se leen como un par (es la misma fila que en
            <ProviderForm>), mientras que un teléfono suelto ocupando toda la
            caja se vería desproporcionado. */}
        <div>
          <label htmlFor="vac-nombre" className={LABEL}>
            Nombre <span aria-hidden="true">*</span>
          </label>
          <input
            ref={nombreRef}
            id="vac-nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={FIELD}
          />
        </div>

        {/* Rejilla de una sola fila: en `md` van lado a lado y por debajo caen
            apilados, como todo lo demás de la tarjeta. El orden del DOM es el
            mismo que el visual —izquierda antes que derecha—, así que el
            tabulador sigue el recorrido natural. */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="vac-correo" className={LABEL}>
              Correo <span aria-hidden="true">*</span>
            </label>
            <input
              ref={correoRef}
              id="vac-correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="vac-telefono" className={LABEL}>
              Teléfono
            </label>
            <input
              ref={telefonoRef}
              id="vac-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        {/* AQUÍ ATERRIZA LA REFERENCIA AL PUESTO, donde antes había un <select>
            aparte. Ancho completo, como el resto del bloque de escritura. */}
        <div>
          <label htmlFor="vac-mensaje" className={LABEL}>
            Mensaje
          </label>
          <textarea
            ref={mensajeRef}
            id="vac-mensaje"
            rows={4}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Cuéntenos sobre su experiencia. Si tiene su CV en línea, puede dejarnos aquí el enlace."
            className={FIELD}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-brand-900 px-8 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Enviando…" : "Enviar postulación"}
          </button>
        </div>
      </form>
    </div>
  );
}
