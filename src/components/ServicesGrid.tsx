import Image from "next/image";
import Link from "next/link";

/**
 * Los `href` son los del spec tal cual.
 * TODO: varios apuntan a una categoría que no coincide obviamente con el
 * título (p. ej. "Nacional" -> /tipo-solucion/transporte-aereo, "Expeditado"
 * -> /tipo-solucion/especializados-maritimo). Confirmar si es intencional o un
 * error del sitio actual antes del cutover.
 *
 * PLACEHOLDERS — TODO: reemplazar todos los `image` con las fotos reales de
 * cada servicio y quitar `unoptimized` de <Image>.
 */
const SERVICES = [
  {
    href: "/tipo-solucion/soluciones-360",
    title: "Portacontenedor",
    description:
      "Contamos con servicios Sencillos y full desde y hasta cualquier puerto de México.",
    image: "https://placehold.co/600x400/e2e8f0/475569?text=Portacontenedor",
  },
  {
    href: "/tipo-solucion/soluciones-360",
    title: "Internacional",
    description:
      "Importación y Exportación desde cualquier origen y hacia cualquier destino, adaptándonos a tus necesidades de urgencia y las de tu carga.",
    image: "https://placehold.co/600x400/e2e8f0/475569?text=Internacional",
  },
  {
    href: "/tipo-solucion/transporte-aereo",
    title: "Nacional",
    description:
      "Acortamos distancias y tiempos con entregas aéreas nacionales con vuelos comerciales.",
    image: "https://placehold.co/600x400/e2e8f0/475569?text=Nacional",
  },
  {
    href: "/tipo-solucion/especializados-terrestre",
    title: "Prioritario",
    description:
      "Si tienes un paro de línea en puerta podemos ayudarte con la mejor solución en tiempos y rutas de acuerdo al tiempo en que requieras tu carga.",
    image: "https://placehold.co/600x400/e2e8f0/475569?text=Prioritario",
  },
  {
    href: "/tipo-solucion/especializados-maritimo",
    title: "Expeditado",
    description:
      "¿Tienes una urgencia? Podemos responder a ella. Solicita una cotización para un servicio en menos de 3 horas.",
    image: "https://placehold.co/600x400/e2e8f0/475569?text=Expeditado",
  },
  {
    href: "/tipo-solucion/transporte-terrestre",
    title: "Transporte terrestre consolidado (LTL)",
    description:
      "Para ahorrar en tus envíos terrestres nacionales, ofrecemos soluciones menores a un camión completo con tiempos competitivos del mercado.",
    image: "https://placehold.co/600x400/e2e8f0/475569?text=LTL",
  },
  {
    href: "/tipo-solucion/transporte-terrestre",
    title: "Transporte terrestre dedicado (FTL)",
    description:
      "Garantizamos un transporte de carga terrestre seguro y puntual en todo México. Flota propia, monitoreo en tiempo real y cobertura nacional.",
    image: "https://placehold.co/600x400/e2e8f0/475569?text=FTL",
  },
  {
    href: "/tipo-solucion/transporte-maritimo",
    title: "Transporte Marítimo Completo (FCL)",
    description:
      "Soluciones de transporte marítimo en contenedores completos para grandes volúmenes, con rutas directas y gestión aduanal eficiente.",
    image: "https://placehold.co/600x400/e2e8f0/475569?text=FCL",
  },
];

export default function ServicesGrid() {
  return (
    <section id="soluciones" className="mx-auto max-w-7xl px-6 py-20">
      <p className="mb-3 text-center text-sm font-semibold tracking-wide text-brand-accent">
        SERVICIOS Y SOLUCIONES
      </p>
      <h2 className="mb-4 text-center text-3xl font-bold text-brand-navy-900 md:text-4xl">
        UN SOCIO. TODAS LAS SOLUCIONES.
      </h2>
      <p className="mx-auto mb-14 max-w-2xl text-center text-slate-500">
        En Compass Solutions brindamos soluciones logísticas globales y locales
        que permiten el crecimiento de pequeñas y grandes empresas. No importa
        desde ni a donde quieras llegar, nosotros lo podemos lograr.
      </p>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <li key={service.title}>
            <Link
              href={service.href}
              className="group block h-full overflow-hidden rounded-xl border border-slate-100"
            >
              <Image
                src={service.image}
                alt={service.title}
                width={600}
                height={400}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                unoptimized
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="mb-1 font-semibold">{service.title}</h3>
                <p className="text-sm text-slate-500">{service.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
