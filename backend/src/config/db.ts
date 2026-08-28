import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import "dotenv/config";

// -----------------------------------------------------------------------
// Pool de conexiones a PostgreSQL. Toda la persistencia del sistema pasa
// por aquí; el frontend nunca se conecta directamente a la base de datos
// (ver Plan de Arquitectura, sección 1).
// -----------------------------------------------------------------------
export const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "melo_pets",
  user: process.env.PGUSER || "melo_admin",
  password: process.env.PGPASSWORD || "melo_pets_dev",
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  // Errores en clientes inactivos del pool no deben tumbar el proceso.
  // eslint-disable-next-line no-console
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params as unknown[]);
}

/**
 * Ejecuta `fn` dentro de una transacción (BEGIN/COMMIT/ROLLBACK).
 * Si se pasa `idUsuario`, además fija la variable de sesión
 * "app.current_usuario_id" con `set_config`, que es la que leen los
 * triggers de auditoría (ver database/05_triggers.sql) para saber
 * quién hizo el cambio.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
  idUsuario?: number | null
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (idUsuario != null) {
      await client.query("SELECT set_config('app.current_usuario_id', $1, true)", [
        String(idUsuario),
      ]);
    }
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}