import { query } from "../../config/db";
import { AppError } from "../../shared/AppError";

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

export async function listar(soloActivas: boolean): Promise<Categoria[]> {
  const { rows } = await query<Categoria>(
    `SELECT id_categoria, nombre, descripcion, estado
       FROM categorias
      ${soloActivas ? "WHERE estado = TRUE" : ""}
      ORDER BY nombre`
  );
  return rows;
}

export async function crear(nombre: string, descripcion?: string): Promise<Categoria> {
  const { rows } = await query<Categoria>(
    `INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2)
     RETURNING id_categoria, nombre, descripcion, estado`,
    [nombre, descripcion ?? null]
  );
  return rows[0];
}

export async function actualizar(
  id: number,
  cambios: { nombre?: string; descripcion?: string; estado?: boolean }
): Promise<Categoria> {
  const { rows } = await query<Categoria>(
    `UPDATE categorias
        SET nombre = COALESCE($1, nombre),
            descripcion = COALESCE($2, descripcion),
            estado = COALESCE($3, estado)
      WHERE id_categoria = $4
      RETURNING id_categoria, nombre, descripcion, estado`,
    [cambios.nombre ?? null, cambios.descripcion ?? null, cambios.estado ?? null, id]
  );
  if (!rows[0]) throw new AppError("Categoría no encontrada", 404);
  return rows[0];
}