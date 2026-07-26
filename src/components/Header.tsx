import Image from "next/image";
import Link from "next/link";
import { QuoteButton } from "./QuoteModal";

const NAV_LINKS = [
  { href: "#soluciones", label: "Soluciones" },
  { href: "#oferta", label: "Oferta" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* Logo real servido desde el WordPress actual.
              width/height = viewBox real del SVG (1617.48 x 361.75), sólo para
              fijar el aspect ratio; el tamaño lo controla `h-9 w-auto`.
              TODO: migrar el SVG a /public para no depender del WordPress. */}
          <Image
            src="https://compasssolutions.com.mx/wp-content/uploads/2025/06/compass-blue.svg"
            alt="Compass Solutions"
            width={1617}
            height={362}
            className="h-9 w-auto"
          />
        </Link>

        {/* TODO: el spec de referencia oculta la navegación en móvil
            (`hidden md:flex`) y no define un menú hamburguesa. Falta definir
            la navegación móvil con diseño. */}
        <nav
          aria-label="Principal"
          className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brand-navy-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <QuoteButton className="shrink-0 rounded-full bg-brand-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
          CONTÁCTENOS
        </QuoteButton>
      </div>
    </header>
  );
}
