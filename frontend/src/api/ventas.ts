import { apiFetch } from "./client";

export interface VentaRegistrada {
  id_compra: number;
  numero_factura: string;
  subtotal: string;
  itbms: string;
  total: string;
}

export interface CrearVentaInput {
  idCliente: number;
  metodoPago: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";
  productos?: { idProducto: number; cantidad: number }[];
  servicios?: { idServicio: number; idMascota: number }[];
}

export function crearVenta(token: string, input: CrearVentaInput) {
  return apiFetch<VentaRegistrada>("/ventas", { method: "POST", token, body: input });
}