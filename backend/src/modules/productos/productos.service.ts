import { query, withTransaction } from "../../config/db";
import { AppError } from "../../shared/AppError";

export interface Producto {
  id_producto: number;
  id_categoria: number;
  categoria: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  stock: number;
  stock_minimo: number;
  estado: boolean;
}

interface ListarOpciones {
  q?: string;
  soloActivos?: boolean;
}

const SELECT_PRODUCTO = `
  SELECT p.id_producto, p.id_categoria, c.nombre AS categoria, p.nombre, p.descripcion,
         p.precio, p.stock, p.stock_minimo, p.estado
    FROM productos p
    JOIN categorias c ON c.id_categoria = p.id_categoria
`;

export async function listar(opciones: ListarOpciones): Promise<Producto[]> {
  const condiciones: string[] = [];
  const params: unknown[] = [];

  if (opciones.q) {
    params.push(`%${opciones.q}%`);
    condiciones.push(`p.nombre ILIKE $${params.length}`);
  }
  if (opciones.soloActivos) {
    condiciones.push("p.estado = TRUE");
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

  const { rows } = await query<Producto>(`${SELECT_PRODUCTO} ${where} ORDER BY p.nombre`, params);
  return rows;
}

interface CrearProductoInput {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  idUsuario: number;
}

export async function crear(input: CrearProductoInput): Promise<Producto> {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO productos (id_categoria, nombre, descripcion, precio, stock, stock_minimo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_producto`,
      [input.idCategoria, input.nombre, input.descripcion ?? null, input.precio, input.stock, input.stockMinimo]
    );
    const idProducto = rows[0].id_producto;

    // Si se cargó con stock inicial, queda registrado como movimiento de
    // ENTRADA — mismo punto único de auditoría de inventario que usa la venta.
    if (input.stock > 0) {
      await client.query(`SELECT fn_registrar_movimiento_inventario($1, 'ENTRADA', $2, $3, $4)`, [
        idProducto,
        input.stock,
        "Carga inicial de inventario",
        input.idUsuario,
      ]);
    }

    const { rows: productoRows } = await client.query(`${SELECT_PRODUCTO} WHERE p.id_producto = $1`, [idProducto]);
    return productoRows[0];
  }, input.idUsuario);
}

export async function actualizar(
  id: number,
  cambios: {
    idCategoria?: number;
    nombre?: string;
    descripcion?: string;
    precio?: number;
    stockMinimo?: number;
    estado?: boolean;
  }
): Promise<Producto> {
  const { rows } = await query(
    `UPDATE productos
        SET id_categoria = COALESCE($1, id_categoria),
            nombre = COALESCE($2, nombre),
            descripcion = COALESCE($3, descripcion),
            precio = COALESCE($4, precio),
            stock_minimo = COALESCE($5, stock_minimo),
            estado = COALESCE($6, estado)
      WHERE id_producto = $7
      RETURNING id_producto`,
    [
      cambios.idCategoria ?? null,
      cambios.nombre ?? null,
      cambios.descripcion ?? null,
      cambios.precio ?? null,
      cambios.stockMinimo ?? null,
      cambios.estado ?? null,
      id,
    ]
  );
  if (!rows[0]) throw new AppError("Producto no encontrado", 404);

  const { rows: productoRows } = await query<Producto>(`${SELECT_PRODUCTO} WHERE p.id_producto = $1`, [id]);  
  return productoRows[0];
}

export async function ajustarStock(
  id: number,
  cantidad: number,
  motivo: string | undefined,
  idUsuario: number
): Promise<Producto> {
  await query(`SELECT fn_registrar_movimiento_inventario($1, 'AJUSTE', $2, $3, $4)`, [
    id,
    cantidad,
    motivo ?? "Ajuste manual desde catálogo",
    idUsuario,
  ]);

  const { rows } = await query<Producto>(`${SELECT_PRODUCTO} WHERE p.id_producto = $1`, [id]);
  if (!rows[0]) throw new AppError("Producto no encontrado", 404);
  return rows[0];
}