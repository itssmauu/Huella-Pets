import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateBody } from "../../shared/validate";
import { postVenta } from "./ventas.controller";
import { crearVentaSchema } from "./ventas.validators";

export const ventasRouter = Router();

// Sin authorize("GERENTE"): registrar ventas es la función principal
// del rol CAJERO, no una tarea administrativa.
ventasRouter.post("/", authenticate, validateBody(crearVentaSchema), postVenta);