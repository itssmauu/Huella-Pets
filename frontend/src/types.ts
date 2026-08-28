export type Rol = "CAJERO" | "GERENTE";

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: Rol;
  debeCambiarPassword: boolean;
}

export interface LoginResponse {
  token: string;
  expiraEn: string;
  usuario: Usuario;
}