import Image from "next/image";
import Link from "next/link";
import CookiePreferencesButton from "./CookiePreferencesButton";
import { SALES_PHONE_DISPLAY } from "@/lib/site";

const INFO_LINKS = [
  { href: "/nosotros#contactanos", label: "Proveedores" },
  { href: "/vacantes", label: "Trabaja con Nosotros" },
  { href: "/apartado-legal#terminos", label: "Términos y Condiciones" },
  { href: "/apartado-legal#privacidad", label: "Aviso de Privacidad" },
];

const SERVICE_LINKS = [
  {
    href: "/tipo-solucion/especializados-maritimo",
    label: "Especializados Marítimo",
  },
  {
    href: "/tipo-solucion/especializados-terrestre",
    label: "Especializados Terrestre",
  },
  { href: "/tipo-solucion/soluciones-360", label: "Soluciones 360" },
  { href: "/tipo-solucion/transporte-aereo", label: "Transporte Aéreo" },
  { href: "/tipo-solucion/transporte-maritimo", label: "Transporte Marítimo" },
  {
    href: "/tipo-solucion/transporte-terrestre",
    label: "Transporte Terrestre",
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
            estrategias a la medida de tu cadena de suministro, respaldados por
            una red de aliados certificados y flota propia.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-white">
            Información
          </h4>
          <ul className="space-y-2 text-sm">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Retirar el consentimiento tiene que ser tan fácil como darlo
                (GDPR art. 7.3), así que la puerta de vuelta al banner vive
                aquí, junto al resto de lo legal. */}
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
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
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
            Ventas y Soporte
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
