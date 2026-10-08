import { Request, Response } from "express";
import { AppError } from "../../shared/AppError";
import { catchAsync } from "../../shared/catchAsync";
import * as mascotasService from "./mascotas.service";

export const getMascotas = catchAsync(async (req: Request, res: Response) => {
  // Sin idCliente se listan todas: el catálogo las necesita para mostrar
  // las mascotas de cada cliente sin pedirlas una por una.
  if (req.query.idCliente === undefined) {
    const todas = await mascotasService.listarTodas();
    res.status(200).json(todas);
    return;
  }
  const idCliente = Number(req.query.idCliente);
  if (!idCliente) {
    throw new AppError("El idCliente indicado no es válido", 400);
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