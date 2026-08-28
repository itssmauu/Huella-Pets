import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "./AppError";

/** Valida req.body contra un esquema zod; RF: "validaciones en frontend y backend". */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(" ");
      next(new AppError(message || "Datos inválidos", 400));
      return;
    }
    req.body = result.data;
    next();
  };
}