/**
 * TODO: el spec usa "★" como marcador de icono en las 8 tarjetas. Falta el set
 * de iconos real de marca (uno distinto por feature, presumiblemente).
 */
const FEATURES = [
  {
    title: "Red de aliados certificados",
    description:
      "Trabajamos con una red de socios certificados para asegurar soluciones logísticas nacionales e internacionales con estándares de calidad global.",
  },
  {
    title: "Flota propia",
    description:
      "Contamos con unidades propias para ofrecer un transporte de carga terrestre confiable, seguro y puntual en todo México.",
  },
  {
    title: "Atención personalizada",
    description:
      "Supervisamos cada embarque con un enfoque de logística integral, brindando estatus claros y soluciones a la medida de tu negocio.",
  },
  {
    title: "Soluciones a la medida",
    description:
      "Te asesoramos para diseñar la mejor estrategia con el respaldo de nuestros expertos en logística 360.",
  },
  {
    title: "Seguimiento activo",
    description:
      "Monitoreamos cada envío en tiempo real como parte de nuestra logística integral, garantizando seguridad y cumplimiento.",
  },
  {
    title: "Rutas optimizadas",
    description:
      "Aprovechamos nuestro conocimiento para elegir las rutas más eficientes a nivel nacional e internacional.",
  },
  {
    title: "Comunicación clara",
    description:
      "Información precisa y constante para que estés informado del estatus de tus envíos, ya sea de carga consolidada o dedicada.",
  },
  {
    title: "Precios competitivos",
    description:
      "Ofrecemos soluciones logísticas integrales a precios competitivos, sin comprometer la calidad de nuestro servicio.",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="oferta" className="mx-auto max-w-7xl px-6 pb-20">
      <h2 className="mx-auto mb-14 max-w-3xl text-center text-3xl font-bold text-brand-navy-900 md:text-4xl">
        Movemos Tu Carga Con Precisión, Seguridad Y Compromiso
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="rounded-xl border border-slate-100 p-6"
          >
            <p aria-hidden="true" className="mb-3 text-brand-accent">
              ★
            </p>
            <h3 className="mb-2 font-semibold">{feature.title}</h3>
            <p className="text-sm text-slate-500">{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
