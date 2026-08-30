import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { obtenerDashboard, type DashboardData } from "../api/reportes";

function money(n: string | number) {
  return `$${Number(n).toFixed(2)}`;
}

function metodoPagoLabel(metodo: string) {
  if (metodo === "EFECTIVO") return "Efectivo";
  if (metodo === "TARJETA") return "Tarjeta";
  if (metodo === "TRANSFERENCIA") return "Transferencia";
  return metodo;
}

function fechaHoy() {
  const texto = new Date().toLocaleDateString("es-PA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    setCargando(true);
    obtenerDashboard(token)
      .then((res) => {
        if (cancelado) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err instanceof ApiError && err.status === 403) {
          setError("Esta sección es solo para el rol Gerente.");
        } else {
          setError(err instanceof ApiError ? err.message : "No se pudo cargar el dashboard.");
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  if (!token) return null;

  if (cargando) {
    return <p className="sub">Cargando dashboard…</p>;
  }

  if (error || !data) {
    return <div className="alert">{error ?? "No se pudo cargar el dashboard."}</div>;
  }

  const deltaVentas = data.ventasHoy.cantidadVentas - data.ventasAyerCantidad;
  const tendenciaVentas =
    deltaVentas > 0
      ? `↑ ${deltaVentas} más que ayer`
      : deltaVentas < 0
      ? `↓ ${Math.abs(deltaVentas)} menos que ayer`
      : "Igual que ayer";

  const ticketHoy =
    data.ventasHoy.cantidadVentas > 0 ? Number(data.ventasHoy.totalVendido) / data.ventasHoy.cantidadVentas : 0;

  const maxVendido = Math.max(1, ...data.productosMasVendidos.map((p) => p.cantidad_vendida));
  const maxServicio = Math.max(1, ...data.serviciosMasRealizados.map((s) => s.cantidad_realizados));

  return (
    <>
      <div className="panel-head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Resumen del negocio — {fechaHoy()}</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <span className="kpi-label">Ventas de hoy</span>
          <span className="kpi-value">{data.ventasHoy.cantidadVentas}</span>
          <span className="kpi-trend">{tendenciaVentas}</span>
        </div>
        <div className="card kpi-card">
          <span className="kpi-label">Total facturado hoy</span>
          <span className="kpi-value">{money(data.ventasHoy.totalVendido)}</span>
          <span className="kpi-trend">ITBMS recaudado: {money(data.ventasHoy.itbms)}</span>
        </div>
        <div className="card kpi-card">
          <span className="kpi-label">Ticket promedio</span>
          <span className="kpi-value">{money(ticketHoy)}</span>
          <span className="kpi-trend">Promedio histórico: {money(data.ticketPromedioHistorico)}</span>
        </div>
        <div className="card kpi-card">
          <span className="kpi-label">Productos con stock bajo</span>
          <span className="kpi-value" style={{ color: "var(--warning)" }}>
            {data.inventarioBajoTotal}
          </span>
          <span className={"kpi-trend" + (data.productosAgotadosTotal > 0 ? " down" : "")}>
            {data.productosAgotadosTotal} agotado{data.productosAgotadosTotal === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="panel-title">
            <h2>Ventas recientes</h2>
            <span className="count">Últimas {data.ventasRecientes.length}</span>
          </div>
          <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Método</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.ventasRecientes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="sub">
                      Todavía no hay ventas registradas.
                    </td>
                  </tr>
                ) : (
                  data.ventasRecientes.map((v) => (
                    <tr key={v.id_compra}>
                      <td className="num">{v.numero_factura}</td>
                      <td>{v.cliente}</td>
                      <td>{metodoPagoLabel(v.metodo_pago)}</td>
                      <td className="num">{money(v.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="panel-title">
            <h2>Alertas de inventario</h2>
            <span className="count">vw_inventario_bajo</span>
          </div>
          <div className="panel-body">
            {data.productosAgotados.length === 0 && data.inventarioBajo.length === 0 && (
              <p className="sub">Todo el inventario está en buen nivel.</p>
            )}
            {data.productosAgotados.map((p) => (
              <div className="alert-row is-out" key={`agotado-${p.id_producto}`}>
                <div className="alert-icon">✕</div>
                <div className="alert-text">
                  <div className="t">{p.producto}</div>
                  <div className="s">Agotado — 0 unidades</div>
                </div>
                <span className="badge badge-danger">Agotado</span>
              </div>
            ))}
            {data.inventarioBajo.map((p) => (
              <div className="alert-row is-low" key={`bajo-${p.id_producto}`}>
                <div className="alert-icon">!</div>
                <div className="alert-text">
                  <div className="t">{p.producto}</div>
                  <div className="s">
                    {p.stock} de {p.stock_minimo} unidades mínimas
                  </div>
                </div>
                <span className="badge badge-warning">Bajo</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="panel-title">
            <h2>Productos más vendidos</h2>
            <span className="count">Histórico</span>
          </div>
          <div className="rank-list">
            {data.productosMasVendidos.length === 0 && <p className="sub">Aún no hay ventas de productos.</p>}
            {data.productosMasVendidos.map((p, idx) => (
              <div className="rank-row" key={p.id_producto}>
                <span className="rank-pos">{idx + 1}</span>
                <span className="rank-name">{p.producto}</span>
                <div className="rank-bar-wrap">
                  <div className="rank-bar" style={{ width: `${(p.cantidad_vendida / maxVendido) * 100}%` }} />
                </div>
                <span className="rank-meta">{p.cantidad_vendida} uds.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="panel-title">
            <h2>Servicios más solicitados</h2>
            <span className="count">Histórico</span>
          </div>
          <div className="rank-list">
            {data.serviciosMasRealizados.length === 0 && <p className="sub">Aún no hay servicios registrados.</p>}
            {data.serviciosMasRealizados.map((s, idx) => (
              <div className="rank-row" key={s.id_servicio}>
                <span className="rank-pos">{idx + 1}</span>
                <span className="rank-name">{s.servicio}</span>
                <div className="rank-bar-wrap">
                  <div className="rank-bar" style={{ width: `${(s.cantidad_realizados / maxServicio) * 100}%` }} />
                </div>
                <span className="rank-meta">{s.cantidad_realizados} veces</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}