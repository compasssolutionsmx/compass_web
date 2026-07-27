import Image from "next/image";
import AnimatedCounter from "./AnimatedCounter";
import Eyebrow from "./Eyebrow";

/* ---------------------------------------------------------------------------
   MÉTRICAS REALES — editar aquí.
   Confirmadas contra el sitio actual. Se guardan con su magnitud real; el
   formato de pantalla lo pone el JSX ("+10k" sale de dividir entre mil).
   --------------------------------------------------------------------------- */
const EFFECTIVENESS = 95.3;
const OPERATIONS_COUNT = 10000;
const PARTNERS_COUNT = 200;

export default function StatsSection() {
  return (
    // `pt` reducido: encima queda la tarjeta del cotizador, que ya aporta su
    // propio padding interno además del `pb` de su sección. Con py-20 aquí, el
    // blanco acumulado entre ambas era de 160px.
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 md:pt-6">
      <div className="rounded-3xl bg-brand-100 p-6 md:p-10 lg:p-14">
        {/* ---------- Bloque superior: imagen izquierda, texto derecha ---------- */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          {/* Primera en el DOM, así que en móvil queda arriba al apilarse. */}
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/compass-hub.webp"
              alt="Supervisor de operaciones observando una terminal portuaria al atardecer"
              width={1000}
              height={1000}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/3] w-full object-cover object-bottom"
            />
          </div>

          <div>
            {/* `tone="tint"`: el pill claro por defecto es brand-100, el mismo
                color de esta caja, y se perdería. Aquí se invierte a blanco. */}
            <Eyebrow tone="tint" className="mb-4">
              Sobre Compass Solutions
            </Eyebrow>

            <h2 className="font-heading text-3xl font-bold text-brand-900 md:text-4xl">
              Nuestra Trayectoria
            </h2>

            <p className="mt-5 text-slate-700">
              Desde 2014, movemos tu carga sin fronteras. Nacimos como freight
              forwarder especializado en transporte aéreo y hoy coordinamos
              importaciones y exportaciones por aire, mar y tierra bajo un mismo
              techo, con despacho aduanal, gestión documental y un departamento
              de calidad que respalda cada embarque. Tú te enfocas en tu
              negocio; nosotros en que tu mercancía llegue segura y a tiempo.
            </p>

            {/* Sin CTA a propósito: la sección es informativa y la página ya
                tiene el cotizador arriba y el CTA de Soluciones Integrales
                abajo. Un tercero aquí sólo repartiría la atención. */}
          </div>
        </div>

        {/* ---------- Bloque inferior: las tres métricas ---------- */}
        {/* Tarjetas blancas sobre la caja clara, con el número en brand-900:
            15.07:1. Antes el 95.3% flotaba sobre la foto; ahora es una de las
            tres, con el mismo tratamiento que las otras dos. */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-14">
          <li className="rounded-2xl bg-white p-6 shadow-sm shadow-brand-950/5">
            <p className="font-heading text-4xl font-bold text-brand-900">
              <AnimatedCounter target={EFFECTIVENESS} decimals={1} />%
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Efectividad en servicios expeditados solicitados por nuestros
              clientes.
            </p>
          </li>
          <li className="rounded-2xl bg-white p-6 shadow-sm shadow-brand-950/5">
            <p className="font-heading text-4xl font-bold text-brand-900">
              +<AnimatedCounter target={OPERATIONS_COUNT / 1000} />k
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Operaciones aéreas, marítimas y terrestres realizadas con éxito.
            </p>
          </li>
          <li className="rounded-2xl bg-white p-6 shadow-sm shadow-brand-950/5">
            <p className="font-heading text-4xl font-bold text-brand-900">
              +<AnimatedCounter target={PARTNERS_COUNT} />
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Asociados de negocio alineados a nuestros estándares de servicio.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
