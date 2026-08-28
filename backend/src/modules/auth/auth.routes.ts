import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateBody } from "../../shared/validate";
import * as authController from "./auth.controller";
import { cambiarPasswordSchema, loginSchema } from "./auth.validators";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), authController.postLogin);
authRouter.post("/logout", authenticate, authController.postLogout);
authRouter.get("/me", authenticate, authController.getMe);
authRouter.post(
  "/cambiar-password",
  authenticate,
  validateBody(cambiarPasswordSchema),
  authController.postCambiarPassword
);