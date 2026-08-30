import { query } from "../../config/db";

export interface VentaRegistrada {
  id_compra: number;
  numero_factura: string;
  subtotal: string;
  itbms: string;
  total: string;
}

interface ProductoVenta {
  idProducto: number;
  cantidad: number;
}

interface ServicioVenta {
  idServicio: number;
  idMascota: number;
}

/**
 * Delega el registro completo de la venta a fn_registrar_venta()
 * (database/04_funciones.sql): valida cliente, productos/servicios
 * activos, descuenta stock y calcula ITBMS de forma atómica dentro de
 * PostgreSQL. Si cualquier paso falla, la función lanza una excepción
 * (código P0001) que errorHandler.ts ya traduce a un mensaje de
 * negocio legible — no hace falta envolver esto en withTransaction
 * porque la propia función es la transacción.
 */
export async function registrarVenta(
  idCliente: number,
  idUsuario: number,
  metodoPago: string,
  productos: ProductoVenta[] | undefined,
  servicios: ServicioVenta[] | undefined
): Promise<VentaRegistrada> {
  const productosJson = JSON.stringify(
    (productos ?? []).map((p) => ({ id_producto: p.idProducto, cantidad: p.cantidad }))
  );
  const serviciosJson = JSON.stringify(
    (servicios ?? []).map((s) => ({ id_servicio: s.idServicio, id_mascota: s.idMascota }))
  );

  const { rows } = await query<VentaRegistrada>(
    `SELECT * FROM fn_registrar_venta($1, $2, $3, $4::jsonb, $5::jsonb)`,
    [idCliente, idUsuario, metodoPago, productosJson, serviciosJson]
  );
  return rows[0];
}