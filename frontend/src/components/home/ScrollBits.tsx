import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/useReveal";

/**
 * Párrafo que se "entinta" palabra por palabra mientras lo recorres
 * con el scroll. El progreso va de 0 (párrafo entrando por abajo) a 1
 * (párrafo pasando el centro de la pantalla).
 */
export function InkText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const palabras = text.split(" ");
  const [encendidas, setEncendidas] = useState(0);
  const reducir = usePrefersReducedMotion();

  useEffect(() => {
    if (reducir) return;
    let frame = 0;
    const medir = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const inicio = vh * 0.9;
      const fin = vh * 0.35;
      const progreso = Math.min(1, Math.max(0, (inicio - r.top) / (inicio - fin + r.height * 0.6)));
      setEncendidas(Math.round(progreso * palabras.length));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [palabras.length, reducir]);

  return (
    <p className="ink-text" ref={ref} aria-label={text}>
      {palabras.map((p, i) => (
        <span key={i} aria-hidden="true">
          <span className="w" data-on={reducir || i < encendidas}>
            {p}
          </span>{" "}
        </span>
      ))}
    </p>
  );
}

/** Cuenta desde 0 hasta `to` la primera vez que entra al viewport. */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [valor, setValor] = useState(0);
  const reducir = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducir) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const duracion = 1600;
        const t0 = performance.now();
        const paso = (t: number) => {
          const p = Math.min(1, (t - t0) / duracion);
          // ease-out quint: arranca rápido y se asienta despacio
          const e = 1 - Math.pow(1 - p, 5);
          setValor(Math.round(e * to));
          if (p < 1) frame = requestAnimationFrame(paso);
        };
        frame = requestAnimationFrame(paso);
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, reducir]);

  return (
    <span className="stat-value" ref={ref} aria-label={`${to}${suffix}`}>
      <span aria-hidden="true">
        {reducir ? to : valor}
        {suffix}
      </span>
    </span>
  );
}
