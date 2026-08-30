import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import * as ventasService from "./ventas.service";

export const postVenta = catchAsync(async (req: Request, res: Response) => {
  const { idCliente, metodoPago, productos, servicios } = req.body;
  const venta = await ventasService.registrarVenta(
    idCliente,
    req.user!.idUsuario,
    metodoPago,
    productos,
    servicios
  );
  res.status(201).json(venta);
});