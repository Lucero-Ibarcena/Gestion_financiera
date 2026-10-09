import {
  BarChart3,
  CircleHelp,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Target,
  WalletCards,
} from 'lucide-react';
import type { PageKey, User } from '../types';
import './Sidebar.css';

const items: { key: PageKey; label: string; icon: typeof LayoutDashboard }[] = [
  {
    key: 'home',
    label: 'Resumen',
    icon: LayoutDashboard,
  },
  {
    key: 'transactions',
    label: 'Movimientos',
    icon: WalletCards,
  },
  {
    key: 'budgets',
    label: 'Presupuestos',
    icon: BarChart3,
  },
  {
    key: 'goals',
    label: 'Metas de ahorro',
    icon: Target,
  },
];

export function Sidebar({
  page,
  user,
  dark,
  onNavigate,
  onToggleTheme,
  onLogout,
  onSignIn,
}: {
  page: PageKey;
  user: User | null;
  dark: boolean;
  onNavigate: (page: PageKey) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onSignIn: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">
          <span />
        </div>
        <span className="brand-name">
          Finanzas <span>Claras</span>
        </span>
      </div>

      <div className="workspace-label">TU ESPACIO</div>

      <nav className="side-nav" aria-label="Navegación principal">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            aria-label={label}
            title={label}
            className={`nav-link ${page === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {key === 'transactions' && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-grow" />

      <button
        aria-label="Centro de ayuda"
        title="Centro de ayuda"
        className={`help-card ${page === 'support' ? 'help-active' : ''}`}
        onClick={() => onNavigate('support')}
      >
        <div className="help-card-icon">
          <CircleHelp size={17} />
        </div>
        <span className="help-card-copy">
          <strong>¿Necesitás una mano?</strong>
          <small>Guías y respuestas rápidas</small>
        </span>
        <span className="help-card-arrow">↗</span>
      </button>

      <div className="sidebar-footer">
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          <span>Modo {dark ? 'claro' : 'oscuro'}</span>
          <span className={`toggle-track ${dark ? 'on' : ''}`}>
            <i />
          </span>
        </button>

        <div className="account-row">
          <div className="avatar">
            {user ? user.name.trim().slice(0, 1).toUpperCase() : 'V'}
          </div>
          <div className="account-copy">
            <strong>{user?.name || 'Modo visitante'}</strong>
            <small>{user ? 'Cuenta personal' : 'Datos de ejemplo'}</small>
          </div>
          <button
            className="logout-button"
            title={user ? 'Cerrar sesión' : 'Iniciar sesión'}
            aria-label={user ? 'Cerrar sesión' : 'Iniciar sesión'}
            onClick={user ? onLogout : onSignIn}
          >
            {user ? <LogOut size={17} /> : <LogIn size={17} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
