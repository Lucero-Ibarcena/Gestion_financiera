import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Plus,
  Sparkles,
  Target,
  WalletCards,
} from 'lucide-react';
import type { Budget, Goal, PageKey, Transaction, User } from '../types';
import { money, monthName, shortDate } from '../services/format';
import { CategoryIcon } from '../components/CategoryIcon';
import './HomePage.css';

type HomePageProps = {
  user: User;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  onNavigate: (page: PageKey) => void;
  onAddTransaction: () => void;
};

type ChartMonth = {
  key: string;
  label: string;
  income: number;
  expense: number;
};

const categoryColors = ['#829b73', '#d6a27e', '#a7b8cb', '#c8bd91', '#b59bbf'];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function createChartMonths(transactions: Transaction[], now: Date): ChartMonth[] {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = monthKey(date);
    const entries = transactions.filter((item) => item.date.slice(0, 7) === key);

    return {
      key,
      label: monthName(date),
      income: entries
        .filter((item) => item.kind === 'income')
        .reduce((sum, item) => sum + item.amount, 0),
      expense: entries
        .filter((item) => item.kind === 'expense')
        .reduce((sum, item) => sum + item.amount, 0),
    };
  });
}

function sumKind(items: Transaction[], kind: Transaction['kind']) {
  return items
    .filter((item) => item.kind === kind)
    .reduce((sum, item) => sum + item.amount, 0);
}

