import { apiFetch } from "./client";

export interface VentaReciente {
  id_compra: number;
  numero_factura: string;
  fecha: string;
  cliente: string;
  metodo_pago: string;
  total: string;
}

export interface ProductoBajo {
  id_producto: number;
  producto: string;
  stock: number;
  stock_minimo: number;
  diferencia: number;
}

export interface ProductoAgotado {
  id_producto: number;
  producto: string;
  stock_minimo: number;
}

export interface ProductoMasVendido {
  id_producto: number;
  producto: string;
  cantidad_vendida: number;
  ingresos_generados: string;
}

export interface ServicioMasRealizado {
  id_servicio: number;
  servicio: string;
  cantidad_realizados: number;
  ingresos_generados: string;
}

export interface ProductoInactivo {
  id_producto: number;
  producto: string;
  categoria: string;
  stock: number;
}

export interface ServicioInactivo {
  id_servicio: number;
  servicio: string;
  tipo_servicio: string;
}

export interface DashboardData {
  ventasHoy: { cantidadVentas: number; totalVendido: string; itbms: string };
  ventasAyerCantidad: number;
  ticketPromedioHistorico: string;
  inventarioBajo: ProductoBajo[];
  inventarioBajoTotal: number;
  productosAgotados: ProductoAgotado[];
  productosAgotadosTotal: number;
  ventasRecientes: VentaReciente[];
  productosMasVendidos: ProductoMasVendido[];
  serviciosMasRealizados: ServicioMasRealizado[];
  productosInactivos: ProductoInactivo[];
  serviciosInactivos: ServicioInactivo[];
}

export function obtenerDashboard(token: string) {
  return apiFetch<DashboardData>("/reportes/dashboard", { token });
}