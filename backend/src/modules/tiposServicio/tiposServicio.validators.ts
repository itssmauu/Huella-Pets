import { z } from "zod";

export const crearTipoServicioSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  descripcion: z.string().trim().max(500).optional(),
});

export const actualizarTipoServicioSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100).optional(),
  descripcion: z.string().trim().max(500).optional(),
  estado: z.boolean().optional(),
});