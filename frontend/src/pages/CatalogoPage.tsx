import { Fragment, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { listarProductos, crearProducto, actualizarProducto, ajustarStockProducto, type Producto } from "../api/productos";
import { listarClientes, crearCliente, actualizarCliente, type Cliente } from "../api/clientes";
import { listarServicios, crearServicio, actualizarServicio, type Servicio } from "../api/servicios";
import { listarCategorias, type Categoria } from "../api/categorias";
import { listarTiposServicio, type TipoServicio } from "../api/tiposServicio";
import { listarMascotasPorCliente, crearMascota, actualizarMascota, type Mascota } from "../api/mascotas";


type CatalogTab = "productos" | "clientes" | "servicios";
type ModalKind = "producto" | "cliente" | "servicio" | "mascota" | null;

function money(n: string | number) {
  return `$${Number(n).toFixed(2)}`;
}

function initials(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stockBadge(stock: number, minimo: number) {
  if (stock <= 0) return <span className="badge badge-danger">Agotado</span>;
  if (stock < minimo) return <span className="badge badge-warning">Bajo</span>;
  return <span className="badge badge-success">Suficiente</span>;
}

export function CatalogoPage() {
  const { token, usuario } = useAuth();
  const esGerente = usuario?.rol === "GERENTE";

  const [tab, setTab] = useState<CatalogTab>("productos");
  const [buscarProducto, setBuscarProducto] = useState("");
  const [buscarCliente, setBuscarCliente] = useState("");
  const [buscarServicio, setBuscarServicio] = useState("");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [mascotasPorCliente, setMascotasPorCliente] = useState<Record<number, Mascota[]>>({});
  const [clienteExpandido, setClienteExpandido] = useState<number | null>(null);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);

  const [modal, setModal] = useState<ModalKind>(null);
  const [modalClienteId, setModalClienteId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [stockOriginal, setStockOriginal] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    setCargando(true);
    Promise.all([
      listarProductos(token, undefined, false),
      listarClientes(token),
      listarServicios(token, undefined, false),
      listarCategorias(token),
      listarTiposServicio(token),
    ])
      .then(([p, c, s, cat, ts]) => {
        if (cancelado) return;
        setProductos(p);
        setClientes(c);
        setServicios(s);
        setCategorias(cat);
        setTiposServicio(ts);
        setErrorCarga(null);
      })
      .catch((err) => {
        if (cancelado) return;
        setErrorCarga(err instanceof ApiError ? err.message : "No se pudo cargar el catálogo.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  if (!token) return null;

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(buscarProducto.trim().toLowerCase())
  );
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(buscarCliente.trim().toLowerCase())
  );
  const serviciosFiltrados = servicios.filter((s) =>
    s.nombre.toLowerCase().includes(buscarServicio.trim().toLowerCase())
  );

  function abrirModal(
    kind: ModalKind,
    opciones: { clienteId?: number; editId?: number; stockOriginal?: number; valoresIniciales?: Record<string, string> } = {}
  ) {
    setModal(kind);
    setModalClienteId(opciones.clienteId ?? null);
    setEditandoId(opciones.editId ?? null);
    setStockOriginal(opciones.stockOriginal ?? null);
    setForm(opciones.valoresIniciales ?? {});
    setFormError(null);
  }

  function cerrarModal() {
    setModal(null);
    setModalClienteId(null);
    setEditandoId(null);
    setStockOriginal(null);
    setForm({});
    setFormError(null);
  }

  function actualizarForm(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function alternarMascotas(idCliente: number) {
    if (clienteExpandido === idCliente) {
      setClienteExpandido(null);
      return;
    }
    setClienteExpandido(idCliente);
    if (!mascotasPorCliente[idCliente] && token) {
      setCargandoMascotas(true);
      try {
        const lista = await listarMascotasPorCliente(token, idCliente);
        setMascotasPorCliente((prev) => ({ ...prev, [idCliente]: lista }));
      } catch {
        // Si falla, el usuario puede cerrar y volver a abrir para reintentar.
      } finally {
        setCargandoMascotas(false);
      }
    }
  }

  async function handleGuardar() {
    if (!token) return;
    setFormError(null);

    try {
      setGuardando(true);

      if (modal === "producto") {
        const idCategoria = Number(form.idCategoria);
        const precio = Number(form.precio);
        const stock = form.stock ? Number(form.stock) : 0;
        const stockMinimo = form.stockMinimo ? Number(form.stockMinimo) : undefined;
        if (!form.nombre || !idCategoria || !precio) {
          setFormError("Completa nombre, categoría y precio.");
          return;
        }
        if (editandoId) {
          const actualizado = await actualizarProducto(token, editandoId, {
            idCategoria,
            nombre: form.nombre,
            precio,
            stockMinimo,
          });
          let productoFinal = actualizado;
          if (stockOriginal !== null && stock !== stockOriginal) {
            productoFinal = await ajustarStockProducto(token, editandoId, stock - stockOriginal, "Ajuste desde catálogo");
          }
          setProductos((prev) => prev.map((p) => (p.id_producto === editandoId ? productoFinal : p)));
        } else {
          const nuevo = await crearProducto(token, { idCategoria, nombre: form.nombre, precio, stock, stockMinimo });
          setProductos((prev) => [...prev, nuevo]);
        }
      }

      if (modal === "cliente") {
        if (!form.nombre || !form.apellido || (!editandoId && !form.cedula)) {
          setFormError(editandoId ? "Completa nombre y apellido." : "Completa nombre, apellido y cédula.");
          return;
        }
        if (editandoId) {
          const actualizado = await actualizarCliente(token, editandoId, {
            nombre: form.nombre,
            apellido: form.apellido,
            cedula: form.cedula || undefined,
            telefono: form.telefono || undefined,
            email: form.email || undefined,
          });
          setClientes((prev) => prev.map((c) => (c.id_cliente === editandoId ? actualizado : c)));
        } else {
          const nuevo = await crearCliente(token, {
            nombre: form.nombre,
            apellido: form.apellido,
            cedula: form.cedula,
            telefono: form.telefono || undefined,
            email: form.email || undefined,
          });
          setClientes((prev) => [...prev, nuevo]);
        }
      }

      if (modal === "servicio") {
        const idTipoServicio = Number(form.idTipoServicio);
        const precio = Number(form.precio);
        const duracionEstimada = form.duracionEstimada ? Number(form.duracionEstimada) : undefined;
        if (!form.nombre || !idTipoServicio || !precio) {
          setFormError("Completa nombre, tipo y precio.");
          return;
        }
        if (editandoId) {
          const actualizado = await actualizarServicio(token, editandoId, {
            idTipoServicio,
            nombre: form.nombre,
            precio,
            duracionEstimada,
          });
          setServicios((prev) => prev.map((s) => (s.id_servicio === editandoId ? actualizado : s)));
        } else {
          const nuevo = await crearServicio(token, { idTipoServicio, nombre: form.nombre, precio, duracionEstimada });
          setServicios((prev) => [...prev, nuevo]);
        }
      }

      if (modal === "mascota") {
        if (!modalClienteId || !form.nombre || !form.especie) {
          setFormError("Completa nombre y especie.");
          return;
        }
        if (editandoId) {
          const actualizada = await actualizarMascota(token, editandoId, {
            nombre: form.nombre,
            especie: form.especie,
            raza: form.raza || undefined,
          });
          setMascotasPorCliente((prev) => ({
            ...prev,
            [modalClienteId]: (prev[modalClienteId] ?? []).map((m) => (m.id_mascota === editandoId ? actualizada : m)),
          }));
        } else {
          const nueva = await crearMascota(token, {
            idCliente: modalClienteId,
            nombre: form.nombre,
            especie: form.especie,
            raza: form.raza || undefined,
          });
          setMascotasPorCliente((prev) => ({
            ...prev,
            [modalClienteId]: [...(prev[modalClienteId] ?? []), nueva],
          }));
        }
        setClienteExpandido(modalClienteId);
      }

      cerrarModal();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function desactivarProducto(p: Producto) {
    if (!token) return;
    try {
      const actualizado = await actualizarProducto(token, p.id_producto, { estado: !p.estado });
      setProductos((prev) => prev.map((x) => (x.id_producto === p.id_producto ? actualizado : x)));
    } catch (err) {
      setErrorCarga(err instanceof ApiError ? err.message : "No se pudo actualizar el producto.");
    }
  }

  async function desactivarServicio(s: Servicio) {
    if (!token) return;
    try {
      const actualizado = await actualizarServicio(token, s.id_servicio, { estado: !s.estado });
      setServicios((prev) => prev.map((x) => (x.id_servicio === s.id_servicio ? actualizado : x)));
    } catch (err) {
      setErrorCarga(err instanceof ApiError ? err.message : "No se pudo actualizar el servicio.");
    }
  }

  return (
    <>
      <div className="panel-head">
        <div>
          <h1>Catálogo</h1>
          <p className="sub">Productos, clientes, mascotas y servicios</p>
        </div>
      </div>

      {errorCarga && <div className="alert">{errorCarga}</div>}

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

      {cargando ? (
        <p className="sub">Cargando catálogo…</p>
      ) : (
        <>
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
                {esGerente && (
                  <button className="btn btn-primary" type="button" onClick={() => abrirModal("producto")}>
                    + Nuevo producto
                  </button>
                )}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      {esGerente && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map((p) => (
                      <tr key={p.id_producto}>
                        <td className="row-name">
                          {p.nombre}
                          {!p.estado && (
                            <span className="badge badge-danger" style={{ marginLeft: 8 }}>
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td>{p.categoria}</td>
                        <td className="num">{money(p.precio)}</td>
                        <td>
                          <div className="stock-cell">
                            <span className="num">{p.stock}</span>
                            {stockBadge(p.stock, p.stock_minimo)}
                          </div>
                        </td>
                        {esGerente && (
                          <td className="actions-cell">
                            <button
                              className="icon-btn"
                              type="button"
                              aria-label="Editar"
                              onClick={() =>
                                abrirModal("producto", {
                                  editId: p.id_producto,
                                  stockOriginal: p.stock,
                                  valoresIniciales: {
                                    nombre: p.nombre,
                                    idCategoria: String(p.id_categoria),
                                    precio: p.precio,
                                    stock: String(p.stock),
                                    stockMinimo: String(p.stock_minimo),
                                  },
                                })
                              }
                            >
                              ✎
                            </button>
                            <button
                              className="icon-btn"
                              type="button"
                              title={p.estado ? "Desactivar producto" : "Activar producto"}
                              aria-label={p.estado ? "Desactivar" : "Activar"}
                              onClick={() => desactivarProducto(p)}
                            >
                              ⏻
                            </button>
                          </td>
                        )}
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
                <button className="btn btn-primary" type="button" onClick={() => abrirModal("cliente")}>
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
                    {clientesFiltrados.map((c) => (
                      <Fragment key={c.id_cliente}>
                        <tr>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span className="avatar-sm">{initials(`${c.nombre} ${c.apellido}`)}</span>
                              <span className="row-name">
                                {c.nombre} {c.apellido}
                              </span>
                            </div>
                          </td>
                          <td className="num">{c.telefono || "—"}</td>
                          <td>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <button
                                className="icon-btn"
                                type="button"
                                title={clienteExpandido === c.id_cliente ? "Ocultar mascotas" : "Ver mascotas"}
                                aria-label={clienteExpandido === c.id_cliente ? "Ocultar mascotas" : "Ver mascotas"}
                                onClick={() => alternarMascotas(c.id_cliente)}
                              >
                                🐾
                              </button>
                              {mascotasPorCliente[c.id_cliente] && (
                                <span className="badge">{mascotasPorCliente[c.id_cliente].length}</span>
                              )}
                              <button
                                className="icon-btn"
                                type="button"
                                title="Agregar mascota"
                                aria-label="Agregar mascota"
                                onClick={() => abrirModal("mascota", { clienteId: c.id_cliente })}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="icon-btn"
                              type="button"
                              aria-label="Editar"
                              onClick={() =>
                                abrirModal("cliente", {
                                  editId: c.id_cliente,
                                  valoresIniciales: {
                                    nombre: c.nombre,
                                    apellido: c.apellido,
                                    cedula: c.cedula || "",
                                    telefono: c.telefono || "",
                                    email: c.email || "",
                                  },
                                })
                              }
                            >
                              ✎
                            </button>
                          </td>
                        </tr>
                        {clienteExpandido === c.id_cliente && (
                          <tr className="pet-detail-row">
                            <td></td>
                            <td></td>
                            <td>
                              <div className="pet-detail-panel">
                                {cargandoMascotas && !mascotasPorCliente[c.id_cliente] && (
                                  <span className="sub">Cargando…</span>
                                )}
                                {mascotasPorCliente[c.id_cliente]?.length === 0 && (
                                  <span className="sub">Sin mascotas registradas</span>
                                )}
                                {mascotasPorCliente[c.id_cliente]?.map((m) => (
                                  <span key={m.id_mascota} className="pet-tag">
                                    {m.nombre} · {m.especie}
                                    <button
                                      type="button"
                                      className="pet-tag-edit"
                                      title="Editar mascota"
                                      aria-label={`Editar ${m.nombre}`}
                                      onClick={() =>
                                        abrirModal("mascota", {
                                          clienteId: c.id_cliente,
                                          editId: m.id_mascota,
                                          valoresIniciales: {
                                            nombre: m.nombre,
                                            especie: m.especie,
                                            raza: m.raza || "",
                                          },
                                        })
                                      }
                                    >
                                      ✎
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td></td>
                          </tr>
                        )}
                      </Fragment>
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
                {esGerente && (
                  <button className="btn btn-primary" type="button" onClick={() => abrirModal("servicio")}>
                    + Nuevo servicio
                  </button>
                )}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Servicio</th>
                      <th>Tipo</th>
                      <th>Duración</th>
                      <th>Precio</th>
                      {esGerente && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {serviciosFiltrados.map((s) => (
                      <tr key={s.id_servicio}>
                        <td className="row-name">
                          {s.nombre}
                          {!s.estado && (
                            <span className="badge badge-danger" style={{ marginLeft: 8 }}>
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td>{s.tipo_servicio}</td>
                        <td>{s.duracion_estimada ? `${s.duracion_estimada} min` : "—"}</td>
                        <td className="num">{money(s.precio)}</td>
                        {esGerente && (
                          <td className="actions-cell">
                            <button
                              className="icon-btn"
                              type="button"
                              aria-label="Editar"
                              onClick={() =>
                                abrirModal("servicio", {
                                  editId: s.id_servicio,
                                  valoresIniciales: {
                                    nombre: s.nombre,
                                    idTipoServicio: String(s.id_tipo_servicio),
                                    precio: s.precio,
                                    duracionEstimada: s.duracion_estimada ? String(s.duracion_estimada) : "",
                                  },
                                })
                              }
                            >
                              ✎
                            </button>
                            <button
                              className="icon-btn"
                              type="button"
                              title={s.estado ? "Desactivar servicio" : "Activar servicio"}
                              aria-label={s.estado ? "Desactivar" : "Activar"}
                              onClick={() => desactivarServicio(s)}
                            >
                              ⏻
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>
                {modal === "producto" && (editandoId ? "Editar producto" : "Nuevo producto")}
                {modal === "cliente" && (editandoId ? "Editar cliente" : "Nuevo cliente")}
                {modal === "servicio" && (editandoId ? "Editar servicio" : "Nuevo servicio")}
                {modal === "mascota" && (editandoId ? "Editar mascota" : "Nueva mascota")}
              </h3>
              <button className="modal-close" type="button" onClick={cerrarModal} aria-label="Cerrar">
                ✕
              </button>
            </div>
            <div className="modal-body">
              {modal === "producto" && (
                <>
                  <div className="field">
                    <label>Nombre</label>
                    <input
                      className="input"
                      placeholder="Ej. Pelota de Goma Resistente"
                      value={form.nombre || ""}
                      onChange={(e) => actualizarForm("nombre", e.target.value)}
                    />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label>Categoría</label>
                      <select
                        className="select"
                        value={form.idCategoria || ""}
                        onChange={(e) => actualizarForm("idCategoria", e.target.value)}
                      >
                        <option value="" disabled>
                          Selecciona…
                        </option>
                        {categorias.map((cat) => (
                          <option key={cat.id_categoria} value={cat.id_categoria}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Precio</label>
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.precio || ""}
                        onChange={(e) => actualizarForm("precio", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label>Stock inicial</label>
                      <input
                        className="input"
                        type="number"
                        placeholder="0"
                        value={form.stock || ""}
                        onChange={(e) => actualizarForm("stock", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Stock mínimo</label>
                      <input
                        className="input"
                        type="number"
                        placeholder="5"
                        value={form.stockMinimo || ""}
                        onChange={(e) => actualizarForm("stockMinimo", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
              {modal === "cliente" && (
                <>
                  <div className="field">
                    <label>Cédula</label>
                    <input
                      className="input"
                      placeholder="Ej. 8-888-8888"
                      value={form.cedula || ""}
                      onChange={(e) => actualizarForm("cedula", e.target.value)}
                    />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label>Nombre</label>
                      <input
                        className="input"
                        placeholder="Ej. Laura"
                        value={form.nombre || ""}
                        onChange={(e) => actualizarForm("nombre", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Apellido</label>
                      <input
                        className="input"
                        placeholder="Ej. Herrera"
                        value={form.apellido || ""}
                        onChange={(e) => actualizarForm("apellido", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Teléfono</label>
                    <input
                      className="input"
                      placeholder="6000-0000"
                      value={form.telefono || ""}
                      onChange={(e) => actualizarForm("telefono", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Correo (opcional)</label>
                    <input
                      className="input"
                      placeholder="correo@ejemplo.com"
                      value={form.email || ""}
                      onChange={(e) => actualizarForm("email", e.target.value)}
                    />
                  </div>
                </>
              )}
              {modal === "servicio" && (
                <>
                  <div className="field">
                    <label>Nombre</label>
                    <input
                      className="input"
                      placeholder="Ej. Corte de pelo especializado"
                      value={form.nombre || ""}
                      onChange={(e) => actualizarForm("nombre", e.target.value)}
                    />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label>Tipo</label>
                      <select
                        className="select"
                        value={form.idTipoServicio || ""}
                        onChange={(e) => actualizarForm("idTipoServicio", e.target.value)}
                      >
                        <option value="" disabled>
                          Selecciona…
                        </option>
                        {tiposServicio.map((ts) => (
                          <option key={ts.id_tipo_servicio} value={ts.id_tipo_servicio}>
                            {ts.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Duración (min)</label>
                      <input
                        className="input"
                        type="number"
                        placeholder="30"
                        value={form.duracionEstimada || ""}
                        onChange={(e) => actualizarForm("duracionEstimada", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Precio</label>
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.precio || ""}
                      onChange={(e) => actualizarForm("precio", e.target.value)}
                    />
                  </div>
                </>
              )}
              {modal === "mascota" && (
                <>
                  <div className="field">
                    <label>Nombre</label>
                    <input
                      className="input"
                      placeholder="Ej. Firulais"
                      value={form.nombre || ""}
                      onChange={(e) => actualizarForm("nombre", e.target.value)}
                    />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label>Especie</label>
                      <input
                        className="input"
                        placeholder="Perro, Gato…"
                        value={form.especie || ""}
                        onChange={(e) => actualizarForm("especie", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Raza (opcional)</label>
                      <input
                        className="input"
                        placeholder="Ej. Labrador"
                        value={form.raza || ""}
                        onChange={(e) => actualizarForm("raza", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {formError && <div className="alert">{formError}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" type="button" onClick={cerrarModal} disabled={guardando}>
                Cancelar
              </button>
              <button className="btn btn-primary" type="button" onClick={handleGuardar} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}