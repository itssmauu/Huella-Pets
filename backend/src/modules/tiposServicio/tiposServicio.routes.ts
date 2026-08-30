import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody } from "../../shared/validate";
import { getTiposServicio, postTipoServicio, putTipoServicio } from "./tiposServicio.controller";
import { actualizarTipoServicioSchema, crearTipoServicioSchema } from "./tiposServicio.validators";

export const tiposServicioRouter = Router();

tiposServicioRouter.get("/", authenticate, getTiposServicio);

tiposServicioRouter.post(
  "/",
  authenticate,
  authorize("GERENTE"),
  validateBody(crearTipoServicioSchema),
  postTipoServicio
);

tiposServicioRouter.put(
  "/:id",
  authenticate,
  authorize("GERENTE"),
  validateBody(actualizarTipoServicioSchema),
  putTipoServicio
);