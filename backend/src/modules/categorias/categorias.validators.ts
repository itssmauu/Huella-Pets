import { z } from "zod";

export const crearCategoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60),
  descripcion: z.string().max(200).optional(),
});

export const actualizarCategoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60).optional(),
  descripcion: z.string().max(200).optional(),
  estado: z.boolean().optional(),
});