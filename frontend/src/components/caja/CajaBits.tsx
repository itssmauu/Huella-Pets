import { useEffect, useRef, useState } from "react";

const SVG = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/**
 * Monto que "rueda" hacia el nuevo valor en lugar de saltar.
 * Corto (240 ms) porque en caja se ve decenas de veces al día.
 */
export function AnimatedMoney({ value }: { value: number }) {
  const [mostrado, setMostrado] = useState(value);
  const desde = useRef(value);

  useEffect(() => {
    const inicio = desde.current;
    if (inicio === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      desde.current = value;
      setMostrado(value);
      return;
    }
    const t0 = performance.now();
    let frame = 0;
    const paso = (t: number) => {
      const p = Math.min(1, (t - t0) / 240);
      const e = 1 - Math.pow(1 - p, 3);
      const actual = inicio + (value - inicio) * e;
      desde.current = actual;
      setMostrado(actual);
      if (p < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{`$${mostrado.toFixed(2)}`}</>;
}

export const Icon = {
  search: (
    <svg {...SVG}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  plus: (
    <svg {...SVG} strokeWidth={2.4}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  minus: (
    <svg {...SVG} strokeWidth={2.4}>
      <path d="M5 12h14" />
    </svg>
  ),
  close: (
    <svg {...SVG} strokeWidth={2.2}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  check: (
    <svg {...SVG} strokeWidth={2.6}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  cash: (
    <svg {...SVG}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  card: (
    <svg {...SVG}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19M6 15h4" />
    </svg>
  ),
  transfer: (
    <svg {...SVG}>
      <path d="M4 8h14l-3-3M20 16H6l3 3" />
    </svg>
  ),
  pencil: (
    <svg {...SVG}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  ),
  power: (
    <svg {...SVG}>
      <path d="M12 3v8" />
      <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
    </svg>
  ),
  phone: (
    <svg {...SVG}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  mail: (
    <svg {...SVG}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  ),
  clock: (
    <svg {...SVG}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  printer: (
    <svg {...SVG}>
      <path d="M7 9V3.5h10V9" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <path d="M7 14h10v6.5H7Z" />
    </svg>
  ),
  receipt: (
    <svg {...SVG} strokeWidth={1.4}>
      <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  ),
};
