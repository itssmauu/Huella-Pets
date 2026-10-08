import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const TAB_META: Record<string, { title: string; sub: string }> = {
  "/app/caja": { title: "Caja", sub: "Registra una nueva venta" },
  "/app/dashboard": { title: "Dashboard", sub: "Resumen gerencial del negocio" },
  "/app/catalogo": { title: "Catálogo", sub: "Productos, clientes, mascotas y servicios" },
};

function initials(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

function linkClass({ isActive }: { isActive: boolean }) {
  return "sidebar-link" + (isActive ? " active" : "");
}

function saludo(fecha: Date) {
  const h = fecha.getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function useReloj() {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    // Sincroniza con el cambio de minuto para que la hora no vaya atrasada
    let id: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      setAhora(new Date());
      id = setInterval(() => setAhora(new Date()), 60_000);
    }, (60 - new Date().getSeconds()) * 1000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, []);
  return ahora;
}

const FORMATO_RELOJ = new Intl.DateTimeFormat("es-PA", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function AppShell() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const ahora = useReloj();

  const navRef = useRef<HTMLElement>(null);
  const [indicador, setIndicador] = useState<{ top: number; height: number } | null>(null);

  // Indicador que se desliza hasta el link activo
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const medir = () => {
      const activo = nav.querySelector<HTMLElement>(".sidebar-link.active");
      setIndicador(activo ? { top: activo.offsetTop, height: activo.offsetHeight } : null);
    };
    medir();
    // Re-mide ante cualquier cambio de layout (sidebar colapsada, fuentes cargando, etc.)
    const observer = new ResizeObserver(medir);
    observer.observe(nav);
    nav.querySelectorAll(".sidebar-link").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname, usuario?.rol]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  if (!usuario) return null;

  const meta = TAB_META[location.pathname] ?? { title: "MELO Pets", sub: "" };
  const sub = location.pathname === "/app/caja" ? `${saludo(ahora)}, ${usuario.nombre}. ${meta.sub}.` : meta.sub;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="logo-dot">
            <img src="/MELOPets_logo.png" alt="" />
          </div>
          <span>MELO Pets</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal" ref={navRef}>
          <span
            className="sidebar-indicator"
            aria-hidden="true"
            style={{
              transform: `translateY(${indicador?.top ?? 0}px)`,
              height: indicador?.height ?? 0,
              opacity: indicador ? 1 : 0,
            }}
          />
          <span className="sidebar-section-label">Operación</span>
          <NavLink to="/app/caja" className={linkClass} title="Caja">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" />
              <path d="M6 10V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5" />
              <path d="M9 7h6M8 14h2M14 14h2M8 17h2M14 17h2" />
            </svg>
            <span className="nav-label">Caja</span>
          </NavLink>
          <NavLink to="/app/catalogo" className={linkClass} title="Catálogo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
              <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
              <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
              <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
            </svg>
            <span className="nav-label">Catálogo</span>
          </NavLink>

          {usuario.rol === "GERENTE" && (
            <>
              <span className="sidebar-section-label">Gerencia</span>
              <NavLink to="/app/dashboard" className={linkClass} title="Dashboard">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                </svg>
                <span className="nav-label">Dashboard</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-foot">
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} type="button" title="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
            </svg>
            <span className="nav-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div key={location.pathname}>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{sub}</div>
          </div>
          <div className="user-chip">
            <time className="topbar-clock" dateTime={ahora.toISOString()}>
              {FORMATO_RELOJ.format(ahora)}
            </time>
            <div className="user-meta">
              <span className="name">
                {usuario.nombre} {usuario.apellido}
              </span>
              <span className="role">{usuario.rol === "GERENTE" ? "Gerente" : "Cajero"}</span>
            </div>
            <div className="user-avatar" aria-hidden="true">
              {initials(usuario.nombre, usuario.apellido)}
            </div>
          </div>
        </header>

        <main className="content">
          <div className="page" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
