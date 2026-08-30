import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { getDashboard } from "./reportes.controller";

export const reportesRouter = Router();

// Los reportes son información gerencial: solo GERENTE puede verlos.
reportesRouter.get("/dashboard", authenticate, authorize("GERENTE"), getDashboard);