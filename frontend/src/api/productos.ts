import { apiFetch } from "./client";

export interface Producto {
  id_producto: number;
  id_categoria: number;
  categoria: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  stock: number;
  stock_minimo: number;
  estado: boolean;
}

export interface CrearProductoInput {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock?: number;
  stockMinimo?: number;
}

export function listarProductos(token: string, q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiFetch<Producto[]>(`/productos${query}`, { token });
}

export function crearProducto(token: string, input: CrearProductoInput) {
  return apiFetch<Producto>("/productos", { method: "POST", token, body: input });
}

export function actualizarProducto(
  token: string,
  id: number,
  cambios: Partial<CrearProductoInput> & { estado?: boolean }
) {
  return apiFetch<Producto>(`/productos/${id}`, { method: "PUT", token, body: cambios });
}

export function ajustarStockProducto(token: string, id: number, cantidad: number, motivo?: string) {
  return apiFetch<Producto>(`/productos/${id}/stock`, { method: "PATCH", token, body: { cantidad, motivo } });
}