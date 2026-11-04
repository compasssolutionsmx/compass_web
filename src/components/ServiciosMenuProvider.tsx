import type { ReactNode } from "react";
import { gruposServicios } from "@/lib/servicios-contenido";
import { ServiciosMenuProvider as Provider } from "./ServiciosMenu";

/**
 * Envoltura de SERVIDOR del contexto del mega menú: lee la agrupación oficial
 * de `lib/servicios-contenido.ts` y pasa al proveedor de cliente sólo la forma
 * ligera (slug y nombre de cada grupo y servicio).
 */
export default function ServiciosMenuProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <Provider grupos={gruposServicios()}>{children}</Provider>;
}
