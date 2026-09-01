import { query } from "../../config/db";
import { AppError } from "../../shared/AppError";

export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estado: boolean;
  fecha_registro: string;
}

interface ListarOpciones {
  q?: string;
  cedula?: string;
  soloActivos?: boolean;
}

const SELECT_CLIENTE = `SELECT id_cliente, nombre, apellido, cedula, telefono, email, direccion, estado, fecha_registro FROM clientes`;

export async function listar(opciones: ListarOpciones): Promise<Cliente[]> {
  const condiciones: string[] = [];
  const params: unknown[] = [];

  if (opciones.q) {
    params.push(`%${opciones.q}%`);
    condiciones.push(
      `(nombre ILIKE $${params.length} OR apellido ILIKE $${params.length} OR telefono ILIKE $${params.length})`
    );
  }
    if (opciones.cedula) {
    params.push(`%${opciones.cedula}%`);
    condiciones.push(`cedula ILIKE $${params.length}`);
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
  cedula: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export async function crear(input: CrearClienteInput): Promise<Cliente> {
  const { rows } = await query<Cliente>(
    `INSERT INTO clientes (nombre, apellido, cedula, telefono, email, direccion)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_cliente, nombre, apellido, cedula, telefono, email, direccion, estado, fecha_registro`,
    [input.nombre, input.apellido, input.cedula, input.telefono ?? null, input.email ?? null, input.direccion ?? null]
  );
  return rows[0];
}

export async function actualizar(
  id: number,
  cambios: {
    nombre?: string;
    apellido?: string;
    cedula?: string;
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
            cedula = COALESCE($3, cedula),
            telefono = COALESCE($4, telefono),
            email = COALESCE($5, email),
            direccion = COALESCE($6, direccion),
            estado = COALESCE($7, estado)
      WHERE id_cliente = $8
      RETURNING id_cliente, nombre, apellido, cedula, telefono, email, direccion, estado, fecha_registro`,
    [
      cambios.nombre ?? null,
      cambios.apellido ?? null,
      cambios.cedula ?? null,
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