import { z } from "zod";

export const crearClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60),
  apellido: z.string().min(1, "El apellido es obligatorio").max(60),
  telefono: z.string().max(20).optional(),
  email: z.string().email("Correo inválido").max(120).optional(),
  direccion: z.string().max(200).optional(),
});

export const actualizarClienteSchema = z.object({
  nombre: z.string().min(1).max(60).optional(),
  apellido: z.string().min(1).max(60).optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().email("Correo inválido").max(120).optional(),
  direccion: z.string().max(200).optional(),
  estado: z.boolean().optional(),
});