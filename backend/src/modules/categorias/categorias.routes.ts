import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody } from "../../shared/validate";
import * as categoriasController from "./categorias.controller";
import { actualizarCategoriaSchema, crearCategoriaSchema } from "./categorias.validators";

export const categoriasRouter = Router();

categoriasRouter.get("/", authenticate, categoriasController.getCategorias);
categoriasRouter.post(
  "/",
  authenticate,
  authorize("GERENTE"),
  validateBody(crearCategoriaSchema),
  categoriasController.postCategoria
);
categoriasRouter.put(
  "/:id",
  authenticate,
  authorize("GERENTE"),
  validateBody(actualizarCategoriaSchema),
  categoriasController.putCategoria
);