import { query } from "../../config/db";

interface VentaDiaRow {
  cantidad_ventas: number;
  subtotal: string;
  itbms: string;
  total_vendido: string;
}

interface VentaAyerRow {
  cantidad_ventas: number;
}

interface VentasTotalesRow {
  cantidad_ventas: number;
  total_vendido: string;
}

interface ConteoRow {
  total: number;
}

interface ProductoBajoRow {
  id_producto: number;
  producto: string;
  stock: number;
  stock_minimo: number;
  diferencia: number;
}

interface ProductoAgotadoRow {
  id_producto: number;
  producto: string;
  stock_minimo: number;
}

interface VentaRecienteRow {
  id_compra: number;
  numero_factura: string;
  fecha: string;
  cliente: string;
  metodo_pago: string;
  total: string;
}

interface ProductoMasVendidoRow {
  id_producto: number;
  producto: string;
  cantidad_vendida: number;
  ingresos_generados: string;
}

interface ServicioMasRealizadoRow {
  id_servicio: number;
  servicio: string;
  cantidad_realizados: number;
  ingresos_generados: string;
}

export interface DashboardData {
  ventasHoy: { cantidadVentas: number; totalVendido: string; itbms: string };
  ventasAyerCantidad: number;
  ticketPromedioHistorico: string;
  inventarioBajo: ProductoBajoRow[];
  inventarioBajoTotal: number;
  productosAgotados: ProductoAgotadoRow[];
  productosAgotadosTotal: number;
  ventasRecientes: VentaRecienteRow[];
  productosMasVendidos: ProductoMasVendidoRow[];
  serviciosMasRealizados: ServicioMasRealizadoRow[];
}

export async function obtenerDashboard(): Promise<DashboardData> {
  const [
    ventasHoyRes,
    ventasAyerRes,
    totalesRes,
    inventarioBajoRes,
    inventarioBajoCountRes,
    agotadosRes,
    agotadosCountRes,
    recientesRes,
    masVendidosRes,
    masSolicitadosRes,
  ] = await Promise.all([
    query<VentaDiaRow>(`SELECT cantidad_ventas, subtotal, itbms, total_vendido FROM vw_ventas_diarias WHERE dia = CURRENT_DATE`),
    query<VentaAyerRow>(`SELECT cantidad_ventas FROM vw_ventas_diarias WHERE dia = CURRENT_DATE - INTERVAL '1 day'`),
    query<VentasTotalesRow>(`SELECT cantidad_ventas, total_vendido FROM vw_ventas_totales`),
    query<ProductoBajoRow>(`SELECT * FROM vw_inventario_bajo LIMIT 5`),
    query<ConteoRow>(`SELECT COUNT(*)::INT AS total FROM vw_inventario_bajo`),
    query<ProductoAgotadoRow>(`SELECT * FROM vw_productos_agotados LIMIT 5`),
    query<ConteoRow>(`SELECT COUNT(*)::INT AS total FROM vw_productos_agotados`),
    query<VentaRecienteRow>(`SELECT * FROM vw_historial_compras WHERE estado = 'COMPLETADA' LIMIT 4`),
    query<ProductoMasVendidoRow>(`SELECT * FROM vw_productos_mas_vendidos LIMIT 3`),
    query<ServicioMasRealizadoRow>(`SELECT * FROM vw_servicios_mas_realizados LIMIT 3`),
  ]);

  const hoy = ventasHoyRes.rows[0];
  const totales = totalesRes.rows[0];
  const cantidadHistorica = Number(totales?.cantidad_ventas ?? 0);
  const totalHistorico = Number(totales?.total_vendido ?? 0);

  return {
    ventasHoy: {
      cantidadVentas: Number(hoy?.cantidad_ventas ?? 0),
      totalVendido: hoy?.total_vendido ?? "0.00",
      itbms: hoy?.itbms ?? "0.00",
    },
    ventasAyerCantidad: Number(ventasAyerRes.rows[0]?.cantidad_ventas ?? 0),
    ticketPromedioHistorico: cantidadHistorica > 0 ? (totalHistorico / cantidadHistorica).toFixed(2) : "0.00",
    inventarioBajo: inventarioBajoRes.rows,
    inventarioBajoTotal: inventarioBajoCountRes.rows[0].total,
    productosAgotados: agotadosRes.rows,
    productosAgotadosTotal: agotadosCountRes.rows[0].total,
    ventasRecientes: recientesRes.rows,
    productosMasVendidos: masVendidosRes.rows,
    serviciosMasRealizados: masSolicitadosRes.rows,
  };
}