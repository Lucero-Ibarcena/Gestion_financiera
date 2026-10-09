import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleDollarSign,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import type { Budget, PageKey } from '../types';
import { categories, money } from '../services/format';
import { CategoryIcon } from '../components/CategoryIcon';
import { Modal } from '../components/Modal';
import './BudgetsPage.css';

type BudgetInput = {
  category: string;
  limit: number;
  period: 'month';
};

type BudgetsPageProps = {
  budgets: Budget[];
  canEdit: boolean;
  onNavigate: (page: PageKey) => void;
  onRequireAuth: () => void;
  onSave: (data: BudgetInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function BudgetsPage({
  budgets,
  canEdit,
  onNavigate,
  onRequireAuth,
  onSave,
  onDelete,
}: BudgetsPageProps) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Budget | null>(null);
  const [category, setCategory] = useState('Vivienda');
  const [limit, setLimit] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const totalLimit = budgets.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const remaining = totalLimit - totalSpent;
  const canCreateBudget = categories.some(
    (item) =>
      item !== 'Sueldo' &&
      !budgets.some((budget) => budget.category === item),
  );

  function openNew() {
    setEdit(null);
    setCategory(
      categories.filter(
        (item) =>
          item !== 'Sueldo' &&
          !budgets.some((budget) => budget.category === item),
      )[0] || 'Otros',
    );
    setLimit(0);
    setError('');
    setOpen(true);
  }

  function openEdit(item: Budget) {
    setEdit(item);
    setCategory(item.category);
    setLimit(item.limit);
    setError('');
    setOpen(true);
  }

  function requestNew() {
    if (!canEdit) {
      onRequireAuth();
      return;
    }

    openNew();
  }

  function requestEdit(item: Budget) {
    if (!canEdit) {
      onRequireAuth();
      return;
    }

    openEdit(item);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await onSave({ category, limit, period: 'month' });
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: Budget) {
    if (!canEdit) {
      onRequireAuth();
      return;
    }

    if (!window.confirm(`¿Eliminar el presupuesto de ${item.category}?`)) return;

    try {
      await onDelete(item.id);
    } catch {
      // El aviso global informa el error.
    }
  }

  function categoryOptions() {
    return categories.filter(
      (item) =>
        item !== 'Sueldo' &&
        (item === edit?.category ||
          !budgets.some((budget) => budget.category === item)),
    );
  }

  return (
    <section className="budgets-page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Decisiones con intención</div>
          <h1>Presupuestos</h1>
          <p>Definí un límite mensual para las categorías que querés cuidar.</p>
        </div>
        <div className="page-header-actions">
          <button
            className="button button-primary"
            onClick={requestNew}
            disabled={!canCreateBudget}
            title={canCreateBudget ? 'Crear presupuesto' : 'Ya tenés un límite para cada categoría'}
          >
            <Plus size={16} />
            Nuevo presupuesto
          </button>
        </div>
      </header>

      <section className="budget-overview">
        <div className="budget-overview-main">
          <div className="budget-overview-icon">
            <ShieldCheck size={19} />
          </div>
          <div>
            <small>Límites que definiste</small>
            <strong>
              {money(totalLimit)}
              <span> / mes</span>
            </strong>
          </div>
        </div>

        <div className="budget-overview-stats">
          <div>
            <small>Usado en estos límites</small>
            <strong>{money(totalSpent)}</strong>
          </div>
          <i />
          <div>
            <small>{remaining >= 0 ? 'Disponible' : 'Por encima del límite'}</small>
            <strong className={remaining < 0 ? 'over-limit' : ''}>
              {money(Math.abs(remaining))}
            </strong>
          </div>
        </div>
      </section>

      <div className="budgets-section-heading">
        <div>
          <h2>Tus categorías</h2>
          <p>
            {budgets.length
              ? 'Un límite claro te ayuda a decidir con tiempo.'
              : 'Empezá por las categorías que más te importan.'}
          </p>
        </div>
        {budgets.length > 0 && (
          <span className="budget-count">
            {budgets.length} {budgets.length === 1 ? 'categoría' : 'categorías'}
          </span>
        )}
      </div>

      {budgets.length === 0 ? (
        <section className="panel">
          <div className="empty-state budget-empty">
            <div className="empty-state-icon">
              <CircleDollarSign size={21} />
            </div>
            <h3>Un límite, más tranquilidad</h3>
            <p>
              Elegí una categoría y asignale un monto mensual. Finanzas Claras compara el
              límite con los gastos que anotás.
            </p>
            <button
              className="button button-primary button-small"
              onClick={requestNew}
            >
              <Plus size={14} />
              Crear primer presupuesto
            </button>
          </div>
        </section>
      ) : (
        <div className="budget-card-grid">
          {budgets.map((item) => {
            const ratio = item.spent / item.limit;
            const progress = Math.min(ratio * 100, 100);
            const exceeded = ratio >= 1;
            const close = ratio >= 0.8 && ratio < 1;

            return (
              <article className="panel budget-card" key={item.id}>
                <div className="budget-card-top">
                  <CategoryIcon category={item.category} />
                  <div
                    className={`budget-status ${exceeded ? 'status-over' : close ? 'status-close' : 'status-ok'}`}
                  >
                    {exceeded ? <AlertCircle size={12} /> : <Check size={12} />}
                    <span>
                      {exceeded
                        ? 'Límite superado'
                        : close
                          ? 'Casi en el límite'
                          : 'En buen camino'}
                    </span>
                  </div>
                </div>

                <div className="budget-title-row">
                  <div>
                    <h3>{item.category}</h3>
                    <p>Presupuesto mensual</p>
                  </div>
                  <div className="budget-actions">
                    <button
                      className="icon-button"
                      title="Ajustar límite"
                      aria-label={`Ajustar presupuesto de ${item.category}`}
                      onClick={() => requestEdit(item)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-button delete-action"
                      title="Eliminar"
                      aria-label={`Eliminar presupuesto de ${item.category}`}
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="budget-values">
                  <strong>{money(item.spent)}</strong>
                  <span>de {money(item.limit)}</span>
                  <b>{Math.round(ratio * 100)}%</b>
                </div>

                <div className="budget-progress">
                  <i
                    className={exceeded ? 'over' : close ? 'close' : ''}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="budget-card-footer">
                  <span>
                    {exceeded
                      ? `Te excediste por ${money(item.spent - item.limit)}`
                      : `${money(item.limit - item.spent)} disponibles`}
                  </span>
                  <span>Este mes</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="budget-note">
        <div>
          <CircleDollarSign size={16} />
        </div>
        <p>
          <strong>Una guía, no una regla.</strong> El avance usa los gastos que
          anotaste en Finanzas Claras dentro de cada categoría y el mes actual. Tus
          movimientos no se conectan a cuentas bancarias.
        </p>
        <button onClick={() => onNavigate('support')}>
          ¿Cómo funciona? <ArrowRight size={13} />
        </button>
      </div>

      {open && (
        <Modal
          title={edit ? 'Ajustar presupuesto' : 'Nuevo presupuesto'}
          description="El límite se aplica al mes en curso y a los gastos de esta categoría."
          onClose={() => setOpen(false)}
        >
          <form className="data-form" onSubmit={submit}>
            <label className="form-field">
              Categoría
              <select
                value={category}
                disabled={!!edit}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categoryOptions().map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              Límite mensual en pesos
              <input
                type="number"
                value={limit || ''}
                onChange={(event) => setLimit(Number(event.target.value))}
                placeholder="Ej. 150000"
                min="1"
                max="999999999"
                step="0.01"
                required
              />
            </label>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button className="button button-primary" disabled={busy}>
                {busy
                  ? 'Guardando…'
                  : edit
                    ? 'Guardar límite'
                    : 'Crear presupuesto'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
