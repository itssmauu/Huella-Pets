import bcrypt from "bcryptjs";
import { pool, query } from "../../config/db";
import { AppError, UnauthorizedError } from "../../shared/AppError";
import { hashToken, signToken } from "../../shared/jwt";

interface UsuarioRow {
  id_usuario: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password_hash: string;
  estado: boolean;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
  debe_cambiar_password: boolean;
  nombre_rol: "CAJERO" | "GERENTE";
}

interface ConfigRow {
  clave: string;
  valor: string;
}

async function getConfig(claves: string[]): Promise<Record<string, string>> {
  const { rows } = await query<ConfigRow>(
    `SELECT clave, valor FROM configuracion_sistema WHERE clave = ANY($1)`,
    [claves]
  );
  const config: Record<string, string> = {};
  for (const row of rows) config[row.clave] = row.valor;
  return config;
}

export interface LoginResult {
  token: string;
  expiraEn: string; // ISO
  usuario: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    username: string;
    email: string;
    rol: "CAJERO" | "GERENTE";
    debeCambiarPassword: boolean;
  };
}

/**
 * RF-AUTH-01/03: valida credenciales y da SIEMPRE el mismo mensaje
 * genérico ante cualquier fallo (usuario inexistente, contraseña
 * incorrecta, cuenta inactiva se distingue solo tras confirmar que el
 * usuario existe, para no filtrar información a un atacante que solo
 * está probando usuarios).
 * RF-EXT-05: lleva el conteo de intentos fallidos y bloquea la cuenta
 * temporalmente (BLOQUEO_MINUTOS_LOGIN) al superar MAX_INTENTOS_LOGIN.
 */
export async function login(usernameOrEmail: string, password: string): Promise<LoginResult> {
  const { rows } = await query<UsuarioRow>(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.username, u.email, u.password_hash,
            u.estado, u.intentos_fallidos, u.bloqueado_hasta, u.debe_cambiar_password,
            r.nombre_rol
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
      WHERE u.username = $1 OR u.email = $1`,
    [usernameOrEmail]
  );
  const usuario = rows[0];

  if (!usuario) {
    throw new UnauthorizedError("Usuario o contraseña incorrectos");
  }
  if (!usuario.estado) {
    throw new UnauthorizedError("Esta cuenta está inactiva, contacte al administrador");
  }
  if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta).getTime() > Date.now()) {
    const minutosRestantes = Math.ceil(
      (new Date(usuario.bloqueado_hasta).getTime() - Date.now()) / 60000
    );
    throw new UnauthorizedError(
      `Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente de nuevo en ${minutosRestantes} minuto(s).`
    );
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);
  const config = await getConfig(["MAX_INTENTOS_LOGIN", "BLOQUEO_MINUTOS_LOGIN", "MINUTOS_EXPIRACION_SESION"]);
  const maxIntentos = Number(config.MAX_INTENTOS_LOGIN ?? 5);
  const minutosBloqueo = Number(config.BLOQUEO_MINUTOS_LOGIN ?? 15);
  const minutosSesion = Number(config.MINUTOS_EXPIRACION_SESION ?? 480);

  if (!passwordValida) {
    const nuevosIntentos = usuario.intentos_fallidos + 1;
    if (nuevosIntentos >= maxIntentos) {
      await query(
        `UPDATE usuarios
            SET intentos_fallidos = $1,
                bloqueado_hasta = now() + ($2 || ' minutes')::interval
          WHERE id_usuario = $3`,
        [nuevosIntentos, minutosBloqueo, usuario.id_usuario]
      );
      throw new UnauthorizedError(
        `Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente de nuevo en ${minutosBloqueo} minuto(s).`
      );
    }
    await query(`UPDATE usuarios SET intentos_fallidos = $1 WHERE id_usuario = $2`, [
      nuevosIntentos,
      usuario.id_usuario,
    ]);
    throw new UnauthorizedError("Usuario o contraseña incorrectos");
  }

  // Login correcto: limpiar contador de intentos y bloqueo, y dejar
  // constancia del último acceso.
  await query(
    `UPDATE usuarios
        SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_login = now()
      WHERE id_usuario = $1`,
    [usuario.id_usuario]
  );

  const token = signToken({
    sub: usuario.id_usuario,
    username: usuario.username,
    rol: usuario.nombre_rol,
  });

  const fechaExpiracion = new Date(Date.now() + minutosSesion * 60_000);

  await query(
    `INSERT INTO sesiones (id_usuario, token_hash, fecha_expiracion) VALUES ($1, $2, $3)`,
    [usuario.id_usuario, hashToken(token), fechaExpiracion.toISOString()]
  );

  return {
    token,
    expiraEn: fechaExpiracion.toISOString(),
    usuario: {
      idUsuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.nombre_rol,
      debeCambiarPassword: usuario.debe_cambiar_password,
    },
  };
}

/** RF-AUTH-02: revoca la sesión asociada al token actual. */
export async function logout(idSesion: number): Promise<void> {
  await query(`UPDATE sesiones SET revocado = TRUE WHERE id_sesion = $1`, [idSesion]);
}

export async function me(idUsuario: number) {
  const { rows } = await query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.username, u.email,
            u.debe_cambiar_password, u.ultimo_login, r.nombre_rol AS rol
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
      WHERE u.id_usuario = $1`,
    [idUsuario]
  );
  return rows[0] ?? null;
}

/** RF-AUTH-07: el usuario autenticado puede actualizar su propia contraseña. */
export async function cambiarPassword(
  idUsuario: number,
  passwordActual: string,
  passwordNueva: string
): Promise<void> {
  const { rows } = await query<{ password_hash: string }>(
    `SELECT password_hash FROM usuarios WHERE id_usuario = $1`,
    [idUsuario]
  );
  const usuario = rows[0];
  if (!usuario) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const passwordActualValida = await bcrypt.compare(passwordActual, usuario.password_hash);
  if (!passwordActualValida) {
    throw new AppError("La contraseña actual no es correcta", 400);
  }

  const nuevoHash = await bcrypt.hash(passwordNueva, 10);
  await query(
    `UPDATE usuarios SET password_hash = $1, debe_cambiar_password = FALSE WHERE id_usuario = $2`,
    [nuevoHash, idUsuario]
  );

  // Por seguridad, cerrar todas las demás sesiones activas de este
  // usuario al cambiar la contraseña.
  await pool.query(`UPDATE sesiones SET revocado = TRUE WHERE id_usuario = $1`, [idUsuario]);
}