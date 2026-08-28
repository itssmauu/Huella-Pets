import { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/AppError";

interface PgError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

/**
 * RNF-11: los errores técnicos de PostgreSQL nunca se muestran
 * directamente al usuario ("ERROR: duplicate key value violates
 * unique constraint..."); se traducen a mensajes de negocio claros.
 * El detalle técnico completo se registra en el log del servidor.
 */
function traducirErrorPostgres(err: PgError): AppError | null {
  switch (err.code) {
    case "23505": // unique_violation
      return new AppError("Ya existe un registro con esos datos.", 409);
    case "23503": // foreign_key_violation
      return new AppError(
        "No se puede completar la operación porque hace referencia a datos que no existen o están en uso.",
        409
      );
    case "23514": // check_violation
      return new AppError(
        "Los datos no cumplen con las reglas del sistema (por ejemplo, precio o cantidad inválidos).",
        400
      );
    case "23502": // not_null_violation
      return new AppError("Falta completar un campo obligatorio.", 400);
    case "P0001": // RAISE EXCEPTION explícito en una función PL/pgSQL
      // Estas excepciones ya se escriben pensando en el usuario final
      // (ver database/04_funciones.sql y 05_triggers.sql), así que se
      // reenvía el mensaje tal cual en vez de uno genérico.
      return new AppError(err.message || "No se pudo completar la operación.", 400);
    default:
      return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else {
    const pgError = traducirErrorPostgres(err as PgError);
    if (pgError) {
      appError = pgError;
    } else {
      appError = new AppError("Ocurrió un error inesperado. Intente nuevamente.", 500);
    }
  }

  if (appError.statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  res.status(appError.statusCode).json({
    error: true,
    message: appError.message,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: true, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}