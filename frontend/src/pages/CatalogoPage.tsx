import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { listarProductos, crearProducto, actualizarProducto, ajustarStockProducto, type Producto } from "../api/productos";
import { listarClientes, crearCliente, actualizarCliente, type Cliente } from "../api/clientes";
import { listarServicios, crearServicio, actualizarServicio, type Servicio } from "../api/servicios";
import { listarCategorias, type Categoria } from "../api/categorias";
import { listarTiposServicio, type TipoServicio } from "../api/tiposServicio";
import { listarMascotas, crearMascota, actualizarMascota, type Mascota } from "../api/mascotas";
import { Icon } from "../components/caja/CajaBits";
import { ItemArt, PetArt } from "../components/caja/ItemArt";

type CatalogTab = "productos" | "clientes" | "servicios";
type ModalKind = "producto" | "cliente" | "servicio" | "mascota" | null;
type FiltroProducto = "todos" | "bajo" | "agotado" | "inactivo";
type FiltroCliente = "todos" | "con" | "sin";
type FiltroServicio = "todos" | "activos" | "inactivos";

const ESPECIES = ["Perro", "Gato", "Ave", "Conejo"];

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

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function estadoStock(p: Producto): "agotado" | "bajo" | "ok" {
  if (p.stock <= 0) return "agotado";
  if (p.stock < p.stock_minimo) return "bajo";
  return "ok";
}

function edad(fecha: string | null) {
  if (!fecha) return null;
  const nac = new Date(fecha);
  const hoy = new Date();
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
  if (hoy.getDate() < nac.getDate()) meses -= 1;
  if (meses < 1) return "recién nacido";
  if (meses < 12) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  const anios = Math.floor(meses / 12);
  return `${anios} ${anios === 1 ? "año" : "años"}`;
}

const FORMATO_ALTA = new Intl.DateTimeFormat("es-PA", { month: "short", year: "numeric" });

// Tonos para los avatares de clientes, de la misma paleta que las ilustraciones
const TONOS_AVATAR = ["#ffe7a3", "#cde8f6", "#cfefe2", "#ffd8c9", "#e5defa", "#fadbe7"];

interface FiltroChipsProps<T extends string> {
  opciones: { valor: T; label: string; total: number; tono?: "warning" | "danger" | "muted" }[];
  activo: T;
  onChange: (v: T) => void;
  label: string;
}

function FiltroChips<T extends string>({ opciones, activo, onChange, label }: FiltroChipsProps<T>) {
  return (
    <div className="filter-chips" role="group" aria-label={label}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          className="filter-chip"
          data-tono={o.tono}
          aria-pressed={activo === o.valor}
          onClick={() => onChange(o.valor)}
        >
          {o.label}
          <span className="filter-count">{o.total}</span>
        </button>
      ))}
    </div>
  );
}

