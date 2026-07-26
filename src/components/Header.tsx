"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { QuoteButton } from "./QuoteModal";

const NAV_LINKS = [
  { href: "#soluciones", label: "Soluciones" },
  { href: "#oferta", label: "Oferta" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/blog", label: "Blog" },
];

const MOBILE_PANEL_ID = "menu-movil";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // Cerrar con Escape, bloquear scroll del body y mover el foco al panel.
  useEffect(() => {
    if (!isMenuOpen) return;

    closeButtonRef.current?.focus();
    // Se copia el nodo ahora para devolverle el foco al cerrar (el ref puede
    // haber cambiado cuando corra la limpieza).
    const triggerButton = openButtonRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      // Focus trap: Tab no debe salirse del panel.
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables =
        panelRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerButton?.focus();
    };
  }, [isMenuOpen]);

  return (
    // El panel móvil va FUERA del <header> a propósito: el `backdrop-blur` del
    // header crea un containing block, así que un hijo `fixed` se posicionaría
    // respecto al header (h-20) en vez del viewport.
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {/* Logo real servido desde el WordPress actual.
                width/height = viewBox real del SVG (1617.48 x 361.75), sólo
                para fijar el aspect ratio; el tamaño lo controla `h-9 w-auto`.
                TODO: migrar el SVG a /public para no depender del WordPress. */}
            <Image
              src="https://compasssolutions.com.mx/wp-content/uploads/2025/06/compass-blue.svg"
              alt="Compass Solutions"
              width={1617}
              height={362}
              className="h-9 w-auto"
            />
          </Link>

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

          <div className="flex shrink-0 items-center gap-2">
            <QuoteButton className="rounded-full bg-brand-navy-900 px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-6 sm:text-sm">
              CONTÁCTENOS
            </QuoteButton>

            <button
              ref={openButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={isMenuOpen}
              aria-controls={MOBILE_PANEL_ID}
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-navy-900 transition-colors hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ---- Menú móvil: panel deslizante ---- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 motion-safe:animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id={MOBILE_PANEL_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl motion-safe:animate-slide-in-right"
          >
            <div className="flex h-20 shrink-0 items-center justify-end px-6">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <nav
              aria-label="Principal (móvil)"
              className="flex flex-col gap-1 px-6"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg py-3 text-base font-medium text-slate-700 transition-colors hover:text-brand-navy-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
