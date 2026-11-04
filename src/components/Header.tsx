"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { QuoteButton } from "./QuoteModal";
import { useServiciosMenu } from "./ServiciosMenu";
import { useSmoothScroll } from "./SmoothScroll";
import { NOSOTROS_LABEL } from "@/lib/site";

/**
 * Una sola lista para el nav de escritorio y para el panel móvil: son la misma
 * navegación en dos formatos, y duplicarla es cómo se desincronizan.
 *
 * OJO CON LA LONGITUD DE LAS ETIQUETAS. El nav suelto es la pieza que fija el
 * ancho mínimo del header, y no tiene mucho margen: ver la nota del breakpoint
 * en el <nav> de abajo antes de alargar una etiqueta o añadir un enlace.
 */
/**
 * "Nuestra Compañía" vuelve al nav: /nosotros ya existe. Se había quitado
 * porque esa ruta era un 404 (auditoría de enlaces internos) y un nav con un
 * 404 es peor que un nav más corto. La página está VACÍA por ahora —sólo el
 * chasis— pero ya no rompe la navegación.
 *
 * "SERVICIOS" SUSTITUYE A LAS DOS ANCLAS DEL HOME (`/#soluciones` y
 * `/#oferta`). Es un enlace real a /servicios y, con `megaMenu`, además abre
 * el panel con la agrupación oficial de servicios (ver `useServiciosMenu`).
 * En escritorio el clic navega aunque el panel no llegue a abrirse; en móvil
 * es un acordeón dentro del panel a pantalla completa.
 */
type NavLink = { href: string; label: string; megaMenu?: boolean };

const NAV_LINKS: NavLink[] = [
  { href: "/servicios", label: "Servicios", megaMenu: true },
  { href: "/nosotros", label: NOSOTROS_LABEL },
  { href: "/blog", label: "Blog" },
];

const MOBILE_PANEL_ID = "menu-movil";
const MEGA_PANEL_ID = "menu-servicios";
const MOBILE_SERVICIOS_ID = "menu-movil-servicios";

/** Retardo de cierre al salir el puntero: deja cruzar del disparador al panel. */
const MEGA_CLOSE_DELAY_MS = 150;

