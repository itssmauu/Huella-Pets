import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { Mascot, type MascotHide, type MascotMood } from "../components/login/Mascot";
import { ArrowLeftIcon } from "../components/home/icons";

const CUENTAS_PRUEBA = [
  { rol: "Gerente", usuario: "melissa.gerente", password: "MeloGerente#2026" },
  { rol: "Cajero", usuario: "diego.cajero", password: "MeloCajero#2026" },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [enviando, setEnviando] = useState(false);

  const [foco, setFoco] = useState<"usuario" | "password" | null>(null);
  const [mood, setMood] = useState<MascotMood>("idle");
  const [rectUsuario, setRectUsuario] = useState<DOMRect | null>(null);

  // Mientras escribes el usuario, el perrito mira hacia donde va el texto
  let lookAt: { x: number; y: number } | null = null;
  if (foco === "usuario" && rectUsuario) {
    const r = rectUsuario;
    lookAt = { x: r.left + Math.min(r.width - 16, 16 + usuario.length * 8.5), y: r.top + r.height / 2 };
  }

  let hide: MascotHide = "false";
  if (foco === "password") hide = verPassword ? "peek" : "true";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!usuario.trim() || !password) {
      setError("Escribe tu usuario y tu contraseña para entrar.");
      setIntento((n) => n + 1);
      return;
    }
    setEnviando(true);
    try {
      await login(usuario, password);
      setMood("happy");
      // Un instante para ver la cola moverse antes de cambiar de pantalla
      await new Promise((r) => setTimeout(r, 380));
      navigate("/app/caja");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo conectar con el servidor. Verifica que el backend esté corriendo."
      );
      setIntento((n) => n + 1);
      setEnviando(false);
    }
  }

  function usarCuenta(c: (typeof CUENTAS_PRUEBA)[number]) {
    setUsuario(c.usuario);
    setPassword(c.password);
    setError(null);
  }

  return (
    <div className="login-page">
      <aside className="login-art">
        <Link className="brand-mark" to="/">
          <div className="logo-dot">
            <img src="/MELOPets_logo.png" alt="" />
          </div>
          <span>MELO Pets</span>
        </Link>
        <div className="mascot-stage">
          <Mascot hide={hide} mood={mood} lookAt={lookAt} />
        </div>
        <p className="login-quote">
          Cada venta, cada baño y cada vacuna quedan en el historial de la mascota.
          <small>Caja, catálogo y reportes de MELO Pets</small>
        </p>
      </aside>

      <div className="login-form-side">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <Link className="back-home-link" to="/" style={{ ["--i" as string]: 0 }}>
            <ArrowLeftIcon />
            Volver al inicio
          </Link>

          <div style={{ ["--i" as string]: 1 }}>
            <h1 className="login-title">Hola de nuevo</h1>
            <p className="login-help">Entra con tu usuario de MELO Pets para abrir la caja.</p>
          </div>

          {error && (
            <div className="form-error" role="alert" key={intento}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16.5v.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="field" style={{ ["--i" as string]: 2 }}>
            <label htmlFor="f-usuario">Usuario o correo</label>
            <input
              className="input"
              id="f-usuario"
              type="text"
              autoComplete="username"
              placeholder="melissa.gerente"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onFocus={(e) => {
                setRectUsuario(e.currentTarget.getBoundingClientRect());
                setFoco("usuario");
              }}
              onBlur={() => setFoco(null)}
              autoFocus
            />
          </div>

          <div className="field" style={{ ["--i" as string]: 3 }}>
            <label htmlFor="f-password">Contraseña</label>
            <div className="password-wrap">
              <input
                className="input"
                id="f-password"
                type={verPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFoco("password")}
                onBlur={() => setFoco(null)}
              />
              <button
                className="password-toggle"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={verPassword}
              >
                {verPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.3A9.6 9.6 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.4-2.6 3.7M6.2 6.6C4.3 7.9 2.8 9.8 2 12c1 2.5 5 7 10 7 1.7 0 3.3-.5 4.6-1.3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={enviando}
            style={{ ["--i" as string]: 4 }}
            onMouseEnter={() => usuario && password && setMood("happy")}
            onMouseLeave={() => !enviando && setMood("idle")}
          >
            {enviando ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </button>

          <div className="demo-creds" style={{ ["--i" as string]: 5 }}>
            <span>Cuentas de prueba (toca una para llenar el formulario)</span>
            <div className="demo-list">
              {CUENTAS_PRUEBA.map((c) => (
                <button type="button" className="demo-chip" key={c.usuario} onClick={() => usarCuenta(c)}>
                  <b>{c.rol}</b>
                  <span>{c.usuario}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
