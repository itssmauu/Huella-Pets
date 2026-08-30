import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import * as productosService from "./productos.service";

export const getProductos = catchAsync(async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const soloActivos = req.query.activos !== "false";
  const productos = await productosService.listar({ q, soloActivos });
  res.status(200).json(productos);
});

export const postProducto = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as {
    idCategoria: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    stockMinimo: number;
  };
  const producto = await productosService.crear({ ...body, idUsuario: req.user!.idUsuario });
  res.status(201).json(producto);
});

export const putProducto = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const producto = await productosService.actualizar(id, req.body);
  res.status(200).json(producto);
});

export const patchStockProducto = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { cantidad, motivo } = req.body;
  const producto = await productosService.ajustarStock(id, cantidad, motivo, req.user!.idUsuario);
  res.status(200).json(producto);
});