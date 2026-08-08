"use client";

/**
 * Las dos secciones de /apartado-legal, alternadas con tabs.
 *
 * SON TABS ARIA COMPLETAS, no botones con estado. El patrón encaja exactamente:
 * un solo grupo de controles que conmuta entre paneles hermanos y excluyentes,
 * sin navegación ni carga. Lo que eso obliga a implementar, y está implementado:
 *
 *   · `role="tablist"` con `aria-orientation="horizontal"`
 *   · cada botón `role="tab"` + `aria-selected` + `aria-controls`
 *   · cada panel `role="tabpanel"` + `aria-labelledby` apuntando a su tab
 *   · TABINDEX ITINERANTE: sólo la tab activa es tabulable (`tabIndex 0`), las
 *     demás quedan a -1. Es lo que distingue unas tabs de dos botones sueltos:
 *     el Tab del teclado entra al grupo y sale al panel, no recorre las opciones
 *   · flechas ←/→ para moverse, Home/End a los extremos, con activación
 *     automática (mover el foco cambia el panel). La activación automática es la
 *     recomendada cuando mostrar el panel es instantáneo, que es el caso: el
 *     contenido ya está en el cliente
 *   · el panel lleva `tabIndex 0` porque NO contiene nada enfocable y puede
 *     desbordar en alto: sin eso, quien navega con teclado no puede hacerle
 *     scroll
 *
 * EL PANEL INACTIVO SE DESMONTA (no se esconde con CSS). Es lo correcto para el
 * árbol de accesibilidad, pero tiene una consecuencia real que conviene tener
 * escrita: el Ctrl+F del navegador NO encuentra el texto de la pestaña que no
 * está a la vista. En una página legal eso importa, y es el precio de las tabs.
 * Si algún día se decide que prima poder buscar en todo el texto de una vez, el
 * patrón correcto NO es dejar las tabs con los dos paneles montados, sino
 * volver a las dos secciones apiladas.
 *
 * ANCLAS: /apartado-legal#privacidad es el destino del pie y del banner de
 * cookies, así que la pestaña se elige desde `location.hash` al montar. Los ids
 * de los paneles SON esas anclas.
 */

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { COMPROMISOS_SEGURIDAD, INTRO_SEGURIDAD } from "@/lib/nosotros";

type TabId = "privacidad" | "seguridad";

const TABS: { id: TabId; label: string }[] = [
  { id: "privacidad", label: "Aviso de privacidad" },
  { id: "seguridad", label: "Política de seguridad" },
];

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** La pestaña que pide la URL, o `null` si el hash no nombra ninguna. */
function tabDelHash(): TabId | null {
  const hash = window.location.hash.slice(1);
  return hash === "privacidad" || hash === "seguridad" ? hash : null;
}

/**
 * Dato pendiente del cliente. Va VISIBLE y marcado a propósito: es la lista de
 * lo que falta para que este borrador sea un documento real, y quien revise la
 * página tiene que verla sin abrir el código.
 */
function Pendiente({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-950">
      [PENDIENTE: {children}]
    </mark>
  );
}

/** Título de apartado dentro del texto legal. */
function Apartado({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-10 font-heading text-lg font-bold text-brand-900">
      {children}
    </h3>
  );
}

