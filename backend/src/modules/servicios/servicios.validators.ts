import { z } from "zod";

export const crearServicioSchema = z.object({
  idTipoServicio: z.number().int().positive("Debe indicar un tipo de servicio válido"),
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  descripcion: z.string().trim().max(500).optional(),
  precio: z.number().positive("El precio debe ser mayor a 0"),
  duracionEstimada: z.number().int().positive("La duración debe ser mayor a 0").optional(),
});

export const actualizarServicioSchema = z.object({
  idTipoServicio: z.number().int().positive("Debe indicar un tipo de servicio válido").optional(),
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100).optional(),
  descripcion: z.string().trim().max(500).optional(),
  precio: z.number().positive("El precio debe ser mayor a 0").optional(),
  duracionEstimada: z.number().int().positive("La duración debe ser mayor a 0").optional(),
  estado: z.boolean().optional(),
});