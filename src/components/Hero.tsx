import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-navy-950">
        {/* PLACEHOLDER — TODO: reemplazar el `src` con la foto real de
            puerto/buque cuando tengamos los assets, y quitar `unoptimized`. */}
        <Image
          src="https://placehold.co/1920x900/0A2035/0A2035?text=+"
          alt="Puerto de carga internacional"
          width={1920}
          height={900}
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          unoptimized
          className="h-full w-full object-cover opacity-60"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-40">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white md:text-6xl">
          Impulsamos su Crecimiento Global
        </h1>
        <p className="mt-6 max-w-xl text-lg text-slate-200">
          Transformamos los desafíos globales en oportunidades. Diseñamos
          soluciones logísticas sin fronteras que impulsan el crecimiento de
          cada industria a través de las fronteras.
        </p>
        <Link
          href="#soluciones"
          className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-semibold text-brand-navy-950 transition-colors hover:bg-slate-100"
        >
          DESCUBRA MÁS ➝
        </Link>
      </div>
    </section>
  );
}
