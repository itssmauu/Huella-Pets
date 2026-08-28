import { NextFunction, Request, Response } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Envuelve un controlador async para que cualquier excepción se
 * reenvíe a next() y termine en el errorHandler central, en vez de
 * tumbar el proceso o quedar como una promesa no manejada.
 */
export function catchAsync(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}