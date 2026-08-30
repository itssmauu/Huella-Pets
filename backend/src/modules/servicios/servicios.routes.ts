import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody } from "../../shared/validate";
import { getServicios, postServicio, putServicio } from "./servicios.controller";
import { actualizarServicioSchema, crearServicioSchema } from "./servicios.validators";

export const serviciosRouter = Router();

serviciosRouter.get("/", authenticate, getServicios);

serviciosRouter.post(
  "/",
  authenticate,
  authorize("GERENTE"),
  validateBody(crearServicioSchema),
  postServicio
);

serviciosRouter.put(
  "/:id",
  authenticate,
  authorize("GERENTE"),
  validateBody(actualizarServicioSchema),
  putServicio
);