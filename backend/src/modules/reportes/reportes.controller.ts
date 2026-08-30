import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import * as reportesService from "./reportes.service";

export const getDashboard = catchAsync(async (_req: Request, res: Response) => {
  const data = await reportesService.obtenerDashboard();
  res.status(200).json(data);
});