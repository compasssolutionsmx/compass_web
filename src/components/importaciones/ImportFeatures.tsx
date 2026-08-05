import { Brain, ClipboardCheck, Globe } from "lucide-react";

/**
 * Las tres promesas de la landing. El CONTENIDO es exclusivo de esta página
 * (🆕); lo que se reutiliza es el lenguaje de tarjeta.
 *
 * Estas NO son `.tech-card`. Esa utilidad fija fondo blanco y su glow está
 * calibrado para tarjetas claras sobre página clara; aquí el mockup pide
 * tarjetas OSCURAS. Se replica el mismo gesto —borde que se enciende y sombra
 * al hover— con las clases equivalentes en oscuro, para que se lea como parte
 * del mismo sistema sin romper la utilidad compartida.
 */
const FEATURES = [
  {
    icon: Brain,
    title: "Inteligencia Logística",
    description:
      "No solo transportamos; diseñamos la ruta más eficiente para tu cadena de suministro, mitigando riesgos desde el origen.",
  },
  {
    icon: Globe,
    title: "Capacidad Global",
    description:
      "Conectamos los principales puertos y aeropuertos del mundo con las aduanas más importantes de México.",
  },
  {
    icon: ClipboardCheck,
    title: "Certeza Jurídica",
    description:
      "Expertos en clasificación arancelaria y NOMs. Importa con la tranquilidad de que tu carga cumple con cada regulación vigente.",
  },
];

export default function ImportFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <ul className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="h-full rounded-3xl border border-transparent bg-brand-900 p-8 transition-[border-color,box-shadow] duration-250 hover:border-brand-300 hover:shadow-2xl hover:shadow-brand-950/30 motion-reduce:transition-none"
          >
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/12">
              <feature.icon
                aria-hidden="true"
                className="h-6 w-6 text-brand-100"
              />
            </span>
            <h3 className="font-heading text-lg font-bold text-white">
              {feature.title}
            </h3>
            {/* slate-200 sobre brand-900: 11.4:1. El slate-500 del cuerpo claro
                del sitio aquí daría 2.6:1 y no pasaría. */}
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
