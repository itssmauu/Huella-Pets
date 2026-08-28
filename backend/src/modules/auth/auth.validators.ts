import { z } from "zod";

export const loginSchema = z.object({
  usuario: z.string().min(1, "El usuario o correo es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const cambiarPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "Debe indicar la contraseña actual"),
    passwordNueva: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.passwordActual !== data.passwordNueva, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["passwordNueva"],
  });