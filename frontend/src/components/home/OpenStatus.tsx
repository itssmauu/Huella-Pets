import { useEffect, useState } from "react";

// Horario: lunes a sábado, 8:00 a.m. a 6:00 p.m. (hora de Panamá)
const ABRE = 8;
const CIERRA = 18;

function estadoTienda(ahora: Date) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Panama",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(ahora);
  const dia = partes.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hora = Number(partes.find((p) => p.type === "hour")?.value ?? 0);

  const esDomingo = dia === "Sun";
  const abierto = !esDomingo && hora >= ABRE && hora < CIERRA;

  if (abierto) return { abierto, texto: "Abierto ahora", detalle: "cerramos a las 6:00 p.m." };
  if (!esDomingo && hora < ABRE) return { abierto, texto: "Cerrado", detalle: "abrimos hoy a las 8:00 a.m." };
  if (dia === "Sat" || esDomingo) return { abierto, texto: "Cerrado", detalle: "abrimos el lunes a las 8:00 a.m." };
  return { abierto, texto: "Cerrado", detalle: "abrimos mañana a las 8:00 a.m." };
}

export function OpenStatus({ className = "" }: { className?: string }) {
  const [estado, setEstado] = useState(() => estadoTienda(new Date()));

  useEffect(() => {
    const id = setInterval(() => setEstado(estadoTienda(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className={`open-status ${className}`} data-open={estado.abierto}>
      <span className="dot" aria-hidden="true" />
      <span>
        <strong>{estado.texto}</strong>, {estado.detalle}
      </span>
    </p>
  );
}
