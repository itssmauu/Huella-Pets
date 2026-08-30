import { query } from "../../config/db";
import { AppError } from "../../shared/AppError";

export interface TipoServicio {
  id_tipo_servicio: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

export async function listar(soloActivos = true): Promise<TipoServicio[]> {
  const condicion = soloActivos ? "WHERE estado = TRUE" : "";
  const { rows } = await query<TipoServicio>(
    `SELECT id_tipo_servicio, nombre, descripcion, estado
       FROM tipos_servicio
       ${condicion}
      ORDER BY nombre`
  );
  return rows;
}

export async function crear(nombre: string, descripcion?: string): Promise<TipoServicio> {
  const { rows } = await query<TipoServicio>(
    `INSERT INTO tipos_servicio (nombre, descripcion)
          VALUES ($1, $2)
       RETURNING id_tipo_servicio, nombre, descripcion, estado`,
    [nombre, descripcion ?? null]
  );
  return rows[0];
}

export async function actualizar(
  id: number,
  cambios: { nombre?: string; descripcion?: string; estado?: boolean }
): Promise<TipoServicio> {
  const { rows } = await query<TipoServicio>(
    `UPDATE tipos_servicio
        SET nombre = COALESCE($2, nombre),
            descripcion = COALESCE($3, descripcion),
            estado = COALESCE($4, estado)
      WHERE id_tipo_servicio = $1
      RETURNING id_tipo_servicio, nombre, descripcion, estado`,
    [id, cambios.nombre ?? null, cambios.descripcion ?? null, cambios.estado ?? null]
  );

  if (rows.length === 0) {
    throw new AppError("El tipo de servicio indicado no existe", 404);
  }
  return rows[0];
}