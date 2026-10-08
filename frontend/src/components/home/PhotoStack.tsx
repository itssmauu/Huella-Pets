import { useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { PawIcon } from "./icons";

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=720&h=820&q=75`;

const MASCOTAS = [
  { nombre: "Bruno", nota: "Baño y corte cada tres semanas", src: IMG("1517849845537-4d257902454a"), alt: "Pug negro con suéter gris sobre fondo amarillo" },
  { nombre: "Mishi", nota: "Vacunas al día", src: IMG("1574158622682-e40e69881006"), alt: "Gato atigrado mirando hacia arriba sobre fondo azul" },
  { nombre: "Toby", nota: "Fan de los premios de pollo", src: IMG("1537151608828-ea2b11777ee8"), alt: "Cachorro corgi sentado sobre fondo naranja" },
  { nombre: "Coco", nota: "Corte de barba incluido", src: IMG("1625316708582-7c38734be31d"), alt: "Schnauzer sacando la lengua sobre fondo amarillo" },
  { nombre: "Lola", nota: "Su primera visita", src: IMG("1543466835-00a7907e9de1"), alt: "Beagle sonriente con collar negro" },
];

// Posición de reposo de cada carta según su profundidad en la pila
const REPOSO = [
  { rotate: -3, x: 0, y: 0, scale: 1 },
  { rotate: 5, x: 18, y: 10, scale: 0.97 },
  { rotate: -8, x: -22, y: 18, scale: 0.94 },
  { rotate: 9, x: 10, y: 26, scale: 0.91 },
  { rotate: 0, x: 0, y: 30, scale: 0.88 },
];

const RESORTE = { type: "spring", duration: 0.6, bounce: 0.22 } as const;

interface CartaProps {
  mascota: (typeof MASCOTAS)[number];
  profundidad: number;
  onLanzar: () => void;
}

function Carta({ mascota, profundidad, onLanzar }: CartaProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // La carta se inclina hacia donde la arrastras, como una foto real
  const inclinacion = useTransform(x, [-260, 260], [-16, 16]);
  const esTope = profundidad === 0;
  const reposo = REPOSO[Math.min(profundidad, REPOSO.length - 1)];

  async function alSoltar(_: unknown, info: PanInfo) {
    const distancia = Math.hypot(info.offset.x, info.offset.y);
    const velocidad = Math.hypot(info.velocity.x, info.velocity.y);

    // Un tirón rápido basta: no exigimos cruzar un umbral de distancia
    if (distancia > 110 || velocidad > 650) {
      const dirX = Math.sign(info.offset.x || info.velocity.x || 1);
      await Promise.all([
        animate(x, dirX * 420, { type: "spring", velocity: info.velocity.x, stiffness: 260, damping: 30 }),
        animate(y, info.offset.y * 1.4, { type: "spring", velocity: info.velocity.y, stiffness: 260, damping: 30 }),
      ]);
      onLanzar();
      animate(x, 0, RESORTE);
      animate(y, 0, RESORTE);
    } else {
      animate(x, 0, RESORTE);
      animate(y, 0, RESORTE);
    }
  }

  return (
    <motion.div
      className="stack-slot"
      style={{ position: "absolute", inset: 0, zIndex: 10 - profundidad }}
      initial={false}
      animate={reposo}
      transition={RESORTE}
    >
      <motion.figure
        className="polaroid"
        style={{ x, y, rotate: inclinacion, margin: 0 }}
        drag={esTope}
        dragMomentum={false}
        dragElastic={0.9}
        onDragEnd={alSoltar}
        whileDrag={{ scale: 1.04, cursor: "grabbing" }}
        aria-hidden={!esTope}
      >
        <img src={mascota.src} alt={mascota.alt} draggable={false} loading={profundidad < 2 ? "eager" : "lazy"} />
        <figcaption>
          <span className="pet-name">{mascota.nombre}</span>
          <span className="pet-note">{mascota.nota}</span>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}

export function PhotoStack() {
  const [orden, setOrden] = useState(() => MASCOTAS.map((_, i) => i));
  const siguiente = () => setOrden((o) => [...o.slice(1), o[0]]);

  return (
    <div className="stack-wrap">
      <div className="stack-blob" aria-hidden="true" />
      <div className="stack-paws" aria-hidden="true" style={{ width: 56, height: 56, top: "6%", right: "12%", transform: "rotate(18deg)" }}>
        <PawIcon />
      </div>
      <div className="stack-paws" aria-hidden="true" style={{ width: 36, height: 36, bottom: "18%", left: "4%", transform: "rotate(-24deg)" }}>
        <PawIcon />
      </div>

      {/* La entrada es predecible, así que va en CSS (corre fuera del hilo principal) */}
      <div className="stack stack-enter">
        {orden.map((idx, profundidad) => (
          <Carta key={MASCOTAS[idx].nombre} mascota={MASCOTAS[idx]} profundidad={profundidad} onLanzar={siguiente} />
        ))}
      </div>

      <div className="stack-hint hero-fade" style={{ ["--d" as string]: "1100ms" }}>
        <PawIcon />
        <span>
          Arrastra la foto<span className="only-wide"> para conocer a otro cliente</span>
        </span>
        <button type="button" onClick={siguiente} aria-label="Ver la siguiente mascota">
          Siguiente
        </button>
      </div>
    </div>
  );
}
