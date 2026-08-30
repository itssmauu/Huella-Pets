import { apiFetch } from "./client";

export interface TipoServicio {
  id_tipo_servicio: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

export function listarTiposServicio(token: string) {
  return apiFetch<TipoServicio[]>("/tipos-servicio", { token });
}

export function crearTipoServicio(token: string, nombre: string, descripcion?: string) {
  return apiFetch<TipoServicio>("/tipos-servicio", { method: "POST", token, body: { nombre, descripcion } });
}