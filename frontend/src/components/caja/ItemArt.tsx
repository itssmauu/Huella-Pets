import type { ReactNode } from "react";

/*
 * Mini ilustraciones tipo "sticker" para cada producto o servicio de la caja.
 * Los fondos repiten los colores de las fotos del home (amarillo, celeste,
 * menta, coral) y el trazo usa la tinta teal de la marca, así combinan con
 * el resto del sistema sin perder el contraste con la tarjeta blanca.
 */

const INK = "#11313a";
const C = {
  teal: "#1d6474",
  tealLight: "#3e93a6",
  orange: "#f08a3e",
  orangeDark: "#c9712f",
  yellow: "#f6c445",
  red: "#e2553f",
  pink: "#e86a92",
  lime: "#c6dd4a",
  white: "#ffffff",
  cream: "#fbefe0",
  purple: "#7e6bd6",
  silver: "#e3eaec",
  grey: "#cdd7da",
};

const BG = {
  sun: "#ffe7a3",
  sky: "#cde8f6",
  mint: "#cfefe2",
  coral: "#ffd8c9",
  lilac: "#e5defa",
  pink: "#fadbe7",
  green: "#d9f2d2",
  peach: "#ffe3c4",
};

const trazo = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Destello({ x, y, s = 4.5 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`}
      fill={C.yellow}
      {...trazo}
      strokeWidth={1.2}
    />
  );
}

type Arte = { bg: string; dibujo: ReactNode };

const ARTES: Record<string, Arte> = {
  plato: {
    bg: BG.sun,
    dibujo: (
      <>
        <circle cx="17" cy="19.5" r="4" fill={C.orangeDark} {...trazo} />
        <circle cx="31" cy="19.5" r="4" fill={C.orangeDark} {...trazo} />
        <circle cx="24" cy="17" r="4.5" fill={C.orange} {...trazo} />
        <path d="M9 24h30l-3.2 10.4A4 4 0 0 1 32 37H16a4 4 0 0 1-3.8-2.6Z" fill={C.teal} {...trazo} />
        <rect x="7" y="21.5" width="34" height="5" rx="2.5" fill={C.tealLight} {...trazo} />
        <circle cx="24" cy="32" r="2.3" fill={C.white} />
        <circle cx="21.3" cy="29.2" r="1.1" fill={C.white} />
        <circle cx="24" cy="28.3" r="1.1" fill={C.white} />
        <circle cx="26.7" cy="29.2" r="1.1" fill={C.white} />
      </>
    ),
  },
  pelota: {
    bg: BG.sky,
    dibujo: (
      <>
        <circle cx="24" cy="24" r="13" fill={C.lime} {...trazo} />
        <path d="M13.8 16.5c4.6 4.3 4.6 10.7 0 15" stroke={C.white} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M34.2 16.5c-4.6 4.3-4.6 10.7 0 15" stroke={C.white} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M8 13l3 1.5M7 19.5h3.2" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  raton: {
    bg: BG.sun,
    dibujo: (
      <>
        <path d="M11 32c-3.5 0-5 3-3 5.2s6.5.8 7.5 3.8" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M11 32c0-7.5 6.2-13 13.5-13S37 24.5 37 28.5c0 2-1.2 3.5-3.4 3.5Z" fill={C.grey} {...trazo} />
        <circle cx="28.5" cy="19.5" r="4.8" fill={C.pink} {...trazo} />
        <circle cx="32.5" cy="26.5" r="1.4" fill={INK} />
        <circle cx="37.2" cy="29.6" r="1.7" fill={C.pink} {...trazo} strokeWidth={1.2} />
      </>
    ),
  },
  cuerda: {
    bg: BG.coral,
    dibujo: (
      <>
        <path d="M14 31 34 17" stroke={INK} strokeWidth="8.6" strokeLinecap="round" />
        <path d="M14 31 34 17" stroke={C.red} strokeWidth="5.6" strokeLinecap="round" />
        <path d="M14 31 34 17" stroke={C.white} strokeWidth="5.6" strokeDasharray="2.6 3.6" />
        <circle cx="12.5" cy="32" r="5.2" fill={C.teal} {...trazo} />
        <circle cx="35.5" cy="16" r="5.2" fill={C.teal} {...trazo} />
        <path d="M9 37l-2 3M12 37.5l-.6 3.4M38.5 11l2-3M35.5 10.5l.6-3.4" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  shampoo: {
    bg: BG.mint,
    dibujo: (
      <>
        <circle cx="36.5" cy="13" r="3" fill={C.white} {...trazo} strokeWidth={1.2} />
        <circle cx="40" cy="20.5" r="2" fill={C.white} {...trazo} strokeWidth={1.2} />
        <circle cx="11.5" cy="16" r="2.4" fill={C.white} {...trazo} strokeWidth={1.2} />
        <rect x="20" y="7.5" width="8" height="6" rx="1.5" fill={C.orange} {...trazo} />
        <rect x="18" y="12.5" width="12" height="4.5" rx="1.5" fill={C.orangeDark} {...trazo} />
        <rect x="15" y="16" width="18" height="24" rx="5" fill={C.teal} {...trazo} />
        <rect x="18.5" y="23" width="11" height="10" rx="2" fill={C.white} />
        <path d="M24 25.2s2.4 2.7 2.4 4.3a2.4 2.4 0 0 1-4.8 0c0-1.6 2.4-4.3 2.4-4.3Z" fill={C.tealLight} />
      </>
    ),
  },
  cepillo: {
    bg: BG.mint,
    dibujo: (
      <>
        <path d="M10 37 23 26" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        <path d="M10 37 23 26" stroke={C.orange} strokeWidth="4.2" strokeLinecap="round" />
        <rect x="20" y="11" width="20" height="14" rx="5" transform="rotate(-38 30 18)" fill={C.teal} {...trazo} />
        {[
          [26.5, 15.5],
          [31, 12.2],
          [28.8, 19.5],
          [33.3, 16.2],
          [31.2, 23],
          [35.6, 19.8],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill={C.white} />
        ))}
      </>
    ),
  },
  collar: {
    bg: BG.coral,
    dibujo: (
      <>
        <ellipse cx="24" cy="19" rx="14" ry="8.5" fill="none" stroke={INK} strokeWidth="7.6" />
        <ellipse cx="24" cy="19" rx="14" ry="8.5" fill="none" stroke={C.red} strokeWidth="4.6" />
        <rect x="32" y="15" width="6" height="7.5" rx="1.4" fill={C.yellow} {...trazo} />
        <path d="M24 27.5v3" stroke={INK} strokeWidth="1.6" />
        <circle cx="24" cy="35.5" r="5.6" fill={C.yellow} {...trazo} />
        <path d="M24 38.2s-2.8-1.6-2.8-3.5a1.5 1.5 0 0 1 2.8-.7 1.5 1.5 0 0 1 2.8.7c0 1.9-2.8 3.5-2.8 3.5Z" fill={C.red} />
      </>
    ),
  },
  cama: {
    bg: BG.lilac,
    dibujo: (
      <>
        {/* Cama redonda con borde acolchado y un cojín */}
        <path d="M6 29.5C6 24 10 21 15 21h18c5 0 9 3 9 8.5V33a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" fill={C.purple} {...trazo} />
        <path d="M11.5 29c0-2 1.6-3.5 3.6-3.5h17.8c2 0 3.6 1.5 3.6 3.5v2.5H11.5Z" fill={C.cream} {...trazo} />
        <path d="M9.5 33.5h29" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        {/* "Zz" de mascota dormida */}
        <path d="M27 10h5l-5 5.5h5M34.5 15h3.5l-3.5 4h3.5" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  correa: {
    bg: BG.sky,
    dibujo: (
      <>
        {/* Asa, cinta y gancho */}
        <ellipse cx="14" cy="14.5" rx="5.5" ry="7" transform="rotate(-35 14 14.5)" fill="none" stroke={INK} strokeWidth="6" />
        <ellipse cx="14" cy="14.5" rx="5.5" ry="7" transform="rotate(-35 14 14.5)" fill="none" stroke={C.orange} strokeWidth="3.4" />
        <path d="M18.5 19.5C22 27 29 23 31 30" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M18.5 19.5C22 27 29 23 31 30" stroke={C.orange} strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <rect x="28.5" y="29" width="6" height="5" rx="1.2" fill={C.silver} {...trazo} />
        <path d="M31.5 34v2.5a3 3 0 1 0 3 3" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  bolsa: {
    bg: BG.lilac,
    dibujo: (
      <>
        <path d="M18 18v-3a6 6 0 0 1 12 0v3" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M11.5 18h25l-2 19.5a2.5 2.5 0 0 1-2.5 2.5H16a2.5 2.5 0 0 1-2.5-2.5Z" fill={C.purple} {...trazo} />
        <path d="M24 34s-5-2.9-5-6.3a2.7 2.7 0 0 1 5-1.4 2.7 2.7 0 0 1 5 1.4c0 3.4-5 6.3-5 6.3Z" fill={C.white} />
      </>
    ),
  },
  tijeras: {
    bg: BG.pink,
    dibujo: (
      <>
        <path d="M17 17.5 37 35.5M17 30.5 37 12.5" stroke={INK} strokeWidth="5.4" strokeLinecap="round" />
        <path d="M17 17.5 37 35.5M17 30.5 37 12.5" stroke={C.silver} strokeWidth="3" strokeLinecap="round" />
        <circle cx="12.5" cy="14.5" r="5.2" fill={C.pink} {...trazo} />
        <circle cx="12.5" cy="33.5" r="5.2" fill={C.pink} {...trazo} />
        <circle cx="12.5" cy="14.5" r="2" fill={C.white} />
        <circle cx="12.5" cy="33.5" r="2" fill={C.white} />
        <circle cx="25.4" cy="24" r="1.9" fill={C.yellow} {...trazo} strokeWidth={1.1} />
        <Destello x={37} y={24} s={3.6} />
      </>
    ),
  },
  salud: {
    bg: BG.green,
    dibujo: (
      <>
        <path d="M24 38.5S11 31 11 21.5a7 7 0 0 1 13-3.6 7 7 0 0 1 13 3.6C37 31 24 38.5 24 38.5Z" fill={C.red} {...trazo} />
        <path d="M24 21v9M19.5 25.5h9" stroke={C.white} strokeWidth="3.2" strokeLinecap="round" />
        <Destello x={37.5} y={11.5} s={3.6} />
      </>
    ),
  },
  diente: {
    bg: BG.sky,
    dibujo: (
      <>
        <path
          d="M15 13c3-3 6-2 9-1 3-1 6-2 9 1 3 3 2 9 0 13-1.2 3-1.2 10-4 10-2.2 0-2.2-6.5-5-6.5s-2.8 6.5-5 6.5c-2.8 0-2.8-7-4-10-2-4-3-10 0-13Z"
          fill={C.white}
          {...trazo}
        />
        <path d="M18.5 16.5c1-1 2.5-1.2 3.6-.7" stroke={C.tealLight} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <Destello x={37} y={12} s={4} />
        <Destello x={11} y={34} s={2.8} />
      </>
    ),
  },
  huella: {
    bg: BG.peach,
    dibujo: (
      <>
        <ellipse cx="13.5" cy="20" rx="3.6" ry="4.6" transform="rotate(-18 13.5 20)" fill={C.orange} {...trazo} />
        <ellipse cx="20" cy="13.5" rx="3.6" ry="4.8" transform="rotate(-6 20 13.5)" fill={C.orange} {...trazo} />
        <ellipse cx="28" cy="13.6" rx="3.6" ry="4.8" transform="rotate(8 28 13.6)" fill={C.orange} {...trazo} />
        <ellipse cx="34.5" cy="20.3" rx="3.5" ry="4.5" transform="rotate(20 34.5 20.3)" fill={C.orange} {...trazo} />
        <path d="M24 23c-4.6 0-9.6 5.6-9.6 10 0 3.2 2.4 5 5.2 5 1.9 0 2.9-.9 4.4-.9s2.5.9 4.4.9c2.8 0 5.2-1.8 5.2-5 0-4.4-5-10-9.6-10Z" fill={C.orange} {...trazo} />
        <Destello x={38} y={35} s={3.4} />
      </>
    ),
  },
};

function elegirArte(kind: "producto" | "servicio", texto: string): Arte {
  const t = texto.toLowerCase();
  if (kind === "servicio") {
    if (/dental|diente/.test(t)) return ARTES.diente;
    if (/vet|consult|vacun|salud|despar|m[eé]dic/.test(t)) return ARTES.salud;
    if (/combo/.test(t)) return ARTES.huella;
    if (/est[eé]tica|ba[ñn]o|corte|u[ñn]a|peluq|grooming/.test(t)) return ARTES.tijeras;
    return ARTES.huella;
  }
  if (/pelota/.test(t)) return ARTES.pelota;
  if (/rat[oó]n/.test(t)) return ARTES.raton;
  if (/cuerda/.test(t)) return ARTES.cuerda;
  if (/shampoo|champ[uú]|jab[oó]n/.test(t)) return ARTES.shampoo;
  if (/cepillo|peine/.test(t)) return ARTES.cepillo;
  if (/cama|cojin|coj[ií]n/.test(t)) return ARTES.cama;
  if (/correa|arn[eé]s/.test(t)) return ARTES.correa;
  if (/collar|antipulgas/.test(t)) return ARTES.collar;
  if (/aliment|comida|croqueta|snack|premio/.test(t)) return ARTES.plato;
  if (/juguete/.test(t)) return ARTES.pelota;
  if (/higiene|limpieza|aseo/.test(t)) return ARTES.shampoo;
  if (/accesorio/.test(t)) return ARTES.collar;
  return ARTES.bolsa;
}

interface ItemArtProps {
  kind: "producto" | "servicio";
  /** Categoría o tipo de servicio */
  categoria: string;
  nombre: string;
  size?: "md" | "sm";
}

export function ItemArt({ kind, categoria, nombre, size = "md" }: ItemArtProps) {
  // El nombre manda (una "Pelota" es pelota aunque la categoría diga "Juguetes")
  const arte = elegirArte(kind, `${nombre} ${categoria}`);
  return (
    <span className="item-art" data-size={size} style={{ ["--art-bg" as string]: arte.bg }} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        {arte.dibujo}
      </svg>
    </span>
  );
}

/* ---------------- Mascotas por especie ---------------- */

const ARTES_MASCOTA: Record<string, Arte> = {
  perro: {
    bg: BG.sun,
    dibujo: (
      <>
        <ellipse cx="13.5" cy="21" rx="4.6" ry="8" transform="rotate(20 13.5 21)" fill={C.orangeDark} {...trazo} />
        <ellipse cx="34.5" cy="21" rx="4.6" ry="8" transform="rotate(-20 34.5 21)" fill={C.orangeDark} {...trazo} />
        <circle cx="24" cy="25" r="11.5" fill={C.cream} {...trazo} />
        <ellipse cx="28.8" cy="22.4" rx="4.2" ry="3.6" fill="#ebb07a" />
        <circle cx="19.8" cy="23.6" r="1.9" fill={INK} />
        <circle cx="28.4" cy="23.6" r="1.9" fill={INK} />
        <ellipse cx="24" cy="28.4" rx="2.7" ry="2" fill={INK} />
        <path d="M24 30.4v1.5M24 31.9c-1 1.4-2.6 1.4-3.4.4M24 31.9c1 1.4 2.6 1.4 3.4.4" stroke={INK} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  gato: {
    bg: BG.sky,
    dibujo: (
      <>
        <path d="M13.5 19 14.5 8.5 22 14.5Z" fill={C.orange} {...trazo} />
        <path d="M34.5 19 33.5 8.5 26 14.5Z" fill={C.orange} {...trazo} />
        <path d="M15.6 15.5 16 11.6l2.8 2.4Z" fill={C.pink} />
        <path d="M32.4 15.5 32 11.6l-2.8 2.4Z" fill={C.pink} />
        <ellipse cx="24" cy="25" rx="12.5" ry="10.8" fill={C.orange} {...trazo} />
        <ellipse cx="19.5" cy="23.6" rx="1.6" ry="2.3" fill={INK} />
        <ellipse cx="28.5" cy="23.6" rx="1.6" ry="2.3" fill={INK} />
        <path d="M22.6 27.4h2.8L24 29Z" fill={C.pink} {...trazo} strokeWidth={0.9} />
        <path d="M24 29c-.6 1.2-2 1.4-2.8.6M24 29c.6 1.2 2 1.4 2.8.6" stroke={INK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M9 26.5h6M9.5 30l5.6-1.3M39 26.5h-6M38.5 30l-5.6-1.3" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
  },
  ave: {
    bg: BG.green,
    dibujo: (
      <>
        <path d="M22 13.5c0-3 2-4.5 3.5-4.5-.4 1.6.2 2.6 1.4 3.4" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="23" cy="25" r="11" fill={C.yellow} {...trazo} />
        <path d="M17 26c2.5 4.5 7 5.5 10 3.5-3.5-.5-6-2.5-7-6Z" fill={C.orange} {...trazo} strokeWidth={1.3} />
        <path d="M33.5 21.5 39.5 24l-6 2.4Z" fill={C.orange} {...trazo} />
        <circle cx="28" cy="21.5" r="1.9" fill={INK} />
        <path d="M20 36v3.5M26 36v3.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  conejo: {
    bg: BG.pink,
    dibujo: (
      <>
        <ellipse cx="18.5" cy="12.5" rx="3.6" ry="8.5" transform="rotate(-10 18.5 12.5)" fill={C.white} {...trazo} />
        <ellipse cx="29.5" cy="12.5" rx="3.6" ry="8.5" transform="rotate(10 29.5 12.5)" fill={C.white} {...trazo} />
        <ellipse cx="18.5" cy="13" rx="1.5" ry="5.5" transform="rotate(-10 18.5 13)" fill={C.pink} />
        <ellipse cx="29.5" cy="13" rx="1.5" ry="5.5" transform="rotate(10 29.5 13)" fill={C.pink} />
        <circle cx="24" cy="28" r="10.5" fill={C.white} {...trazo} />
        <circle cx="20.2" cy="26.6" r="1.7" fill={INK} />
        <circle cx="27.8" cy="26.6" r="1.7" fill={INK} />
        <ellipse cx="24" cy="30.2" rx="1.8" ry="1.3" fill={C.pink} />
        <path d="M24 31.5v1.5" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
  },
};

function elegirArteMascota(especie: string): Arte {
  const t = especie.toLowerCase();
  if (/perr|can/.test(t)) return ARTES_MASCOTA.perro;
  if (/gat|fel/.test(t)) return ARTES_MASCOTA.gato;
  if (/ave|p[aá]jar|loro|perico|canario|periquito/.test(t)) return ARTES_MASCOTA.ave;
  if (/conej/.test(t)) return ARTES_MASCOTA.conejo;
  return ARTES.huella;
}

export function PetArt({ especie, size = "md" }: { especie: string; size?: "md" | "sm" }) {
  const arte = elegirArteMascota(especie);
  return (
    <span className="item-art" data-size={size} style={{ ["--art-bg" as string]: arte.bg }} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        {arte.dibujo}
      </svg>
    </span>
  );
}
