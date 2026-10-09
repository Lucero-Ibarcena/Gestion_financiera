import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CircleHelp,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import type { Session } from '../types';
import { api, saveToken } from '../services/api';
import './AuthPage.css';

type AuthMode = 'login' | 'register';

type AuthPageProps = {
  onAuthenticated: (session: Session) => void;
  onContinueAsGuest: () => void;
  initialMode?: AuthMode;
  initialError?: string;
  notice?: string;
};

export default function AuthPage({
  onAuthenticated,
  onContinueAsGuest,
  initialMode = 'login',
  initialError = '',
  notice = '',
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const session =
        mode === 'register'
          ? await api.register({ name, email, password })
          : await api.login({ email, password });

      saveToken(session.accessToken);
      onAuthenticated(session);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'No se pudo iniciar sesión.',
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === 'login' ? 'register' : 'login'));
    setError('');
  }

  return (
    <main className="auth-page">
      <section className="auth-form-side">
        <div className="auth-brand">
          <div className="brand-mark">
            <span />
          </div>
          <span className="brand-name">
            Finanzas <span>Claras</span>
          </span>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-eyebrow">
            <Sparkles size={14} /> UN LUGAR PARA ORDENARTE
          </div>

          <h1>
            {mode === 'login' ? (
              <>
                Tus finanzas,
                <br />
                <em>con más calma.</em>
              </>
            ) : (
              <>
                Empezá a tener
                <br />
                <em>todo más claro.</em>
              </>
            )}
          </h1>

          <p className="auth-intro">
            Anotá lo que entra y lo que sale. Lo demás, paso a paso.
          </p>

          {notice && <div className="auth-notice">{notice}</div>}

          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <label>
                ¿Cómo te llamás?
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  required
                  minLength={2}
                  maxLength={60}
                />
              </label>
            )}

            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vos@correo.com"
                required
              />
            </label>

            <label>
              Contraseña
              <span className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Al menos 8 caracteres"
                  required
                  minLength={8}
                  maxLength={72}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button className="button button-primary auth-submit" disabled={busy}>
              {busy
                ? 'Un momento…'
                : mode === 'login'
                  ? 'Ingresar a mi espacio'
                  : 'Crear mi cuenta'}
              <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login'
              ? '¿Todavía no tenés cuenta?'
              : '¿Ya tenés una cuenta?'}{' '}
            <button onClick={toggleMode}>
              {mode === 'login' ? 'Crear una cuenta' : 'Iniciar sesión'}
            </button>
          </p>

          <button className="auth-visitor-link" onClick={onContinueAsGuest}>
            <ArrowLeft size={14} />
            Volver a explorar sin cuenta
          </button>

          <div className="auth-privacy">
            <CircleHelp size={15} />
            <span>
              Finanzas Claras es una herramienta de organización personal. Nunca
              te pedimos claves bancarias.
            </span>
          </div>
        </div>

        <div className="auth-footnote">Hecho para acompañarte, a tu ritmo.</div>
      </section>

      <section className="auth-art-side" aria-label="Vista previa de Finanzas Claras">
        <div className="art-orb orb-one" />
        <div className="art-orb orb-two" />
        <div className="art-caption">
          <span className="caption-line" />
          UNA FORMA MÁS AMABLE DE MIRAR TU DINERO
        </div>

        <div className="preview-card">
          <div className="preview-card-head">
            <div>
              <span className="preview-kicker">VISTA DE EJEMPLO</span>
              <h2>Tu dinero en perspectiva</h2>
            </div>
            <div className="preview-icon">
              <BarChart3 size={18} />
            </div>
          </div>

          <div className="preview-balance-label">Disponible este mes</div>
          <div className="preview-balance">$ 824.500</div>

          <div className="preview-chart">
            <div className="chart-lines">
              <i />
              <i />
              <i />
            </div>
            <svg
              viewBox="0 0 420 110"
              preserveAspectRatio="none"
              role="presentation"
            >
              <defs>
                <linearGradient id="preview-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#b8cc94" stopOpacity=".33" />
                  <stop offset="1" stopColor="#b8cc94" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 83 C32 77 48 90 76 69 S116 75 143 54 S179 62 205 49 S242 56 268 37 S310 51 337 27 S385 38 420 12 L420 110 L0 110Z"
                fill="url(#preview-fill)"
              />
              <path
                d="M0 83 C32 77 48 90 76 69 S116 75 143 54 S179 62 205 49 S242 56 268 37 S310 51 337 27 S385 38 420 12"
                fill="none"
                stroke="#b8cc94"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="preview-months">
            <span>ENE</span>
            <span>FEB</span>
            <span>MAR</span>
            <span>ABR</span>
            <span>MAY</span>
            <span>JUN</span>
          </div>

          <div className="preview-bottom">
            <div className="preview-metric">
              <span className="metric-dot green" />
              <div>
                <small>Ingresos</small>
                <strong>$ 1.250.000</strong>
              </div>
            </div>
            <div className="preview-metric">
              <span className="metric-dot peach" />
              <div>
                <small>Gastos</small>
                <strong>$ 425.500</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="art-quote">
          <span>“</span>
          <div>
            <strong>Un paso a la vez también es avanzar.</strong>
            <small>Tu tranquilidad financiera empieza con claridad.</small>
          </div>
        </div>

        <div className="art-footnote">Tus datos son tuyos. Sin conexiones bancarias.</div>
      </section>
    </main>
  );
}
