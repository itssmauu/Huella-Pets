import { z } from "zod";

const cedulaSchema = z
  .string()
  .trim()
  .min(1, "La cédula es obligatoria")
  .max(20, "La cédula no puede tener más de 20 caracteres")
  .regex(/^[A-Za-z0-9-]+$/, "La cédula solo puede tener letras, números y guiones");

export const crearClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60),
  apellido: z.string().min(1, "El apellido es obligatorio").max(60),
  cedula: cedulaSchema,
  telefono: z.string().max(20).optional(),
  email: z.string().email("Correo inválido").max(120).optional(),
  direccion: z.string().max(200).optional(),
});

export const actualizarClienteSchema = z.object({
  nombre: z.string().min(1).max(60).optional(),
  apellido: z.string().min(1).max(60).optional(),
  cedula: cedulaSchema.optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().email("Correo inválido").max(120).optional(),
  direccion: z.string().max(200).optional(),
  estado: z.boolean().optional(),
});