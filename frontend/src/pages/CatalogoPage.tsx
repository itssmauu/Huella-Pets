import { useState } from "react";
import { CLIENTES, PRODUCTOS, SERVICIOS } from "../data/mockCatalog";

type CatalogTab = "productos" | "clientes" | "servicios";
type ModalKind = "producto" | "cliente" | "servicio" | null;

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function initials(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stockBadge(stock: number, min: number) {
  if (stock <= 0) return <span className="badge badge-danger">Agotado</span>;
  if (stock < min) return <span className="badge badge-warning">Bajo</span>;
  return <span className="badge badge-success">Suficiente</span>;
}

export function CatalogoPage() {
  const [tab, setTab] = useState<CatalogTab>("productos");
  const [buscarProducto, setBuscarProducto] = useState("");
  const [buscarCliente, setBuscarCliente] = useState("");
  const [buscarServicio, setBuscarServicio] = useState("");
  const [modal, setModal] = useState<ModalKind>(null);

  const productos = PRODUCTOS.filter((p) => p.nombre.toLowerCase().includes(buscarProducto.trim().toLowerCase()));
  const clientes = CLIENTES.filter((c) => c.nombre.toLowerCase().includes(buscarCliente.trim().toLowerCase()));
  const servicios = SERVICIOS.filter((s) => s.nombre.toLowerCase().includes(buscarServicio.trim().toLowerCase()));

  return (
    <>
      <div className="panel-head">
        <div>
          <h1>Catálogo</h1>
          <p className="sub">Productos, clientes, mascotas y servicios</p>
        </div>
      </div>

      <div className="catalog-tabs">
        <button className={"catalog-tab" + (tab === "productos" ? " active" : "")} type="button" onClick={() => setTab("productos")}>
          Productos
        </button>
        <button className={"catalog-tab" + (tab === "clientes" ? " active" : "")} type="button" onClick={() => setTab("clientes")}>
          Clientes &amp; mascotas
        </button>
        <button className={"catalog-tab" + (tab === "servicios" ? " active" : "")} type="button" onClick={() => setTab("servicios")}>
          Servicios
        </button>
      </div>

      {tab === "productos" && (
        <div>
          <div className="toolbar" style={{ marginBottom: 14 }}>
            <input
              className="input"
              type="text"
              placeholder="Buscar producto…"
              value={buscarProducto}
              onChange={(e) => setBuscarProducto(e.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={() => setModal("producto")}>
              + Nuevo producto
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.nombre}>
                    <td className="row-name">{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td className="num">{money(p.precio)}</td>
                    <td>
                      <div className="stock-cell">
                        <span className="num">{p.stock}</span>
                        {stockBadge(p.stock, p.min)}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <button className="icon-btn" type="button" aria-label="Editar">
                        ✎
                      </button>
                      <button className="icon-btn" type="button" aria-label="Desactivar">
                        ⏻
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "clientes" && (
        <div>
          <div className="toolbar" style={{ marginBottom: 14 }}>
            <input
              className="input"
              type="text"
              placeholder="Buscar cliente…"
              value={buscarCliente}
              onChange={(e) => setBuscarCliente(e.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={() => setModal("cliente")}>
              + Nuevo cliente
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Mascotas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.nombre}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="avatar-sm">{initials(c.nombre)}</span>
                        <span className="row-name">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="num">{c.telefono}</td>
                    <td>
                      {c.mascotas.map((m) => (
                        <span className="pet-tag" key={m.nombre}>
                          {m.nombre} · {m.tipo}
                        </span>
                      ))}
                    </td>
                    <td className="actions-cell">
                      <button className="icon-btn" type="button" aria-label="Editar">
                        ✎
                      </button>
                      <button className="icon-btn" type="button" aria-label="Ver historial">
                        🕘
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "servicios" && (
        <div>
          <div className="toolbar" style={{ marginBottom: 14 }}>
            <input
              className="input"
              type="text"
              placeholder="Buscar servicio…"
              value={buscarServicio}
              onChange={(e) => setBuscarServicio(e.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={() => setModal("servicio")}>
              + Nuevo servicio
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Tipo</th>
                  <th>Duración</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s) => (
                  <tr key={s.nombre}>
                    <td className="row-name">{s.nombre}</td>
                    <td>{s.tipo}</td>
                    <td>{s.duracion}</td>
                    <td className="num">{money(s.precio)}</td>
                    <td className="actions-cell">
                      <button className="icon-btn" type="button" aria-label="Editar">
                        ✎
                      </button>
                      <button className="icon-btn" type="button" aria-label="Desactivar">
                        ⏻
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>
                {modal === "producto" && "Nuevo producto"}
                {modal === "cliente" && "Nuevo cliente"}
                {modal === "servicio" && "Nuevo servicio"}
              </h3>
              <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Cerrar">
                ✕
              </button>
            </div>
            <div className="modal-body">
              {modal === "producto" && (
                <>
                  <div className="field">
                    <label>Nombre</label>
                    <input className="input" placeholder="Ej. Pelota de Goma Resistente" />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label>Categoría</label>
                      <select className="select">
                        <option>Alimentos</option>
                        <option>Juguetes</option>
                        <option>Accesorios</option>
                        <option>Higiene</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Precio</label>
                      <input className="input" placeholder="$0.00" />
                    </div>
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label>Stock inicial</label>
                      <input className="input" placeholder="0" />
                    </div>
                    <div className="field">
                      <label>Stock mínimo</label>
                      <input className="input" placeholder="0" />
                    </div>
                  </div>
                </>
              )}
              {modal === "cliente" && (
                <>
                  <div className="field">
                    <label>Nombre completo</label>
                    <input className="input" placeholder="Ej. Laura Herrera" />
                  </div>
                  <div className="field">
                    <label>Teléfono</label>
                    <input className="input" placeholder="6000-0000" />
                  </div>
                  <div className="field">
                    <label>Correo (opcional)</label>
                    <input className="input" placeholder="correo@ejemplo.com" />
                  </div>
                </>
              )}
              {modal === "servicio" && (
                <>
                  <div className="field">
                    <label>Nombre</label>
                    <input className="input" placeholder="Ej. Corte de pelo especializado" />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label>Tipo</label>
                      <select className="select">
                        <option>Estética</option>
                        <option>Veterinaria</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Duración</label>
                      <input className="input" placeholder="30 min" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Precio</label>
                    <input className="input" placeholder="$0.00" />
                  </div>
                </>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" type="button" onClick={() => setModal(null)}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}