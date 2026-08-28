import { apiFetch } from "./client";
import type { LoginResponse, Usuario } from "../types";

export function login(usuario: string, password: string) {
  return apiFetch<LoginResponse>("/auth/login", { method: "POST", body: { usuario, password } });
}

export function logout(token: string) {
  return apiFetch<{ message: string }>("/auth/logout", { method: "POST", token });
}

export function me(token: string) {
  return apiFetch<Usuario>("/auth/me", { token });
}

export function cambiarPassword(token: string, passwordActual: string, passwordNueva: string) {
  return apiFetch<{ message: string }>("/auth/cambiar-password", {
    method: "POST",
    token,
    body: { passwordActual, passwordNueva },
  });
}