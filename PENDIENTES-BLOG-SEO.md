# Pendiente del blog: los redirects 301 desde las URLs viejas

> Las cinco tareas SEO de este documento **ya se ejecutaron** (migración de los 3
> posts, anclas congeladas, title tags, enlaces internos, tuteo). Lo que queda es
> la única decisión de fondo que no se tomó: qué hacer con las URLs indexadas.

## El problema

`src/lib/blog.ts` tiene un `TODO` sin resolver: el sitio actual de WordPress
publica los artículos **en la raíz** (`/funciones-agente-aduanal-mexico`), no
bajo `/blog/`. El sitio nuevo los publica en `/blog/<slug>`.

Son 39 artículos con SEO ya indexado. **Si se publica sin redirects, ese SEO se
pierde**: Google trata las URLs nuevas como contenido nuevo, sin historial.

## Las dos salidas

1. **Redirects 301 desde las URLs viejas.** Es lo estándar y lo que conserva la
   autoridad acumulada. Los slugs coinciden uno a uno, así que basta una regla
   que mapee `/<slug>` → `/blog/<slug>` para los 39 slugs conocidos —no un
   comodín, que capturaría rutas legítimas de la raíz como `/nosotros` o
   `/vacantes`. En Vercel se declara en `vercel.ts`; en Next, en `redirects()`
   dentro de `next.config`.
2. **Conservar las URLs en la raíz.** Mantiene el SEO sin redirects, pero mezcla
   los artículos con las páginas del sitio y complica la estructura de rutas.

La lista de slugs sale de:

```bash
ls src/content/blog/*.mdx | xargs -n1 basename | sed 's/\.mdx$//'
```

## Verificación de que lo demás sigue sano

```bash
npx tsc --noEmit                                              # limpio
grep -l "Texto de ejemplo pendiente" src/content/blog/*.mdx   # vacío

# ningún enlace interno apunta a un slug inexistente
grep -rhoE '\]\(/blog/[a-z0-9-]+' src/content/blog/*.mdx | sed 's|.*/blog/||' \
  | sort -u | while read s; do
      [ -f "src/content/blog/$s.mdx" ] || echo "ENLACE ROTO: $s"
    done
```

Estado tras la pasada SEO: 39 artículos, 0 con title tag >60 caracteres, 0 sin
enlaces salientes, 0 huérfanos, 0 enlaces rotos.

**Borra este archivo cuando decidas lo de los redirects.**
