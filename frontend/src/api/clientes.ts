import { apiFetch } from "./client";

export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estado: boolean;
  fecha_registro: string;
}

export interface CrearClienteInput {
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export function listarClientes(token: string, q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiFetch<Cliente[]>(`/clientes${query}`, { token });
}

export function crearCliente(token: string, input: CrearClienteInput) {
  return apiFetch<Cliente>("/clientes", { method: "POST", token, body: input });
}

export function actualizarCliente(token: string, id: number, cambios: Partial<CrearClienteInput>) {
  return apiFetch<Cliente>(`/clientes/${id}`, { method: "PUT", token, body: cambios });
}