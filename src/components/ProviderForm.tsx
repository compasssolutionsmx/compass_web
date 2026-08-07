"use client";

/**
 * Registro de proveedores de /proveedores.
 *
 * ES EL TERCER FORMULARIO del sitio y el único que NO captura un lead
 * comercial: aquí no hay nada que cotizar. Comparte con los otros dos el hook
 * de envío (`useLeadSubmit`) y las pantallas de cierre (`LeadConfirmation`),
 * pero se aparta en tres cosas, todas a propósito:
 *
 *   1. Va con `formulario: "proveedor"`, que en `lib/lead-email` tiene su
 *      propio asunto ("Nuevo proveedor interesado — <empresa>") y un pie que
 *      avisa a gritos que NO es una cotización. Sin eso, en la bandeja de
 *      ventas se lee igual que un lead y acaba en el flujo equivocado.
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

    setError(null);
    void submitLead(
      {
        empresa: empresa.trim(),
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
        servicio: servicio || undefined,
        mensaje: mensaje.trim() || undefined,
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
