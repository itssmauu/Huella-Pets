import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/AppError";
import { AuthUser } from "./authenticate";

/**
 * RF-AUTH-06: impide el acceso a funciones administrativas a usuarios
 * con rol Cajero, aunque se invoque el endpoint directamente (no
 * depende de que el frontend oculte el botón).
 *
 * Uso: router.post('/productos', authenticate, authorize('GERENTE'), ...)
 */
export function authorize(...rolesPermitidos: Array<AuthUser["rol"]>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Debe iniciar sesión para continuar"));
      return;
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      next(new ForbiddenError("No tiene permisos para realizar esta acción"));
      return;
    }
    next();
  };
}