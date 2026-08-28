import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import * as authService from "./auth.service";

export const postLogin = catchAsync(async (req: Request, res: Response) => {
  const { usuario, password } = req.body as { usuario: string; password: string };
  const resultado = await authService.login(usuario, password);
  res.status(200).json(resultado);
});

export const postLogout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.user!.idSesion);
  res.status(200).json({ message: "Sesión cerrada correctamente" });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const usuario = await authService.me(req.user!.idUsuario);
  res.status(200).json(usuario);
});

export const postCambiarPassword = catchAsync(async (req: Request, res: Response) => {
  const { passwordActual, passwordNueva } = req.body as {
    passwordActual: string;
    passwordNueva: string;
  };
  await authService.cambiarPassword(req.user!.idUsuario, passwordActual, passwordNueva);
  res.status(200).json({ message: "Contraseña actualizada correctamente" });
});