export default function LegalTabs() {
  /**
   * DOS FUENTES, con prioridad clara: manda lo que el usuario haya elegido y,
   * mientras no elija nada, manda el ancla de la URL.
   *
   * El hash se lee con `useSyncExternalStore` y NO con un efecto que llame a
   * `setState`: eso es leer un sistema externo, que es justo para lo que está
   * este hook. El snapshot de servidor devuelve `null` (en el prerender no hay
   * `location`), así que el HTML estático sale siempre con la pestaña de
   * privacidad y React lo reconcilia al hidratar, sin desajuste.
   *
   * LA ELECCIÓN GUARDA CON QUÉ HASH SE HIZO, y caduca en cuanto el hash cambia.
   * Sin eso, el enlace "Aviso de privacidad" del pie —que está DENTRO de esta
   * misma página— no hacía nada si el usuario tenía abierta la otra pestaña: su
   * elección ganaba para siempre y la URL cambiaba sin efecto. Comparar contra
   * el hash con el que se eligió es ajustar estado durante el render, que es lo
   * que React recomienda en vez de un efecto que sincronice.
   */
  const anclaDeLaUrl = useSyncExternalStore(
    subscribeToHash,
    tabDelHash,
    () => null,
  );
  const [elegida, setElegida] = useState<{
    tab: TabId;
    /** El ancla vigente en el momento de elegir. */
    conHash: TabId | null;
  } | null>(null);
  const vigente = elegida?.conHash === anclaDeLaUrl ? elegida.tab : null;
  const activa = vigente ?? anclaDeLaUrl ?? "privacidad";

  const baseId = useId();
  const tabId = (id: TabId) => `${baseId}-tab-${id}`;

  // Las refs de los botones: al mover con las flechas hay que llevar el foco,
  // no sólo cambiar el estado.
  const botones = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const mover = (destino: TabId) => {
    setElegida({ tab: destino, conHash: anclaDeLaUrl });
    botones.current[destino]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === activa);
    if (e.key === "ArrowRight") mover(TABS[(i + 1) % TABS.length].id);
    else if (e.key === "ArrowLeft")
      mover(TABS[(i - 1 + TABS.length) % TABS.length].id);
    else if (e.key === "Home") mover(TABS[0].id);
    else if (e.key === "End") mover(TABS[TABS.length - 1].id);
    else return;
    // Sólo se previene cuando la tecla se ha usado: si no, se rompería el
    // scroll con Home/End en el resto de la página.
    e.preventDefault();
  };

  return (
    <>
      <div
        role="tablist"
        aria-orientation="horizontal"
        aria-label="Secciones del apartado legal"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-3"
      >
        {TABS.map((tab) => {
          const seleccionada = tab.id === activa;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                botones.current[tab.id] = el;
              }}
              id={tabId(tab.id)}
              type="button"
              role="tab"
              aria-selected={seleccionada}
              aria-controls={tab.id}
              tabIndex={seleccionada ? 0 : -1}
              onClick={() =>
                setElegida({ tab: tab.id, conHash: anclaDeLaUrl })
              }
              /* Mismo lenguaje de pastilla que el filtro del blog y los chips
                 del cotizador: activa en brand-900 sólido con blanco encima, en
                 reposo con borde y slate-600 sobre blanco. */
              className={`rounded-full border px-5 py-2.5 font-heading text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 ${
                seleccionada
                  ? "border-brand-900 bg-brand-900 text-white"
                  : "border-slate-300 text-slate-600 hover:border-brand-900 hover:text-brand-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activa === "privacidad" && (
        <section
          // `scroll-mt-28` para que al llegar por el ancla el título no quede
          // debajo del header flotante.
          id="privacidad"
          role="tabpanel"
          aria-labelledby={tabId("privacidad")}
          tabIndex={0}
          className="mt-10 scroll-mt-28"
        >
          {/* BANNER DE BORRADOR. Rompe la paleta a propósito (es el único ámbar
              del sitio): si se pintara con los tokens de marca se leería como
              una nota más del documento en vez de como la advertencia de que
              nada de lo que hay debajo es definitivo. */}
          <p
            role="note"
            className="rounded-2xl border-2 border-amber-600 bg-amber-100 p-4 text-sm leading-relaxed text-amber-950"
          >
            <strong className="font-heading font-bold">Borrador.</strong> Este
            aviso de privacidad es provisional y no constituye el documento
            definitivo de Compass Solutions. Pendiente de revisión y aprobación
            legal.
          </p>

          <h2 className="mt-10 font-heading text-2xl font-bold text-brand-900 md:text-3xl">
            Aviso de privacidad
          </h2>

          <div className="max-w-[68ch] text-slate-600">
            <Apartado>
              Responsable del tratamiento de sus datos personales
            </Apartado>
            <p className="mt-3 leading-relaxed">
              <Pendiente>razón social</Pendiente> (en adelante &laquo;Compass
              Solutions&raquo;), con domicilio en{" "}
              <Pendiente>confirmar domicilio del responsable</Pendiente>, es
              responsable del uso y protección de sus datos personales, en
              cumplimiento de la Ley Federal de Protección de Datos Personales
              en Posesión de los Particulares (LFPDPPP), su Reglamento y demás
              disposiciones aplicables.
            </p>

            <Apartado>Datos personales que recabamos</Apartado>
            <p className="mt-3 leading-relaxed">
              Para las finalidades señaladas en este aviso, podemos recabar sus
              datos de identificación y contacto (nombre, empresa, correo
              electrónico, teléfono) y los datos relacionados con las
              operaciones logísticas que nos solicite. No recabamos datos
              personales sensibles.
            </p>

            <Apartado>Finalidades del tratamiento</Apartado>
            <p className="mt-3 leading-relaxed">
              <strong className="font-semibold text-brand-900">
                Finalidades primarias
              </strong>{" "}
              (necesarias para el servicio): responder a sus solicitudes de
              cotización y contacto; coordinar y dar seguimiento a los servicios
              de logística internacional contratados; y cumplir con las
              obligaciones derivadas de la relación comercial.
            </p>
            <p className="mt-3 leading-relaxed">
              <strong className="font-semibold text-brand-900">
                Finalidades secundarias
              </strong>{" "}
              (no necesarias, puede oponerse): envío de comunicaciones
              informativas, promocionales y de mejora de nuestros servicios. Si
              no desea que sus datos se traten para estas finalidades, puede
              manifestarlo escribiéndonos al correo indicado más abajo.
            </p>

            <Apartado>Transferencia de datos</Apartado>
            <p className="mt-3 leading-relaxed">
              Sus datos personales podrán ser transferidos a terceros (como
              agentes aduanales, transportistas y aliados operativos) únicamente
              cuando sea necesario para prestar el servicio que usted solicita.
              Estas transferencias no requieren de su consentimiento conforme al
              artículo 37 de la LFPDPPP.
            </p>

            <Apartado>Medios para ejercer sus derechos ARCO</Apartado>
            <p className="mt-3 leading-relaxed">
              Usted tiene derecho a acceder, rectificar, cancelar u oponerse al
              tratamiento de sus datos personales (derechos ARCO), así como a
              revocar su consentimiento. Para ejercerlos, envíe su solicitud a{" "}
              <Pendiente>correo del área de datos personales</Pendiente>,
              indicando su nombre y el derecho que desea ejercer.
            </p>

            <Apartado>Cambios al aviso de privacidad</Apartado>
            <p className="mt-3 leading-relaxed">
              Este aviso puede sufrir modificaciones. Cualquier cambio se
              publicará en esta misma página.
            </p>

            <p className="mt-10 text-sm">
              Última actualización: <Pendiente>fecha de publicación</Pendiente>
            </p>
          </div>
        </section>
      )}

      {activa === "seguridad" && (
        <section
          id="seguridad"
          role="tabpanel"
          aria-labelledby={tabId("seguridad")}
          tabIndex={0}
          className="mt-10 scroll-mt-28"
        >
          <h2 className="font-heading text-2xl font-bold text-brand-900 md:text-3xl">
            Política de seguridad
          </h2>

          {/* Los diez compromisos y su entradilla SE IMPORTAN de lib/nosotros:
              son el mismo texto que publica /nosotros, y dos copias a mano se
              desincronizarían. */}
          <p className="mt-4 max-w-[68ch] text-slate-600">
            {INTRO_SEGURIDAD}
          </p>

          {/* <ol> y no <ul>: los diez van numerados en el documento del cliente
              y el orden es parte del contenido. El número visible va
              `aria-hidden` porque la lista ya numera sola. */}
          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            {COMPROMISOS_SEGURIDAD.map((compromiso, i) => (
              <li
                key={compromiso.titulo}
                className="tech-card flex gap-4 p-5 md:p-6"
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 font-heading text-xl font-bold text-brand-600"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading font-bold text-brand-900">
                    {compromiso.titulo}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {compromiso.texto}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
