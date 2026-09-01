import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import * as clientesService from "./clientes.service";

export const getClientes = catchAsync(async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const cedula = typeof req.query.cedula === "string" ? req.query.cedula : undefined;
  const soloActivos = req.query.activos !== "false";
  const clientes = await clientesService.listar({ q, cedula, soloActivos });
  res.status(200).json(clientes);
});

export const postCliente = catchAsync(async (req: Request, res: Response) => {
  const cliente = await clientesService.crear(req.body);
  res.status(201).json(cliente);
});

export const putCliente = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const cliente = await clientesService.actualizar(id, req.body);
  res.status(200).json(cliente);
});