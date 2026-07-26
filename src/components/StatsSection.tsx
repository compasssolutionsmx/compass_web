import Image from "next/image";
import AnimatedCounter from "./AnimatedCounter";

/* ---------------------------------------------------------------------------
   VALORES DE LOS CONTADORES ANIMADOS — editar aquí.

   TODO: cifras reales pendientes. En el sitio actual estos contadores arrancan
   en 0 y suben por JS; el spec no documenta el valor final, así que NO se
   inventan. Sustituir por los números reales cuando los confirme el cliente.
   --------------------------------------------------------------------------- */
const OPERATIONS_COUNT = 0; // se renderiza como "+{n}k"
const PARTNERS_COUNT = 0; // se renderiza como "+{n}"

/**
 * Stat estático (no animado) sobre la foto.
 * TODO: confirmar si "4.1%" es un dato fijo o también debería ser dinámico.
 */
const EFFECTIVENESS_STAT = "4.1%";

export default function StatsSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2 md:items-stretch">
      <div className="relative overflow-hidden rounded-2xl">
        {/* PLACEHOLDER — TODO: reemplazar el `src` con la foto real
            (trabajadores con chaleco revisando tablet en patio de carga)
            y quitar `unoptimized`. */}
        <Image
          src="https://placehold.co/900x600/e2e8f0/475569?text=Foto%3A+equipo+en+operaci%C3%B3n"
          alt="Equipo Compass Solutions en operación"
          width={900}
          height={600}
          sizes="(min-width: 768px) 50vw, 100vw"
          unoptimized
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 rounded-tr-2xl bg-white px-6 py-4">
          <p className="text-3xl font-bold text-brand-navy-900">
            {EFFECTIVENESS_STAT}
          </p>
          <p className="max-w-[180px] text-xs text-slate-500">
            Efectividad en servicios expeditados solicitados por nuestros
            clientes.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-6">
        <div className="rounded-2xl bg-brand-teal-800 p-8 text-white">
          <p className="text-4xl font-bold">
            +<AnimatedCounter target={OPERATIONS_COUNT} />k
          </p>
          <p className="mt-2 text-slate-200">
            Operaciones aéreas, marítimas y terrestres realizadas con éxito.
          </p>
        </div>
        <div className="rounded-2xl bg-brand-teal-800 p-8 text-white">
          <p className="text-4xl font-bold">
            +<AnimatedCounter target={PARTNERS_COUNT} />
          </p>
          <p className="mt-2 text-slate-200">
            Asociados de negocio alineados a nuestros estándares de servicio.
          </p>
        </div>
      </div>
    </section>
  );
}
