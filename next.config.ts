import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Ya sólo queda el logo de ALACAT: los demás assets del WordPress
      // (logotipo de marca y los otros 3 logos de certificaciones) migraron a
      // /public.
      // TODO: eliminar este patrón en cuanto llegue alacat.png.
      {
        protocol: "https",
        hostname: "compasssolutions.com.mx",
        pathname: "/wp-content/uploads/**",
      },
      // TEMPORAL: placeholders de placehold.co.
      // TODO: eliminar este patrón cuando todas las imágenes usen assets
      // propios (`/public` o el CDN definitivo).
      // Se omite `search` a propósito porque las URLs de placehold.co llevan
      // query string (`?text=...`).
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
