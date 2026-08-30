import { query } from "../../config/db";
import { AppError } from "../../shared/AppError";

export interface Servicio {
  id_servicio: number;
  id_tipo_servicio: number;
  tipo_servicio: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  duracion_estimada: number | null;
  estado: boolean;
  fecha_creacion: string;
}

const SELECT_SERVICIO = `
  SELECT s.id_servicio, s.id_tipo_servicio, ts.nombre AS tipo_servicio,
         s.nombre, s.descripcion, s.precio, s.duracion_estimada,
         s.estado, s.fecha_creacion
    FROM servicios s
    JOIN tipos_servicio ts ON ts.id_tipo_servicio = s.id_tipo_servicio
`;

export async function listar(opciones: { q?: string; soloActivos?: boolean } = {}): Promise<Servicio[]> {
  const condiciones: string[] = [];
  const params: unknown[] = [];

  if (opciones.soloActivos !== false) {
    condiciones.push("s.estado = TRUE");
  }
  if (opciones.q) {
    params.push(`%${opciones.q}%`);
    condiciones.push(`s.nombre ILIKE $${params.length}`);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";
  const { rows } = await query<Servicio>(`${SELECT_SERVICIO} ${where} ORDER BY s.nombre`, params);
  return rows;
}

interface CrearServicioInput {
  idTipoServicio: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionEstimada?: number;
}

export async function crear(input: CrearServicioInput): Promise<Servicio> {
  const { rows } = await query<{ id_servicio: number }>(
    `INSERT INTO servicios (id_tipo_servicio, nombre, descripcion, precio, duracion_estimada)
          VALUES ($1, $2, $3, $4, $5)
       RETURNING id_servicio`,
    [
      input.idTipoServicio,
      input.nombre,
      input.descripcion ?? null,
      input.precio,
      input.duracionEstimada ?? null,
    ]
  );

  const { rows: servicioRows } = await query<Servicio>(`${SELECT_SERVICIO} WHERE s.id_servicio = $1`, [
    rows[0].id_servicio,
  ]);
  return servicioRows[0];
}

interface ActualizarServicioInput {
  idTipoServicio?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracionEstimada?: number;
  estado?: boolean;
}

export async function actualizar(id: number, cambios: ActualizarServicioInput): Promise<Servicio> {
  const { rows } = await query<{ id_servicio: number }>(
    `UPDATE servicios
        SET id_tipo_servicio = COALESCE($2, id_tipo_servicio),
            nombre = COALESCE($3, nombre),
            descripcion = COALESCE($4, descripcion),
            precio = COALESCE($5, precio),
            duracion_estimada = COALESCE($6, duracion_estimada),
            estado = COALESCE($7, estado)
      WHERE id_servicio = $1
      RETURNING id_servicio`,
    [
      id,
      cambios.idTipoServicio ?? null,
      cambios.nombre ?? null,
      cambios.descripcion ?? null,
      cambios.precio ?? null,
      cambios.duracionEstimada ?? null,
      cambios.estado ?? null,
    ]
  );

  if (rows.length === 0) {
    throw new AppError("El servicio indicado no existe", 404);
  }

  const { rows: servicioRows } = await query<Servicio>(`${SELECT_SERVICIO} WHERE s.id_servicio = $1`, [
    id,
  ]);
  return servicioRows[0];
}