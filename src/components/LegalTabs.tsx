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
 * Título de apartado dentro del texto legal.
 *
 * ES h3 Y NO h2: el h1 lo pinta el hero de la página y el h2 es el título del
 * panel ("Aviso de privacidad"), así que los apartados numerados del documento
 * cuelgan de él sin saltarse un nivel.
 *
 * El texto va TAL CUAL viene del documento —numeral romano y versalitas
 * incluidos—, aunque el resto del sitio escriba los títulos en sentence case:
 * es un documento legal y no se reescribe por consistencia de estilo.
 */
function Apartado({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-10 font-heading text-lg font-bold text-brand-900">
      {children}
    </h3>
  );
}

/** Párrafo del texto legal. */
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed">{children}</p>;
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
          <h2 className="font-heading text-2xl font-bold text-brand-900 md:text-3xl">
            Aviso de privacidad
          </h2>

          {/* TEXTO LEGAL LITERAL. Todo lo que hay dentro de este bloque es
              transcripción del documento que entregó el cliente: no se corrige
              la redacción, ni la puntuación, ni el tratamiento (el documento
              habla del "Titular" en tercera persona, no de "usted"), ni los
              títulos en versalitas. Si algo aquí ha de cambiar, cambia primero
              en el documento. */}
          <div className="max-w-[68ch] text-slate-600">
            <P>
              El tratamiento legítimo, controlado e informado de sus Datos
              Personales es de vital importancia para alcanzar los objetivos
              corporativos de Compass Solutions, S.A. de C.V. (en adelante
              &ldquo;LA EMPRESA&rdquo;), a través de todas las áreas de negocio
              reiteramos nuestro compromiso con su privacidad y el derecho a la
              autodeterminación informativa, por lo que, en cumplimiento a lo
              establecido en la Ley Federal de Protección de Datos Personales en
              Posesión de los Particulares (en adelante &ldquo;la
              LFPDPPP&rdquo;), ponemos a su disposición nuestro AVISO DE
              PRIVACIDAD.
            </P>
            <P>
              El Aviso de Privacidad aplicará para todos los productos,
              servicios, programas, y/o sitios web, que tenga LA EMPRESA, de
              acuerdo con la naturaleza de los Datos Personales recabados y
              conforme a la legislación vigente y aplicable en materia de
              privacidad y protección de Datos Personales. LA EMPRESA podrá
              publicar nuevos Avisos de Privacidad específicos o actualizaciones
              y para los cuales se podrá requerir o no, del consentimiento
              expreso del Titular de los Datos Personales (en adelante &ldquo;el
              Titular&rdquo;), sin embargo, a través de la página de internet
              www.compasssolutions.com.mx, se harán del conocimiento público las
              políticas de privacidad aplicables a los Datos Personales que nos
              hayan sido otorgados.
            </P>

            <Apartado>I. NOMBRE Y DOMICILIO DEL RESPONSABLE</Apartado>
            <P>
              Para efectos de la divulgación y tratamiento de los Datos
              Personales que el Titular haya divulgado o pudiera llegar a
              divulgar a LA EMPRESA, a través de diversos medios y formas
              incluyendo de manera enunciativa más no limitativamente sitios de
              internet, herramientas tecnológicas, o directamente a nuestros
              representantes, derivado de la relación comercial o posible
              relación comercial que exista o llegaré a existir entre LA EMPRESA
              y el Titular, así como por el uso de nuestros productos y/o
              servicios, o para cualquier actividad relacionada, se considerará
              que el responsable es LA EMPRESA, la cual es una sociedad
              constituida de conformidad con las leyes de la República Mexicana,
              con domicilio ubicado en calle Heriberto Frías número 1439
              interior 401-403, colonia del Valle, código postal 03100, alcaldía
              Benito Juárez, en la Ciudad de México.
            </P>
            <P>
              Para cualquier información sobre este Aviso de Privacidad, o para
              el ejercicio de cualquiera de sus derechos derivados de sus Datos
              Personales, incluyendo sin limitación sus derechos de acceso,
              rectificación, cancelación y oposición (derechos ARCO), contactar
              a nuestro Departamento de Privacidad a través del correo
              electrónico avisodeprivacidad@compasssolutions.com.mx.
            </P>

            <Apartado>II. DATOS PERSONALES QUE SE RECABAN</Apartado>
            <P>
              Para llevar a cabo las finalidades descritas en el presente Aviso
              de Privacidad LA EMPRESA, con base en la relación jurídica o no
              jurídica que exista con el Titular, podrá recabar los Datos
              Personales, entre los cuales de manera enunciativa más no
              limitativamente se encuentran:
            </P>
            <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
              <li>Nombre completo</li>
              <li>Edad</li>
              <li>Fecha de nacimiento</li>
              <li>Domicilio</li>
              <li>Correo electrónico</li>
              <li>
                Número (s) telefónico de contacto, móvil, trabajo, particular
              </li>
              <li>IFE o INE</li>
              <li>Registro Federal de Contribuyentes (RFC)</li>
              <li>Cuentas de redes sociales</li>
              <li>Dirección de IP</li>
            </ul>

            <Apartado>
              III. FINALIDADES PARA EL USO DE LOS DATOS PERSONALES
            </Apartado>
            <P>
              Los Datos Personales que recabamos del Titular, son necesarios
              para el cumplimiento de las obligaciones, la relación y/o la
              prestación de servicios que exista o pudiera llegar a existir
              entre el Titular y LA EMPRESA, siendo este último quien los
              utiliza, almacena, transmite o transfiere en la medida en que la
              Ley lo permite, para cumplir con las obligaciones derivadas de la
              relación jurídica o no jurídica que exista o llegaré a existir con
              el Titular.
            </P>
            <P>
              A continuación, enlistamos de manera enunciativa más no
              limitativamente las finalidades para las que trataremos sus Datos
              Personales:
            </P>
            <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
              <li>Identificación</li>
              <li>Contacto</li>
              <li>Localización</li>
              <li>Cobranza</li>
              <li>Cumplimiento de obligaciones contractuales</li>
              <li>Fines estadísticos</li>
              <li>Rectificar vínculo comercial</li>
              <li>
                Fines de seguridad: transferir para el reconocimiento, ejercicio
                o defensa de un derecho en un proceso judicial. Cuando sean
                requeridos por las instituciones públicas, financieras,
                autoridades gubernamentales, administrativas y/o judiciales
                locales o federales
              </li>
              <li>
                Envío de información, notificaciones, avisos, noticias,
                propaganda o publicidad sobre nuestros productos o servicios
              </li>
              <li>
                Envío de notificaciones de cambios a este aviso de privacidad
              </li>
            </ul>

            <Apartado>
              IV. TRANSFERENCIA Y REMISIÓN DE LOS DATOS PERSONALES
            </Apartado>
            <P>
              Como parte de las operaciones propias del negocio y a fin de
              cumplir con las finalidades descritas, LA EMPRESA, podrá compartir
              con terceros nacionales o extranjeros, algunos o todos sus Datos
              Personales.
            </P>
            <P>
              LA EMPRESA se asegurará a través de la firma de convenios y la
              adopción de otros documentos vinculantes, que dichos terceros
              mantengan medidas de seguridad, administrativas, técnicas y
              físicas adecuadas para resguardar sus datos personales, así como
              que dichos terceros únicamente utilicen sus Datos Personales para
              las finalidades para los cuales fueron recabados y de conformidad
              con el presente Aviso de Privacidad.
            </P>
            <P>
              LA EMPRESA podrá compartir todos o parte de sus Datos Personales
              con entidades autorizadas de acuerdo con la Legislación Mexicana
              para la supervisión en la realización de las actividades y
              operaciones relacionadas con nuestros productos y/o servicios,
              quienes podrán o no tratar sus Datos Personales por cuenta de LA
              EMPRESA, conforme a las finalidades y usos previstos en el
              presente Aviso de Privacidad.
            </P>
            <P>
              Asimismo, LA EMPRESA se reserva el derecho de compartir sus Datos
              Personales con autoridades administrativas, judiciales o
              gubernamentales de cualquier tipo en los Estados Unidos Mexicanos.
            </P>
            <P>
              LA EMPRESA podrá transferir sus Datos Personales a asesores y
              prestadores de servicio de cobranza, asesores profesionales
              externos y otros prestadores que ofrezcan servicios, soporte
              técnico, tecnologías de la información y en general, cualquier
              tercero que actúe como encargado a nombre y por cuenta de LA
              EMPRESA.
            </P>

            <Apartado>V. MECANISMOS DE SEGURIDAD</Apartado>
            <P>
              LA EMPRESA cuenta con las medidas de seguridad, técnicas,
              administrativas y físicas necesarias para procurar la integridad
              de sus Datos Personales y evitar su daño, pérdida, alteración,
              destrucción o el uso, acceso o tratamiento no autorizado.
            </P>
            <P>
              Únicamente el personal autorizado de LA EMPRESA que ha cumplido y
              observado los correspondientes requisitos de confidencialidad,
              podrá participar en el tratamiento de sus Datos Personales. El
              personal autorizado tiene prohibido permitir el acceso de personas
              no autorizadas y utilizar sus Datos Personales para fines
              distintos a los establecidos en el presente Aviso de Privacidad.
              La obligación de confidencialidad de las personas que participan
              en el tratamiento de sus Datos Personales subsiste aun después de
              terminada la relación con LA EMPRESA.
            </P>

            <Apartado>VI. ALMACENAMIENTO DE SUS DATOS PERSONALES</Apartado>
            <P>
              LA EMPRESA podrá conservar sus Datos Personales en sus bases de
              datos ubicadas en los Estados Unidos Mexicanos o en el extranjero
              sin limitación alguna, en el entendido de que se cuenta con
              políticas y estándares comerciales razonables de tecnología y
              seguridad para proteger la información que nos haya sido
              proporcionada.
            </P>
            <P>
              LA EMPRESA se reserva el derecho a modificar los términos y
              condiciones de este Aviso de Privacidad, en cuyo caso la
              modificación se notificará a través del medio de comunicación que
              LA EMPRESA considere más adecuado para tal efecto pudiendo ser a
              través de correo electrónico, avisos en medios de comunicación,
              comunicación directa, y/o un anuncio en nuestra página de internet
              o en nuestra sucursal.
            </P>
            <P>
              LA EMPRESA, así como el Titular, reconocen que este Aviso de
              Privacidad es de vigencia ilimitada. Sin embargo, LA EMPRESA
              mantendrá actualizado el presente Aviso de Privacidad.
            </P>
            <P>
              LA EMPRESA, recomienda al Titular que vuelva a leer con
              regularidad este documento, de forma que se mantenga siempre
              informado sobre eventuales modificaciones.
            </P>
            <P>
              Las alteraciones o modificaciones al presente Aviso de Privacidad
              se volverán efectivas inmediatamente después de su publicación en
              la página de internet de LA EMPRESA (www.compasssolutions.com.mx),
              sin perjuicio del uso de algún otro medio para que LA EMPRESA dé
              las mencionadas publicaciones. Una vez realizadas las
              modificaciones, se presumirá que el Titular que continúe usando la
              página de internet (www.compasssolutions.com.mx), solicitado los
              servicios, o realizando los actos que dieron origen a su relación
              con LA EMPRESA, tendrá pleno conocimiento, habrá leído y consentido
              el Aviso de Privacidad reformado.
            </P>

            <Apartado>VII. CONSENTIMIENTO</Apartado>
            <P>
              El Titular manifiesta y consiente el presente Aviso de Privacidad,
              de conformidad con la Ley de Protección de Datos Personales en
              Posesión de los Particulares, no oponiéndose al Aviso de
              Privacidad. Ninguno de los Datos Personales será tratado sino
              hasta 2 (dos) días después de que hayan sido proporcionados por el
              Titular y este no haya manifestado su negativa.
            </P>

            <Apartado>VIII. DERECHOS ARCO</Apartado>
            <P>
              El Titular podrá solicitar acceder a sus Datos Personales,
              rectificarlos, cancelarlos, oponerse, limitar su uso o divulgación
              o revocar su consentimiento, en términos de la LFPDPPP y demás
              disposiciones aplicables.
            </P>
            <P>
              Para ejercer estos derechos, el Titular deberá contactar al
              Departamento de Privacidad, al correo electrónico que aparecen
              anteriormente en nuestros datos de contacto. En términos de la ley
              aplicable, cualquier solicitud de ejercicio de los derechos ARCO
              mencionados deberá indicar los siguientes requisitos
              indispensables para dar respuesta a su solicitud:
            </P>
            <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">
              <li>Nombre y domicilio.</li>
              <li>
                Los documentos que acrediten su identidad o, en su caso, la
                representación legal de la persona que realiza la solicitud a su
                nombre.
              </li>
              <li>
                La descripción clara y precisa de los Datos Personales a los que
                desea acceder o que desea rectificar, cancelar u oponerse y
                cualquier otro elemento que facilite la localización de sus
                datos.
              </li>
              <li>
                Cualquier otro requisito establecido por la LFPDPPP y/o demás
                disposiciones aplicables.
              </li>
            </ol>
            <P>
              En cualquier momento el Titular podrá solicitar que se suspenda o
              cancele el envío de mensajes o avisos comerciales e información de
              nuevos productos, a través de nuestro Departamento de Privacidad.
              En caso de solicitar la rectificación de datos personales,
              adicionalmente deberá indicar las modificaciones a realizarse y
              aportar la documentación que sustente su petición.
            </P>
            <P>
              La respuesta a su solicitud se le comunicará en un plazo de 15
              (quince) días hábiles, contados a partir de la fecha en que se
              recibió la solicitud, pudiendo ampliarse 5 (cinco) días más en los
              casos en los que así lo establezca la LFPDPPP; a efecto de que en
              caso de resultar procedente, se lleven a cabo las medidas
              necesarias para cumplir con su solicitud, mismas que se llevarán a
              cabo dentro de los 15 (quince) días hábiles siguientes a la fecha
              en que se le comunique al Titular la respuesta a su solicitud.
            </P>
            <P>
              El Titular de los Datos Personales, deberá cubrir los gastos
              justificados de envío o el costo de reproducción en copias u otros
              formatos. En el caso de requerirse envío físico de información, LA
              EMPRESA requerirá un domicilio para dicho envió. En el caso de que
              él envió de la información sea de forma electrónica LA EMPRESA
              requerirá un correo electrónico.
            </P>
            <P>La Solicitud no será válida ante la omisión de lo señalado anteriormente.</P>
            <P>
              Cuando los Datos Personales hayan dejado de ser necesarios para el
              cumplimiento de las finalidades previstas por este Aviso de
              Privacidad y las disposiciones legales aplicables, deberán ser
              cancelados, bloqueados y suprimidos por ministerio de Ley.
            </P>
            <P>
              En caso de que el Titular haya solicitado el derecho de oposición
              al tratamiento de sus Datos Personales, LA EMPRESA considerará lo
              siguiente:
            </P>
            <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">
              <li>
                Que exista causa legítima y la situación específica así lo
                requiera, lo cual deberá justificar que aun siendo lícito el
                tratamiento, el mismo debe cesar para evitar que su persistencia
                cause un perjuicio al Titular.
              </li>
              <li>
                Que requiera manifestar su oposición para el tratamiento de sus
                Datos Personales a fin de que no se lleve a cabo el tratamiento
                para fines específicos.
              </li>
              <li>
                Que el tratamiento no sea necesario para el cumplimiento de una
                obligación legal impuesta a LA EMPRESA.
              </li>
            </ol>
            <P>
              En caso de haber ejercido el derecho de oposición al tratamiento
              de sus Datos Personales, LA EMPRESA mandará a un Listado de
              Exclusión los Datos Personales de conformidad con la LFPDPPP.
            </P>

            <Apartado>
              IX. PROCEDIMIENTOS PARA EL BLOQUEO Y LA SUPRESIÓN DE LOS DATOS
              PERSONALES
            </Apartado>
            <P>
              Una vez que los Datos Personales hayan sido cancelados, LA EMPRESA
              conservará un mes más los Datos Personales del Titular, para fines
              de aclaraciones y preparación para la supresión una vez vencido
              este plazo, LA EMPRESA bloqueará de manera definitiva los Datos
              Personales del Titular, no teniendo oportunidad nuevamente de
              localización ni contacto con el Titular.
            </P>
            <P>
              Si el Titular llegare a realizar otro acto con LA EMPRESA, deberá
              iniciarlo como si la relación nunca hubiese existido.
            </P>
            <P>
              Lo anterior, observando lo señalado en las Políticas de Privacidad
              para efectos de conservar información por ministerio de ley o de
              autoridad.
            </P>
            <P>
              Los Datos Personales que hayan cumplido con sus fines, pero que no
              puedan ser cancelados y/o suprimidos por ministerio de ley o por
              la relación contractual existente, serán bloqueados de los fines a
              los que eran sometidos, hasta que se puedan suprimir. Durante
              dicho periodo, los Datos Personales no podrán ser objeto de
              tratamiento mayor a la conservación y resguardo.
            </P>

            <Apartado>X. REVOCACIÓN DEL CONSENTIMIENTO</Apartado>
            <P>
              El consentimiento podrá ser revocado en cualquier momento sin que
              se le atribuyan efectos retroactivos. Para revocar el
              consentimiento el Titular debe de enviar una solicitud por escrito
              al correo electrónico avisodeprivacidad@compasssolutions.com.mx
              con los siguientes requisitos:
            </P>
            <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
              <li>Nombre del Titular</li>
              <li>Domicilio al que se le enviará la respuesta a su solicitud</li>
              <li>
                Los documentos que acrediten la identidad del Titular, IFE (INE)
                y/o PASAPORTE, o en su caso, la representación legal del Titular
              </li>
              <li>
                La descripción clara y precisa del vínculo que tiene con LA
                EMPRESA.
              </li>
              <li>Aportar la documentación que sustente su petición</li>
              <li>La solicitud deberá estar dirigida a LA EMPRESA.</li>
              <li>
                Documentos que acrediten que la relación jurídica que sostenía
                con LA EMPRESA, ha terminado
              </li>
            </ul>
            <P>
              LA EMPRESA emitirá una respuesta en la cual confirmará la
              revocación del consentimiento del Titular, o en su caso, señalará
              el razonamiento dependiendo del caso en concreto, contando con 15
              (quince) días para emitir esta respuesta. Los plazos serán
              contados a partir del momento en que la solicitud enviada a través
              de correo electrónico entre en nuestro servidor, emitiendo LA
              EMPRESA el respectivo Acuse de Recibido de Solicitud.
            </P>
            <P>
              Cualquier solicitud ulterior a la mencionada en el párrafo
              anterior tendrá el mismo efecto que una de inicio, estando el
              Titular y LA EMPRESA, obligadas a los mismos plazos señalados
              anteriormente.
            </P>
            <P>
              La solicitud no será válida ante la omisión de lo señalado
              anteriormente.
            </P>

            <Apartado>XI. JURISDICCIÓN</Apartado>
            <P>
              Este Aviso de Privacidad, el tratamiento de sus Datos Personales
              y/o todos los documentos relacionados se rigen por la LFPDPPP y
              las demás leyes y reglamentos de los Estados Unidos Mexicanos.
            </P>
            <P>
              La aceptación de este Aviso de Privacidad o la simple solicitud de
              servicios una vez publicado y puesto a disposición el presente
              Aviso de Privacidad implica una aceptación expresa por parte del
              Titular de los términos del mismo y su sometimiento expreso a los
              tribunales competentes de la Ciudad de México, para cualquier
              controversia o reclamación derivada de este Aviso de Privacidad.
            </P>
            <P>
              Manifiesto que he leído y entiendo el presente Aviso de Privacidad
              y otorgo mi consentimiento, para los casos en que es necesario,
              para el tratamiento de mis Datos Personales en los términos del
              presente. Confirmo que he informado a las personas de las cuales
              he proporcionado Datos Personales, sobre el tratamiento que se
              hará de sus Datos Personales.
            </P>
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
