import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import * as tiposServicioService from "./tiposServicio.service";

export const getTiposServicio = catchAsync(async (req: Request, res: Response) => {
  const soloActivos = req.query.soloActivos !== "false";
  const tipos = await tiposServicioService.listar(soloActivos);
  res.status(200).json(tipos);
});

export const postTipoServicio = catchAsync(async (req: Request, res: Response) => {
  const { nombre, descripcion } = req.body;
  const tipo = await tiposServicioService.crear(nombre, descripcion);
  res.status(201).json(tipo);
});

export const putTipoServicio = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const tipo = await tiposServicioService.actualizar(id, req.body);
  res.status(200).json(tipo);
});