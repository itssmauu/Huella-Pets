import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const TAB_META: Record<string, { title: string; sub: string }> = {
  "/app/caja": { title: "Caja", sub: "Registrar una nueva venta" },
  "/app/dashboard": { title: "Dashboard", sub: "Resumen gerencial del negocio" },
  "/app/catalogo": { title: "Catálogo", sub: "Productos, clientes, mascotas y servicios" },
};

function initials(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

function linkClass({ isActive }: { isActive: boolean }) {
  return "sidebar-link" + (isActive ? " active" : "");
}

export function AppShell() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  if (!usuario) return null;

  const meta = TAB_META[location.pathname] ?? { title: "MELO Pets", sub: "" };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="logo-dot">M</div>
          <span>MELO Pets</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <span className="sidebar-section-label">Operación</span>
          <NavLink to="/app/caja" className={linkClass}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M3 12h18" />
            </svg>
            <span className="nav-label">Caja</span>
          </NavLink>
          <NavLink to="/app/catalogo" className={linkClass}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span className="nav-label">Catálogo</span>
          </NavLink>

          {usuario.rol === "GERENTE" && (
            <>
              <span className="sidebar-section-label">Gerencia</span>
              <NavLink to="/app/dashboard" className={linkClass}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21h18" />
                  <rect x="5" y="10" width="4" height="8" />
                  <rect x="10.5" y="5" width="4" height="13" />
                  <rect x="16" y="13" width="4" height="5" />
                </svg>
                <span className="nav-label">Dashboard</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-foot">
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "#cddbd1", borderColor: "rgba(255,255,255,0.16)" }}
            onClick={handleLogout}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <div className="user-chip">
            <div className="user-meta">
              <span className="name">
                {usuario.nombre} {usuario.apellido}
              </span>
              <span className="role">{usuario.rol === "GERENTE" ? "Gerente" : "Cajero"}</span>
            </div>
            <div className="user-avatar">{initials(usuario.nombre, usuario.apellido)}</div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}