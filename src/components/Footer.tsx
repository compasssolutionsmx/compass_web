import Image from "next/image";
import Link from "next/link";
import CookiePreferencesButton from "./CookiePreferencesButton";
import { SALES_PHONE_DISPLAY } from "@/lib/site";

/**
 * VARIOS ENLACES DE ABAJO NO SON CLICABLES (auditoría de enlaces internos): las
 * seis rutas de SERVICE_LINKS no existen todavía y devuelven 404. Los `href` se
 * quedan en los datos porque son el destino real una vez que Alex confirme la
 * arquitectura de URLs de servicios.
 *
 * `live: true` marca las rutas que YA existen y por tanto se renderizan como
 * `<Link>`: hoy /proveedores y /vacantes. Activar otra es poner el flag cuando
 * su página exista, no tocar el marcado.
 *
 * "Términos y condiciones" YA NO ESTÁ en esta lista: apuntaba a
 * /apartado-legal#terminos y esa sección se retiró de la página (no existe el
 * texto legal), así que el ancla no lleva a ninguna parte. Si algún día llega
 * el documento, se añade la sección allí y la entrada aquí.
 *
 * LAS TRES ENTRADAS DE /apartado-legal van `live` — y `live: true` NO ES
 * OPCIONAL: sin el flag, el `map` de abajo las pinta en texto plano y el enlace
 * deja de existir sin que nada falle. Ya pasó con esta misma columna.
 *
 * La primera es la PÁGINA ENTERA, sin ancla: <LegalTabs> resuelve `activa` como
 * `vigente ?? anclaDeLaUrl ?? "privacidad"`, así que sin hash abre en su
 * pestaña por defecto. Va antes que las otras dos porque las contiene: primero
 * el documento, luego sus dos secciones.
 *
 * Las otras dos llevan ancla, y esas anclas son los `id` de los dos `tabpanel`
 * de <LegalTabs> — que es de donde ese componente saca qué pestaña abrir,
 * comparando contra `location.hash`. Si algún día se renombra un panel, esos
 * dos `href` se rompen en silencio: el ancla es el contrato. El de la página
 * entera no corre ese riesgo, que es otra razón para tenerlo.
 *
 * "Política de seguridad" es NUEVA aquí. Antes no existía ninguna entrada hacia
 * ella y la política se había quedado sin un solo enlace entrante en todo el
 * sitio: el único que hubo apuntaba de /apartado-legal a /nosotros#politica-
 * titulo y desapareció al reconstruir esa página con pestañas.
 *
 * OJO CON EL SCROLL DE #seguridad: su panel NO está en el HTML inicial —las
 * pestañas desmontan el inactivo—, así que al cargar la página el navegador
 * busca el ancla, no la encuentra y abandona su salto nativo. La pestaña sí
 * queda seleccionada al hidratar; lo que puede no ocurrir es el desplazamiento.
 * Con #privacidad no pasa, porque ése es el panel por defecto y sí viene en el
 * HTML. Sin verificar en navegador.
 *
 * OJO 2: la página YA NO lleva `noindex`. El aviso de privacidad es el
 * documento definitivo del cliente, se publicó y se indexa con normalidad —
 * el `live: true` de las tres entradas de aquí abajo sigue siendo necesario
 * por la misma razón de siempre (sin el flag no hay `<Link>`), no por ningún
 * estado de borrador.
 */
const INFO_LINKS = [
  { href: "/proveedores", label: "Proveedores", live: true },
  { href: "/vacantes", label: "Trabaja con nosotros", live: true },
  { href: "/apartado-legal", label: "Apartado legal", live: true },
  {
    href: "/apartado-legal#privacidad",
    label: "Aviso de privacidad",
    live: true,
  },
  {
    href: "/apartado-legal#seguridad",
    label: "Política de seguridad",
    live: true,
  },
];

/**
 * Redes sociales oficiales de Compass. Los glifos van inline (mismo patrón que
 * WhatsAppIcon.tsx: viewBox 24, `fill="currentColor"`, sin librería de
 * íconos) y el tratamiento de color es el mismo que el resto de enlaces del
 * pie: `text-slate-300` en reposo, blanco al hover, sin subrayado.
 */
const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/compasssolutionslogistica",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/compasssolutionslogistica/",
    path: "M12 0C8.74 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.986 8.74 24 12 24s3.667-.014 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.014 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845c-.796 0-1.44.645-1.44 1.44s.644 1.44 1.44 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@compass.solutions5",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.43 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/compass-solutions-logistica/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
];

const SERVICE_LINKS = [
  {
    href: "/tipo-solucion/especializados-maritimo",
    label: "Especializados marítimo",
  },
  {
    href: "/tipo-solucion/especializados-terrestre",
    label: "Especializados terrestre",
  },
  { href: "/tipo-solucion/soluciones-360", label: "Soluciones 360" },
  { href: "/tipo-solucion/transporte-aereo", label: "Transporte aéreo" },
  { href: "/tipo-solucion/transporte-maritimo", label: "Transporte marítimo" },
  {
    href: "/tipo-solucion/transporte-terrestre",
    label: "Transporte terrestre",
  },
];

