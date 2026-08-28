import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { usuariosRouter } from "./modules/usuarios/usuarios.routes";

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

app.use(notFoundHandler);
app.use(errorHandler);