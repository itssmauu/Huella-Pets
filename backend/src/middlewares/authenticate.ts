import { NextFunction, Request, Response } from "express";
import { query } from "../config/db";
import { UnauthorizedError } from "../shared/AppError";
import { hashToken, verifyToken } from "../shared/jwt";

export interface AuthUser {
  idUsuario: number;
  username: string;
  rol: "CAJERO" | "GERENTE";
  idSesion: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface SesionRow {
  id_sesion: number;
  id_usuario: number;
  username: string;
  nombre_rol: "CAJERO" | "GERENTE";
  estado: boolean;
}

/**
 * RF-AUTH-05: protege cada endpoint validando el token en el backend,
 * no solo ocultando opciones en el frontend.
 *
 * Verifica, en este orden: (1) que venga un Bearer token bien formado,
 * (2) que la firma y expiración del JWT sean válidas, (3) que exista
 * una sesión activa (no revocada, no expirada) para ese token exacto
 * — esto es lo que hace que "cerrar sesión" invalide el token de
 * verdad y no solo lo borre del navegador (RF-AUTH-02, RF-AUTH-04) —
 * y (4) que el usuario siga activo.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError("Debe iniciar sesión para continuar");
    }
    const token = header.slice("Bearer ".length).trim();

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new UnauthorizedError("Sesión inválida o expirada, inicie sesión nuevamente");
    }

    const tokenHash = hashToken(token);
    const { rows } = await query<SesionRow>(
      `SELECT s.id_sesion, s.id_usuario, u.username, r.nombre_rol, u.estado
         FROM sesiones s
         JOIN usuarios u ON u.id_usuario = s.id_usuario
         JOIN roles r ON r.id_rol = u.id_rol
        WHERE s.token_hash = $1
          AND s.revocado = FALSE
          AND s.fecha_expiracion > now()`,
      [tokenHash]
    );

    const sesion = rows[0];
    if (!sesion) {
      throw new UnauthorizedError("Sesión inválida o expirada, inicie sesión nuevamente");
    }
    if (!sesion.estado) {
      throw new UnauthorizedError("Esta cuenta está inactiva, contacte al administrador");
    }
    if (sesion.id_usuario !== payload.sub) {
      // El token es válido criptográficamente pero no corresponde a
      // esta sesión (no debería ocurrir; defensa en profundidad).
      throw new UnauthorizedError("Sesión inválida o expirada, inicie sesión nuevamente");
    }

    req.user = {
      idUsuario: sesion.id_usuario,
      username: sesion.username,
      rol: sesion.nombre_rol,
      idSesion: sesion.id_sesion,
    };
    next();
  } catch (err) {
    next(err);
  }
}