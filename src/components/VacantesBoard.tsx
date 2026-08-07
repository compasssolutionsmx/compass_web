"use client";

/**
 * Cuerpo de /vacantes: las vacantes y el formulario, lado a lado.
 *
 * POR QUÉ ES UN SOLO COMPONENTE Y NO DOS SUELTOS: el botón "Postularme a este
 * puesto" de cada tarjeta tiene que preseleccionar ese puesto en el selector
 * del formulario. Eso obliga a que alguien sostenga la conexión entre las dos
 * columnas, y ese alguien es este componente — a través del `ref` imperativo
 * que expone <VacanteForm>. La alternativa (subir todo el estado del
 * formulario aquí) haría cliente y controlado un formulario que hoy se maneja
 * solo.
 *
 * REPARTO 7/5 sobre 12 columnas: las tarjetas necesitan ancho para su rejilla
 * de datos y sus requisitos a dos columnas; el formulario es una pila de
 * campos y se lee bien más estrecho.
 */

import { useRef } from "react";
import Link from "next/link";
import VacanteForm, { type VacanteFormHandle } from "./VacanteForm";
import { useSmoothScroll } from "./SmoothScroll";
import type { Vacante } from "@/lib/vacantes";

/**
 * Ancho a partir del cual el formulario queda a la vista en su propia columna.
 * Es el `lg` de Tailwind, y tiene que coincidir con el breakpoint de las clases
 * de abajo: por debajo de esto el formulario va DESPUÉS de las vacantes y hay
 * que llevar el scroll hasta él.
 */
const DESKTOP_QUERY = "(min-width: 1024px)";

function VacanteCard({
  vacante,
  onPostularse,
}: {
  vacante: Vacante;
  onPostularse: (puesto: string) => void;
}) {
  // Contraste sobre brand-100: slate-600 6.45:1 y brand-700 8.22:1. El cuerpo
  // NO usa el slate-500 habitual del sitio porque sobre este fondo se queda en
  // 4.05:1 y no pasa AA.
  const DATOS = [
    ["Ubicación", vacante.ubicacion],
    ["Escolaridad", vacante.escolaridad],
    ["Edad", vacante.edad],
    ["Experiencia", vacante.experiencia],
  ] as const;

  return (
    <article className="rounded-3xl bg-brand-100 p-6 md:p-8">
      <h3 className="font-heading text-2xl font-bold text-brand-900">
        {vacante.puesto}
      </h3>

      {/* <dl> y no una lista suelta: cada dato es un par etiqueta-valor, y así
          un lector de pantalla los anuncia emparejados. */}
      <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {DATOS.map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {etiqueta}
            </dt>
            <dd className="mt-1 text-sm text-slate-600">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-brand-900/10 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Requisitos
        </p>
        <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-slate-600 sm:grid-cols-2 sm:gap-x-8">
          {vacante.requisitos.map((requisito) => (
            <li key={requisito}>{requisito}</li>
          ))}
        </ul>
      </div>

      {/* No navega ni envía nada: sólo rellena el selector del formulario. Por
          eso es un <button> y no un enlace. Blanco sobre brand-900: 15.07:1. */}
      <button
        type="button"
        onClick={() => onPostularse(vacante.puesto)}
        className="mt-6 rounded-full bg-brand-900 px-6 py-3 font-heading text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Postularme a este puesto
      </button>
    </article>
  );
}

export default function VacantesBoard({ vacantes }: { vacantes: Vacante[] }) {
  const formRef = useRef<VacanteFormHandle>(null);
  const formColumnRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  /**
   * Preselecciona el puesto y deja al usuario listo para escribir.
   *
   * El scroll es CONDICIONAL y se decide en el clic, no en el render: en
   * desktop el formulario ya está a la vista en su columna sticky, así que
   * moverlo sería desorientador; por debajo de `lg` el formulario vive más
   * abajo en la página y hay que llevar al usuario hasta él.
   *
   * `scrollTo` es el del proyecto: pasa por Lenis con el mismo offset que los
   * anclas del nav, y cuando Lenis está apagado —`prefers-reduced-motion`—
   * cae a un `scrollIntoView()` sin animación. O sea que la preferencia de
   * movimiento reducido se respeta sin comprobarla aquí otra vez.
   *
   * El foco lo mueve <VacanteForm> desde dentro, que es quien sabe cuál de sus
   * campos sigue vacío.
   */
  function postularse(puesto: string) {
    formRef.current?.aplicarPuesto(puesto);

    const esDesktop = window.matchMedia(DESKTOP_QUERY).matches;
    if (!esDesktop && formColumnRef.current) {
      scrollTo(formColumnRef.current);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      {/* NADA DE `overflow` en esta rejilla ni en sus padres: rompería el
          `sticky` de la columna derecha. El único recorte del camino es el
          `overflow-x: clip` de <html> en globals.css, que es `clip` y no
          `hidden` precisamente para no convertirse en contenedor de scroll
          (ver la nota que acompaña a esa regla). */}
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h2
            id="vacantes-disponibles"
            className="mb-6 font-heading text-2xl font-bold text-brand-900 md:text-3xl"
          >
            Vacantes disponibles
          </h2>

          {/* ESTADO VACÍO: la columna NO se colapsa ni el formulario se queda
              solo. Quien llega buscando trabajo necesita saber que la puerta
              sigue abierta, y el formulario de al lado sigue sirviendo porque
              los datos se guardan también para vacantes futuras. */}
          {vacantes.length > 0 ? (
            <div className="grid gap-6">
              {vacantes.map((vacante) => (
                <VacanteCard
                  key={vacante.slug}
                  vacante={vacante}
                  onPostularse={postularse}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-3xl bg-brand-100 p-6 text-slate-600 md:p-8">
              Ahora mismo no tenemos vacantes publicadas. Aun así, puede
              dejarnos sus datos en el formulario: los guardamos para cuando se
              abra una posición que corresponda con su perfil.
            </p>
          )}
        </div>

        <div ref={formColumnRef} className="lg:col-span-5">
          {/* `top-28` (112px) libra el header condensado, que es fixed a 16px
              del borde y mide ~52px de alto. El sticky sólo entra en `lg`: por
              debajo la columna va apilada y no hay nada a lo que fijarse. */}
          <div className="lg:sticky lg:top-28">
            <h2 className="mb-2 font-heading text-2xl font-bold text-brand-900 md:text-3xl">
              Déjenos sus datos
            </h2>
            <p className="mb-6 text-slate-500">
              Los campos marcados con asterisco son obligatorios.
            </p>

            <VacanteForm ref={formRef} vacantes={vacantes} />
          </div>
        </div>
      </div>

      {/* Enlace de cortesía fuera de la rejilla: quien llegó por error tiene la
          salida dentro del propio formulario (ver el aviso de origen), y esto
          es sólo el remate de la página. */}
      <p className="mt-12 text-sm text-slate-500">
        ¿Busca otra cosa? También puede{" "}
        <Link
          href="/proveedores"
          className="font-medium text-brand-900 underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          registrarse como proveedor
        </Link>
        .
      </p>
    </section>
  );
}
