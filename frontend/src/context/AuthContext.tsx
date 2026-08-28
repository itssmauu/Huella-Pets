import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import type { Usuario } from "../types";

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_TOKEN = "melo_token";
const STORAGE_USER = "melo_usuario";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_USER);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUser));
      // Revalida contra el backend por si la sesión ya expiró o fue revocada
      // (por ejemplo, si cerraste sesión desde otra pestaña).
      authApi
        .me(storedToken)
        .catch(() => {
          setToken(null);
          setUsuario(null);
          localStorage.removeItem(STORAGE_TOKEN);
          localStorage.removeItem(STORAGE_USER);
        })
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, []);

  async function login(usernameInput: string, password: string) {
    const resultado = await authApi.login(usernameInput, password);
    setToken(resultado.token);
    setUsuario(resultado.usuario);
    localStorage.setItem(STORAGE_TOKEN, resultado.token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(resultado.usuario));
  }

  async function logout() {
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        // Si la sesión ya no era válida en el backend, igual la limpiamos localmente.
      }
    }
    setToken(null);
    setUsuario(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}