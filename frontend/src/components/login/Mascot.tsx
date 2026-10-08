import { useEffect, useRef } from "react";

export type MascotHide = "false" | "true" | "peek";
export type MascotMood = "idle" | "happy";

interface MascotProps {
  hide: MascotHide;
  mood: MascotMood;
  /** Punto en pantalla al que mira (por ejemplo, el cursor del input). null = sigue al mouse */
  lookAt: { x: number; y: number } | null;
}

const OJOS = [
  { cx: 122, cy: 158 },
  { cx: 198, cy: 158 },
];
const MAX_DESPLAZAMIENTO = 7;

/**
 * Perrito que asoma sobre el borde: sigue el cursor con la mirada y se
 * tapa los ojos mientras escribes la contraseña. Las pupilas se mueven
 * escribiendo `transform` directamente en el nodo (sin re-render de React).
 */
export function Mascot({ hide, mood, lookAt }: MascotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilas = useRef<(SVGGElement | null)[]>([]);
  const objetivoX = lookAt?.x;
  const objetivoY = lookAt?.y;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function mirar(px: number, py: number) {
      const r = svg!.getBoundingClientRect();
      const escala = r.width / 320;
      OJOS.forEach((ojo, i) => {
        const ex = r.left + ojo.cx * escala;
        const ey = r.top + ojo.cy * escala;
        const dx = px - ex;
        const dy = py - ey;
        const dist = Math.hypot(dx, dy) || 1;
        const d = Math.min(MAX_DESPLAZAMIENTO, dist / 30);
        const nodo = pupilas.current[i];
        if (nodo) nodo.style.transform = `translate(${(dx / dist) * d}px, ${(dy / dist) * d}px)`;
      });
    }

    let ultimo = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const onMove = (e: PointerEvent) => {
      ultimo = { x: e.clientX, y: e.clientY };
      if (objetivoX === undefined) mirar(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", onMove);

    if (objetivoX !== undefined && objetivoY !== undefined) mirar(objetivoX, objetivoY);
    else mirar(ultimo.x, ultimo.y);

    return () => window.removeEventListener("pointermove", onMove);
  }, [objetivoX, objetivoY]);

  return (
    <svg
      ref={svgRef}
      className="mascot"
      viewBox="0 0 320 320"
      data-hide={hide}
      data-mood={mood}
      role="img"
      aria-label="Ilustración de un perrito asomándose"
    >
      {/* Cola */}
      <path className="tail" d="M250 250 C 290 236, 300 196, 284 170" stroke="#c9712f" strokeWidth="18" strokeLinecap="round" fill="none" />

      {/* Orejas */}
      <ellipse cx="74" cy="150" rx="34" ry="62" transform="rotate(18 74 150)" fill="#c9712f" />
      <ellipse cx="246" cy="150" rx="34" ry="62" transform="rotate(-18 246 150)" fill="#c9712f" />

      {/* Cabeza */}
      <ellipse cx="160" cy="168" rx="96" ry="92" fill="#f7e8d4" />
      <path d="M160 78 C 150 100, 150 130, 160 150 C 170 130, 170 100, 160 78Z" fill="#fffaf2" />
      <ellipse cx="204" cy="150" rx="34" ry="30" fill="#ebb07a" />

      {/* Ojos */}
      {OJOS.map((o, i) => (
        <g key={i}>
          <g
            className="pupil"
            ref={(el) => {
              pupilas.current[i] = el;
            }}
          >
            <circle cx={o.cx} cy={o.cy} r="14" fill="#11313a" />
            <circle cx={o.cx + 4} cy={o.cy - 5} r="4.5" fill="#fff" />
          </g>
          <ellipse className="eye-lid" cx={o.cx} cy={o.cy} rx="17" ry="17" fill={i === 1 ? "#ebb07a" : "#f7e8d4"} />
        </g>
      ))}

      {/* Mejillas */}
      <ellipse cx="100" cy="200" rx="14" ry="9" fill="#f08a3e" opacity="0.28" />
      <ellipse cx="220" cy="200" rx="14" ry="9" fill="#f08a3e" opacity="0.28" />

      {/* Hocico */}
      <ellipse cx="160" cy="210" rx="46" ry="34" fill="#fffaf2" />
      <path d="M146 190 Q160 184 174 190 Q172 204 160 207 Q148 204 146 190Z" fill="#11313a" />
      <path className="mouth-idle" d="M160 207 V216 M160 216 Q150 226 140 218 M160 216 Q170 226 180 218" stroke="#11313a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <g className="mouth-happy">
        <path d="M138 214 Q160 246 182 214 Z" fill="#11313a" />
        <path d="M150 228 Q160 246 170 228 Q160 222 150 228Z" fill="#f28c8c" />
      </g>

      {/* Borde sobre el que se asoma */}
      <rect x="0" y="282" width="320" height="38" rx="19" fill="rgba(255,255,255,0.08)" />

      {/* Patitas: suben para taparle los ojos */}
      <g className="paw paw-left">
        <ellipse cx="118" cy="290" rx="32" ry="26" fill="#fbefe0" stroke="#c9712f" strokeWidth="3" />
        <path d="M106 276 v10 M118 274 v12 M130 276 v10" stroke="#d9b48c" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="paw paw-right">
        <ellipse cx="202" cy="290" rx="32" ry="26" fill="#fbefe0" stroke="#c9712f" strokeWidth="3" />
        <path d="M190 276 v10 M202 274 v12 M214 276 v10" stroke="#d9b48c" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