function Buscador({ valor, onChange, placeholder }: { valor: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="pos-search catalog-search">
      <span className="sr-only">{placeholder}</span>
      {Icon.search}
      <input className="input" type="search" placeholder={placeholder} value={valor} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function CatalogoPage() {
  const { token, usuario } = useAuth();
  const esGerente = usuario?.rol === "GERENTE";

  const [tab, setTab] = useState<CatalogTab>("productos");
  const [buscarProducto, setBuscarProducto] = useState("");
  const [buscarCliente, setBuscarCliente] = useState("");
  const [buscarServicio, setBuscarServicio] = useState("");
  const [filtroProducto, setFiltroProducto] = useState<FiltroProducto>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [filtroCliente, setFiltroCliente] = useState<FiltroCliente>("todos");
  const [filtroServicio, setFiltroServicio] = useState<FiltroServicio>("todos");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

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
      listarMascotas(token),
    ])
      .then(([p, c, s, cat, ts, m]) => {
        if (cancelado) return;
        setProductos(p);
        setClientes(c);
        setServicios(s);
        setCategorias(cat);
        setTiposServicio(ts);
        setMascotas(m);
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

  // ---------- Productos ----------
  const qProducto = normalizar(buscarProducto.trim());
  const productosBuscados = productos.filter(
    (p) =>
      (!qProducto || normalizar(`${p.nombre} ${p.categoria}`).includes(qProducto)) &&
      (!categoriaFiltro || p.categoria === categoriaFiltro)
  );
  const conteoProductos = {
    todos: productosBuscados.length,
    bajo: productosBuscados.filter((p) => p.estado && estadoStock(p) === "bajo").length,
    agotado: productosBuscados.filter((p) => p.estado && estadoStock(p) === "agotado").length,
    inactivo: productosBuscados.filter((p) => !p.estado).length,
  };
  const productosFiltrados = productosBuscados.filter((p) => {
    if (filtroProducto === "bajo") return p.estado && estadoStock(p) === "bajo";
    if (filtroProducto === "agotado") return p.estado && estadoStock(p) === "agotado";
    if (filtroProducto === "inactivo") return !p.estado;
    return true;
  });
  const categoriasUsadas = [...new Set(productos.map((p) => p.categoria))].sort();

  // ---------- Clientes y mascotas ----------
  const mascotasDe = (idCliente: number) => mascotas.filter((m) => m.id_cliente === idCliente);
  const qCliente = normalizar(buscarCliente.trim());
  const clientesBuscados = clientes.filter((c) => {
    if (!qCliente) return true;
    const nombresMascotas = mascotasDe(c.id_cliente)
      .map((m) => m.nombre)
      .join(" ");
    return normalizar(`${c.nombre} ${c.apellido} ${c.cedula ?? ""} ${c.telefono ?? ""} ${nombresMascotas}`).includes(qCliente);
  });
  const conteoClientes = {
    todos: clientesBuscados.length,
    con: clientesBuscados.filter((c) => mascotasDe(c.id_cliente).length > 0).length,
    sin: clientesBuscados.filter((c) => mascotasDe(c.id_cliente).length === 0).length,
  };
  const clientesFiltrados = clientesBuscados.filter((c) => {
    const n = mascotasDe(c.id_cliente).length;
    if (filtroCliente === "con") return n > 0;
    if (filtroCliente === "sin") return n === 0;
    return true;
  });

  // ---------- Servicios ----------
  const qServicio = normalizar(buscarServicio.trim());
  const serviciosBuscados = servicios.filter((s) => !qServicio || normalizar(`${s.nombre} ${s.tipo_servicio}`).includes(qServicio));
  const conteoServicios = {
    todos: serviciosBuscados.length,
    activos: serviciosBuscados.filter((s) => s.estado).length,
    inactivos: serviciosBuscados.filter((s) => !s.estado).length,
  };
  const serviciosFiltrados = serviciosBuscados.filter((s) => {
    if (filtroServicio === "activos") return s.estado;
    if (filtroServicio === "inactivos") return !s.estado;
    return true;
  });

  const clienteDelModal = clientes.find((c) => c.id_cliente === modalClienteId) ?? null;

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
        const sexo = form.sexo === "M" || form.sexo === "H" ? form.sexo : undefined;
        if (editandoId) {
          const actualizada = await actualizarMascota(token, editandoId, {
            nombre: form.nombre,
            especie: form.especie,
            raza: form.raza || undefined,
            sexo,
          });
          setMascotas((prev) => prev.map((m) => (m.id_mascota === editandoId ? actualizada : m)));
        } else {
          const nueva = await crearMascota(token, {
            idCliente: modalClienteId,
            nombre: form.nombre,
            especie: form.especie,
            raza: form.raza || undefined,
            sexo,
          });
          setMascotas((prev) => [...prev, nueva]);
        }
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

  const TABS: { valor: CatalogTab; label: string; total: number }[] = [
    { valor: "productos", label: "Productos", total: productos.length },
    { valor: "clientes", label: "Clientes y mascotas", total: clientes.length },
    { valor: "servicios", label: "Servicios", total: servicios.length },
  ];

  return (
    <>
      {errorCarga && <div className="alert">{errorCarga}</div>}

      <div className="catalog-tabs" role="tablist" aria-label="Secciones del catálogo">
        {TABS.map((t) => (
          <button
            key={t.valor}
            role="tab"
            aria-selected={tab === t.valor}
            className={"catalog-tab" + (tab === t.valor ? " active" : "")}
            type="button"
            onClick={() => setTab(t.valor)}
          >
            {t.label}
            {!cargando && <span className="tab-count">{t.total}</span>}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="catalog-grid" aria-busy="true" aria-label="Cargando catálogo">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card skeleton" style={{ minHeight: 180 }} />
          ))}
        </div>
      ) : (
        <div className="catalog-panel" key={tab}>
          {/* ======================= PRODUCTOS ======================= */}
          {tab === "productos" && (
            <>
              <div className="catalog-toolbar">
                <Buscador valor={buscarProducto} onChange={setBuscarProducto} placeholder="Buscar producto o categoría" />
                <select
                  className="select catalog-select"
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  aria-label="Filtrar por categoría"
                >
                  <option value="">Todas las categorías</option>
                  {categoriasUsadas.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {esGerente && (
                  <button className="btn btn-primary" type="button" onClick={() => abrirModal("producto")}>
                    {Icon.plus}
                    Nuevo producto
                  </button>
                )}
              </div>
              <FiltroChips
                label="Filtrar productos por estado"
                activo={filtroProducto}
                onChange={setFiltroProducto}
                opciones={[
                  { valor: "todos", label: "Todos", total: conteoProductos.todos },
                  { valor: "bajo", label: "Stock bajo", total: conteoProductos.bajo, tono: "warning" },
                  { valor: "agotado", label: "Agotados", total: conteoProductos.agotado, tono: "danger" },
                  { valor: "inactivo", label: "Inactivos", total: conteoProductos.inactivo, tono: "muted" },
                ]}
              />

              <div className="catalog-grid">
                {productosFiltrados.length === 0 && <p className="catalog-empty">No hay productos con estos filtros.</p>}
                {productosFiltrados.map((p, i) => {
                  const estado = estadoStock(p);
                  const referencia = Math.max(p.stock_minimo * 3, p.stock, 1);
                  return (
                    <article className="cat-card" key={p.id_producto} data-inactive={!p.estado} style={{ ["--i" as string]: i }}>
                      <div className="cat-card-top">
                        <ItemArt kind="producto" categoria={p.categoria} nombre={p.nombre} />
                        {!p.estado ? (
                          <span className="badge badge-muted">Inactivo</span>
                        ) : estado === "agotado" ? (
                          <span className="badge badge-danger">Agotado</span>
                        ) : estado === "bajo" ? (
                          <span className="badge badge-warning">Stock bajo</span>
                        ) : (
                          <span className="badge badge-success">Disponible</span>
                        )}
                      </div>
                      <div className="cat-card-title">
                        <h3 className="cat-card-name">{p.nombre}</h3>
                        <p className="cat-card-meta">{p.categoria}</p>
                      </div>
                      <div className="stock-meter" data-estado={estado} aria-hidden="true">
                        <span style={{ transform: `scaleX(${Math.min(1, p.stock / referencia)})` }} />
                        <i style={{ left: `${Math.min(100, (p.stock_minimo / referencia) * 100)}%` }} />
                      </div>
                      <div className="cat-card-foot">
                        <span className="cat-card-price">{money(p.precio)}</span>
                        <span className="cat-card-stock">
                          <b>{p.stock}</b> en stock, mín. {p.stock_minimo}
                        </span>
                      </div>
                      {esGerente && (
                        <div className="cat-card-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
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
                            {Icon.pencil}
                            Editar
                          </button>
                          <button
                            className="icon-btn"
                            type="button"
                            title={p.estado ? "Desactivar producto" : "Activar producto"}
                            aria-label={p.estado ? `Desactivar ${p.nombre}` : `Activar ${p.nombre}`}
                            data-on={p.estado}
                            onClick={() => desactivarProducto(p)}
                          >
                            {Icon.power}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* ======================= CLIENTES ======================= */}
          {tab === "clientes" && (
            <>
              <div className="catalog-toolbar">
                <Buscador
                  valor={buscarCliente}
                  onChange={setBuscarCliente}
                  placeholder="Buscar por nombre, cédula, teléfono o mascota"
                />
                <button className="btn btn-primary" type="button" onClick={() => abrirModal("cliente")}>
                  {Icon.plus}
                  Nuevo cliente
                </button>
              </div>
              <FiltroChips
                label="Filtrar clientes"
                activo={filtroCliente}
                onChange={setFiltroCliente}
                opciones={[
                  { valor: "todos", label: "Todos", total: conteoClientes.todos },
                  { valor: "con", label: "Con mascota", total: conteoClientes.con },
                  { valor: "sin", label: "Sin mascota", total: conteoClientes.sin, tono: "muted" },
                ]}
              />

              <div className="client-grid">
                {clientesFiltrados.length === 0 && <p className="catalog-empty">Ningún cliente coincide con la búsqueda.</p>}
                {clientesFiltrados.map((c, i) => {
                  const suyas = mascotasDe(c.id_cliente);
                  const nombreCompleto = `${c.nombre} ${c.apellido}`;
                  return (
                    <article className="client-card" key={c.id_cliente} style={{ ["--i" as string]: i }}>
                      <header className="client-head">
                        <span className="client-avatar" style={{ background: TONOS_AVATAR[c.id_cliente % TONOS_AVATAR.length] }}>
                          {initials(nombreCompleto)}
                        </span>
                        <div className="client-id">
                          <h3>{nombreCompleto}</h3>
                          <p className="num">{c.cedula || "Sin cédula"}</p>
                        </div>
                        <button
                          className="icon-btn"
                          type="button"
                          title="Editar cliente"
                          aria-label={`Editar a ${nombreCompleto}`}
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
                          {Icon.pencil}
                        </button>
                      </header>

                      <ul className="client-contact">
                        <li data-empty={!c.telefono}>
                          {Icon.phone}
                          {c.telefono ? <a href={`tel:${c.telefono}`}>{c.telefono}</a> : "Sin teléfono"}
                        </li>
                        <li data-empty={!c.email}>
                          {Icon.mail}
                          {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : "Sin correo"}
                        </li>
                      </ul>

                      <section className="client-pets" aria-label={`Mascotas de ${nombreCompleto}`}>
                        <div className="client-pets-head">
                          <span>
                            {suyas.length === 0
                              ? "Sin mascotas registradas"
                              : `${suyas.length} ${suyas.length === 1 ? "mascota" : "mascotas"}`}
                          </span>
                          <span className="client-since">Cliente desde {FORMATO_ALTA.format(new Date(c.fecha_registro))}</span>
                        </div>

                        <div className="pet-list">
                          {suyas.map((m) => {
                            const detalles = [m.raza, edad(m.fecha_nacimiento), m.peso ? `${Number(m.peso)} kg` : null].filter(Boolean);
                            return (
                              <div className="pet-chip" key={m.id_mascota} data-inactive={!m.estado}>
                                <PetArt especie={m.especie} size="sm" />
                                <div className="pet-info">
                                  <span className="pet-name">
                                    {m.nombre}
                                    {m.sexo && (
                                      <span
                                        className="pet-sex"
                                        data-sexo={m.sexo}
                                        title={m.sexo === "M" ? "Macho" : "Hembra"}
                                        aria-label={m.sexo === "M" ? "Macho" : "Hembra"}
                                      >
                                        {m.sexo === "M" ? "♂" : "♀"}
                                      </span>
                                    )}
                                  </span>
                                  <span className="pet-detail">
                                    {m.especie}
                                    {detalles.length > 0 && `, ${detalles.join(", ")}`}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="pet-edit"
                                  title="Editar mascota"
                                  aria-label={`Editar a ${m.nombre}`}
                                  onClick={() =>
                                    abrirModal("mascota", {
                                      clienteId: c.id_cliente,
                                      editId: m.id_mascota,
                                      valoresIniciales: {
                                        nombre: m.nombre,
                                        especie: m.especie,
                                        raza: m.raza || "",
                                        sexo: m.sexo || "",
                                      },
                                    })
                                  }
                                >
                                  {Icon.pencil}
                                </button>
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            className="pet-add"
                            onClick={() => abrirModal("mascota", { clienteId: c.id_cliente })}
                          >
                            {Icon.plus}
                            {suyas.length === 0 ? "Registrar su primera mascota" : "Agregar mascota"}
                          </button>
                        </div>
                      </section>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* ======================= SERVICIOS ======================= */}
          {tab === "servicios" && (
            <>
              <div className="catalog-toolbar">
                <Buscador valor={buscarServicio} onChange={setBuscarServicio} placeholder="Buscar servicio o tipo" />
                {esGerente && (
                  <button className="btn btn-primary" type="button" onClick={() => abrirModal("servicio")}>
                    {Icon.plus}
                    Nuevo servicio
                  </button>
                )}
              </div>
              <FiltroChips
                label="Filtrar servicios"
                activo={filtroServicio}
                onChange={setFiltroServicio}
                opciones={[
                  { valor: "todos", label: "Todos", total: conteoServicios.todos },
                  { valor: "activos", label: "Activos", total: conteoServicios.activos },
                  { valor: "inactivos", label: "Inactivos", total: conteoServicios.inactivos, tono: "muted" },
                ]}
              />

              <div className="catalog-grid">
                {serviciosFiltrados.length === 0 && <p className="catalog-empty">No hay servicios con estos filtros.</p>}
                {serviciosFiltrados.map((s, i) => (
                  <article className="cat-card" key={s.id_servicio} data-inactive={!s.estado} style={{ ["--i" as string]: i }}>
                    <div className="cat-card-top">
                      <ItemArt kind="servicio" categoria={s.tipo_servicio} nombre={s.nombre} />
                      {s.estado ? <span className="badge badge-success">Activo</span> : <span className="badge badge-muted">Inactivo</span>}
                    </div>
                    <div className="cat-card-title">
                      <h3 className="cat-card-name">{s.nombre}</h3>
                      <p className="cat-card-meta">{s.tipo_servicio}</p>
                      {s.descripcion && <p className="cat-card-desc">{s.descripcion}</p>}
                    </div>
                    <div className="cat-card-foot">
                      <span className="cat-card-price">{money(s.precio)}</span>
                      <span className="duration-chip">
                        {Icon.clock}
                        {s.duracion_estimada ? `${s.duracion_estimada} min` : "Sin duración"}
                      </span>
                    </div>
                    {esGerente && (
                      <div className="cat-card-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
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
                          {Icon.pencil}
                          Editar
                        </button>
                        <button
                          className="icon-btn"
                          type="button"
                          title={s.estado ? "Desactivar servicio" : "Activar servicio"}
                          aria-label={s.estado ? `Desactivar ${s.nombre}` : `Activar ${s.nombre}`}
                          data-on={s.estado}
                          onClick={() => desactivarServicio(s)}
                        >
                          {Icon.power}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-head">
              <div>
                <h3>
                  {modal === "producto" && (editandoId ? "Editar producto" : "Nuevo producto")}
                  {modal === "cliente" && (editandoId ? "Editar cliente" : "Nuevo cliente")}
                  {modal === "servicio" && (editandoId ? "Editar servicio" : "Nuevo servicio")}
                  {modal === "mascota" && (editandoId ? "Editar mascota" : "Nueva mascota")}
                </h3>
                {modal === "mascota" && clienteDelModal && (
                  <p className="modal-sub">
                    De {clienteDelModal.nombre} {clienteDelModal.apellido}
                  </p>
                )}
              </div>
              <button className="modal-close" type="button" onClick={cerrarModal} aria-label="Cerrar">
                {Icon.close}
              </button>
            </div>
            <div className="modal-body">
              {modal === "producto" && (
                <>
                  <div className="field">
                    <label htmlFor="m-nombre">Nombre</label>
                    <input
                      id="m-nombre"
                      className="input"
                      placeholder="Ej. Pelota de Goma Resistente"
                      value={form.nombre || ""}
                      onChange={(e) => actualizarForm("nombre", e.target.value)}
                    />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label htmlFor="m-categoria">Categoría</label>
                      <select
                        id="m-categoria"
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
                      <label htmlFor="m-precio">Precio</label>
                      <input
                        id="m-precio"
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
                      <label htmlFor="m-stock">{editandoId ? "Stock actual" : "Stock inicial"}</label>
                      <input
                        id="m-stock"
                        className="input"
                        type="number"
                        placeholder="0"
                        value={form.stock || ""}
                        onChange={(e) => actualizarForm("stock", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="m-minimo">Stock mínimo</label>
                      <input
                        id="m-minimo"
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
                    <label htmlFor="m-cedula">Cédula</label>
                    <input
                      id="m-cedula"
                      className="input"
                      placeholder="Ej. 8-888-8888"
                      value={form.cedula || ""}
                      onChange={(e) => actualizarForm("cedula", e.target.value)}
                    />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label htmlFor="m-cnombre">Nombre</label>
                      <input
                        id="m-cnombre"
                        className="input"
                        placeholder="Ej. Laura"
                        value={form.nombre || ""}
                        onChange={(e) => actualizarForm("nombre", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="m-apellido">Apellido</label>
                      <input
                        id="m-apellido"
                        className="input"
                        placeholder="Ej. Herrera"
                        value={form.apellido || ""}
                        onChange={(e) => actualizarForm("apellido", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="m-telefono">Teléfono</label>
                    <input
                      id="m-telefono"
                      className="input"
                      placeholder="6000-0000"
                      value={form.telefono || ""}
                      onChange={(e) => actualizarForm("telefono", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="m-email">Correo (opcional)</label>
                    <input
                      id="m-email"
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
                    <label htmlFor="m-snombre">Nombre</label>
                    <input
                      id="m-snombre"
                      className="input"
                      placeholder="Ej. Corte de pelo especializado"
                      value={form.nombre || ""}
                      onChange={(e) => actualizarForm("nombre", e.target.value)}
                    />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label htmlFor="m-tipo">Tipo</label>
                      <select
                        id="m-tipo"
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
                      <label htmlFor="m-duracion">Duración (min)</label>
                      <input
                        id="m-duracion"
                        className="input"
                        type="number"
                        placeholder="30"
                        value={form.duracionEstimada || ""}
                        onChange={(e) => actualizarForm("duracionEstimada", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="m-sprecio">Precio</label>
                    <input
                      id="m-sprecio"
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
                  <div className="pet-form-preview">
                    <PetArt especie={form.especie || ""} />
                    <div className="field" style={{ flex: 1 }}>
                      <label htmlFor="m-mnombre">Nombre</label>
                      <input
                        id="m-mnombre"
                        className="input"
                        placeholder="Ej. Firulais"
                        value={form.nombre || ""}
                        onChange={(e) => actualizarForm("nombre", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <span className="field-label">Especie</span>
                    <div className="species-options" role="radiogroup" aria-label="Especie">
                      {ESPECIES.map((e) => (
                        <button
                          key={e}
                          type="button"
                          role="radio"
                          aria-checked={form.especie === e}
                          className="species-option"
                          onClick={() => actualizarForm("especie", e)}
                        >
                          <PetArt especie={e} size="sm" />
                          {e}
                        </button>
                      ))}
                    </div>
                    <input
                      className="input"
                      placeholder="Otra especie (escríbela aquí)"
                      aria-label="Otra especie"
                      value={ESPECIES.includes(form.especie || "") ? "" : form.especie || ""}
                      onChange={(e) => actualizarForm("especie", e.target.value)}
                    />
                  </div>
                  <div className="grid2">
                    <div className="field">
                      <label htmlFor="m-raza">Raza (opcional)</label>
                      <input
                        id="m-raza"
                        className="input"
                        placeholder="Ej. Labrador"
                        value={form.raza || ""}
                        onChange={(e) => actualizarForm("raza", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="m-sexo">Sexo (opcional)</label>
                      <select id="m-sexo" className="select" value={form.sexo || ""} onChange={(e) => actualizarForm("sexo", e.target.value)}>
                        <option value="">Sin indicar</option>
                        <option value="M">Macho</option>
                        <option value="H">Hembra</option>
                      </select>
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
                {guardando ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Guardando…
                  </>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
