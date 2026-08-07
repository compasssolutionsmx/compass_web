import type { Metadata } from "next";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { QuoteModalProvider } from "@/components/QuoteModal";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { WhatsAppModalProvider } from "@/components/WhatsAppModal";

/**
 * Apartado legal. LA RUTA EXISTE; DOS DE SUS TRES SECCIONES ESTÁN VACÍAS.
 *
 * Se construye el chasis ahora porque media docena de sitios del código
 * apuntaban aquí y devolvían 404 —las dos entradas del footer y, lo más serio,
 * el "Aviso de privacidad" del banner de cookies—. Con la ruta viva, activarlos
 * es un flag; sin ella no había nada que enlazar.
 *
 * LO QUE FALTA es el texto legal en sí: términos y condiciones, y aviso de
 * privacidad. No se redacta aquí ni se aproxima — es texto con efectos legales
 * y tiene que venir del cliente o del WordPress actual. Los dos anclajes
 * (#terminos y #privacidad) ya son los que el resto del sitio referencia, así
 * que al llegar el contenido se rellenan estas dos secciones y nada más cambia
 * de sitio.
 *
 * AL COMPLETARLA hay que hacer, además, estas cuatro cosas:
 *   1. quitar el `robots: { index: false }` de aquí abajo
 *   2. añadir /apartado-legal a src/app/sitemap.ts
 *   3. poner `live: true` a las dos entradas de INFO_LINKS en Footer.tsx
 *   4. envolver en <Link href="/apartado-legal#privacidad"> el "Aviso de
 *      privacidad" del CookieBanner (tiene un TODO(compliance) marcándolo)
 */

const PATH = "/apartado-legal";

const TITLE = "Apartado legal";
const DESCRIPTION =
  "Términos y condiciones, aviso de privacidad y política de seguridad y calidad de Compass Solutions.";

export const metadata: Metadata = {
  title: `${TITLE} | Compass Solutions`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  /**
   * NOINDEX MIENTRAS FALTE EL TEXTO. Una página legal a medias indexada es peor
   * que una que no aparece: promete condiciones que no están escritas. El
   * `follow` se conserva para que los enlaces salientes sí se recorran.
   */
  robots: { index: false, follow: true },
};

/** Sección de la página. `id` es el anclaje que el resto del sitio referencia. */
function SeccionLegal({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    // `scroll-mt-28` para que el anclaje no quede debajo del header flotante.
    // El `scroll-padding-top` de globals.css cubre el scroll nativo, pero no el
    // de Lenis cuando se llega con la URL ya cargada.
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-28">
      <h2
        id={`${id}-titulo`}
        className="font-heading text-2xl font-bold text-brand-900 md:text-3xl"
      >
        {titulo}
      </h2>
      <div className="mt-4 max-w-[68ch] text-slate-600">{children}</div>
    </section>
  );
}

/**
 * Aviso de sección pendiente. Es andamiaje visible a propósito: quien llegue
 * buscando el aviso de privacidad tiene que ver que aún no está, no un vacío
 * que parezca un fallo de carga. Se borra entero con el texto real.
 */
function Pendiente({ que }: { que: string }) {
  return (
    <p className="rounded-2xl border border-brand-900/15 bg-brand-100/60 p-4 text-sm leading-relaxed">
      Estamos preparando {que}. Mientras tanto, puede solicitarlo escribiéndonos
      desde{" "}
      <Link
        href="/proveedores"
        className="font-medium text-brand-900 underline underline-offset-2 transition-opacity hover:opacity-80"
      >
        cualquiera de nuestros formularios de contacto
      </Link>
      .
    </p>
  );
}

export default function ApartadoLegal() {
  return (
    <WhatsAppModalProvider>
      <QuoteModalProvider>
        {/* `topTone="dark"`: arriba del todo hay `brand-gradient`. */}
        <Header topTone="dark" />

        <main className="flex-1">
          <section className="brand-gradient rounded-b-[2rem] px-6 pb-16 pt-32 md:pb-20 md:pt-40">
            <div className="mx-auto max-w-7xl">
              <Eyebrow tone="dark" className="mb-4">
                Información legal
              </Eyebrow>
              <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
                Apartado legal
              </h1>
            </div>
          </section>

          {/* `max-w-3xl` y no el `max-w-7xl` del resto del sitio: esto es texto
              corrido para leer de principio a fin, y a todo el ancho la línea
              se vuelve incómoda. Es el mismo criterio del cuerpo del blog. */}
          <div className="mx-auto flex max-w-3xl flex-col gap-16 px-6 py-20 md:py-24">
            <SeccionLegal id="terminos" titulo="Términos y condiciones">
              <Pendiente que="los términos y condiciones del sitio" />
            </SeccionLegal>

            <SeccionLegal id="privacidad" titulo="Aviso de privacidad">
              <Pendiente que="el aviso de privacidad" />
            </SeccionLegal>

            {/* La política SÍ existe, pero vive en /nosotros y aquí se enlaza en
                vez de copiarse. Duplicar los diez compromisos dejaría dos URLs
                compitiendo por el mismo texto y dos copias que se
                desincronizan. Si algún día se decide que su sitio natural es
                éste, se mueve `COMPROMISOS_SEGURIDAD` de lib/nosotros.ts para
                acá y se invierte el enlace — el dato ya está en `lib` justo
                para que ese movimiento sea trivial. */}
            <SeccionLegal
              id="seguridad"
              titulo="Política de seguridad y calidad"
            >
              <p>
                Los diez compromisos de la política de seguridad y calidad de
                Compass Solutions se publican, completos, en{" "}
                <Link
                  href="/nosotros#politica-titulo"
                  className="font-medium text-brand-900 underline underline-offset-2 transition-opacity hover:opacity-80"
                >
                  Nuestra Compañía
                </Link>
                .
              </p>
            </SeccionLegal>
          </div>
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </QuoteModalProvider>
    </WhatsAppModalProvider>
  );
}
