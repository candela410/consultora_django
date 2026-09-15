import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useAuth } from "./AuthContext";
import "./Login.css";

const BACKGROUND_IMAGE =
  "https://www.clarin.com/2023/10/12/9cdSiPLYB_1200x0__1.jpg"

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Ingresá tu usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      navigate("/zonas");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <img src={BACKGROUND_IMAGE} alt="" className="login-hero-img" />
        <div className="login-hero-overlay" />
        <div className="login-hero-content">
          <div className="login-hero-rule" />
          <p className="login-hero-text">
            Un mismo espacio para acompañar a la comunidad, todos los días.
          </p>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3c2 3 6 4 8 4-1 6-4 10-8 12-4-2-7-6-8-12 2 0 6-1 8-4z"
                  stroke="#C89B3C"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="login-brand-label">Portal de acceso</span>
          </div>

          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-subtitle">Ingresá tus credenciales para continuar.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="username" className="login-label">Usuario</label>
              <div className="login-input-wrap" style={{ marginTop: 6 }}>
                <span className="login-input-icon"><User size={17} /></span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="login-input"
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password" className="login-label">Contraseña</label>
               
              </div>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={17} /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input login-input--password"
                />
                <br />
            <div> 
                <a href="/recuperar-contrasena" className="login-forgot-link">
                  ¿Olvidó su contraseña?
                </a></div>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="login-toggle-visibility"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error" role="alert">{error}</p>
            )}

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? "Ingresando..." : "Acceder"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}