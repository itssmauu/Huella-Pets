export function DashboardPage() {
  return (
    <>
      <div className="panel-head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Resumen del negocio — jueves 28 de agosto, 2026</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <span className="kpi-label">Ventas de hoy</span>
          <span className="kpi-value">3</span>
          <span className="kpi-trend">↑ 2 más que ayer</span>
        </div>
        <div className="card kpi-card">
          <span className="kpi-label">Total facturado hoy</span>
          <span className="kpi-value">$86.55</span>
          <span className="kpi-trend">ITBMS recaudado: $5.66</span>
        </div>
        <div className="card kpi-card">
          <span className="kpi-label">Ticket promedio</span>
          <span className="kpi-value">$28.85</span>
          <span className="kpi-trend">↑ 6.2% vs. semana pasada</span>
        </div>
        <div className="card kpi-card">
          <span className="kpi-label">Productos con stock bajo</span>
          <span className="kpi-value" style={{ color: "var(--warning)" }}>
            3
          </span>
          <span className="kpi-trend down">1 agotado</span>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="panel-title">
            <h2>Ventas recientes</h2>
            <span className="count">Últimas 4</span>
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
                <tr>
                  <td className="num">F-2026-000008</td>
                  <td>Roberto Chen</td>
                  <td>Transferencia</td>
                  <td className="num">$23.75</td>
                </tr>
                <tr>
                  <td className="num">F-2026-000007</td>
                  <td>Yaritza Sánchez</td>
                  <td>Tarjeta</td>
                  <td className="num">$67.20</td>
                </tr>
                <tr>
                  <td className="num">F-2026-000006</td>
                  <td>Carlos Pinzón</td>
                  <td>Efectivo</td>
                  <td className="num">$15.00</td>
                </tr>
                <tr>
                  <td className="num">F-2026-000005</td>
                  <td>Ana Gómez</td>
                  <td>Tarjeta</td>
                  <td className="num">$42.80</td>
                </tr>
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
            <div className="alert-row is-out">
              <div className="alert-icon">✕</div>
              <div className="alert-text">
                <div className="t">Ratón de Juguete con Catnip</div>
                <div className="s">Agotado — 0 unidades</div>
              </div>
              <span className="badge badge-danger">Agotado</span>
            </div>
            <div className="alert-row is-low">
              <div className="alert-icon">!</div>
              <div className="alert-text">
                <div className="t">Alimento para Gato Adulto 2kg</div>
                <div className="s">6 de 10 unidades mínimas</div>
              </div>
              <span className="badge badge-warning">Bajo</span>
            </div>
            <div className="alert-row is-low">
              <div className="alert-icon">!</div>
              <div className="alert-text">
                <div className="t">Shampoo Antipulgas 500ml</div>
                <div className="s">3 de 8 unidades mínimas</div>
              </div>
              <span className="badge badge-warning">Bajo</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="panel-title">
            <h2>Productos más vendidos</h2>
            <span className="count">Este mes</span>
          </div>
          <div className="rank-list">
            <div className="rank-row">
              <span className="rank-pos">1</span>
              <span className="rank-name">Alimento para Cachorro 3kg</span>
              <div className="rank-bar-wrap">
                <div className="rank-bar" style={{ width: "100%" }} />
              </div>
              <span className="rank-meta">42 uds.</span>
            </div>
            <div className="rank-row">
              <span className="rank-pos">2</span>
              <span className="rank-name">Snacks Dentales para Perro</span>
              <div className="rank-bar-wrap">
                <div className="rank-bar" style={{ width: "71%" }} />
              </div>
              <span className="rank-meta">30 uds.</span>
            </div>
            <div className="rank-row">
              <span className="rank-pos">3</span>
              <span className="rank-name">Arena Sanitaria para Gatos 4kg</span>
              <div className="rank-bar-wrap">
                <div className="rank-bar" style={{ width: "48%" }} />
              </div>
              <span className="rank-meta">20 uds.</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="panel-title">
            <h2>Servicios más solicitados</h2>
            <span className="count">Este mes</span>
          </div>
          <div className="rank-list">
            <div className="rank-row">
              <span className="rank-pos">1</span>
              <span className="rank-name">Baño y Corte</span>
              <div className="rank-bar-wrap">
                <div className="rank-bar" style={{ width: "100%" }} />
              </div>
              <span className="rank-meta">18 veces</span>
            </div>
            <div className="rank-row">
              <span className="rank-pos">2</span>
              <span className="rank-name">Consulta Veterinaria General</span>
              <div className="rank-bar-wrap">
                <div className="rank-bar" style={{ width: "61%" }} />
              </div>
              <span className="rank-meta">11 veces</span>
            </div>
            <div className="rank-row">
              <span className="rank-pos">3</span>
              <span className="rank-name">Aplicación de Vacuna</span>
              <div className="rank-bar-wrap">
                <div className="rank-bar" style={{ width: "39%" }} />
              </div>
              <span className="rank-meta">7 veces</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}