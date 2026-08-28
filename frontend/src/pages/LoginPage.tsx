import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(usuario, password);
      navigate("/app/caja");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-form-side">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <Link className="back-home-link" to="/">
            ‹ Volver al inicio
          </Link>
          <div className="brand-mark">
            <div className="logo-dot">M</div>
            <span>MELO Pets</span>
          </div>
          <div>
            <p className="login-title">Iniciar sesión</p>
            <p className="login-help" style={{ marginTop: 4 }}>
              Ingresa con tu usuario y contraseña de MELO Pets.
            </p>
          </div>

          {error && (
            <div className="form-error">
              <span aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="f-usuario">Usuario o correo</label>
            <input
              className="input"
              id="f-usuario"
              type="text"
              autoComplete="username"
              placeholder="melissa.gerente"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="f-password">Contraseña</label>
            <input
              className="input"
              id="f-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={enviando}>
            {enviando ? "Ingresando…" : "Entrar"}
          </button>

          <div className="demo-creds">
            <span>Cuentas de prueba:</span>
            <span>
              Gerente — <b>melissa.gerente</b> / <b>MeloGerente#2026</b>
            </span>
            <span>
              Cajero — <b>diego.cajero</b> / <b>MeloCajero#2026</b>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}