export default function HomePage({
  user,
  transactions,
  budgets,
  goals,
  onNavigate,
  onAddTransaction,
}: HomePageProps) {
  const now = new Date();
  const currentMonth = monthKey(now);
  const thisMonth = transactions.filter(
    (item) => item.date.slice(0, 7) === currentMonth,
  );
  const income = sumKind(thisMonth, 'income');
  const expenses = sumKind(thisMonth, 'expense');
  const balance = transactions.reduce(
    (sum, item) => sum + (item.kind === 'income' ? item.amount : -item.amount),
    0,
  );
  const chartMonths = createChartMonths(transactions, now);
  const maxChart = Math.max(
    1,
    ...chartMonths.flatMap((item) => [item.income, item.expense]),
  );

  const spendingByCategory = Object.entries(
    thisMonth
      .filter((item) => item.kind === 'expense')
      .reduce<Record<string, number>>((totals, item) => {
        totals[item.category] = (totals[item.category] || 0) + item.amount;
        return totals;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  let accumulatedPercent = 0;
  const donutGradient = spendingByCategory
    .map(([, amount], index) => {
      const totalSpent = spendingByCategory.reduce((sum, [, value]) => sum + value, 0);
      const start = accumulatedPercent;
      accumulatedPercent += (amount / totalSpent) * 100;
      return `${categoryColors[index % categoryColors.length]} ${start}% ${accumulatedPercent}%`;
    })
    .join(', ');

  const goalProgress = goals.reduce((sum, item) => sum + item.current, 0);
  const goalTarget = goals.reduce((sum, item) => sum + item.target, 0);
  const recent = [...transactions]
    .sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    )
    .slice(0, 5);
  const firstName = user.name.trim().split(/\s+/)[0];
  const formattedMonth = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(now);

  return (
    <div className="home-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">{formattedMonth}</div>
          <h1>
            Hola, {firstName} <span className="greeting-sun">✳</span>
          </h1>
          <p>Este es tu espacio. Un vistazo claro para tomar buenas decisiones.</p>
        </div>
        <button className="button button-primary home-add" onClick={onAddTransaction}>
          <Plus size={16} />
          Anotar movimiento
        </button>
      </section>

      <section className="overview-grid">
        <article className="balance-card">
          <div className="balance-top">
            <span>Saldo registrado</span>
            <span className="balance-icon">
              <WalletCards size={18} />
            </span>
          </div>
          <strong className="balance-amount">{money(balance)}</strong>
          <div className="balance-foot">
            <span>
              <i /> Tu balance según los movimientos que anotaste
            </span>
            <button onClick={() => onNavigate('transactions')}>
              Ver detalle <ArrowRight size={13} />
            </button>
          </div>
          <div className="balance-decoration" />
        </article>

        <article className="stat-card income-stat">
          <div className="stat-top">
            <span>Ingresos del mes</span>
            <span className="stat-icon">
              <ArrowDownLeft size={16} />
            </span>
          </div>
          <strong>{money(income)}</strong>
          <small>
            {thisMonth.filter((item) => item.kind === 'income').length}{' '}
            {thisMonth.filter((item) => item.kind === 'income').length === 1
              ? 'movimiento'
              : 'movimientos'}{' '}
            anotados
          </small>
          <div className="stat-sparkline income-spark">
            <i /> <i /> <i /> <i /> <i /> <i /> <i /> <i />
          </div>
        </article>

        <article className="stat-card expense-stat">
          <div className="stat-top">
            <span>Gastos del mes</span>
            <span className="stat-icon">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <strong>{money(expenses)}</strong>
          <small>
            {thisMonth.filter((item) => item.kind === 'expense').length}{' '}
            {thisMonth.filter((item) => item.kind === 'expense').length === 1
              ? 'movimiento'
              : 'movimientos'}{' '}
            anotados
          </small>
          <div className="stat-sparkline expense-spark">
            <i /> <i /> <i /> <i /> <i /> <i /> <i /> <i />
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel flow-panel">
          <div className="panel-heading">
            <div>
              <h2>Tu ritmo de dinero</h2>
              <p>Ingresos y gastos de los últimos 6 meses</p>
            </div>
            <span className="legend">
              <i className="legend-income" />
              Ingresos
              <i className="legend-expense" />
              Gastos
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="chart-empty">
              <div className="empty-spark">
                <Sparkles size={18} />
              </div>
              <p>
                Cuando anotes movimientos, acá vas a ver cómo se mueve tu dinero.
              </p>
              <button className="text-link" onClick={onAddTransaction}>
                Anotar el primero <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="flow-chart">
              <div className="chart-y-labels">
                <span>{money(maxChart)}</span>
                <span>{money(maxChart / 2)}</span>
                <span>$ 0</span>
              </div>
              <div className="chart-plot">
                <div className="chart-grid-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="chart-bars">
                  {chartMonths.map((item) => (
                    <div className="month-group" key={item.key}>
                      <div className="bar-pair">
                        <span
                          className="bar income-bar"
                          style={{
                            height: `${Math.max(
                              item.income ? 4 : 0,
                              (item.income / maxChart) * 100,
                            )}%`,
                          }}
                          title={`Ingresos: ${money(item.income)}`}
                        />
                        <span
                          className="bar expense-bar"
                          style={{
                            height: `${Math.max(
                              item.expense ? 4 : 0,
                              (item.expense / maxChart) * 100,
                            )}%`,
                          }}
                          title={`Gastos: ${money(item.expense)}`}
                        />
                      </div>
                      <span className="month-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>

        <article className="panel category-panel">
          <div className="panel-heading">
            <div>
              <h2>¿A dónde va?</h2>
              <p>Gastos por categoría este mes</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('transactions')}>
              Ver todo
            </button>
          </div>

          {spendingByCategory.length === 0 ? (
            <div className="category-empty">
              <CircleDollarSign size={20} />
              <p>Todavía no hay gastos para mostrar.</p>
            </div>
          ) : (
            <div className="category-content">
              <div className="donut-wrap">
                <div
                  className="donut-chart"
                  style={{ background: `conic-gradient(${donutGradient})` }}
                >
                  <div>
                    <strong>{money(expenses)}</strong>
                    <small>Total</small>
                  </div>
                </div>
              </div>
              <div className="category-list">
                {spendingByCategory.map(([category, amount], index) => (
                  <div className="category-row" key={category}>
                    <span className={`category-color color-${index}`} />
                    <span>{category}</span>
                    <strong>{money(amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Movimientos recientes</h2>
              <p>Lo último que anotaste</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('transactions')}>
              Ver movimientos <ArrowRight size={13} />
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="recent-empty">
              <p>Tu actividad va a aparecer acá.</p>
              <button
                className="button button-secondary button-small"
                onClick={onAddTransaction}
              >
                <Plus size={14} />
                Anotar movimiento
              </button>
            </div>
          ) : (
            <div className="recent-list">
              {recent.map((item) => (
                <div className="recent-row" key={item.id}>
                  <CategoryIcon
                    category={item.category}
                    kind={item.kind}
                    compact
                  />
                  <div className="recent-info">
                    <strong>{item.description}</strong>
                    <small>
                      {item.category} · {shortDate(item.date)}
                    </small>
                  </div>
                  <strong className={`recent-amount ${item.kind}`}>
                    {item.kind === 'income' ? '+' : '−'}
                    {money(item.amount)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel snapshot-panel">
          <div className="panel-heading">
            <div>
              <h2>Lo que estás construyendo</h2>
              <p>Presupuestos y metas en marcha</p>
            </div>
            <span className="snapshot-icon">
              <Target size={17} />
            </span>
          </div>

          <div className="snapshot-content">
            <button className="snapshot-item" onClick={() => onNavigate('budgets')}>
              <span className="snapshot-count">
                {budgets.length.toString().padStart(2, '0')}
              </span>
              <span>
                <strong>Presupuestos activos</strong>
                <small>Para cuidar cada categoría</small>
              </span>
              <ArrowRight size={14} />
            </button>

            <div className="snapshot-divider" />

            <button className="snapshot-item" onClick={() => onNavigate('goals')}>
              <span className="snapshot-count">
                {goals.length.toString().padStart(2, '0')}
              </span>
              <span>
                <strong>Metas de ahorro</strong>
                <small>
                  {goals.length
                    ? `${money(goalProgress)} de ${money(goalTarget)} reunidos`
                    : 'Un deseo a la vez'}
                </small>
              </span>
              <ArrowRight size={14} />
            </button>
          </div>

          <button
            className="snapshot-cta"
            onClick={() => onNavigate(goals.length ? 'goals' : 'budgets')}
          >
            <span>Seguí construyendo tus hábitos</span>
            <ArrowRight size={14} />
          </button>
        </article>
      </section>
    </div>
  );
}
