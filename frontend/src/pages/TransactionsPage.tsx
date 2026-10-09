import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2,
  WalletCards,
} from 'lucide-react';
import type { Transaction } from '../types';
import { categories, localDateInput, money, shortDate } from '../services/format';
import { CategoryIcon } from '../components/CategoryIcon';
import { Modal } from '../components/Modal';
import './TransactionsPage.css';

type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;
type TransactionFilter = 'all' | 'expense' | 'income';

type TransactionsPageProps = {
  transactions: Transaction[];
  canEdit: boolean;
  quickAddToken: number;
  quickAddRequested: boolean;
  onQuickAddHandled: () => void;
  onRequireAuth: () => void;
  onAdd: (data: TransactionInput) => Promise<void>;
  onUpdate: (id: string, data: TransactionInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const blankForm = (): TransactionInput => ({
  description: '',
  amount: 0,
  kind: 'expense',
  category: 'Comida',
  date: localDateInput(),
});

export default function TransactionsPage({
  transactions,
  canEdit,
  quickAddToken,
  quickAddRequested,
  onQuickAddHandled,
  onRequireAuth,
  onAdd,
  onUpdate,
  onDelete,
}: TransactionsPageProps) {
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState<TransactionInput>(blankForm());
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const visible = useMemo(
    () =>
      transactions
        .filter(
          (item) =>
            (filter === 'all' || item.kind === filter) &&
            `${item.description} ${item.category}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
        ),
    [transactions, filter, search],
  );

  const total = visible.reduce(
    (sum, item) => sum + (item.kind === 'income' ? item.amount : -item.amount),
    0,
  );

  useEffect(() => {
    if (quickAddRequested) {
      openNew();
      onQuickAddHandled();
    }
  }, [quickAddToken, quickAddRequested]);

  function openNew() {
    setEditing(null);
    setForm(blankForm());
    setFormError('');
    setModalOpen(true);
  }

  function requestAdd() {
    if (!canEdit) {
      onRequireAuth();
      return;
    }

    openNew();
  }

  function openEdit(item: Transaction) {
    setEditing(item);
    setForm({
      description: item.description,
      amount: item.amount,
      kind: item.kind,
      category: item.category,
      date: item.date.slice(0, 10),
    });
    setFormError('');
    setModalOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFormError('');

    try {
      if (editing) {
        await onUpdate(editing.id, form);
      } else {
        await onAdd(form);
      }

      setModalOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo guardar el movimiento.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: Transaction) {
    if (!window.confirm(`¿Eliminar “${item.description}”?`)) return;

    try {
      await onDelete(item.id);
    } catch {
      // El aviso global informa el error.
    }
  }

  function updateForm<K extends keyof TransactionInput>(
    key: K,
    value: TransactionInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="transactions-page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Registro personal</div>
          <h1>Movimientos</h1>
          <p>Todo lo que entra y sale, en un solo lugar.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-primary" onClick={requestAdd}>
            <Plus size={16} />
            Anotar movimiento
          </button>
        </div>
      </header>

      <section className="transaction-summary">
        <div className="transaction-summary-icon">
          <WalletCards size={18} />
        </div>
        <div>
          <small>Balance de lo que estás viendo</small>
          <strong className={total < 0 ? 'negative' : ''}>{money(total)}</strong>
        </div>
        <div className="transaction-summary-count">
          <strong>{visible.length}</strong>
          <small>{visible.length === 1 ? 'movimiento' : 'movimientos'}</small>
        </div>
      </section>

      <section className="panel transactions-panel">
        <div className="transaction-toolbar">
          <div className="filter-pills">
            <button
              className={filter === 'all' ? 'selected' : ''}
              onClick={() => setFilter('all')}
            >
              Todos <span>{transactions.length}</span>
            </button>
            <button
              className={filter === 'expense' ? 'selected' : ''}
              onClick={() => setFilter('expense')}
            >
              <ArrowUpRight size={13} />
              Gastos
            </button>
            <button
              className={filter === 'income' ? 'selected' : ''}
              onClick={() => setFilter('income')}
            >
              <ArrowDownLeft size={13} />
              Ingresos
            </button>
          </div>

          <label className="transaction-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar movimiento"
              aria-label="Buscar movimiento"
            />
          </label>
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <WalletCards size={20} />
            </div>
            <h3>
              {transactions.length === 0
                ? 'Tu registro empieza acá'
                : 'No encontramos movimientos'}
            </h3>
            <p>
              {transactions.length === 0
                ? 'Anotá un gasto o un ingreso y empezá a ver tus finanzas con más claridad.'
                : 'Probá con otra búsqueda o cambiá el filtro seleccionado.'}
            </p>
            {transactions.length === 0 && (
              <button
                className="button button-primary button-small"
                onClick={requestAdd}
              >
                <Plus size={14} />
                Anotar movimiento
              </button>
            )}
          </div>
        ) : (
          <div className="transactions-table-wrap">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Movimiento</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th className="amount-col">Importe</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="movement-cell">
                        <CategoryIcon
                          category={item.category}
                          kind={item.kind}
                          compact
                        />
                        <span>
                          <strong>{item.description}</strong>
                          <small>{item.kind === 'income' ? 'Ingreso' : 'Gasto'}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{item.category}</span>
                    </td>
                    <td>
                      <span className="date-cell">
                        <CalendarDays size={13} />
                        {shortDate(item.date)}
                      </span>
                    </td>
                    <td className={`amount-cell ${item.kind}`}>
                      {item.kind === 'income' ? '+' : '−'}
                      {money(item.amount)}
                    </td>
                    <td>
                      {canEdit && (
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            aria-label={`Editar ${item.description}`}
                            title="Editar"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="icon-button delete-action"
                            aria-label={`Eliminar ${item.description}`}
                            title="Eliminar"
                            onClick={() => remove(item)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <Modal
          title={editing ? 'Editar movimiento' : 'Nuevo movimiento'}
          description="Anotá el monto y elegí la categoría que mejor lo representa."
          onClose={() => setModalOpen(false)}
        >
          <form className="data-form" onSubmit={submit}>
            <div className="kind-switch">
              <button
                type="button"
                className={form.kind === 'expense' ? 'active expense-choice' : ''}
                onClick={() => {
                  updateForm('kind', 'expense');
                  if (form.category === 'Sueldo') updateForm('category', 'Comida');
                }}
              >
                <ArrowUpRight size={15} />
                Es un gasto
              </button>
              <button
                type="button"
                className={form.kind === 'income' ? 'active income-choice' : ''}
                onClick={() => {
                  updateForm('kind', 'income');
                  updateForm('category', 'Sueldo');
                }}
              >
                <ArrowDownLeft size={15} />
                Es un ingreso
              </button>
            </div>

            <label className="form-field">
              Descripción
              <input
                autoFocus
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                placeholder={
                  form.kind === 'income'
                    ? 'Ej. Sueldo de octubre'
                    : 'Ej. Compra del supermercado'
                }
                required
                minLength={1}
                maxLength={100}
              />
            </label>

            <div className="form-two-col">
              <label className="form-field">
                Importe en pesos
                <input
                  type="number"
                  min="0.01"
                  max="999999999"
                  step="0.01"
                  value={form.amount || ''}
                  onChange={(event) => updateForm('amount', Number(event.target.value))}
                  placeholder="0,00"
                  required
                />
              </label>
              <label className="form-field">
                Fecha
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateForm('date', event.target.value)}
                  required
                />
              </label>
            </div>

            <label className="form-field">
              Categoría
              <select
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
              >
                {categories
                  .filter((category) =>
                    form.kind === 'income'
                      ? ['Sueldo', 'Otros'].includes(category)
                      : category !== 'Sueldo',
                  )
                  .map((category) => (
                    <option key={category}>{category}</option>
                  ))}
              </select>
            </label>

            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}

            <div className="form-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="button button-primary" disabled={busy}>
                {busy
                  ? 'Guardando…'
                  : editing
                    ? 'Guardar cambios'
                    : 'Guardar movimiento'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
