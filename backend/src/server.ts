import "dotenv/config";
import { app } from "./app";
import { pool } from "./config/db";

const PORT = Number(process.env.PORT || 4000);

async function start() {
  try {
    await pool.query("SELECT 1");
    // eslint-disable-next-line no-console
    console.log("Conexión a PostgreSQL verificada correctamente.");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("No se pudo conectar a PostgreSQL. Verifique la configuración en .env:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`MELO Pets backend escuchando en http://localhost:${PORT}`);
  });
}

start();