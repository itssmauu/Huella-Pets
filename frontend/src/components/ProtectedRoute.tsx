import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Rol } from "../types";

export function ProtectedRoute() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="route-loading">Cargando…</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RoleRoute({ roles }: { roles: Rol[] }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="route-loading">Cargando…</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to="/app/caja" replace />;
  return <Outlet />;
}