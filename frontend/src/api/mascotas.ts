import { apiFetch } from "./client";

export interface Mascota {
  id_mascota: number;
  id_cliente: number;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: "M" | "H" | null;
  fecha_nacimiento: string | null;
  peso: string | null;
  observaciones: string | null;
  estado: boolean;
}

export interface CrearMascotaInput {
  idCliente: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo?: "M" | "H";
  fechaNacimiento?: string;
  peso?: number;
  observaciones?: string;
}

export function listarMascotasPorCliente(token: string, idCliente: number) {
  return apiFetch<Mascota[]>(`/mascotas?idCliente=${idCliente}`, { token });
}

export function crearMascota(token: string, input: CrearMascotaInput) {
  return apiFetch<Mascota>("/mascotas", { method: "POST", token, body: input });
}

export interface ActualizarMascotaInput {
  nombre?: string;
  especie?: string;
  raza?: string;
  sexo?: "M" | "H";
  fechaNacimiento?: string;
  peso?: number;
  observaciones?: string;
  estado?: boolean;
}

export function actualizarMascota(token: string, id: number, cambios: ActualizarMascotaInput) {
  return apiFetch<Mascota>(`/mascotas/${id}`, { method: "PUT", token, body: cambios });
}