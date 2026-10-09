import { useCallback, useEffect, useState } from 'react';
import { CircleHelp, Info, Plus } from 'lucide-react';
import type { Budget, Goal, PageKey, Session, Transaction, User } from './types';
import { api, saveToken } from './services/api';
import { demoBudgets, demoGoals, demoTransactions } from './services/demoData';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import SupportPage from './pages/SupportPage';
import { Sidebar } from './components/Sidebar';

const pageNames: Record<PageKey, string> = {
  home: 'Resumen',
  transactions: 'Movimientos',
  budgets: 'Presupuestos',
  goals: 'Metas de ahorro',
  support: 'Centro de ayuda',
};

type AuthMode = 'login' | 'register';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(demoBudgets);
  const [goals, setGoals] = useState<Goal[]>(demoGoals);
  const [page, setPage] = useState<PageKey>('home');
  const [quickAddToken, setQuickAddToken] = useState(0);
  const [quickAddRequested, setQuickAddRequested] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem('luma.theme') === 'dark',
  );
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showAuth, setShowAuth] = useState(false);

  const refreshData = useCallback(async () => {
    const [newTransactions, newBudgets, newGoals] = await Promise.all([
      api.transactions(),
      api.budgets(),
      api.goals(),
    ]);

    setTransactions(newTransactions);
    setBudgets(newBudgets);
    setGoals(newGoals);
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const currentUser = await api.me();
        if (!active) return;

        setUser(currentUser);
        await refreshData();
      } catch (reason) {
        const status = (reason as Error & { status?: number }).status;

        if (status === 401) {
          saveToken(null);
        } else {
          setAuthMessage(
            reason instanceof Error ? reason.message : 'No se pudo conectar con la API.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (localStorage.getItem('luma.accessToken')) {
      restoreSession();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [refreshData]);

  useEffect(() => {
    localStorage.setItem('luma.theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function authenticated(session: Session) {
    setAuthMessage('');
    setAuthNotice('');
    setShowAuth(false);
    setUser(session.user);
    setLoading(true);

    refreshData()
      .then(() => setLoading(false))
      .catch((error) => {
        setLoading(false);
        setToast(error.message || 'No se pudieron cargar tus datos.');
      });
  }

  function logout() {
    saveToken(null);
    setUser(null);
    setTransactions(demoTransactions);
    setBudgets(demoBudgets);
    setGoals(demoGoals);
    setPage('home');
  }

  function openAuthentication(mode: AuthMode, notice = '') {
    setAuthMode(mode);
    setAuthNotice(notice);
    setAuthMessage('');
    setShowAuth(true);
  }

  function startAddingTransaction() {
    if (!user) {
      openAuthentication(
        'register',
        'Creá una cuenta o iniciá sesión para guardar tus movimientos.',
      );
      return;
    }

    setPage('transactions');
    setQuickAddToken((value) => value + 1);
    setQuickAddRequested(true);
  }

  async function perform(action: () => Promise<unknown>, success: string) {
    if (!user) {
      openAuthentication(
        'register',
        'Creá una cuenta o iniciá sesión para guardar tus cambios.',
      );
      throw new Error('Iniciá sesión para guardar tus cambios.');
    }

    try {
      await action();
      await refreshData();
      setToast(success);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'No se pudo guardar el cambio.');
      throw error;
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-mark">
          <span />
        </div>
        <span>Preparando tu espacio…</span>
      </div>
    );
  }

  if (showAuth) {
    return (
      <AuthPage
        initialMode={authMode}
        initialError={authMessage}
        notice={authNotice}
        onAuthenticated={authenticated}
        onContinueAsGuest={() => {
          setShowAuth(false);
          setAuthNotice('');
          setAuthMessage('');
        }}
      />
    );
  }

  return (
    <div className={`app-root ${dark ? 'theme-dark' : ''}`}>
      <Sidebar
        page={page}
        user={user}
        dark={dark}
        onNavigate={setPage}
        onToggleTheme={() => setDark((value) => !value)}
        onLogout={logout}
        onSignIn={() => openAuthentication('login')}
      />

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Mi espacio</span>
            <i>/</i>
            <strong>{pageNames[page]}</strong>
          </div>

          {user ? (
            <div className="topbar-actions">
              <button className="top-help" onClick={() => setPage('support')}>
                <CircleHelp size={16} />
                <span>Ayuda</span>
              </button>
              <button
                className="button button-primary top-add"
                onClick={startAddingTransaction}
              >
                <Plus size={16} />
                <span>Anotar movimiento</span>
              </button>
            </div>
          ) : (
            <div className="guest-auth-actions">
              <button
                className="guest-login-button"
                onClick={() => openAuthentication('login')}
              >
                Iniciar sesión
              </button>
              <button
                className="button button-primary guest-register-button"
                onClick={() => openAuthentication('register')}
              >
                Crear cuenta
              </button>
            </div>
          )}
        </header>

        {!user && (
          <div className="demo-banner">
            <div className="demo-banner-copy">
              <Info size={16} />
              <span>
                Estás explorando una demostración con datos ficticios. Creá una
                cuenta para guardar los tuyos.
              </span>
            </div>
            <button onClick={() => openAuthentication('register')}>
              Crear cuenta
            </button>
          </div>
        )}

        <div className="page-content">
          {page === 'home' && (
            <HomePage
              user={user}
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              onNavigate={setPage}
              onAddTransaction={startAddingTransaction}
            />
          )}

          {page === 'transactions' && (
            <TransactionsPage
              canEdit={!!user}
              quickAddToken={quickAddToken}
              quickAddRequested={quickAddRequested}
              onQuickAddHandled={() => setQuickAddRequested(false)}
              onRequireAuth={() =>
                openAuthentication(
                  'register',
                  'Creá una cuenta o iniciá sesión para anotar y guardar movimientos.',
                )
              }
              transactions={transactions}
              onAdd={(data) =>
                perform(() => api.addTransaction(data), 'Movimiento guardado')
              }
              onUpdate={(id, data) =>
                perform(() => api.updateTransaction(id, data), 'Movimiento actualizado')
              }
              onDelete={(id) =>
                perform(() => api.deleteTransaction(id), 'Movimiento eliminado')
              }
            />
          )}

          {page === 'budgets' && (
            <BudgetsPage
              budgets={budgets}
              canEdit={!!user}
              onNavigate={setPage}
              onRequireAuth={() =>
                openAuthentication(
                  'register',
                  'Creá una cuenta o iniciá sesión para guardar tus presupuestos.',
                )
              }
              onSave={(data) => perform(() => api.addBudget(data), 'Presupuesto guardado')}
              onDelete={(id) =>
                perform(() => api.deleteBudget(id), 'Presupuesto eliminado')
              }
            />
          )}

          {page === 'goals' && (
            <GoalsPage
              goals={goals}
              canEdit={!!user}
              onRequireAuth={() =>
                openAuthentication(
                  'register',
                  'Creá una cuenta o iniciá sesión para guardar tus metas.',
                )
              }
              onSave={(data) => perform(() => api.addGoal(data), 'Meta creada')}
              onContribute={(id, amount) =>
                perform(
                  () => api.contributeGoal(id, amount),
                  'Aporte sumado a tu meta',
                )
              }
              onDelete={(id) => perform(() => api.deleteGoal(id), 'Meta eliminada')}
            />
          )}

          {page === 'support' && <SupportPage onNavigate={setPage} />}
        </div>
      </main>

      {toast && (
        <div className="toast-message" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
