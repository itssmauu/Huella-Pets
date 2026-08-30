import { query } from "../../config/db";
import { AppError } from "../../shared/AppError";

export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estado: boolean;
  fecha_registro: string;
}

interface ListarOpciones {
  q?: string;
  soloActivos?: boolean;
}

const SELECT_CLIENTE = `SELECT id_cliente, nombre, apellido, telefono, email, direccion, estado, fecha_registro FROM clientes`;

export async function listar(opciones: ListarOpciones): Promise<Cliente[]> {
  const condiciones: string[] = [];
  const params: unknown[] = [];

  if (opciones.q) {
    params.push(`%${opciones.q}%`);
    condiciones.push(
      `(nombre ILIKE $${params.length} OR apellido ILIKE $${params.length} OR telefono ILIKE $${params.length})`
    );
  }
  if (opciones.soloActivos) {
    condiciones.push("estado = TRUE");
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

  const { rows } = await query<Cliente>(`${SELECT_CLIENTE} ${where} ORDER BY nombre, apellido`, params);
  return rows;
}

interface CrearClienteInput {
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export async function crear(input: CrearClienteInput): Promise<Cliente> {
  const { rows } = await query<Cliente>(
    `INSERT INTO clientes (nombre, apellido, telefono, email, direccion)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_cliente, nombre, apellido, telefono, email, direccion, estado, fecha_registro`,
    [input.nombre, input.apellido, input.telefono ?? null, input.email ?? null, input.direccion ?? null]
  );
  return rows[0];
}

export async function actualizar(
  id: number,
  cambios: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    estado?: boolean;
  }
): Promise<Cliente> {
  const { rows } = await query<Cliente>(
    `UPDATE clientes
        SET nombre = COALESCE($1, nombre),
            apellido = COALESCE($2, apellido),
            telefono = COALESCE($3, telefono),
            email = COALESCE($4, email),
            direccion = COALESCE($5, direccion),
            estado = COALESCE($6, estado)
      WHERE id_cliente = $7
      RETURNING id_cliente, nombre, apellido, telefono, email, direccion, estado, fecha_registro`,
    [
      cambios.nombre ?? null,
      cambios.apellido ?? null,
      cambios.telefono ?? null,
      cambios.email ?? null,
      cambios.direccion ?? null,
      cambios.estado ?? null,
      id,
    ]
  );
  if (!rows[0]) throw new AppError("Cliente no encontrado", 404);
  return rows[0];
}