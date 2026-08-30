import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import * as serviciosService from "./servicios.service";

export const getServicios = catchAsync(async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const soloActivos = req.query.soloActivos !== "false";
  const servicios = await serviciosService.listar({ q, soloActivos });
  res.status(200).json(servicios);
});

export const postServicio = catchAsync(async (req: Request, res: Response) => {
  const servicio = await serviciosService.crear(req.body);
  res.status(201).json(servicio);
});

export const putServicio = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const servicio = await serviciosService.actualizar(id, req.body);
  res.status(200).json(servicio);
});