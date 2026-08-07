import Image from "next/image";
import { Plane, Ship, Truck, Warehouse } from "lucide-react";
import { QuoteButton } from "../QuoteModal";

/**
 * "Soluciones logísticas a la vanguardia". Cuatro tarjetas póster.
 *
 * REUTILIZACIÓN PARCIAL (♻️ 3 de 4): las tres primeras comparten categoría con
 * los pósters de <ServicesGrid> del home y REUSAN SUS MISMAS FOTOS, que es lo
 * que pedían las notas antes de generar arte nuevo. Lo que no se reutiliza es
 * el componente: allá cada tarjeta es un <Link> a la página del servicio y
 * lleva chips con las opciones del árbol; aquí cada tarjeta termina en el
 * cotizador y el copy es de campaña. Comparten el lenguaje visual —foto,
 * velo de abajo hacia arriba, texto en la franja inferior— no el código.
 *
 * "Servicios Adicionales" es la categoría nueva (🆕) y no tiene foto: usa
 * `brand-gradient` con el mismo formato, igual que hace el home con Almacenaje,
 * para que se lea como parte del set y no como la que falta.
 */
const SOLUTIONS = [
  {
    icon: Plane,
    title: "Transportación aérea",
    description:
      "Logística de respuesta rápida para sus cargas de alta prioridad.",
    image: { src: "/servicios/transportacion-aerea.webp", w: 1080, h: 720 },
  },
  {
    icon: Ship,
    title: "Transportación marítima",
    description:
      "Gestión de contenedores completos (FCL) y carga consolidada (LCL).",
    image: { src: "/servicios/transporte-maritimo-fcl.webp", w: 1920, h: 960 },
  },
  {
    icon: Truck,
    title: "Transportación terrestre",
    description:
      "Infraestructura robusta para cruces fronterizos y distribución nacional.",
    image: { src: "/servicios/transporte-terrestre-ltl.webp", w: 1080, h: 720 },
  },
  {
    icon: Warehouse,
    title: "Servicios adicionales",
    description:
      "Gestión técnica de punta a punta como seguros de carga internacional y cumplimiento de NOMs.",
    // TODO(assets): si llega foto de almacén, se cablea aquí y nada más cambia.
    image: null,
  },
];

export default function ImportSolutions() {
  return (
    <section
      aria-labelledby="soluciones-titulo"
      className="mx-auto max-w-7xl px-6 py-20"
    >
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2
          id="soluciones-titulo"
          className="font-heading text-3xl font-bold text-brand-900 md:text-4xl"
        >
          Soluciones logísticas a la vanguardia
        </h2>
        <p className="mt-4 text-slate-500">
          En <strong className="font-semibold">Compass Solutions</strong>{" "}
          brindamos soluciones logísticas globales que incentivan el crecimiento
          de su compañía, coordinando toda la cadena de suministro de forma
          integral y transparente.
        </p>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((solution) => (
          <li
            key={solution.title}
            className={`relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-2xl border border-white/15 ${
              solution.image ? "" : "brand-gradient"
            }`}
          >
            {solution.image && (
              <>
                {/* `alt=""`: la foto es decorativa, el <h3> ya nombra el
                    servicio. */}
                <Image
                  src={solution.image.src}
                  alt=""
                  width={solution.image.w}
                  height={solution.image.h}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Mismo velo que los pósters del home: al 95% en la franja del
                    texto, medido ahí contra 15.6:1 en el peor píxel. */}
                <div className="absolute inset-0 bg-linear-to-t from-brand-950/95 via-brand-950/55 to-transparent" />
              </>
            )}

            <div className="relative p-5">
              <solution.icon
                aria-hidden="true"
                className="mb-2 h-5 w-5 text-brand-200"
              />
              <h3 className="font-heading text-lg font-bold text-white">
                {solution.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                {solution.description}
              </p>
              <QuoteButton className="mt-4 rounded-full bg-white px-5 py-2.5 font-heading text-xs font-semibold text-brand-900 transition-colors hover:bg-brand-50">
                Solicitar cotización
              </QuoteButton>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
