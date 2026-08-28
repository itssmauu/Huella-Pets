import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";

export interface JwtPayload {
  sub: number; // id_usuario
  username: string;
  rol: "CAJERO" | "GERENTE";
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * El JWT nunca se guarda en texto plano en la tabla `sesiones`
 * (mismo criterio que las contraseñas): se guarda su hash SHA-256,
 * y en cada solicitud se recalcula el hash del token recibido para
 * comparar contra la fila de la sesión.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}