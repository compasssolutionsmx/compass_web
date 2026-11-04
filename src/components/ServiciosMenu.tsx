"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { GrupoServiciosResuelto } from "@/lib/servicios-contenido";

/**
 * La agrupación de servicios llega al header (componente de cliente) por
 * contexto desde el layout raíz, que es de servidor. Así el header sólo recibe
 * slugs y nombres —lo que pinta el mega menú— y no importa
 * `lib/servicios-contenido.ts`, que arrastraría al bundle del navegador el
 * copy completo de las 18 páginas.
 */
const ServiciosMenuContext = createContext<GrupoServiciosResuelto[]>([]);

export function ServiciosMenuProvider({
  grupos,
  children,
}: {
  grupos: GrupoServiciosResuelto[];
  children: ReactNode;
}) {
  return (
    <ServiciosMenuContext.Provider value={grupos}>
      {children}
    </ServiciosMenuContext.Provider>
  );
}

export function useServiciosMenu(): GrupoServiciosResuelto[] {
  return useContext(ServiciosMenuContext);
}
