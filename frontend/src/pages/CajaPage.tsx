import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { listarProductos, type Producto } from "../api/productos";
import { listarServicios, type Servicio } from "../api/servicios";
import { listarClientes, type Cliente } from "../api/clientes";
import { listarMascotasPorCliente, type Mascota } from "../api/mascotas";
import { crearVenta } from "../api/ventas";

interface CartRow {
  tipo: "producto" | "servicio";
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

function money(n: string | number) {
  return `$${Number(n).toFixed(2)}`;
}

export function CajaPage() {
  const { token } = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [posKind, setPosKind] = useState<"productos" | "servicios">("productos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartRow[]>([]);

  const [clienteSel, setClienteSel] = useState<number | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarResultadosCliente, setMostrarResultadosCliente] = useState(false);
  const clienteBuscadorRef = useRef<HTMLDivElement>(null);

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [mascotaSel, setMascotaSel] = useState<number | null>(null);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);

  const [pago, setPago] = useState("EFECTIVO");
  const [cobrando, setCobrando] = useState(false);
  const [errorVenta, setErrorVenta] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, factura: "", total: "" });

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    setCargando(true);
    Promise.all([listarProductos(token), listarServicios(token), listarClientes(token)])
      .then(([p, s, c]) => {
        if (cancelado) return;
        setProductos(p);
        setServicios(s);
        setClientes(c);
        setErrorCarga(null);
      })
      .catch((err) => {
        if (cancelado) return;
        setErrorCarga(err instanceof ApiError ? err.message : "No se pudo cargar la caja.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !clienteSel) {
      setMascotas([]);
      setMascotaSel(null);
      return;
    }
    let cancelado = false;
    setCargandoMascotas(true);
    listarMascotasPorCliente(token, clienteSel)
      .then((lista) => {
        if (cancelado) return;
        setMascotas(lista);
        setMascotaSel(lista[0]?.id_mascota ?? null);
      })
      .catch(() => {
        if (cancelado) return;
        setMascotas([]);
        setMascotaSel(null);
      })
      .finally(() => {
        if (!cancelado) setCargandoMascotas(false);
      });
    return () => {
      cancelado = true;
    };
  }, [token, clienteSel]);

  useEffect(() => {
    function alClicFuera(e: MouseEvent) {
      if (clienteBuscadorRef.current && !clienteBuscadorRef.current.contains(e.target as Node)) {
        setMostrarResultadosCliente(false);
      }
    }
    document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, []);

  if (!token) return null;

  const query = search.trim().toLowerCase();
  const productosFiltrados = productos.filter((p) => p.estado && p.nombre.toLowerCase().includes(query));
  const serviciosFiltrados = servicios.filter((s) => s.estado && s.nombre.toLowerCase().includes(query));

  const clienteActual = clientes.find((c) => c.id_cliente === clienteSel) ?? null;
  const cedulaBuscada = busquedaCliente.trim();
  const resultadosCliente = cedulaBuscada
    ? clientes
        .filter((c) => c.cedula && c.cedula.toLowerCase().includes(cedulaBuscada.toLowerCase()))
        .slice(0, 6)
    : [];

  const hasServicio = cart.some((r) => r.tipo === "servicio");
  const subtotal = cart.reduce((s, r) => s + r.precio * r.cantidad, 0);
  const itbms = subtotal * 0.07;
  const total = subtotal + itbms;
  const count = cart.reduce((s, r) => s + r.cantidad, 0);

  function addToCart(tipo: "producto" | "servicio", id: number, nombre: string, precio: number) {
    setCart((prev) => {
      const idx = prev.findIndex((r) => r.tipo === tipo && r.id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
        return next;
      }
      return [...prev, { tipo, id, nombre, precio, cantidad: 1 }];
    });
  }

  function changeQty(idx: number, delta: number) {
    setCart((prev) => {
      const next = [...prev];
      const nuevaCantidad = next[idx].cantidad + delta;
      if (nuevaCantidad <= 0) {
        next.splice(idx, 1);
        return next;
      }
      next[idx] = { ...next[idx], cantidad: nuevaCantidad };
      return next;
    });
  }

  function removeRow(idx: number) {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }

  function seleccionarCliente(c: Cliente) {
    setClienteSel(c.id_cliente);
    setBusquedaCliente("");
    setMostrarResultadosCliente(false);
  }

  async function handleCobrar() {
    if (!token || cart.length === 0 || !clienteSel) return;
    setErrorVenta(null);

    if (hasServicio && !mascotaSel) {
      setErrorVenta("Selecciona la mascota que recibe el servicio.");
      return;
    }

    setCobrando(true);
    try {
      const productosPayload = cart
        .filter((r) => r.tipo === "producto")
        .map((r) => ({ idProducto: r.id, cantidad: r.cantidad }));

      const serviciosPayload = cart
        .filter((r) => r.tipo === "servicio")
        .flatMap((r) => Array.from({ length: r.cantidad }, () => ({ idServicio: r.id, idMascota: mascotaSel! })));

      const venta = await crearVenta(token, {
        idCliente: clienteSel,
        metodoPago: pago as "EFECTIVO" | "TARJETA" | "TRANSFERENCIA",
        productos: productosPayload.length > 0 ? productosPayload : undefined,
        servicios: serviciosPayload.length > 0 ? serviciosPayload : undefined,
      });

      setToast({ visible: true, factura: venta.numero_factura, total: money(venta.total) });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
      setCart([]);
      setClienteSel(null);

      // Refresca productos para reflejar el stock ya descontado por la venta.
      const productosActualizados = await listarProductos(token);
      setProductos(productosActualizados);
    } catch (err) {
      setErrorVenta(err instanceof ApiError ? err.message : "No se pudo registrar la venta. Intenta de nuevo.");
    } finally {
      setCobrando(false);
    }
  }

  if (cargando) {
    return <p className="sub">Cargando caja…</p>;
  }

  return (
    <>
      {errorCarga && <div className="alert">{errorCarga}</div>}

      <div className="pos-grid">
        <div className="card">
          <div className="pos-search">
            <input
              className="input"
              type="text"
              placeholder="Buscar producto o servicio…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="item-tabs">
            <button
              className={"item-tab" + (posKind === "productos" ? " active" : "")}
              type="button"
              onClick={() => setPosKind("productos")}
            >
              Productos
            </button>
            <button
              className={"item-tab" + (posKind === "servicios" ? " active" : "")}
              type="button"
              onClick={() => setPosKind("servicios")}
            >
              Servicios
            </button>
          </div>
          <div className="item-grid">
            {posKind === "productos"
              ? productosFiltrados.map((p) => {
                  const outOfStock = p.stock <= 0;
                  return (
                    <button
                      key={p.id_producto}
                      type="button"
                      className="item-card"
                      disabled={outOfStock}
                      onClick={() => addToCart("producto", p.id_producto, p.nombre, Number(p.precio))}
                    >
                      <span className="cat">{p.categoria}</span>
                      <span className="name">{p.nombre}</span>
                      <span className="price">{money(p.precio)}</span>
                      <span className="stock">{outOfStock ? "Sin stock" : `${p.stock} en stock`}</span>
                    </button>
                  );
                })
              : serviciosFiltrados.map((s) => (
                  <button
                    key={s.id_servicio}
                    type="button"
                    className="item-card"
                    onClick={() => addToCart("servicio", s.id_servicio, s.nombre, Number(s.precio))}
                  >
                    <span className="cat">{s.tipo_servicio}</span>
                    <span className="name">{s.nombre}</span>
                    <span className="price">{money(s.precio)}</span>
                    <span className="stock">{s.duracion_estimada ? `${s.duracion_estimada} min` : ""}</span>
                  </button>
                ))}
          </div>
        </div>

        <div className="card cart-card">
          <div className="panel-title">
            <h2>Venta actual</h2>
            <span className="count">
              {count} {count === 1 ? "ítem" : "ítems"}
            </span>
          </div>

          <div className="cart-list">
            {cart.length === 0 ? (
              <div className="cart-empty">Agrega productos o servicios desde la izquierda para comenzar la venta.</div>
            ) : (
              cart.map((row, idx) => (
                <div className="cart-row" key={`${row.tipo}-${row.id}`}>
                  <div style={{ flex: 1 }}>
                    <div className="name">{row.nombre}</div>
                    <div className="unit">{money(row.precio)} c/u</div>
                  </div>
                  <div className="qty-stepper">
                    <button type="button" onClick={() => changeQty(idx, -1)}>
                      −
                    </button>
                    <span>{row.cantidad}</span>
                    <button type="button" onClick={() => changeQty(idx, 1)}>
                      +
                    </button>
                  </div>
                  <div className="line-total num">{money(row.precio * row.cantidad)}</div>
                  <button className="remove" type="button" onClick={() => removeRow(idx)} aria-label="Quitar">
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-selects">
            <div className="field cliente-buscador" ref={clienteBuscadorRef}>
              <label htmlFor="buscar-cliente">Cliente (cédula)</label>
              <input
                className="input"
                id="buscar-cliente"
                type="text"
                placeholder="Escribe la cédula…"
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  setMostrarResultadosCliente(true);
                }}
                onFocus={() => setMostrarResultadosCliente(true)}
                autoComplete="off"
              />

              {clienteActual && (
                <div className="cliente-elegido">
                  Cliente: <strong>{clienteActual.nombre} {clienteActual.apellido}</strong>
                  {clienteActual.cedula ? ` · ${clienteActual.cedula}` : ""}
                </div>
              )}

              {mostrarResultadosCliente && cedulaBuscada && (
                <div className="cliente-resultados">
                  {resultadosCliente.length === 0 && (
                    <div className="cliente-resultado-vacio">Sin coincidencias</div>
                  )}
                  {resultadosCliente.map((c) => (
                    <button
                      type="button"
                      key={c.id_cliente}
                      className="cliente-resultado-item"
                      onClick={() => seleccionarCliente(c)}
                    >
                      <span className="nombre">{c.nombre} {c.apellido}</span>
                      <span className="cedula">{c.cedula}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasServicio && (
              <div className="field">
                <label htmlFor="sel-mascota">Mascota</label>
                <select
                  className="select"
                  id="sel-mascota"
                  value={mascotaSel ?? ""}
                  onChange={(e) => setMascotaSel(Number(e.target.value))}
                >
                  {cargandoMascotas && <option value="">Cargando…</option>}
                  {!cargandoMascotas && mascotas.length === 0 && <option value="">Este cliente no tiene mascotas</option>}
                  {mascotas.map((m) => (
                    <option key={m.id_mascota} value={m.id_mascota}>
                      {m.nombre} ({m.especie})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="sel-pago">Método de pago</label>
              <select className="select" id="sel-pago" value={pago} onChange={(e) => setPago(e.target.value)}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          </div>

          <div className="totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span className="num">{money(subtotal)}</span>
            </div>
            <div className="totals-row">
              <span>ITBMS (7%)</span>
              <span className="num">{money(itbms)}</span>
            </div>
            <div className="totals-row grand">
              <span>Total</span>
              <span className="num">{money(total)}</span>
            </div>
          </div>

          {errorVenta && <div className="alert">{errorVenta}</div>}

          <div className="cart-actions">
            <button
              className="btn btn-primary btn-block"
              type="button"
              disabled={cart.length === 0 || !clienteSel || cobrando || (hasServicio && !mascotaSel)}
              onClick={handleCobrar}
            >
              {cobrando ? "Cobrando…" : "Cobrar venta"}
            </button>
            <button className="btn btn-ghost btn-block btn-sm" type="button" onClick={() => setCart([])}>
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>

      <div className={"receipt-toast" + (toast.visible ? " visible" : "")}>
        <div className="head">
          <span aria-hidden="true">✓</span>
          <span>Venta registrada</span>
        </div>
        <div className="fac">Factura {toast.factura}</div>
        <div className="fac">Total cobrado: {toast.total}</div>
      </div>
    </>
  );
}