/** Por debajo de esto el header va suelto; por encima, condensado en pastilla. */
const CONDENSE_AT_PX = 32;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export default function Header({
  /**
   * Qué hay detrás del header cuando la página está arriba del todo. Es
   * OBLIGATORIO a propósito: así el compilador obliga a decidirlo en cada
   * página nueva, en vez de heredar un default que dejaría el logo invisible.
   *   - `dark`  video del home, cabecera azul del blog…  -> logo blanco
   *   - `light` una página que arranca en blanco         -> logo en su color
   */
  topTone,
  /**
   * `full`        el header del sitio: nav completo + CTA + hamburguesa.
   * `conversion`  el de las landings de campaña: logo y un solo CTA. El
   *               teléfono que llevaba se retiró — el footer lo sigue
   *               mostrando en todas las páginas, esta incluida.
   *               Sin los enlaces GLOBALES, porque en una landing apuntarían
   *               fuera de la página — una salida gratuita en la única página
   *               cuyo trabajo es convertir. Puede recuperar un nav propio
   *               pasándole `navLinks` (ver abajo).
   */
  variant = "full",
  /**
   * Enlaces del nav. Por defecto los globales del sitio, y ninguno en
   * `conversion`.
   *
   * Existe para que una landing pueda montar su PROPIO nav —anclas internas a
   * sus secciones— sin recuperar los globales, que es justo lo que esa variante
   * quiere evitar. La distinción no es cosmética: un enlace interno retiene al
   * visitante y uno global lo saca de la página de campaña.
   *
   * OJO CON LOS `href` EN UNA LANDING: tienen que llevar SU ruta, no la raíz.
   * `/#soluciones` significa "home + ancla" y se llevaría al usuario a otra
   * página; lo correcto es `/importaciones-a-mexico#soluciones`. Con la ruta
   * completa Lenis compara pathname, ve que coincide con la actual y lo
   * intercepta con su desplazamiento suave (ver su `onClick`).
   */
  navLinks,
}: {
  topTone: "dark" | "light";
  variant?: "full" | "conversion";
  navLinks?: NavLink[];
}) {
  const esConversion = variant === "conversion";
  /**
   * Qué enlaces se pintan. `conversion` sin `navLinks` explícitos se queda sin
   * nav —su comportamiento de siempre— y el resto hereda los globales.
   */
  const enlaces = navLinks ?? (esConversion ? [] : NAV_LINKS);
  const hayNav = enlaces.length > 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const gruposServicios = useServiciosMenu();
  const pathname = usePathname();

  /* ---- Mega menú de escritorio ----
     El estado guarda la RUTA en la que se abrió, no un booleano: así al
     navegar el panel queda cerrado solo (la ruta deja de coincidir) sin un
     efecto que llame a setState, que la regla react-hooks/set-state-in-effect
     del proyecto rechaza. */
  const [megaOpenAt, setMegaOpenAt] = useState<string | null>(null);
  const isMegaOpen = megaOpenAt !== null && megaOpenAt === pathname;
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaTriggerRef = useRef<HTMLAnchorElement>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const [isMobileServiciosOpen, setIsMobileServiciosOpen] = useState(false);
  /* Grupos abiertos dentro del acordeón móvil de "Servicios". Independientes:
     pueden abrirse varios a la vez, y todos arrancan cerrados. */
  const [gruposMovilAbiertos, setGruposMovilAbiertos] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const toggleGrupoMovil = (slug: string) =>
    setGruposMovilAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  /* Al cerrar con Escape el foco vuelve al disparador, y su `onFocus` abriría
     el panel otra vez. Esta marca hace que ese foco devuelto no lo reabra. */
  const skipFocusOpen = useRef(false);

  const cancelMegaClose = () => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
  };
  const openMega = () => {
    cancelMegaClose();
    setMegaOpenAt(pathname);
  };
  const closeMega = () => {
    cancelMegaClose();
    setMegaOpenAt(null);
  };
  const scheduleMegaClose = () => {
    cancelMegaClose();
    megaCloseTimer.current = setTimeout(
      () => setMegaOpenAt(null),
      MEGA_CLOSE_DELAY_MS,
    );
  };

  // Sólo limpia el temporizador pendiente al desmontar; no toca estado.
  useEffect(() => cancelMegaClose, []);

  /** Cierra si el foco sale a algo que no es ni el disparador ni el panel. */
  const onMegaBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (
      next &&
      (megaTriggerRef.current?.contains(next) ||
        megaPanelRef.current?.contains(next))
    ) {
      return;
    }
    closeMega();
  };

  const panelLinks = () =>
    Array.from(
      megaPanelRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ??
        [],
    );

  /** El enlace del nav que sigue a "Servicios", para salir del panel con Tab. */
  const focusAfterTrigger = () => {
    const navLinks = Array.from(
      desktopNavRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ??
        [],
    );
    const i = navLinks.indexOf(megaTriggerRef.current as HTMLAnchorElement);
    navLinks[i + 1]?.focus();
  };

  /* EL PANEL VIVE DESPUÉS DE LA BARRA EN EL DOM (ver su comentario), así que
     el orden de tabulación natural no pasa por él. Estos dos manejadores lo
     cosen: Tab desde "Servicios" entra al panel, Tab desde su último enlace
     sale al siguiente del nav y Shift+Tab desde el primero vuelve al
     disparador. Escape cierra y devuelve el foco al disparador. */
  const onMegaTriggerKeyDown = (event: ReactKeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Escape" && isMegaOpen) {
      event.preventDefault();
      closeMega();
      return;
    }
    if (
      (event.key === "Tab" && !event.shiftKey && isMegaOpen) ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      openMega();
      // El panel puede estar recién montado como visible: se enfoca tras el
      // commit.
      requestAnimationFrame(() => panelLinks()[0]?.focus());
    }
  };

  const onMegaPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMega();
      skipFocusOpen.current = true;
      megaTriggerRef.current?.focus();
      return;
    }
    if (event.key !== "Tab") return;
    const links = panelLinks();
    const first = links[0];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      megaTriggerRef.current?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      closeMega();
      focusAfterTrigger();
    }
  };

  // El disparador es la POSICIÓN DE SCROLL, no "estar sobre el hero". Así el
  // comportamiento es idéntico en todas las páginas: arriba del todo, suelto;
  // en cuanto se hace scroll, pastilla. Antes dependía de un
  // IntersectionObserver sobre #hero y las páginas sin hero arrancaban ya
  // condensadas.
  //
  // Va por useSyncExternalStore y no por useState + efecto porque la regla
  // react-hooks/set-state-in-effect del proyecto rechaza el segundo patrón, y
  // además así el valor inicial ya es correcto si la página carga scrolleada
  // (recarga a media página, o volver atrás en el historial).
  const isCondensed = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > CONDENSE_AT_PX,
    () => false,
  );

  // El logo y el ícono del menú son los únicos sin fondo propio que los
  // respalde. Condensado, la pastilla `.glass` es clara y piden color oscuro;
  // suelto, depende de lo que la página declare detrás.
  // El CTA (opaco) y la cápsula del nav (clara en ambos casos) no entran.
  const onDarkSurface = !isCondensed && topTone === "dark";

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const { pause: pauseSmoothScroll, resume: resumeSmoothScroll } =
    useSmoothScroll();

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

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
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

    // Lenis se pausa mientras el scroll del body está bloqueado: si sigue
    // vivo, el fondo se desplaza por debajo del modal.
    pauseSmoothScroll();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      resumeSmoothScroll();
      triggerButton?.focus();
    };
  }, [isMenuOpen, pauseSmoothScroll, resumeSmoothScroll]);

  return (
    // El panel móvil va FUERA del <header> a propósito: el backdrop-filter de
    // `.glass` (hoy en la cápsula del nav) crea un containing block, así que un
    // hijo `fixed` se posicionaría respecto a ella en vez del viewport.
    <>
      {/* El <header> sólo posiciona; la barra interior es la que cambia de
          estado, y el disparador es la posición de scroll — igual en todas las
          páginas, con o sin hero detrás.

            A (scrollY <= 32px) los tres elementos sueltos, sin fondo común.
            B (scrollY  > 32px) los tres recogidos en una sola pastilla
                                `.glass`, más estrecha, compacta y rounded-full.

          La transición lista sus propiedades EXPLÍCITAMENTE y deja fuera el
          borde. Con `transition-all` aparecían líneas oscuras de subpíxel en
          todo el contorno: el Preflight de Tailwind deja `border: 0 solid` sin
          color, así que el borde hereda `currentColor` —el slate-800 del body—
          y al entrar `.glass` se interpolaban a la vez el ancho (0 -> 1px) y el
          color (slate-800 -> blanco 35%). A mitad de camino eso es un borde de
          0.5px en rgb(~171): la línea que se veía. El `border-transparent` de
          base mantiene el ancho fijo en 1px en los dos estados, así que ya no
          hay salto de layout ni color oscuro que atravesar.
          `motion-reduce:transition-none` hace el cambio instantáneo si el
          sistema lo pide, sin perder ninguno de los dos estados.

          OJO con el max-width de A: es un valor en px (1800) y no `none` porque
          CSS no interpola entre `none` y una longitud, y sin eso el ancho daría
          un salto seco. Sólo se nota por encima de ~1832px de viewport. */}
      <header className="fixed inset-x-0 top-4 z-40 px-4">
        <div
          className={`mx-auto flex items-center border border-transparent transition-[max-width,padding,gap,background-color,border-radius,box-shadow] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${
            isCondensed
              ? "glass max-w-4xl justify-between gap-3 rounded-full py-3 pl-6 pr-3"
              : "max-w-[1800px] justify-between gap-4"
          }`}
        >
          {/* 1. LOGO — suelto sobre el video en A; dentro de la barra en B, y
              un punto más chico. */}
          <Link href="/" className="flex shrink-0 items-center">
            {/* Logo de marca, servido desde /public — ya no depende del WordPress.
              Sin pastilla detrás, el logo en su color natural (#00546e) se
              perdería sobre el video; sobre el blanco del sitio, la versión en
              blanco desaparecería. Se resuelve con un solo archivo: el SVG es
              monocromo (una sola clase `.cls-1`, sin gradientes), así que
              `brightness-0 invert` lo pasa a blanco puro sin distorsionarlo.
              Qué hay detrás lo declara cada página con `topTone`; condensado
              la pastilla siempre es clara, así que ahí va en su color.
              width/height = viewBox real del SVG (1617.48 x 361.75), sólo para
              fijar el aspect ratio; el tamaño lo controla `h-9 w-auto`.
              `unoptimized` porque el optimizador de Next no procesa SVG (y así
              se evita tener que activar `dangerouslyAllowSVG`). */}
            <Image
              src="/brand/logotipo.svg"
              alt="Compass Solutions"
              width={1617}
              height={362}
              preload
              unoptimized
              className={`w-auto transition-all duration-300 motion-reduce:transition-none ${
                onDarkSurface ? "brightness-0 invert" : ""
              } ${isCondensed ? "h-7 md:h-8" : "h-9 md:h-10"}`}
            />
          </Link>

          {/* 2. NAV — en A es una cápsula `.glass` independiente. En B pierde
              su propio vidrio: la barra ya lo aporta, y apilar dos superficies
              glass ensucia el blur y oscurece de más. El texto se queda en
              brand-900 en los dos estados (sobre vidrio claro en ambos).

              APARECE EN `lg` (1024px), NO EN `md` (768px). El estado suelto es
              el que manda, porque es el más ancho. El nav es el único hijo sin
              `shrink-0`, así que al no caber se encoge y los enlaces envuelven
              a dos líneas: el header entero cambia de alto.

              Remedido sobre los woff2 del build al devolver "Nuestra Compañía"
              al nav (DM Sans 500 a 14px en los enlaces; el CTA va en Archivo
              600, que es más ancha que la Manrope con la que se midió antes):
              logo a h-10 179px + nav 428px + CTA 191px + los dos gap-4 + el
              px-4 del header = 861px. En `lg` sobran 163px; a 768px faltarían
              93. Con tres etiquetas eran 707px, así que esta cuarta consume
              155px de la holgura — la que queda alcanza, pero una quinta
              etiqueta o una más larga hay que volver a medirla.

              Antes estaba en `md` y ya se pasaba 24px entre 768 y 792px —el
              defecto existía con la etiqueta corta, sólo que en una franja
              estrechísima—. Al alargar "Nosotros" a "Nuestra Compañía" esa
              franja creció a 768–855px, que es justo donde caen las tablets en
              vertical (iPad 810, iPad Air 820), así que dejó de ser teórico.

              El estado condensado no tiene este problema: va a max-w-4xl y le
              sobran 188px. Si alguna vez se acorta el nav, esto puede volver a
              `md`. */}
          {hayNav && (
            <nav
              ref={desktopNavRef}
              aria-label="Principal"
              className={`hidden items-center border border-transparent text-sm font-medium text-brand-900 transition-[max-width,padding,gap,background-color,border-radius,box-shadow] duration-300 motion-reduce:transition-none lg:flex ${
                isCondensed
                  ? "gap-6 px-2 py-1"
                  : "glass gap-8 rounded-full px-8 py-3"
              }`}
            >
              {enlaces.map((link) =>
                link.megaMenu && gruposServicios.length > 0 ? (
                  /* Disparador del mega menú: un <Link> real a /servicios,
                     así que el clic navega aunque el panel no se abra. Abre
                     con hover y con foco; el cierre por puntero espera 150 ms
                     para poder cruzar al panel. */
                  <Link
                    key={link.href}
                    ref={megaTriggerRef}
                    href={link.href}
                    aria-expanded={isMegaOpen}
                    aria-controls={MEGA_PANEL_ID}
                    onMouseEnter={openMega}
                    onMouseLeave={scheduleMegaClose}
                    onFocus={() => {
                      if (skipFocusOpen.current) {
                        skipFocusOpen.current = false;
                        return;
                      }
                      openMega();
                    }}
                    onBlur={onMegaBlur}
                    onKeyDown={onMegaTriggerKeyDown}
                    onClick={closeMega}
                    className="inline-flex items-center gap-1 transition-opacity hover:opacity-70"
                  >
                    {link.label}
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${
                        isMegaOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Link>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-opacity hover:opacity-70"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          )}

          {/* 3. CTA — cristal AZUL. Al 88% es casi opaco, así que dentro de la
              barra glass de B no se lee como vidrio sobre vidrio sino como una
              pastilla sólida de acento. Por eso no hace falta adaptarlo. */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Cristal azul: el cuerpo, las sombras en capas, el barrido de
              brillo y el respeto a prefers-reduced-motion viven en la utilidad
              `.glass-cta` de globals.css. Aquí sólo va la forma y el contenido.
              El padding baja en móvil: con px-9 py-4 el botón no cabía junto al
              logo y al ícono del menú. */}
            <QuoteButton
              className={`glass-cta group inline-flex items-center gap-2 rounded-full font-heading text-xs font-semibold text-white transition-all duration-300 motion-reduce:transition-none ${
                isCondensed
                  ? "px-5 py-2 sm:px-6 sm:py-2.5"
                  : "px-6 py-3 sm:px-9 sm:py-3 sm:text-sm"
              }`}
            >
              Contáctenos
              {/* La flecha se mueve con `transform`, que no reflowea: no descuadra
                el header. Los 3px de desplazamiento caben de sobra dentro del
                padding, así que el `overflow: hidden` del botón no la recorta.
                Bajo `motion-safe:` para que la preferencia del sistema la
                congele junto con el resto de los movimientos. */}
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-250 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:-translate-y-[3px] motion-safe:group-hover:translate-x-[3px]"
              />
            </QuoteButton>

            {hayNav && (
              <button
                ref={openButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={isMenuOpen}
                aria-controls={MOBILE_PANEL_ID}
                // Sin fondo propio detrás, este ícono cambia de color por la
                // misma razón que el logo.
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden ${
                  onDarkSurface
                    ? "text-white hover:bg-white/15"
                    : "text-brand-900 hover:bg-brand-900/10"
                }`}
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* ---- Mega menú de escritorio ----
            Hijo del <header> y NO del <nav>: la cápsula del nav (estado A) y
            la barra condensada (estado B) llevan `backdrop-filter`, que crea
            un containing block, así que dentro de ellas el panel se mediría
            contra la cápsula y no podría ir a ancho completo. Aquí se
            posiciona contra el <header>, que es `fixed` y ocupa todo el ancho.

            El `pt-3` es un puente transparente entre la barra y la tarjeta:
            el puntero lo recorre sin salir del panel. Y como el panel no sigue
            al disparador en el DOM, la tabulación la cosen
            `onMegaTriggerKeyDown` y `onMegaPanelKeyDown`.

            Siempre montado (con `hidden` cuando está cerrado) para que el
            `aria-controls` del disparador apunte a un elemento que existe. */}
        {gruposServicios.length > 0 && (
          <div
            ref={megaPanelRef}
            id={MEGA_PANEL_ID}
            hidden={!isMegaOpen}
            onMouseEnter={openMega}
            onMouseLeave={scheduleMegaClose}
            onBlur={onMegaBlur}
            onKeyDown={onMegaPanelKeyDown}
            className="absolute inset-x-4 top-full hidden pt-3 lg:block"
          >
            <div className="mx-auto max-w-7xl rounded-3xl border border-brand-100 bg-white p-10 shadow-xl shadow-brand-900/10">
              {/* Cuatro columnas iguales con `divide-x`: la línea va SÓLO
                  entre columnas (en Tailwind v4, borde derecho de todas menos
                  la última), y
                  `items-stretch` hace que corra a la altura completa de la
                  fila y no sólo a la del contenido de cada columna. Cada
                  columna lleva `px-7` para separar los enlaces de la línea;
                  la primera y la última lo pierden por fuera para alinear con
                  el padding del panel y con la fila de abajo. */}
              <div className="grid grid-cols-4 items-stretch divide-x divide-brand-100">
                {gruposServicios.map((grupo, i) => (
                  <div
                    key={grupo.slug}
                    className="min-w-0 px-7 first:pl-0 last:pr-0"
                  >
                    {/* <p> y no un heading: el panel está en todas las páginas
                        y un encabezado aquí metería un nivel suelto antes del
                        <h1> de cada una. Más chico, con tracking abierto y un
                        tono más tenue que los enlaces para que no compita con
                        ellos (slate-500 sobre blanco: 4.76:1, pasa AA). */}
                    <p className="text-xs font-semibold tracking-wide text-slate-500">
                      {grupo.nombre}
                    </p>
                    {/* `py-1.5` por enlace + `space-y-0.5` = 14px entre
                        líneas de texto, y `mt-3.5` + el `py-1.5` del primero
                        = 20px del encabezado al primer enlace. Enlaces en
                        bloque, con área clicable a lo ancho de la columna; el
                        `-mx-3` deja que el fondo del hover sobresalga sin
                        mover el texto. */}
                    <ul className="mt-3.5 space-y-0.5">
                      {grupo.servicios.map((servicio) => (
                        <li key={servicio.slug}>
                          <Link
                            href={`/servicios/${servicio.slug}`}
                            onClick={closeMega}
                            className="-mx-3 block rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-900 focus-visible:text-brand-900"
                          >
                            {servicio.nombre}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* Cierre en la última columna, que con cuatro enlaces
                        dejaba media columna vacía frente a las de seis.
                        Copy del bloque "Soluciones logísticas integrales" de
                        la home (<IntegratedSolutions>): su título, la última
                        oración de su párrafo y el texto de su botón. Abre el
                        mismo <QuoteModal>; cierra el panel antes. Sólo existe
                        aquí: el acordeón móvil no lo lleva. */}
                    {i === gruposServicios.length - 1 ? (
                      <div className="mt-8 rounded-2xl bg-brand-100 p-5">
                        <p className="font-heading text-sm font-bold text-brand-900">
                          Soluciones logísticas integrales
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          Un solo punto de contacto para toda su operación
                          internacional.
                        </p>
                        <QuoteButton
                          onClick={closeMega}
                          className="mt-4 rounded-full bg-brand-900 px-5 py-2 font-heading text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Solicite una cotización
                        </QuoteButton>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-brand-100 pt-6">
                <Link
                  href="/servicios"
                  onClick={closeMega}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-900 transition-opacity hover:opacity-70"
                >
                  Ver todos los servicios
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---- Menú móvil: panel a pantalla completa ----

          SIN VELO Y SIN CAPA EXTERIOR. Antes eran dos elementos: un `fixed
          inset-0` que sostenía el `bg-black/50` clicable y, dentro, un panel de
          288px pegado a la derecha. Con el panel cubriendo la pantalla entera ya
          no hay un "fuera" que oscurecer ni al que se pueda hacer clic, así que
          el velo desapareció y el panel ES el elemento fijo.

          CUBRE TAMBIÉN AL <header>, que va en z-40: de ahí que el logo y el
          botón de cerrar tengan que vivir aquí dentro. Antes el logo que se veía
          arriba a la izquierda era el del header asomando junto al panel
          estrecho; ahora queda tapado y hay que ponerlo. */}
      {isMenuOpen && hayNav && (
        <div
          ref={panelRef}
          id={MOBILE_PANEL_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className="fixed inset-x-0 top-0 z-50 flex h-dvh flex-col bg-white motion-safe:animate-slide-in-right lg:hidden"
        >
          <div className="flex h-20 shrink-0 items-center justify-between px-6">
            {/* Mismo destino y mismo tamaño que el logo del header, y sin el
                `brightness-0 invert`: aquí el fondo es siempre blanco, así que
                va en su color natural. A 320px mide 161px de ancho y convive de
                sobra con el botón de cerrar. */}
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex shrink-0 items-center"
            >
              <Image
                src="/brand/logotipo.svg"
                alt="Compass Solutions"
                width={1617}
                height={362}
                unoptimized
                className="h-9 w-auto"
              />
            </Link>

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

          {/* El bloque se pega ABAJO y todo el aire sobrante queda entre la
              cabecera y los enlaces, que es lo que pide un menú a pantalla
              completa.

              CON `mt-auto` EN EL <nav>, NO CON `justify-end` EN ESTE
              CONTENEDOR: hacen lo mismo mientras el contenido quepa, pero si
              algún día no cupiera, `justify-end` deja el principio del contenido
              FUERA del área desplazable y no hay forma de llegar a él —el
              desbordamiento por el borde de inicio no genera scroll—. El margen
              automático se resuelve a cero en cuanto falta sitio y el contenedor
              se desplaza con normalidad desde arriba.

              ALTURA Y SCROLL. El panel mide `h-dvh` (no `inset-0` ni 100vh)
              para que la barra de direcciones de Safari no corte el final; la
              cabecera de arriba es `shrink-0` y queda fija, y este contenedor
              (`flex-1 min-h-0 overflow-y-auto`) es lo único que se desplaza.
              Con el acordeón de "Servicios" el contenido supera el viewport
              en cualquier teléfono, así que el scroll propio ya es necesario.

              `data-lenis-prevent` ES OBLIGATORIO, mismo patrón que <QuoteModal>
              y <WhatsAppModal>. Lenis queda pausado mientras el menú está
              abierto, pero pausado sigue escuchando la rueda y el táctil y
              llama a `preventDefault()`: sin la marca, este contenedor no se
              podía desplazar ni con el dedo ni con la rueda (medido), sólo
              moviendo el foco con teclado.

              El `pb` suma `env(safe-area-inset-bottom)` para que el último
              elemento no quede bajo la barra inferior del navegador, y
              `-webkit-overflow-scrolling: touch` da la inercia en iOS viejos. */}
          <div
            data-lenis-prevent
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]"
          >
            <nav
              aria-label="Principal (móvil)"
              className="mt-auto flex flex-col gap-1"
            >
              {enlaces.map((link) =>
                link.megaMenu && gruposServicios.length > 0 ? (
                  /* "Servicios" en móvil: acordeón con los cuatro grupos. El
                     botón tiene la misma tipografía que los enlaces de al
                     lado; cada enlace de servicio mide al menos 44px de alto
                     (`min-h-11`), el mínimo táctil. */
                  <div key={link.href}>
                    <button
                      type="button"
                      aria-expanded={isMobileServiciosOpen}
                      aria-controls={MOBILE_SERVICIOS_ID}
                      onClick={() => setIsMobileServiciosOpen((v) => !v)}
                      className="flex w-full items-center justify-between py-2 text-left font-heading text-3xl font-bold leading-tight text-brand-900 transition-colors hover:text-brand-700 sm:text-4xl"
                    >
                      {link.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-7 w-7 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                          isMobileServiciosOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      id={MOBILE_SERVICIOS_ID}
                      hidden={!isMobileServiciosOpen}
                      className="pb-4"
                    >
                      {/* Cada grupo es su propio acordeón: el botón muestra
                          u oculta sólo sus enlaces. Botón y enlaces miden al
                          menos 44px de alto (`min-h-11`). */}
                      {gruposServicios.map((grupo) => {
                        const abierto = gruposMovilAbiertos.has(grupo.slug);
                        const idLista = `menu-movil-grupo-${grupo.slug}`;
                        return (
                          <div key={grupo.slug} className="mt-2">
                            <button
                              type="button"
                              aria-expanded={abierto}
                              aria-controls={idLista}
                              onClick={() => toggleGrupoMovil(grupo.slug)}
                              className="flex min-h-11 w-full items-center justify-between text-left font-heading text-base font-bold text-brand-900"
                            >
                              {grupo.nombre}
                              <ChevronDown
                                aria-hidden="true"
                                className={`h-5 w-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                                  abierto ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            <ul id={idLista} hidden={!abierto} className="pl-3">
                              {grupo.servicios.map((servicio) => (
                                <li key={servicio.slug}>
                                  <Link
                                    href={`/servicios/${servicio.slug}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex min-h-11 items-center text-base text-slate-600 transition-colors hover:text-brand-900"
                                  >
                                    {servicio.nombre}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                      <Link
                        href="/servicios"
                        onClick={() => setIsMenuOpen(false)}
                        className="mt-4 flex min-h-11 items-center gap-1.5 font-heading text-base font-semibold text-brand-900"
                      >
                        Ver todos los servicios
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* TIPOGRAFÍA DE MENÚ, no de lista: `font-heading` (Archivo) a
                     text-3xl en teléfono y text-4xl de 640px en adelante — el
                     panel llega hasta 1023px, así que esa segunda talla es para
                     tableta. Eran 16px en peso medium con la fuente de cuerpo.

                     El `py-2` no es decorativo: la línea a 30px mide 37.5px de
                     alto y el mínimo táctil cómodo son 44px. Con él cada enlace
                     ocupa 53.5px de alto real. */
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2 font-heading text-3xl font-bold leading-tight text-brand-900 transition-colors hover:text-brand-700 sm:text-4xl"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>

            {/* MISMO BOTÓN QUE EL DEL HEADER, y no por parecido: el panel tapa
                el header, así que este CTA ES el "Contáctenos" de arriba
                mientras el menú está abierto. Repite su `.glass-cta`, su
                tipografía y su flecha; sólo cambia a ancho completo y con el
                contenido centrado, que es lo que corresponde al pie de un menú
                de pantalla completa.

                CIERRA EL MENÚ AL ABRIR EL MODAL. Dejarlo abierto detrás
                apilaría dos diálogos `aria-modal` con dos trampas de foco y dos
                bloqueos del scroll del body peleándose. React procesa el cierre
                y la apertura en el mismo commit —primero las limpiezas, después
                los efectos nuevos—, así que el menú restituye el scroll y el
                foco justo antes de que el modal se los quede. El foco acaba en
                el modal, que es donde debe estar. */}
            <QuoteButton
              onClick={() => setIsMenuOpen(false)}
              className="glass-cta group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-heading text-sm font-semibold text-white transition-all duration-300 motion-reduce:transition-none"
            >
              Contáctenos
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-250 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:-translate-y-[3px] motion-safe:group-hover:translate-x-[3px]"
              />
            </QuoteButton>
          </div>
        </div>
      )}
    </>
  );
}
