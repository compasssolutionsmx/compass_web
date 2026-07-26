import Image from "next/image";

export default function YearsBanner() {
  return (
    <section className="relative py-16">
      <div className="absolute inset-0 bg-brand-teal-800">
        {/* PLACEHOLDER — TODO: reemplazar el `src` con la foto real de
            contenedores y quitar `unoptimized`. */}
        <Image
          src="https://placehold.co/1920x400/123A4D/123A4D?text=+"
          alt="Contenedores de carga"
          width={1920}
          height={400}
          sizes="100vw"
          unoptimized
          className="h-full w-full object-cover opacity-50"
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <p className="text-2xl font-semibold text-white md:text-3xl">
          +12 años brindado soluciones sin fronteras.
        </p>
      </div>
    </section>
  );
}
