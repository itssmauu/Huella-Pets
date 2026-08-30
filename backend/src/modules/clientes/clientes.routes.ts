import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateBody } from "../../shared/validate";
import * as clientesController from "./clientes.controller";
import { actualizarClienteSchema, crearClienteSchema } from "./clientes.validators";

export const clientesRouter = Router();

clientesRouter.get("/", authenticate, clientesController.getClientes);
clientesRouter.post("/", authenticate, validateBody(crearClienteSchema), clientesController.postCliente);
clientesRouter.put("/:id", authenticate, validateBody(actualizarClienteSchema), clientesController.putCliente);