import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import * as categoriasService from "./categorias.service";

export const getCategorias = catchAsync(async (req: Request, res: Response) => {
  const soloActivas = req.query.activas !== "false";
  const categorias = await categoriasService.listar(soloActivas);
  res.status(200).json(categorias);
});

export const postCategoria = catchAsync(async (req: Request, res: Response) => {
  const { nombre, descripcion } = req.body as { nombre: string; descripcion?: string };
  const categoria = await categoriasService.crear(nombre, descripcion);
  res.status(201).json(categoria);
});

export const putCategoria = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const categoria = await categoriasService.actualizar(id, req.body);
  res.status(200).json(categoria);
});