import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=720&q=75`;

const SERVICIOS = [
  {
    titulo: "Alimentos y accesorios",
    texto: "Alimento seco y húmedo, premios, camas, juguetes y correas. Te ayudamos a escoger según la edad y el tamaño de tu mascota.",
    tags: ["Perros", "Gatos", "Marcas premium"],
    src: IMG("1591946614720-90a587da4a36"),
    alt: "Golden retriever con un juguete de peluche en la boca",
  },
  {
    titulo: "Estética",
    texto: "Baño, secado, corte por raza y limpieza de uñas y oídos, con productos suaves para pieles sensibles.",
    tags: ["Baño", "Corte", "Uñas"],
    src: IMG("1719464454959-9cf304ef4774"),
    alt: "Perro blanco recibiendo un corte de pelo con tijeras",
  },
  {
    titulo: "Veterinaria",
    texto: "Consultas generales, vacunación y desparasitación con veterinarios que se toman su tiempo con cada paciente.",
    tags: ["Consulta", "Vacunas", "Desparasitación"],
    src: IMG("1628009368231-7bb7cfcb0def"),
    alt: "Veterinaria revisando a un gato atigrado",
  },
  {
    titulo: "Cuidado preventivo",
    texto: "Llevamos el calendario de vacunas y baños de tu mascota y te avisamos cuando toca la próxima visita.",
    tags: ["Historial", "Recordatorios"],
    src: IMG("1516734212186-a967f81ad0d7"),
    alt: "Golden retriever feliz siendo atendido",
  },
];

const ANCHO = 280;
const ALTO = 340;

function usePunteroFino() {
  const [fino, setFino] = useState(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setFino(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return fino;
}

export function ServiceList() {
  const [activo, setActivo] = useState<number | null>(null);
  const punteroFino = usePunteroFino();

  // La foto persigue al cursor con un resorte: sin él se sentiría pegada y artificial
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 28, mass: 0.7 });
  const y = useSpring(my, { stiffness: 260, damping: 28, mass: 0.7 });
  const vx = useVelocity(x);
  const giro = useTransform(vx, [-1600, 0, 1600], [-10, 0, 10], { clamp: true });

  // La foto va a un costado del cursor para no tapar el texto que se está leyendo
  function posicion(cx: number, cy: number) {
    const derecha = cx + 32 + ANCHO < window.innerWidth;
    return { px: derecha ? cx + 32 : cx - 32 - ANCHO, py: cy - ALTO / 2 };
  }

  function alMover(e: React.PointerEvent) {
    const { px, py } = posicion(e.clientX, e.clientY);
    mx.set(px);
    my.set(py);
  }

  return (
    <>
      <div className="services" onPointerMove={punteroFino ? alMover : undefined} onPointerLeave={() => setActivo(null)}>
        {SERVICIOS.map((s, i) => (
          <article
            className="service-row"
            key={s.titulo}
            data-reveal
            style={{ ["--reveal-delay" as string]: i * 80 }}
            onPointerEnter={(e) => {
              if (!punteroFino) return;
              // Coloca la foto donde está el cursor antes de mostrarla
              if (activo === null) {
                const { px, py } = posicion(e.clientX, e.clientY);
                mx.jump(px);
                my.jump(py);
                x.jump(px);
                y.jump(py);
              }
              setActivo(i);
            }}
          >
            <img className="service-thumb" src={s.src} alt={s.alt} loading="lazy" />
            <h3>{s.titulo}</h3>
            <p>{s.texto}</p>
            <div className="service-tags">
              {s.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {punteroFino && (
        <motion.div
          className="cursor-photo"
          aria-hidden="true"
          style={{ x, y, rotate: giro }}
          initial={false}
          animate={{ opacity: activo === null ? 0 : 1, scale: activo === null ? 0.85 : 1 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
        >
          {SERVICIOS.map((s, i) => (
            <img key={s.titulo} src={s.src} alt="" data-active={activo === i} loading="lazy" />
          ))}
        </motion.div>
      )}
    </>
  );
}
