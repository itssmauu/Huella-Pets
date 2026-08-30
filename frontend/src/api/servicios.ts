import { apiFetch } from "./client";

export interface Servicio {
  id_servicio: number;
  id_tipo_servicio: number;
  tipo_servicio: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  duracion_estimada: number | null;
  estado: boolean;
}

export interface CrearServicioInput {
  idTipoServicio: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionEstimada?: number;
}

export function listarServicios(token: string, q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiFetch<Servicio[]>(`/servicios${query}`, { token });
}

export function crearServicio(token: string, input: CrearServicioInput) {
  return apiFetch<Servicio>("/servicios", { method: "POST", token, body: input });
}

export function actualizarServicio(
  token: string,
  id: number,
  cambios: Partial<CrearServicioInput> & { estado?: boolean }
) {
  return apiFetch<Servicio>(`/servicios/${id}`, { method: "PUT", token, body: cambios });
}