import {
  Headset,
  MessagesSquare,
  Network,
  Radar,
  Route,
  Settings2,
  Tag,
  Truck,
} from "lucide-react";
import Eyebrow from "./Eyebrow";

const FEATURES = [
  {
    icon: Network,
    title: "Red de aliados certificados",
    description:
      "Trabajamos con una red de socios certificados para asegurar soluciones logísticas nacionales e internacionales con estándares de calidad global.",
  },
  {
    icon: Truck,
    title: "Flota propia",
    description:
      "Contamos con unidades propias para ofrecer un transporte de carga terrestre confiable, seguro y puntual en todo México.",
  },
  {
    icon: Headset,
    title: "Atención personalizada",
    description:
      "Supervisamos cada embarque con un enfoque de logística integral, brindando estatus claros y soluciones a la medida de tu negocio.",
  },
  {
    icon: Settings2,
    title: "Soluciones a la medida",
    description:
      "Te asesoramos para diseñar la mejor estrategia con el respaldo de nuestros expertos en logística 360.",
  },
  {
    icon: Radar,
    title: "Seguimiento activo",
    description:
      "Monitoreamos cada envío en tiempo real como parte de nuestra logística integral, garantizando seguridad y cumplimiento.",
  },
  {
    icon: Route,
    title: "Rutas optimizadas",
    description:
      "Aprovechamos nuestro conocimiento para elegir las rutas más eficientes a nivel nacional e internacional.",
  },
  {
    icon: MessagesSquare,
    title: "Comunicación clara",
    description:
      "Información precisa y constante para que estés informado del estatus de tus envíos, ya sea de carga consolidada o dedicada.",
  },
  {
    icon: Tag,
    title: "Precios competitivos",
    description:
      "Ofrecemos soluciones logísticas integrales a precios competitivos, sin comprometer la calidad de nuestro servicio.",
  },
];

export default function FeaturesGrid() {
  return (
    // El padding superior es menor que el `py-20` del resto de secciones a
    // propósito: encima va el cotizador, cuya tarjeta ya aporta 40px de padding
    // interno además del `pb-20` de su sección. Con `pt-20` aquí, el blanco
    // entre la última fila de la tarjeta y este título sumaba ~200px.
    <section
      id="oferta"
      className="mx-auto max-w-7xl px-6 pb-20 pt-4 md:pt-6"
    >
      <Eyebrow className="mb-3 text-center">Por qué Compass Solutions</Eyebrow>
      <h2 className="mx-auto mb-4 max-w-3xl text-center font-heading text-3xl font-bold text-brand-900 md:text-4xl">
        Movemos tu carga con precisión, seguridad y compromiso
      </h2>
      <p className="mx-auto mb-14 max-w-2xl text-center text-slate-500">
        Movemos importaciones y exportaciones por vía aérea, marítima y
        terrestre con despacho aduanal, gestión documental y visibilidad total
        de tu operación en México.
      </p>
      {/* El <li> ES la tarjeta y es hijo directo del grid, así que el
          `align-items: stretch` por defecto ya iguala las alturas de cada fila.
          El `h-full` va explícito como garantía por si alguien añade luego un
          `items-start` o mete un wrapper entre el grid y la tarjeta — que es
          justo lo que rompía esto antes, cuando la tarjeta era un <div> dentro
          del <li> y solo estiraba el <li>, no la tarjeta visible. */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="tech-card h-full p-6">
            <feature.icon
              aria-hidden="true"
              className="mb-3 h-6 w-6 text-brand-900"
            />
            <h3 className="mb-2 font-heading font-semibold">{feature.title}</h3>
            <p className="text-sm text-slate-500">{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
