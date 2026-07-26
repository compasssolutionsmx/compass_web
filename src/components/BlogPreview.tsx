import Image from "next/image";
import Link from "next/link";

/**
 * TODO(data): estos posts están hardcodeados desde el spec. En la
 * implementación final deben venir de la API headless de WordPress
 * (`data-source: posts reales via WP headless API` en el spec).
 *
 * PLACEHOLDERS — TODO: reemplazar los `image` con las portadas reales de cada
 * post (vendrán del mismo API) y quitar `unoptimized` de <Image>.
 */
const POSTS = [
  {
    href: "/funciones-agente-aduanal-mexico",
    title:
      "Funciones del agente aduanal en México, ¿qué hace y por qué tu carga depende de él?",
  },
  {
    href: "/empresa-logistica-internacional-monterrey",
    title:
      "Lo que tu empresa debe saber antes de elegir una empresa de logística internacional en Monterrey",
  },
  {
    href: "/ruta-logistica-mx-2026-cierre-comercio-exterior",
    title:
      "Ruta Logística MX 2026: el cierre del programa que transformó la conversación del comercio exterior",
  },
  {
    href: "/tarifarios-logisticos-quincenales-que-son-y-por-que-importan",
    title: "Tarifarios logísticos quincenales: qué son y por qué importan",
  },
  {
    href: "/seguridad-en-transporte-de-carga-como-proteger-tu-mercancia-y-tu-operacion-en-cada-embarque",
    title:
      "Seguridad en transporte de carga: cómo proteger tu mercancía y tu operación en cada embarque",
  },
  {
    href: "/manifestacion-valor-electronica-vucem-guia-importadores",
    title: "Manifestación de Valor Electrónica (MVE) en VUCEM",
  },
];

const PLACEHOLDER_COVER = "https://placehold.co/500x300/e2e8f0/475569?text=Post";

export default function BlogPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-accent">Últimas</p>
          <h2 className="text-3xl font-bold text-brand-navy-900">Noticias</h2>
        </div>
        <Link
          href="/blog"
          className="shrink-0 text-sm font-semibold text-brand-navy-900 hover:underline"
        >
          Ver Más
        </Link>
      </div>

      <ul className="flex snap-x gap-6 overflow-x-auto pb-4">
        {POSTS.map((post) => (
          <li key={post.href} className="min-w-[280px] snap-start">
            <Link
              href={post.href}
              className="block h-full overflow-hidden rounded-xl border border-slate-100"
            >
              <Image
                src={PLACEHOLDER_COVER}
                alt={post.title}
                width={500}
                height={300}
                sizes="280px"
                unoptimized
                className="h-40 w-full object-cover"
              />
              <p className="p-4 text-sm font-medium">{post.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
