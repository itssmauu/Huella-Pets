import { query } from "../../config/db";
import { AppError } from "../../shared/AppError";

export interface Mascota {
  id_mascota: number;
  id_cliente: number;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: string | null;
  fecha_nacimiento: string | null;
  peso: string | null;
  observaciones: string | null;
  estado: boolean;
}

const SELECT_MASCOTA = `SELECT id_mascota, id_cliente, nombre, especie, raza, sexo, fecha_nacimiento, peso, observaciones, estado FROM mascotas`;

export async function listarTodas(): Promise<Mascota[]> {
  const { rows } = await query<Mascota>(`${SELECT_MASCOTA} ORDER BY id_cliente, nombre`);
  return rows;
}

export async function listarPorCliente(idCliente: number): Promise<Mascota[]> {
  const { rows } = await query<Mascota>(`${SELECT_MASCOTA} WHERE id_cliente = $1 ORDER BY nombre`, [idCliente]);
  return rows;
}

interface CrearMascotaInput {
  idCliente: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo?: "M" | "H";
  fechaNacimiento?: string;
  peso?: number;
  observaciones?: string;
}

export async function crear(input: CrearMascotaInput): Promise<Mascota> {
  const { rows } = await query<Mascota>(
    `INSERT INTO mascotas (id_cliente, nombre, especie, raza, sexo, fecha_nacimiento, peso, observaciones)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id_mascota, id_cliente, nombre, especie, raza, sexo, fecha_nacimiento, peso, observaciones, estado`,
    [
      input.idCliente,
      input.nombre,
      input.especie,
      input.raza ?? null,
      input.sexo ?? null,
      input.fechaNacimiento ?? null,
      input.peso ?? null,
      input.observaciones ?? null,
    ]
  );
  return rows[0];
}

export async function actualizar(
  id: number,
  cambios: {
    nombre?: string;
    especie?: string;
    raza?: string;
    sexo?: "M" | "H";
    fechaNacimiento?: string;
    peso?: number;
    observaciones?: string;
    estado?: boolean;
  }
): Promise<Mascota> {
  const { rows } = await query<Mascota>(
    `UPDATE mascotas
        SET nombre = COALESCE($1, nombre),
            especie = COALESCE($2, especie),
            raza = COALESCE($3, raza),
            sexo = COALESCE($4, sexo),
            fecha_nacimiento = COALESCE($5, fecha_nacimiento),
            peso = COALESCE($6, peso),
            observaciones = COALESCE($7, observaciones),
            estado = COALESCE($8, estado)
      WHERE id_mascota = $9
      RETURNING id_mascota, id_cliente, nombre, especie, raza, sexo, fecha_nacimiento, peso, observaciones, estado`,
    [
      cambios.nombre ?? null,
      cambios.especie ?? null,
      cambios.raza ?? null,
      cambios.sexo ?? null,
      cambios.fechaNacimiento ?? null,
      cambios.peso ?? null,
      cambios.observaciones ?? null,
      cambios.estado ?? null,
      id,
    ]
  );
  if (!rows[0]) throw new AppError("Mascota no encontrada", 404);
  return rows[0];
}