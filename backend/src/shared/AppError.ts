/**
 * Error de negocio con un mensaje seguro para mostrar al usuario final
 * (RNF-11: nunca se exponen errores técnicos de PostgreSQL directamente).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No tiene permisos para realizar esta acción") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El recurso solicitado no existe") {
    super(message, 404);
  }
}