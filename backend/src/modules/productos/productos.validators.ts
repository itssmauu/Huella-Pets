import { z } from "zod";

export const crearProductoSchema = z.object({
  idCategoria: z.number().int().positive("Selecciona una categoría"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
  descripcion: z.string().max(300).optional(),
  precio: z.number().positive("El precio debe ser mayor a 0"),
  stock: z.number().int().min(0).optional().default(0),
  stockMinimo: z.number().int().min(0).optional().default(5),
});

export const actualizarProductoSchema = z.object({
  idCategoria: z.number().int().positive().optional(),
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().max(300).optional(),
  precio: z.number().positive().optional(),
  stockMinimo: z.number().int().min(0).optional(),
  estado: z.boolean().optional(),
});

export const ajustarStockSchema = z.object({
  cantidad: z.number().int().refine((n) => n !== 0, "La cantidad no puede ser cero"),
  motivo: z.string().max(200).optional(),
});