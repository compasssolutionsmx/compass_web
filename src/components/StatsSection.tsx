import Image from "next/image";
import AnimatedCounter from "./AnimatedCounter";
import Eyebrow from "./Eyebrow";

/* ---------------------------------------------------------------------------
   MÉTRICAS REALES — editar aquí.
   Cifras definitivas validadas por el cliente. Son las mismas tres, en el
   mismo orden y con el mismo copy, que las de <ImportStats> en la landing:
   si se tocan aquí, hay que tocarlas allá.
   --------------------------------------------------------------------------- */
const COUNTRIES_COUNT = 50;
const EFFECTIVENESS = 95;
const CLIENTS_COUNT = 50;

export default function StatsSection() {
  return (
    // `pt` reducido porque la sección de encima ya cierra con su propio `pb`:
    // con py-20 aquí el blanco acumulado entre ambas se iba a 160px. Antes esa
    // vecina era <QuoteSection>; hoy es <Certifications>, que lleva el mismo
    // `pb-16 md:pb-20`, así que el hueco resultante no cambió: 80px en móvil y
    // 104px en desktop.
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 md:pt-6">
      <div className="rounded-3xl bg-brand-100 p-6 md:p-10 lg:p-14">
        {/* ---------- Bloque superior: imagen izquierda, texto derecha ---------- */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          {/* Primera en el DOM, así que en móvil queda arriba al apilarse. */}
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/home/compass-hub.webp"
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
              Nuestra trayectoria
            </h2>

            <p className="mt-5 text-slate-700">
              Desde 2014, movemos su carga sin fronteras. Nacimos como freight
              forwarder especializado en transporte aéreo y hoy coordinamos
              importaciones y exportaciones por aire, mar y tierra bajo un mismo
              techo, con despacho aduanal, gestión documental y un departamento
              de calidad que respalda cada embarque. Usted se enfoca en su
              negocio; nosotros en que su mercancía llegue segura y a tiempo.
            </p>

            {/* Sin CTA a propósito: la sección es informativa y la página ya
                tiene el cotizador arriba y el CTA de Soluciones Integrales
                abajo. Un tercero aquí sólo repartiría la atención. */}
          </div>
        </div>

        {/* ---------- Bloque inferior: las tres métricas ---------- */}
        {/* Tarjetas blancas sobre la caja clara, con la cifra en brand-900:
            15.07:1.

            JERARQUÍA DE TRES LÍNEAS —cifra, rótulo corto, descripción— tomada
            de <ImportStats> en la landing, para que las mismas tres métricas se
            lean igual en las dos páginas. Los tamaños y pesos son los de allá:
            cifra en `text-4xl font-bold`, rótulo en `text-sm font-bold` y misma
            font-heading que la cifra (es su continuación, no un párrafo), y
            descripción en `text-sm` slate-600. Lo único que NO se copia es el
            fondo: aquí la tarjeta sigue siendo blanca sobre la caja brand-100,
            mientras que en la landing es brand-100 sobre blanco. Sobre blanco
            el rótulo en brand-900 da los mismos 15.07:1 de la cifra y la
            descripción en slate-600 da 7.58:1.

            `mt-1` entre las tres líneas, y no el `mt-2` que llevaba la
            descripción cuando colgaba directamente de la cifra: con el rótulo
            en medio, 8px de separación uniforme mantienen las tres como un solo
            bloque en vez de partirlo en dos. */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-14">
          <li className="rounded-2xl bg-white p-6 shadow-sm shadow-brand-950/5">
            <p className="font-heading text-4xl font-bold text-brand-900">
              +<AnimatedCounter target={COUNTRIES_COUNT} />
            </p>
            <p className="mt-1 font-heading text-sm font-bold text-brand-900">
              Países
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Cobertura internacional para sus operaciones de comercio exterior.
            </p>
          </li>
          <li className="rounded-2xl bg-white p-6 shadow-sm shadow-brand-950/5">
            <p className="font-heading text-4xl font-bold text-brand-900">
              <AnimatedCounter target={EFFECTIVENESS} />%
            </p>
            <p className="mt-1 font-heading text-sm font-bold text-brand-900">
              Efectividad
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Comprometidos con la eficiencia y cumplimiento de cada operación.
            </p>
          </li>
          <li className="rounded-2xl bg-white p-6 shadow-sm shadow-brand-950/5">
            <p className="font-heading text-4xl font-bold text-brand-900">
              +<AnimatedCounter target={CLIENTS_COUNT} />
            </p>
            <p className="mt-1 font-heading text-sm font-bold text-brand-900">
              Clientes satisfechos
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Empresas que confían en Compass Solutions para sus operaciones
              logísticas.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
