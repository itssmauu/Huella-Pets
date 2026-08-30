import { Request, Response } from "express";
import { AppError } from "../../shared/AppError";
import { catchAsync } from "../../shared/catchAsync";
import * as mascotasService from "./mascotas.service";

export const getMascotas = catchAsync(async (req: Request, res: Response) => {
  const idCliente = Number(req.query.idCliente);
  if (!idCliente) {
    throw new AppError("Debe indicar el cliente (idCliente) para listar sus mascotas", 400);
  }
  const mascotas = await mascotasService.listarPorCliente(idCliente);
  res.status(200).json(mascotas);
});

export const postMascota = catchAsync(async (req: Request, res: Response) => {
  const mascota = await mascotasService.crear(req.body);
  res.status(201).json(mascota);
});

export const putMascota = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const mascota = await mascotasService.actualizar(id, req.body);
  res.status(200).json(mascota);
});