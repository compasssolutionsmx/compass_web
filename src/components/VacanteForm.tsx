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
 * EXPONE UN `ref` IMPERATIVO (`aplicarPuesto`) para que <VacantesBoard> pueda
 * rellenar el selector desde el botón de una tarjeta. Es lo mínimo que hay que
 * abrir hacia fuera: el resto del estado sigue viviendo aquí dentro.
 */

import { useImperativeHandle, useRef, useState } from "react";
import Link from "next/link";
import { LeadError, LeadSuccess } from "./LeadConfirmation";
import { QuoteButton } from "./QuoteModal";
import { useLeadSubmit } from "./useLeadSubmit";
import type { Vacante } from "@/lib/vacantes";

/** Mismos estilos de campo que el cotizador, el modal corto y proveedores. */
const FIELD =
  "w-full rounded-lg border border-slate-500 px-3 py-2.5 text-sm transition-colors focus:border-brand-900";

const LABEL = "mb-1.5 block text-sm font-medium text-slate-700";

/** Para quien no encaja en ninguna vacante publicada, o cuando no hay ninguna. */
const OTRO_PUESTO = "Otro";

export type VacanteFormHandle = {
  /** Preselecciona un puesto y manda el foco al primer campo que falte. */
  aplicarPuesto: (puesto: string) => void;
};

export default function VacanteForm({
  vacantes,
  ref,
}: {
  vacantes: Vacante[];
  ref?: React.Ref<VacanteFormHandle>;
}) {
  const { status, isSubmitting, whatsappUrl, submitLead, retryLead } =
    useLeadSubmit();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [puesto, setPuesto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);

  const nombreRef = useRef<HTMLInputElement>(null);
  const correoRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const mensajeRef = useRef<HTMLTextAreaElement>(null);

  // Las opciones salen de las vacantes ACTIVAS que recibe la página, así que
  // publicar o retirar una en lib/vacantes.ts mueve el selector solo. "Otro"
  // va siempre al final, y es la única opción cuando no hay ninguna publicada.
  const opciones = [...vacantes.map((vacante) => vacante.puesto), OTRO_PUESTO];

  useImperativeHandle(ref, () => ({
    aplicarPuesto(valor: string) {
      setPuesto(valor);
      setError(null);

      /* El foco va al primer campo VACÍO, no siempre al primero: si alguien ya
         escribió su nombre y luego cambia de puesto, devolverlo al nombre le
         borraría el sitio donde estaba. Sin esto, quien navega con teclado o
         lector de pantalla pulsa el botón de una tarjeta y no se entera de que
         algo cambió al otro lado de la página.

         `preventScroll`: mover el foco arrastra el scroll por defecto, y eso
         pelearía con el desplazamiento suave que <VacantesBoard> hace en
         móvil. Quién y cuándo se mueve la página se decide allá, no aquí. */
      const pendiente = (
        [
          [nombre, nombreRef],
          [correo, correoRef],
          [telefono, telefonoRef],
          [mensaje, mensajeRef],
        ] as const
      ).find(([valorActual]) => !valorActual.trim());

      pendiente?.[1].current?.focus({ preventScroll: true });
    },
  }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
        puesto: puesto || undefined,
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
        mensaje: mensaje.trim() || undefined,
      },
      // Sin salida por WhatsApp: ver la nota de la cabecera.
      null,
      "vacante",
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
      {/* AVISO DE ORIGEN. Va ANTES de los campos, que es donde todavía sirve:
          después de llenarlos, decirle a alguien que se equivocó de formulario
          es hacerle perder el trabajo hecho.

          Tratamiento sobrio a propósito —borde y fondo tenue de la familia
          brand— y NO `accent-red`, que está reservado a la salida de
          proveedores del cotizador. Un bloque rojo aquí leería como error,
          y esto es una aclaración.

          Contraste sobre el fondo resultante (brand-100/60 sobre el blanco de
          la tarjeta): texto slate-600 6.88:1, enlaces brand-900 13.69:1. */}
      <p className="mb-6 rounded-2xl border border-brand-900/15 bg-brand-100/60 p-4 text-sm leading-relaxed text-slate-600">
        Este formulario es exclusivo para postulaciones de empleo. Si busca una
        cotización, use el{" "}
        {/* Abre el modal del cotizador en esta misma página, en vez de mandar
            al usuario al home a buscarlo. `QuoteButton` ya es `type="button"`,
            así que no envía este formulario. */}
        <QuoteButton className="font-medium text-brand-900 underline underline-offset-2 transition-opacity hover:opacity-80">
          cotizador
        </QuoteButton>
        . Si desea registrarse como proveedor, visite{" "}
        <Link
          href="/proveedores"
          className="font-medium text-brand-900 underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          Proveedores
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

        <div>
          <label htmlFor="vac-puesto" className={LABEL}>
            Puesto de interés
          </label>
          <select
            id="vac-puesto"
            value={puesto}
            onChange={(e) => setPuesto(e.target.value)}
            className={FIELD}
          >
            <option value="">Seleccione una opción</option>
            {opciones.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>

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
