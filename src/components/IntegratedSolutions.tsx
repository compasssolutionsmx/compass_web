import Image from "next/image";
import { QuoteButton } from "./QuoteModal";

const CAPABILITIES = [
  "Transportación Aérea",
  "Transportación Terrestre",
  "Almacenamiento",
  "Servicio Nacional e Internacional",
];

export default function IntegratedSolutions() {
  return (
    <section className="bg-brand-navy-950 py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div className="overflow-hidden rounded-2xl">
          {/* PLACEHOLDER — TODO: reemplazar el `src` con la foto real
              (camión en carretera) y quitar `unoptimized`. */}
          <Image
            src="https://placehold.co/800x600/0E2A42/0E2A42?text=+"
            alt="Camión Compass Solutions en carretera"
            width={800}
            height={600}
            sizes="(min-width: 768px) 50vw, 100vw"
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>

        <div className="text-white">
          <p className="mb-3 text-sm font-semibold text-brand-accent">
            Expertos en Logística 360: de la A a la Z
          </p>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Soluciones Logísticas Integrales
          </h2>
          <ul className="mb-6 grid grid-cols-2 gap-4 text-sm">
            {CAPABILITIES.map((capability) => (
              <li key={capability} className="rounded-lg bg-white/10 p-4">
                {capability}
              </li>
            ))}
          </ul>
          <p className="mb-8 text-slate-300">
            La logística no tiene por qué ser complicada. En Compass Solutions,
            cubrimos todas tus necesidades logísticas, de principio a fin, con
            una solución, un socio y una cadena de suministro fluida, lo que te
            permite centrarte en lo que mejor hace tu negocio.
          </p>
          <QuoteButton className="rounded-full border border-white px-7 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-brand-navy-950">
            Solicite una Cotización
          </QuoteButton>
        </div>
      </div>
    </section>
  );
}
