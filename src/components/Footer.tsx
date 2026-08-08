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
 * LAS DOS ENTRADAS DE /apartado-legal van `live`, y sus anclas son los `id` de
 * los dos `tabpanel` de <LegalTabs> — que es de donde ese componente saca qué
 * pestaña abrir, comparando contra `location.hash`. Si algún día se renombra un
 * panel, estos dos `href` se rompen en silencio: el ancla es el contrato.
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
 * OJO 2: la página sigue con `noindex` porque su aviso es un borrador con datos
 * pendientes. Eso es deliberado y no se contradice — poder LLEGAR al aviso desde
 * cualquier página es justo lo que se busca; lo que no queremos es que Google lo
 * indexe mientras no esté aprobado.
 */
const INFO_LINKS = [
  { href: "/proveedores", label: "Proveedores", live: true },
  { href: "/vacantes", label: "Trabaja con nosotros", live: true },
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
            {/* Retirar el consentimiento tiene que ser tan fácil como darlo
                (GDPR art. 7.3), así que la puerta de vuelta al banner vive
                aquí, junto al resto de lo legal. Éste SÍ es interactivo de
                verdad: no navega, sólo reabre el banner ya montado. */}
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
          <p className="mb-6 text-sm">
            Mitikah, Torre M, Av. Río Churubusco 601-piso 17 int 1707, Xoco,
            Benito Juárez, 03330 Ciudad de México, CDMX
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
