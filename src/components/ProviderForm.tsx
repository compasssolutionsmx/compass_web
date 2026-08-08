"use client";

/**
 * Registro de proveedores de /proveedores.
 *
 * ES EL TERCER FORMULARIO del sitio y el único que NO captura un lead
 * comercial: aquí no hay nada que cotizar. Comparte con los otros dos el hook
 * de envío (`useLeadSubmit`) y las pantallas de cierre (`LeadConfirmation`),
 * pero se aparta en tres cosas, todas a propósito:
 *
 *   1. Va con `formulario: "proveedor"`, que en `lib/lead-email` tiene SU PROPIA
 *      LISTA DE DESTINATARIOS (`PROVIDER_RECIPIENTS`), su propio asunto
 *      ("Registro de proveedor — <empresa>") y un pie que avisa a gritos que NO
 *      es una cotización. Ya no pasa por la bandeja comercial: antes llegaba a
 *      `LEAD_RECIPIENTS` como todo lo demás y sólo se distinguía por el texto.
 *   2. Manda `null` como mensaje de WhatsApp: ese canal es de atención a
 *      clientes. Con `null`, `whatsappUrl` se queda vacío y las pantallas de
 *      confirmación omiten la tarjeta por sí solas.
 *   3. La pantalla de éxito lleva textos propios: no hay "solicitud" que
 *      revisar ni se promete un contacto de vuelta.
 *
 * NO PROMETE NADA que no esté confirmado — ni plazos de respuesta, ni proceso
 * de aprobación, ni requisitos. Si algún día el cliente define ese proceso,
 * este es el sitio donde contarlo.
 */

import Link from "next/link";
import { useState } from "react";
import { LeadError, LeadSuccess } from "./LeadConfirmation";
import { useLeadSubmit } from "./useLeadSubmit";

/** Mismos estilos de campo que el cotizador y el modal corto. */
const FIELD =
  "w-full rounded-lg border border-slate-500 px-3 py-2.5 text-sm transition-colors focus:border-brand-900";

const LABEL = "mb-1.5 block text-sm font-medium text-slate-700";

/**
 * Categorías de lo que el proveedor OFRECE. No son los `REQUEST_TYPES` del
 * cotizador —esos son lo que un cliente pide— aunque varias coincidan de
 * nombre: aquí caben perfiles que el cotizador no contempla, como agencia
 * aduanal o almacenaje. Por eso el campo viaja como `servicio` y no como
 * `tipo`, que es la clave que el correo traduce con `requestTypeLabel`.
 *
 * Es un `<select>` simple y con "Otro": la lista orienta a quien no sabe cómo
 * describirse, y el campo de mensaje recoge el detalle de quien no encaja.
 */
const SERVICIOS = [
  "Transporte terrestre",
  "Transporte marítimo",
  "Transporte aéreo",
  "Almacenaje y distribución",
  "Agencia aduanal",
  "Otro",
];

export default function ProviderForm() {
  const { status, isSubmitting, whatsappUrl, submitLead, retryLead } =
    useLeadSubmit();

  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [consiente, setConsiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nombre.trim() || !empresa.trim() || !correo.trim()) {
      setError("Nombre, empresa y correo son obligatorios.");
      return;
    }
    // Misma validación laxa que el resto del sitio: un correo con forma rara
    // pero real vale más que un registro perdido por una regex estricta.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError("Revise el correo: no parece una dirección válida.");
      return;
    }
    // El consentimiento se comprueba AL FINAL, después de los campos: si
    // faltaran datos y además la casilla, lo primero que hay que arreglar son
    // los datos. Usa el mismo `error` y la misma región `role="alert"` que el
    // resto, así que se anuncia igual que cualquier campo requerido.
    if (!consiente) {
      setError("Debe aceptar el aviso de privacidad para enviar su registro.");
      return;
    }

    setError(null);
    void submitLead(
      {
        empresa: empresa.trim(),
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
        servicio: servicio || undefined,
        mensaje: mensaje.trim() || undefined,
        // Constancia de la casilla. Va como texto porque el payload de
        // `useLeadSubmit` es Record<string, string | undefined> y el correo
        // pinta valores crudos.
        consentimiento:
          "Aceptó el aviso de privacidad y el envío de comunicaciones",
      },
      // Sin salida por WhatsApp: ver la nota 2 de la cabecera.
      null,
      "proveedor",
    );
  }

  // Terminado el envío, la tarjeta deja de ser un formulario y se sustituye
  // entera por la confirmación, igual que en el cotizador.
  if (status === "success" || status === "error") {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-900/5 md:p-10">
        {status === "success" ? (
          <LeadSuccess
            whatsappUrl={whatsappUrl}
            title="Su registro quedó recibido"
            description="Ya tenemos los datos de su empresa. Quedan a disposición del área que corresponda dentro de Compass Solutions."
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
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* La nota de obligatorios vive DENTRO de la tarjeta y pegada a los
            campos que describe. Estaba fuera, encima de la tarjeta, donde se
            leía como parte de la introducción de la página y no como una
            instrucción del formulario. */}
        <p className="text-sm text-slate-500">
          Los campos marcados con asterisco son obligatorios.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="prov-empresa" className={LABEL}>
              Empresa <span aria-hidden="true">*</span>
            </label>
            <input
              id="prov-empresa"
              type="text"
              required
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="prov-nombre" className={LABEL}>
              Nombre de contacto <span aria-hidden="true">*</span>
            </label>
            <input
              id="prov-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="prov-correo" className={LABEL}>
              Correo <span aria-hidden="true">*</span>
            </label>
            <input
              id="prov-correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="prov-telefono" className={LABEL}>
              Teléfono
            </label>
            <input
              id="prov-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        <div>
          <label htmlFor="prov-servicio" className={LABEL}>
            Tipo de servicio que ofrece
          </label>
          <select
            id="prov-servicio"
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            className={FIELD}
          >
            <option value="">Seleccione una opción</option>
            {SERVICIOS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="prov-mensaje" className={LABEL}>
            Mensaje
          </label>
          <textarea
            id="prov-mensaje"
            rows={4}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Cuéntenos qué ofrece su empresa: cobertura, capacidad, equipo, zonas donde opera…"
            className={FIELD}
          />
        </div>

        {/* CASILLA OBLIGATORIA. `aria-required` y no el `required` nativo: el
            <form> va con `noValidate`, así que el navegador no valida por su
            cuenta y quien manda es `handleSubmit`; `required` a secas prometería
            una validación nativa que aquí está desactivada.

            El texto ata las dos cosas —aviso de privacidad y comunicaciones— en
            una sola frase y acota las comunicaciones a las "relacionadas con
            este registro". Ver la nota del reporte sobre por qué ese matiz
            importa frente a lo que dice el aviso de /apartado-legal. */}
        <div className="flex items-start gap-3 pt-2">
          <input
            id="prov-consentimiento"
            type="checkbox"
            checked={consiente}
            onChange={(e) => setConsiente(e.target.checked)}
            aria-required="true"
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-500 text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
          />
          <label
            htmlFor="prov-consentimiento"
            className="text-sm leading-relaxed text-slate-600"
          >
            Acepto el{" "}
            <Link
              href="/apartado-legal#privacidad"
              className="font-semibold text-brand-900 underline underline-offset-2 hover:opacity-80"
            >
              aviso de privacidad
            </Link>{" "}
            y el envío de comunicaciones de Compass Solutions relacionadas con
            este registro. <span aria-hidden="true">*</span>
          </label>
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
            className="rounded-full bg-brand-900 px-10 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Enviando…" : "Enviar registro"}
          </button>
        </div>
      </form>
    </div>
  );
}
