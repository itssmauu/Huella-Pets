import { z } from "zod";

const productoVentaSchema = z.object({
  idProducto: z.number().int().positive("Producto inválido"),
  cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
});

const servicioVentaSchema = z.object({
  idServicio: z.number().int().positive("Servicio inválido"),
  idMascota: z.number().int().positive("Debe indicar la mascota que recibe el servicio"),
});

export const crearVentaSchema = z
  .object({
    idCliente: z.number().int().positive("Debe indicar un cliente"),
    metodoPago: z.enum(["EFECTIVO", "TARJETA", "TRANSFERENCIA"]).default("EFECTIVO"),
    productos: z.array(productoVentaSchema).optional(),
    servicios: z.array(servicioVentaSchema).optional(),
  })
  .refine(
    (data) => (data.productos && data.productos.length > 0) || (data.servicios && data.servicios.length > 0),
    { message: "La venta debe incluir al menos un producto o un servicio", path: ["productos"] }
  );