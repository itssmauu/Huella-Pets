import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { listarProductos, type Producto } from "../api/productos";
import { listarServicios, type Servicio } from "../api/servicios";
import { listarClientes, type Cliente } from "../api/clientes";
import { listarMascotasPorCliente, type Mascota } from "../api/mascotas";
import { crearVenta } from "../api/ventas";
import { AnimatedMoney, Icon } from "../components/caja/CajaBits";
import { ItemArt } from "../components/caja/ItemArt";
import { Receipt, type FacturaData } from "../components/caja/Receipt";

interface CartRow {
  tipo: "producto" | "servicio";
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
}

function money(n: string | number) {
  return `$${Number(n).toFixed(2)}`;
}

const PAGOS = [
  { valor: "EFECTIVO", label: "Efectivo", icono: Icon.cash },
  { valor: "TARJETA", label: "Tarjeta", icono: Icon.card },
  { valor: "TRANSFERENCIA", label: "Transf.", icono: Icon.transfer },
];

const FORMATO_HORA = new Intl.DateTimeFormat("es-PA", { hour: "numeric", minute: "2-digit" });

export function CajaPage() {
  const { token, usuario } = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [posKind, setPosKind] = useState<"productos" | "servicios">("productos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartRow[]>([]);
  const [horaTicket, setHoraTicket] = useState(() => FORMATO_HORA.format(new Date()));

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
  // Última venta cobrada: alimenta el aviso y la factura imprimible
  const [factura, setFactura] = useState<FacturaData | null>(null);
  const [avisoVisible, setAvisoVisible] = useState(false);

  // La cascada de entrada de las tarjetas solo se ve en la primera carga:
  // cambiar de pestaña o buscar pasa decenas de veces al día y debe ser instantáneo.
  const [primeraCarga, setPrimeraCarga] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

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
    if (cargando) return;
    const t = setTimeout(() => setPrimeraCarga(false), 900);
    return () => clearTimeout(t);
  }, [cargando]);

  // Atajo "/" para enfocar el buscador (sin animación: es una acción de teclado)
  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

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

  function addToCart(tipo: "producto" | "servicio", id: number, nombre: string, categoria: string, precio: number) {
    if (cart.length === 0) setHoraTicket(FORMATO_HORA.format(new Date()));
    // Empezar otra venta cierra el aviso de la anterior
    if (avisoVisible) setAvisoVisible(false);
    setCart((prev) => {
      const idx = prev.findIndex((r) => r.tipo === tipo && r.id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
        return next;
      }
      return [...prev, { tipo, id, nombre, categoria, precio, cantidad: 1 }];
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

  function cantidadEnCarrito(tipo: CartRow["tipo"], id: number) {
    return cart.find((r) => r.tipo === tipo && r.id === id)?.cantidad ?? 0;
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

      // Foto de la venta antes de vaciar el carrito, para la factura
      const mascotaNombre = mascotas.find((m) => m.id_mascota === mascotaSel)?.nombre;
      setFactura({
        numero: venta.numero_factura,
        fecha: new Date(),
        cajero: usuario ? `${usuario.nombre} ${usuario.apellido}` : "",
        cliente: {
          nombre: clienteActual ? `${clienteActual.nombre} ${clienteActual.apellido}` : "",
          cedula: clienteActual?.cedula ?? null,
        },
        metodoPago: pago,
        items: cart.map((r) => ({
          nombre: r.nombre,
          cantidad: r.cantidad,
          precio: r.precio,
          mascota: r.tipo === "servicio" ? mascotaNombre : undefined,
        })),
        subtotal: Number(venta.subtotal),
        itbms: Number(venta.itbms),
        total: Number(venta.total),
      });
      setAvisoVisible(true);
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
    return (
      <div className="pos-grid" aria-busy="true" aria-label="Cargando caja">
        <div className="card skeleton" style={{ minHeight: 460 }} />
        <div className="card skeleton" style={{ minHeight: 460 }} />
      </div>
    );
  }

  const lista = posKind === "productos" ? productosFiltrados : serviciosFiltrados;

  return (
    <>
      {errorCarga && <div className="alert">{errorCarga}</div>}

      <div className="pos-grid">
        <div className="card pos-catalog">
          <div className="pos-toolbar">
            <label className="pos-search">
              <span className="sr-only">Buscar producto o servicio</span>
              {Icon.search}
              <input
                ref={searchRef}
                className="input"
                type="search"
                placeholder="Buscar producto o servicio"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {!search && <kbd aria-hidden="true">/</kbd>}
            </label>
            <div className="segmented" data-active={posKind === "productos" ? 0 : 1} role="group" aria-label="Tipo de ítem">
              <span className="segmented-thumb" aria-hidden="true" />
              <button type="button" aria-pressed={posKind === "productos"} onClick={() => setPosKind("productos")}>
                Productos <span className="seg-count">{productosFiltrados.length}</span>
              </button>
              <button type="button" aria-pressed={posKind === "servicios"} onClick={() => setPosKind("servicios")}>
                Servicios <span className="seg-count">{serviciosFiltrados.length}</span>
              </button>
            </div>
          </div>

          <div className="item-grid">
            {lista.length === 0 && (
              <p className="item-empty">
                {query ? `No hay ${posKind} que coincidan con "${search.trim()}".` : `No hay ${posKind} activos.`}
              </p>
            )}
            {posKind === "productos"
              ? productosFiltrados.map((p, i) => {
                  const outOfStock = p.stock <= 0;
                  const bajo = !outOfStock && p.stock <= p.stock_minimo;
                  const enCarrito = cantidadEnCarrito("producto", p.id_producto);
                  return (
                    <button
                      key={p.id_producto}
                      type="button"
                      className="item-card"
                      data-enter={primeraCarga}
                      style={{ ["--i" as string]: i }}
                      disabled={outOfStock}
                      onClick={() => addToCart("producto", p.id_producto, p.nombre, p.categoria, Number(p.precio))}
                      aria-label={`Agregar ${p.nombre}, ${money(p.precio)}`}
                    >
                      {enCarrito > 0 && (
                        <span className="item-qty" key={enCarrito} aria-hidden="true">
                          {enCarrito}
                        </span>
                      )}
                      <span className="item-top">
                        <ItemArt kind="producto" categoria={p.categoria} nombre={p.nombre} />
                        <span className="item-add" aria-hidden="true">
                          {Icon.plus}
                        </span>
                      </span>
                      <span className="cat">{p.categoria}</span>
                      <span className="name">{p.nombre}</span>
                      <span className="item-foot">
                        <span className="price">{money(p.precio)}</span>
                        <span className="stock" data-low={bajo || outOfStock}>
                          {outOfStock ? "Sin stock" : `${p.stock} en stock`}
                        </span>
                      </span>
                    </button>
                  );
                })
              : serviciosFiltrados.map((s, i) => {
                  const enCarrito = cantidadEnCarrito("servicio", s.id_servicio);
                  return (
                    <button
                      key={s.id_servicio}
                      type="button"
                      className="item-card"
                      data-enter={primeraCarga}
                      style={{ ["--i" as string]: i }}
                      onClick={() => addToCart("servicio", s.id_servicio, s.nombre, s.tipo_servicio, Number(s.precio))}
                      aria-label={`Agregar ${s.nombre}, ${money(s.precio)}`}
                    >
                      {enCarrito > 0 && (
                        <span className="item-qty" key={enCarrito} aria-hidden="true">
                          {enCarrito}
                        </span>
                      )}
                      <span className="item-top">
                        <ItemArt kind="servicio" categoria={s.tipo_servicio} nombre={s.nombre} />
                        <span className="item-add" aria-hidden="true">
                          {Icon.plus}
                        </span>
                      </span>
                      <span className="cat">{s.tipo_servicio}</span>
                      <span className="name">{s.nombre}</span>
                      <span className="item-foot">
                        <span className="price">{money(s.precio)}</span>
                        <span className="stock">{s.duracion_estimada ? `${s.duracion_estimada} min` : ""}</span>
                      </span>
                    </button>
                  );
                })}
          </div>
        </div>

        <div className="cart-card">
          <div className="cart-head">
            <div>
              <h2>Venta actual</h2>
              <p className="ticket-meta">{cart.length > 0 ? `Ticket abierto a las ${horaTicket}` : "Ticket vacío"}</p>
            </div>
            <span className="cart-count" key={count} data-bump={count > 0}>
              {count} {count === 1 ? "ítem" : "ítems"}
            </span>
          </div>

          <div className="cart-list" aria-live="polite">
            {cart.length === 0 ? (
              <div className="cart-empty">
                {Icon.receipt}
                <span>Toca un producto o servicio para agregarlo a la venta.</span>
              </div>
            ) : (
              cart.map((row, idx) => (
                <div className="cart-row" key={`${row.tipo}-${row.id}`}>
                  <ItemArt kind={row.tipo} categoria={row.categoria} nombre={row.nombre} size="sm" />
                  <div className="info">
                    <div className="name">{row.nombre}</div>
                    <div className="unit">{money(row.precio)} c/u</div>
                  </div>
                  <div className="qty-stepper">
                    <button type="button" onClick={() => changeQty(idx, -1)} aria-label={`Quitar una unidad de ${row.nombre}`}>
                      {Icon.minus}
                    </button>
                    <span>{row.cantidad}</span>
                    <button type="button" onClick={() => changeQty(idx, 1)} aria-label={`Agregar una unidad de ${row.nombre}`}>
                      {Icon.plus}
                    </button>
                  </div>
                  <div className="line-total num">{money(row.precio * row.cantidad)}</div>
                  <button className="remove" type="button" onClick={() => removeRow(idx)} aria-label={`Quitar ${row.nombre}`}>
                    {Icon.close}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-selects">
            <div className="field cliente-buscador" ref={clienteBuscadorRef}>
              <label htmlFor="buscar-cliente">Cliente (cédula)</label>
              {clienteActual ? (
                <div className="cliente-elegido">
                  <span className="avatar-sm" aria-hidden="true">
                    {`${clienteActual.nombre[0] ?? ""}${clienteActual.apellido[0] ?? ""}`.toUpperCase()}
                  </span>
                  <div className="meta">
                    <strong>
                      {clienteActual.nombre} {clienteActual.apellido}
                    </strong>
                    {clienteActual.cedula && <span>{clienteActual.cedula}</span>}
                  </div>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setClienteSel(null)}>
                    Cambiar
                  </button>
                </div>
              ) : (
                <input
                  className="input"
                  id="buscar-cliente"
                  type="text"
                  placeholder="Escribe la cédula, por ejemplo 8-123-456"
                  value={busquedaCliente}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setMostrarResultadosCliente(true);
                  }}
                  onFocus={() => setMostrarResultadosCliente(true)}
                  autoComplete="off"
                />
              )}

              {!clienteActual && mostrarResultadosCliente && cedulaBuscada && (
                <div className="cliente-resultados">
                  {resultadosCliente.length === 0 && (
                    <div className="cliente-resultado-vacio">Ningún cliente tiene esa cédula.</div>
                  )}
                  {resultadosCliente.map((c) => (
                    <button
                      type="button"
                      key={c.id_cliente}
                      className="cliente-resultado-item"
                      onClick={() => seleccionarCliente(c)}
                    >
                      <span className="nombre">
                        {c.nombre} {c.apellido}
                      </span>
                      <span className="cedula">{c.cedula}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasServicio && (
              <div className="field">
                <label htmlFor="sel-mascota">Mascota que recibe el servicio</label>
                <select
                  className="select"
                  id="sel-mascota"
                  value={mascotaSel ?? ""}
                  onChange={(e) => setMascotaSel(Number(e.target.value))}
                >
                  {!clienteSel && <option value="">Primero elige un cliente</option>}
                  {clienteSel && cargandoMascotas && <option value="">Cargando…</option>}
                  {clienteSel && !cargandoMascotas && mascotas.length === 0 && (
                    <option value="">Este cliente no tiene mascotas</option>
                  )}
                  {mascotas.map((m) => (
                    <option key={m.id_mascota} value={m.id_mascota}>
                      {m.nombre} ({m.especie})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="field">
              <span className="field-label" id="lbl-pago">
                Método de pago
              </span>
              <div className="pay-options" role="radiogroup" aria-labelledby="lbl-pago">
                {PAGOS.map((op) => (
                  <button
                    key={op.valor}
                    type="button"
                    role="radio"
                    aria-checked={pago === op.valor}
                    className="pay-option"
                    onClick={() => setPago(op.valor)}
                  >
                    {op.icono}
                    {op.label}
                  </button>
                ))}
              </div>
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
              <span className="num">
                <AnimatedMoney value={total} />
              </span>
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
              {cobrando ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Cobrando…
                </>
              ) : cart.length > 0 ? (
                `Cobrar ${money(total)}`
              ) : (
                "Cobrar venta"
              )}
            </button>
            {cart.length > 0 && !clienteSel && <p className="cart-hint">Elige un cliente para poder cobrar.</p>}
            <button className="btn btn-ghost btn-block btn-sm" type="button" onClick={() => setCart([])} disabled={cart.length === 0}>
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>

      <div className={"receipt-toast" + (avisoVisible ? " visible" : "")} role="status" aria-live="polite">
        <span className="check">{Icon.check}</span>
        <div className="receipt-toast-body">
          <div className="head">Venta registrada</div>
          {factura && (
            <>
              <div className="fac">Factura {factura.numero}</div>
              <div className="fac">Total cobrado: {money(factura.total)}</div>
            </>
          )}
          <div className="receipt-toast-actions">
            <button className="btn btn-primary btn-sm" type="button" onClick={() => window.print()} disabled={!factura}>
              {Icon.printer}
              Imprimir factura
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAvisoVisible(false)}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {factura && <Receipt data={factura} />}
    </>
  );
}
