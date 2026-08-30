import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateBody } from "../../shared/validate";
import * as mascotasController from "./mascotas.controller";
import { actualizarMascotaSchema, crearMascotaSchema } from "./mascotas.validators";

export const mascotasRouter = Router();

mascotasRouter.get("/", authenticate, mascotasController.getMascotas);
mascotasRouter.post("/", authenticate, validateBody(crearMascotaSchema), mascotasController.postMascota);
mascotasRouter.put("/:id", authenticate, validateBody(actualizarMascotaSchema), mascotasController.putMascota);