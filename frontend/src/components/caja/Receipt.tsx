import { createPortal } from "react-dom";

export interface FacturaItem {
  nombre: string;
  cantidad: number;
  precio: number;
  /** Para servicios: la mascota que lo recibió */
  mascota?: string;
}

export interface FacturaData {
  numero: string;
  fecha: Date;
  cajero: string;
  cliente: { nombre: string; cedula: string | null };
  metodoPago: string;
  items: FacturaItem[];
  subtotal: number;
  itbms: number;
  total: number;
}

const METODO: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
};

const money = (n: number) => `$${n.toFixed(2)}`;

// Mes en letras para que no haya duda entre día/mes y mes/día
const FECHA = new Intl.DateTimeFormat("es-PA", { day: "2-digit", month: "short", year: "numeric" });
const HORA = new Intl.DateTimeFormat("es-PA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/**
 * Factura en formato de rollo térmico (80 mm), en blanco y negro como la
 * de un supermercado. Se monta fuera de #root con un portal y solo es
 * visible al imprimir (ver `@media print` en index.css).
 */
export function Receipt({ data }: { data: FacturaData }) {
  const articulos = data.items.reduce((s, i) => s + i.cantidad, 0);

  return createPortal(
    <div className="print-root" aria-hidden="true">
      <article className="receipt">
        <header className="receipt-head">
          <span className="receipt-logo">
            <img src="/MELOPets_logo.png" alt="" />
          </span>
          <h1>MELO PETS</h1>
          <p>Productos y servicios para mascotas</p>
          <p>Vía España, Ciudad de Panamá</p>
          <p>Tel. +507 6867-5156</p>
          <p>melopets@melopets.com</p>
        </header>

        <div className="receipt-rule" />

        <div className="receipt-block">
          <p className="receipt-title">FACTURA {data.numero}</p>
          <p className="receipt-row">
            <span>Fecha: {FECHA.format(data.fecha)}</span>
            <span>Hora: {HORA.format(data.fecha)}</span>
          </p>
          <p>Cajero: {data.cajero}</p>
        </div>

        <div className="receipt-rule" />

        <div className="receipt-block">
          <p>Cliente: {data.cliente.nombre}</p>
          {data.cliente.cedula && <p>Cédula: {data.cliente.cedula}</p>}
        </div>

        <div className="receipt-rule" />

        <p className="receipt-row receipt-cols">
          <span>CANT  DESCRIPCIÓN</span>
          <span>IMPORTE</span>
        </p>
        <div className="receipt-rule thin" />

        <ul className="receipt-items">
          {data.items.map((item, i) => (
            <li key={i}>
              <p className="receipt-item-name">
                {item.cantidad} x {item.nombre}
              </p>
              {item.mascota && <p className="receipt-item-note">Mascota: {item.mascota}</p>}
              <p className="receipt-row">
                <span className="receipt-item-note">{money(item.precio)} c/u</span>
                <span>{money(item.precio * item.cantidad)}</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="receipt-rule" />

        <div className="receipt-block">
          <p className="receipt-row">
            <span>Subtotal</span>
            <span>{money(data.subtotal)}</span>
          </p>
          <p className="receipt-row">
            <span>ITBMS (7%)</span>
            <span>{money(data.itbms)}</span>
          </p>
        </div>

        <div className="receipt-rule double" />
        <p className="receipt-row receipt-total">
          <span>TOTAL A PAGAR</span>
          <span>{money(data.total)}</span>
        </p>
        <div className="receipt-rule double" />

        <div className="receipt-block">
          <p className="receipt-row">
            <span>Método de pago</span>
            <span>{METODO[data.metodoPago] ?? data.metodoPago}</span>
          </p>
          <p className="receipt-row">
            <span>Artículos</span>
            <span>{articulos}</span>
          </p>
        </div>

        <footer className="receipt-foot">
          <p>¡Gracias por su compra!</p>
          <p>Conserve este comprobante.</p>
          <p className="receipt-paws">· · · MELO Pets · · ·</p>
        </footer>
      </article>
    </div>,
    document.body
  );
}