export default function Footer() {
  return (
    <footer className="bg-brand-950 pb-8 pt-16 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-5">
        <div className="md:col-span-2">
          {/* Mismo archivo que el Header. Aquí el fondo es siempre brand-950,
              así que el filtro va fijo: el logo se ve blanco todo el tiempo.
              Ver el comentario del Header para el detalle del SVG monocromo. */}
          <Image
            src="/brand/logotipo.svg"
            alt="Compass Solutions"
            width={1617}
            height={362}
            unoptimized
            className="mb-4 h-9 w-auto brightness-0 invert"
          />
          <p className="max-w-xs text-sm">
            Expertos en logística integral nacional e internacional. Diseñamos
            estrategias a la medida de su cadena de suministro, respaldados por
            una red de aliados certificados y flota propia.
          </p>
          <div className="mt-4 flex gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="transition-colors hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                  className="h-5 w-5"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-white">
            Información
          </h4>
          <ul className="space-y-2 text-sm">
            {/* Los que no están marcados `live` van en texto plano, sin
                subrayado ni hover: su ruta es 404 hoy (ver la nota de
                INFO_LINKS) e insinuar que se puede hacer clic sería peor que no
                tener el enlace. */}
            {INFO_LINKS.map((link) =>
              link.live ? (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.href} className="text-slate-400">
                  {link.label}
                </li>
              ),
            )}
            {/* El mecanismo de oposición permanente. Desde que el sitio es
                opt-out y el banner se puede cerrar sin elegir, ésta es la vía
                por la que el usuario se opone después, así que no puede faltar
                de ninguna página: vive en el footer, que sale en todas, junto
                al resto de lo legal. Éste SÍ es interactivo de verdad: no
                navega, sólo reabre el banner ya montado. */}
            <li>
              <CookiePreferencesButton />
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-white">
            Servicios
          </h4>
          <ul className="space-y-2 text-sm">
            {/* Texto plano, no `<Link>`: las seis rutas de /tipo-solucion/*
                son 404 hoy (ver la nota de SERVICE_LINKS). */}
            {SERVICE_LINKS.map((link) => (
              <li key={link.href} className="text-slate-400">
                {link.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-white">
            Ubicación
          </h4>
          {/* La dirección abre la ficha del sitio en Google Maps. Es un <a> y no
              un <Link>: sale del sitio, así que el router de Next no tiene nada
              que prefetchear ni que interceptar.

              `target="_blank"` con `rel="noopener noreferrer"` — el `noopener`
              no es decorativo: sin él la pestaña nueva recibe `window.opener` y
              puede reescribir la dirección de ésta.

              MISMO TRATAMIENTO QUE EL RESTO DE ENLACES DEL PIE: hereda el
              `text-slate-300` del <footer> y sube a blanco en el hover con
              `transition-colors`, igual que las entradas de "Información". Sin
              subrayado, también como ellas. Contraste sobre brand-950:
                slate-300 en reposo   11.93:1
                blanco en hover       17.71:1
              Los dos pasan AA y AAA. El único que baja de ahí en este pie es el
              slate-400 de las entradas inertes (6.91:1), y esa diferencia es
              justo la señal de que no se puede hacer clic.

              El enlace envuelve el texto ENTERO y no una palabra suelta: la
              dirección es una sola unidad y partirla dejaría media frase
              clicable sin motivo. */}
          <p className="mb-6 text-sm">
            <a
              href="https://maps.app.goo.gl/ipKMCtBJQzui5dMW7"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Mitikah, Torre M, Av. Río Churubusco 601-piso 17 int 1707, Xoco,
              Benito Juárez, 03330 Ciudad de México, CDMX
            </a>
          </p>
          <h4 className="mb-2 font-heading text-sm font-semibold text-white">
            Ventas y soporte
          </h4>
          <p className="text-sm">
            <a
              href={`tel:+${SALES_PHONE_DISPLAY.replace(/\D/g, "")}`}
              className="hover:text-white"
            >
              {SALES_PHONE_DISPLAY}
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 pt-6 text-xs text-slate-400 md:flex-row">
        {/* OJO: la home se prerenderiza como estática, así que este año se
            evalúa en BUILD TIME y queda congelado hasta el siguiente deploy.
            Si el sitio no se redespliega, en enero seguirá mostrando el año
            anterior. Ver nota en el README/summary sobre cómo hacerlo real. */}
        <p>
          © Copyright Compass Solutions {new Date().getFullYear()}. All Rights
          Reserved.
        </p>
        {/* public/brand/Black-webtag.png es el webtag "Created By ✕ SCNDAL" (1814x221),
            no el logo de Compass — por eso va aquí, en el crédito de agencia,
            y no en el slot de arriba.
            `invert` porque el arte es negro y el footer es brand-950: sin él
            queda prácticamente invisible.
            TODO: pedir la versión blanca del webtag y quitar el filtro; invertir
            por CSS funciona sólo mientras el arte sea monocromo. */}
        <a
          href="https://scndal.com"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 transition-opacity hover:opacity-100"
        >
          <Image
            src="/brand/Black-webtag.png"
            alt="Created by SCNDAL"
            width={1814}
            height={221}
            className="h-5 w-auto invert"
          />
        </a>
      </div>
    </footer>
  );
}
