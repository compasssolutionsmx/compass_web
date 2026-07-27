import { Plane, Ship, Truck, Warehouse } from "lucide-react";
import Eyebrow from "./Eyebrow";
import { QuoteButton } from "./QuoteModal";
import WorldMapNetwork from "./WorldMapNetwork";

const SERVICES = [
  {
    icon: Plane,
    name: "Aéreo",
    description: "Importación y exportación con tiempos críticos.",
  },
  {
    icon: Ship,
    name: "Marítimo",
    description: "Contenedor completo y consolidado, puerto a puerto.",
  },
  {
    icon: Truck,
    name: "Terrestre",
    description: "Cobertura nacional en carga consolidada y dedicada.",
  },
  {
    icon: Warehouse,
    name: "Almacenamiento",
    description: "Resguardo y manejo de tu inventario.",
  },
];

export default function IntegratedSolutions() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      {/* Caja oscura con el mapa de red detrás. Ya no comparte nada con
          StatsSection, que se queda con su caja clara y la foto del puerto. */}
      <div className="brand-gradient relative overflow-hidden rounded-3xl p-6 md:p-10 lg:p-14">
        {/* --- Capa 1: el mapa. Decorativo, aria-hidden, sin foco. --- */}
        <div className="pointer-events-none absolute inset-0">
          <WorldMapNetwork />
        </div>

        {/* --- Capa 2: velo de legibilidad ---
            Cubre con fuerza sólo el 40% izquierdo, que es donde cae el bloque
            de texto (max-w-2xl), y se abre rápido hacia la derecha para dejar
            ver la red. El velo anterior llegaba al 90% en el centro y al 45% en
            el borde: enterraba el mapa entero.
            Los cuatro stops van explícitos porque un `bg-linear-to-r` de tres
            paradas no permite controlar DÓNDE cae cada una. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(1,27,38,0.94)_0%,rgba(1,27,38,0.86)_40%,rgba(1,27,38,0.28)_66%,rgba(1,27,38,0.05)_100%)]" />

        <div className="relative">
          {/* --- Bloque superior: texto sobre el mapa --- */}
          <div className="max-w-2xl">
            <Eyebrow tone="dark" className="mb-4">
              Sobre Compass Solutions
            </Eyebrow>

            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Soluciones Logísticas Integrales
            </h2>

            <p className="mt-5 text-brand-50">
              Coordinamos importaciones y exportaciones por aire, mar y tierra
              bajo un mismo techo, conectando los puertos, aeropuertos y
              corredores terrestres donde se mueve tu carga. Un solo punto de
              contacto para toda tu operación internacional.
            </p>

            <QuoteButton className="mt-8 rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50">
              Solicite una Cotización
            </QuoteButton>
          </div>

          {/* --- Bloque inferior: los cuatro servicios, en vidrio oscuro --- */}
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <li
                key={service.name}
                className="rounded-2xl border border-white/15 bg-brand-950/60 p-6 backdrop-blur-sm"
              >
                <service.icon
                  aria-hidden="true"
                  className="mb-3 h-7 w-7 text-brand-200"
                />
                <h3 className="font-heading font-semibold text-white">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-brand-50/80">
                  {service.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
