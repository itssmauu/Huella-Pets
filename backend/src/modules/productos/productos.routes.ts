import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody } from "../../shared/validate";
import * as productosController from "./productos.controller";
import { actualizarProductoSchema, crearProductoSchema } from "./productos.validators";
import { patchStockProducto } from "./productos.controller";
import { ajustarStockSchema } from "./productos.validators";

export const productosRouter = Router();

productosRouter.get("/", authenticate, productosController.getProductos);
productosRouter.post(
  "/",
  authenticate,
  authorize("GERENTE"),
  validateBody(crearProductoSchema),
  productosController.postProducto
);
productosRouter.put(
  "/:id",
  authenticate,
  authorize("GERENTE"),
  validateBody(actualizarProductoSchema),
  productosController.putProducto
);

productosRouter.patch("/:id/stock", authenticate, authorize("GERENTE"), validateBody(ajustarStockSchema), patchStockProducto);