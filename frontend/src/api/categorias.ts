import { apiFetch } from "./client";

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

export function listarCategorias(token: string) {
  return apiFetch<Categoria[]>("/categorias", { token });
}

export function crearCategoria(token: string, nombre: string, descripcion?: string) {
  return apiFetch<Categoria>("/categorias", { method: "POST", token, body: { nombre, descripcion } });
}