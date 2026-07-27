import Image from "next/image";
import YearsBannerText from "./YearsBannerText";

export default function YearsBanner() {
  return (
    // Más alto que la franja delgada que era (sólo py-16): ahora reserva altura
    // propia para tener presencia de sección y no leerse como una línea suelta.
    <section className="relative flex min-h-[320px] items-center overflow-hidden py-20 md:min-h-[400px]">
      <div className="absolute inset-0 bg-brand-950">
        {/* OJO: aquí va back-compass-all.webp. La otra foto del sitio,
            compass-hub.webp, es la de StatsSection — no son intercambiables. */}
        <Image
          src="/back-compass-all.webp"
          alt="Terminal de contenedores de Compass Solutions"
          width={1728}
          height={608}
          sizes="100vw"
          className="h-full w-full object-cover"
        />
        {/* La foto tiene un rango enorme: de 0.000 a 0.968 de luminancia, con
            una zona casi blanca. Sin overlay el texto blanco cae a 1.03:1 sobre
            ese punto, o sea invisible. Con brand-950 al 70% sube a 6.76:1 en
            ese mismo peor píxel, medido sobre el archivo real. Al 60% también
            pasaría (4.81:1) si se quisiera dejar ver más foto. */}
        <div className="absolute inset-0 bg-brand-950/70" />
      </div>

      {/* El claim se revela palabra por palabra al entrar en viewport; el
          componente es cliente sólo por eso. La imagen y el overlay se quedan
          en servidor. */}
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <YearsBannerText />
      </div>
    </section>
  );
}
