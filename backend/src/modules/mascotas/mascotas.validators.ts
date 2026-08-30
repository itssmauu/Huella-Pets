import { z } from "zod";

export const crearMascotaSchema = z.object({
  idCliente: z.number().int().positive("Selecciona un cliente"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(60),
  especie: z.string().min(1, "La especie es obligatoria").max(30),
  raza: z.string().max(60).optional(),
  sexo: z.enum(["M", "H"]).optional(),
  fechaNacimiento: z.string().optional(),
  peso: z.number().positive().optional(),
  observaciones: z.string().max(300).optional(),
});

export const actualizarMascotaSchema = z.object({
  nombre: z.string().min(1).max(60).optional(),
  especie: z.string().min(1).max(30).optional(),
  raza: z.string().max(60).optional(),
  sexo: z.enum(["M", "H"]).optional(),
  fechaNacimiento: z.string().optional(),
  peso: z.number().positive().optional(),
  observaciones: z.string().max(300).optional(),
  estado: z.boolean().optional(),
});