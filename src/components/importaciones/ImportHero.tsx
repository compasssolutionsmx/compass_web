import Image from "next/image";
import { QuoteButton } from "../QuoteModal";

/**
 * Hero de /importaciones-a-mexico. Exclusivo de esta landing (🆕 en el mockup).
 *
 * Sin video, a diferencia del hero del home: aquí manda una imagen fija y el
 * peso de la página importa más, porque es destino de campañas pagadas.
 *
 * JERARQUÍA, que es contraintuitiva y viene así del mockup: el texto GRANDE
 * ("Traemos lo que sea, de donde sea") es un reclamo visual, no el encabezado;
 * el <h1> real es la línea más pequeña y subrayada de debajo, que es la que
 * lleva la keyword. Se respeta tal cual — un <h1> por página, y es ése.
 *
 * HIGHLIGHT del h1: brand-100 al 16% sobre el degradado oscuro. El sitio en
 * vivo usa un cian tipo marcador que está fuera de la paleta; el mockup ya lo
 * normaliza a brand-100 y esa es la decisión que se aplica aquí.
 */
export default function ImportHero() {
  return (
    <section className="brand-gradient relative overflow-hidden rounded-b-[2rem] pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="font-heading text-4xl font-extrabold leading-[1.1] text-white md:text-5xl xl:text-6xl">
            Traemos
            <br />
            lo que sea,
            <br />
            de donde sea
          </p>

          {/* `inline-block` + el pseudo-fondo por detrás: el resaltado tiene que
              medir lo que mide el texto, no lo que mide la columna. */}
          <div className="relative mt-6 inline-block rounded px-2 py-1">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded bg-brand-100/15"
            />
            <h1 className="relative font-heading text-lg font-bold text-white underline decoration-1 underline-offset-[6px] md:text-xl">
              Expertos en Importaciones en México
            </h1>
          </div>

          <p className="mt-6 max-w-[44ch] text-lg text-slate-200">
            Simplificamos sus importaciones logísticas a México mediante
            soluciones integrales 360° que garantizan la eficiencia operativa
            que su compañía necesita.
          </p>

          <QuoteButton className="mt-8 rounded-full bg-white px-8 py-3 font-heading text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50">
            Contacte a un Experto
          </QuoteButton>
        </div>

        {/* RECORTE SOBRE FONDO TRANSPARENTE, no una foto rectangular: el
            archivo es 1100x1100 con las cuatro esquinas en alfa 0 y algo más de
            la mitad del lienzo vacío. Por eso NO lleva caja, ni fondo, ni
            esquinas redondeadas — la figura flota directamente sobre el
            degradado del hero, que es como está pensada.

            `priority` porque es la imagen grande sobre el pliegue y la
            candidata a LCP de esta página; sin él, Next la carga en diferido y
            el hero se pinta con un hueco.

            `sizes` declara el ancho real que ocupa: media columna a partir de
            `lg`, todo el ancho por debajo. Sin esto Next serviría el archivo a
            tamaño completo también en móvil. */}
        <Image
          src="/importaciones/importaciones-hero.webp"
          alt="Un tiranosaurio rugiendo mientras sale de un contenedor marítimo abierto"
          width={1100}
          height={1100}
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
