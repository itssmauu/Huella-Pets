import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { categoriasRouter } from "./modules/categorias/categorias.routes";
import { clientesRouter } from "./modules/clientes/clientes.routes";
import { mascotasRouter } from "./modules/mascotas/mascotas.routes";
import { productosRouter } from "./modules/productos/productos.routes";
import { serviciosRouter } from "./modules/servicios/servicios.routes";
import { tiposServicioRouter } from "./modules/tiposServicio/tiposServicio.routes";
import { usuariosRouter } from "./modules/usuarios/usuarios.routes";
import { ventasRouter } from "./modules/ventas/ventas.routes";
import { reportesRouter } from "./modules/reportes/reportes.routes";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", servicio: "melo-pets-backend" });
});

app.use("/auth", authRouter);
app.use("/usuarios", usuariosRouter);
app.use("/categorias", categoriasRouter);
app.use("/productos", productosRouter);
app.use("/clientes", clientesRouter);
app.use("/mascotas", mascotasRouter);
app.use("/tipos-servicio", tiposServicioRouter);
app.use("/servicios", serviciosRouter);
app.use("/ventas", ventasRouter);
app.use("/reportes", reportesRouter);


app.use(notFoundHandler);
app.use(errorHandler);