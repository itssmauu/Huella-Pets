import { useState } from "react";
import { CLIENTES, ITBMS_RATE, PRODUCTOS, SERVICIOS } from "../data/mockCatalog";

interface CartRow {
  nombre: string;
  precio: number;
  cantidad: number;
  tipo: "producto" | "servicio";
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

let facturaSeq = 9;

export function CajaPage() {
  const [posKind, setPosKind] = useState<"productos" | "servicios">("productos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartRow[]>([]);
  const [clienteSel, setClienteSel] = useState(CLIENTES[0].nombre);
  const [pago, setPago] = useState("Efectivo");
  const [toast, setToast] = useState({ visible: false, factura: "", total: "" });

  const cliente = CLIENTES.find((c) => c.nombre === clienteSel) ?? CLIENTES[0];
  const [mascotaSel, setMascotaSel] = useState(cliente.mascotas[0]?.nombre ?? "");

  const query = search.trim().toLowerCase();
  const productosFiltrados = PRODUCTOS.filter((p) => p.nombre.toLowerCase().includes(query));
  const serviciosFiltrados = SERVICIOS.filter((s) => s.nombre.toLowerCase().includes(query));

  const hasServicio = cart.some((r) => r.tipo === "servicio");
  const subtotal = cart.reduce((s, r) => s + r.precio * r.cantidad, 0);
  const itbms = subtotal * ITBMS_RATE;
  const total = subtotal + itbms;
  const count = cart.reduce((s, r) => s + r.cantidad, 0);

  function addToCart(nombre: string, precio: number, tipo: "producto" | "servicio") {
    setCart((prev) => {
      const idx = prev.findIndex((r) => r.nombre === nombre);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
        return next;
      }
      return [...prev, { nombre, precio, cantidad: 1, tipo }];
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

  function handleCambiarCliente(nombre: string) {
    setClienteSel(nombre);
    const nuevoCliente = CLIENTES.find((c) => c.nombre === nombre);
    setMascotaSel(nuevoCliente?.mascotas[0]?.nombre ?? "");
  }

  function handleCobrar() {
    if (cart.length === 0) return;
    const factura = `F-2026-${String(facturaSeq++).padStart(6, "0")}`;
    setToast({ visible: true, factura, total: money(total) });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
    setCart([]);
  }

  return (
    <>
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
                      key={p.nombre}
                      type="button"
                      className="item-card"
                      disabled={outOfStock}
                      onClick={() => addToCart(p.nombre, p.precio, "producto")}
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
                    key={s.nombre}
                    type="button"
                    className="item-card"
                    onClick={() => addToCart(s.nombre, s.precio, "servicio")}
                  >
                    <span className="cat">{s.tipo}</span>
                    <span className="name">{s.nombre}</span>
                    <span className="price">{money(s.precio)}</span>
                    <span className="stock">{s.duracion}</span>
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
                <div className="cart-row" key={row.nombre}>
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
            <div className="field">
              <label htmlFor="sel-cliente">Cliente</label>
              <select className="select" id="sel-cliente" value={clienteSel} onChange={(e) => handleCambiarCliente(e.target.value)}>
                {CLIENTES.map((c) => (
                  <option key={c.nombre}>{c.nombre}</option>
                ))}
              </select>
            </div>
            {hasServicio && (
              <div className="field">
                <label htmlFor="sel-mascota">Mascota</label>
                <select className="select" id="sel-mascota" value={mascotaSel} onChange={(e) => setMascotaSel(e.target.value)}>
                  {cliente.mascotas.map((m) => (
                    <option key={m.nombre}>
                      {m.nombre} ({m.tipo})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="sel-pago">Método de pago</label>
              <select className="select" id="sel-pago" value={pago} onChange={(e) => setPago(e.target.value)}>
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Transferencia</option>
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

          <div className="cart-actions">
            <button className="btn btn-primary btn-block" type="button" disabled={cart.length === 0} onClick={handleCobrar}>
              Cobrar venta
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