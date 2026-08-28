import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { catchAsync } from "../../shared/catchAsync";
import { query } from "../../config/db";

/**
 * Endpoint mínimo de demostración para probar authorize() de punta a
 * punta (solo Gerente). El módulo completo de gestión de usuarios
 * (crear cajeros, activar/desactivar cuentas) se construye junto con
 * el resto del catálogo administrativo en el siguiente módulo.
 */
export const usuariosRouter = Router();

usuariosRouter.get(
  "/",
  authenticate,
  authorize("GERENTE"),
  catchAsync(async (_req, res) => {
    const { rows } = await query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.username, u.email,
              u.estado, u.ultimo_login, r.nombre_rol AS rol
         FROM usuarios u
         JOIN roles r ON r.id_rol = u.id_rol
        ORDER BY u.nombre, u.apellido`
    );
    res.status(200).json(rows);
  })
);