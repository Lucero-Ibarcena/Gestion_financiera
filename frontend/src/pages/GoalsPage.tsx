import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Heart,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import type { Goal } from '../types';
import { money } from '../services/format';
import { Modal } from '../components/Modal';
import './GoalsPage.css';

type GoalInput = {
  name: string;
  target: number;
  current: number;
  dueDate?: string;
};

type GoalsPageProps = {
  goals: Goal[];
  canEdit: boolean;
  onRequireAuth: () => void;
  onSave: (data: GoalInput) => Promise<void>;
  onContribute: (id: string, amount: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function GoalsPage({
  goals,
  canEdit,
  onRequireAuth,
  onSave,
  onContribute,
  onDelete,
}: GoalsPageProps) {
  const [modal, setModal] = useState<'create' | 'contribute' | null>(null);
  const [selected, setSelected] = useState<Goal | null>(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState(0);
  const [current, setCurrent] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [contribution, setContribution] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const totalSaved = goals.reduce((sum, item) => sum + item.current, 0);
  const totalTarget = goals.reduce((sum, item) => sum + item.target, 0);
  const overallProgress = totalTarget
    ? Math.min((totalSaved / totalTarget) * 100, 100)
    : 0;

  function openCreate() {
    setName('');
    setTarget(0);
    setCurrent(0);
    setDueDate('');
    setError('');
    setModal('create');
  }

  function requestCreate() {
    if (!canEdit) {
      onRequireAuth();
      return;
    }

    openCreate();
  }

  function openContribution(goal: Goal) {
    setSelected(goal);
    setContribution(0);
    setError('');
    setModal('contribute');
  }

  function requestContribution(goal: Goal) {
    if (!canEdit) {
      onRequireAuth();
      return;
    }

    openContribution(goal);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (modal === 'create') {
        await onSave({
          name,
          target,
          current,
          ...(dueDate ? { dueDate } : {}),
        });
      } else if (selected) {
        await onContribute(selected.id, contribution);
      }

      setModal(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(goal: Goal) {
    if (!canEdit) {
      onRequireAuth();
      return;
    }

    if (!window.confirm(`¿Eliminar la meta “${goal.name}”?`)) return;

    try {
      await onDelete(goal.id);
    } catch {
      // El aviso global informa el error.
    }
  }

  return (
    <section className="goals-page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Un paso a la vez</div>
          <h1>Metas de ahorro</h1>
          <p>Ponerle nombre a lo que querés lograr hace más fácil avanzar.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-primary" onClick={requestCreate}>
            <Plus size={16} />
            Nueva meta
          </button>
        </div>
      </header>

      <section className="goal-summary">
        <div className="goal-summary-text">
          <div className="goal-summary-icon">
            <Target size={20} />
          </div>
          <div>
            <small>Lo que llevás reunido</small>
            <strong>
              {money(totalSaved)} <span>de {money(totalTarget)}</span>
            </strong>
          </div>
        </div>

        <div className="goal-summary-bar">
          <i style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="goal-summary-foot">
          <span>
            {goals.length
              ? `${goals.length} ${goals.length === 1 ? 'meta activa' : 'metas activas'}`
              : 'Cada meta empieza con una idea'}
          </span>
          <span>{totalTarget ? `${Math.round(overallProgress)}% en camino` : 'Sin apuro'}</span>
        </div>
      </section>

      <div className="goals-section-heading">
        <div>
          <h2>Tus próximos pasos</h2>
          <p>Podés actualizar el avance cuando quieras.</p>
        </div>
        {goals.length > 0 && (
          <span className="goal-count">
            {goals.length} {goals.length === 1 ? 'meta' : 'metas'}
          </span>
        )}
      </div>

      {goals.length === 0 ? (
        <section className="panel">
          <div className="empty-state goals-empty">
            <div className="empty-state-icon">
              <Sparkles size={20} />
            </div>
            <h3>¿Qué te gustaría hacer posible?</h3>
            <p>
              Un viaje, un fondo de tranquilidad o algo que te ilusione. Creá una
              meta y llevá el progreso a tu manera.
            </p>
            <button
              className="button button-primary button-small"
              onClick={requestCreate}
            >
              <Plus size={14} />
              Crear mi primera meta
            </button>
          </div>
        </section>
      ) : (
        <div className="goal-card-grid">
          {goals.map((goal) => {
            const ratio = goal.target
              ? Math.min((goal.current / goal.target) * 100, 100)
              : 0;
            const completed = ratio >= 100;
            const dueMonth = goal.dueDate
              ? new Intl.DateTimeFormat('es-AR', {
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(`${goal.dueDate}T12:00:00`))
              : null;

            return (
              <article className="panel goal-card" key={goal.id}>
                <div className="goal-card-head">
                  <div className="goal-card-symbol">
                    <Heart size={18} />
                  </div>
                  <div className="goal-card-head-actions">
                    {completed && (
                      <span className="goal-done">
                        <Check size={12} />
                        ¡Meta cumplida!
                      </span>
                    )}
                    <button
                      className="icon-button delete-action"
                      title="Eliminar meta"
                      aria-label={`Eliminar meta ${goal.name}`}
                      onClick={() => remove(goal)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3>{goal.name}</h3>
                <div className="goal-amount-line">
                  <strong>{money(goal.current)}</strong>
                  <span>de {money(goal.target)}</span>
                </div>
                <div className="goal-progress">
                  <i style={{ width: `${ratio}%` }} />
                </div>
                <div className="goal-progress-foot">
                  <span>{Math.round(ratio)}% completado</span>
                  {dueMonth && (
                    <span>
                      <CalendarDays size={12} />
                      {dueMonth}
                    </span>
                  )}
                </div>

                <div className="goal-card-footer">
                  <span>
                    {completed
                      ? 'Te lo propusiste y lo lograste.'
                      : `${money(Math.max(goal.target - goal.current, 0))} para llegar`}
                  </span>
                  <button
                    className="button button-secondary button-small"
                    disabled={completed}
                    onClick={() => requestContribution(goal)}
                  >
                    <Plus size={13} />
                    Sumar ahorro
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="goal-note">
        <div>
          <CircleHelp size={16} />
        </div>
        <p>
          <strong>Una meta es una guía para vos.</strong> Los aportes actualizan
          el progreso de ahorro, pero no mueven dinero ni se registran como un
          gasto. Finanzas Claras solo lleva tus anotaciones.
        </p>
        <span>Tu dinero sigue donde está.</span>
      </div>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Nueva meta de ahorro' : 'Sumar a tu meta'}
          description={
            modal === 'create'
              ? 'Elegí algo que te motive y un monto objetivo.'
              : `Cada aporte cuenta para “${selected?.name}”.`
          }
          onClose={() => setModal(null)}
        >
          <form className="data-form" onSubmit={submit}>
            {modal === 'create' ? (
              <>
                <label className="form-field">
                  Nombre de la meta
                  <input
                    autoFocus
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Vacaciones de verano"
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </label>

                <div className="form-two-col">
                  <label className="form-field">
                    Monto objetivo
                    <input
                      type="number"
                      value={target || ''}
                      onChange={(event) => setTarget(Number(event.target.value))}
                      placeholder="500000"
                      min="1"
                      max="999999999"
                      step="0.01"
                      required
                    />
                  </label>
                  <label className="form-field">
                    Ya tengo ahorrado
                    <input
                      type="number"
                      value={current || ''}
                      onChange={(event) => setCurrent(Number(event.target.value))}
                      placeholder="0"
                      min="0"
                      max="999999999"
                      step="0.01"
                    />
                  </label>
                </div>

                <label className="form-field">
                  Fecha objetivo <span className="optional-label">opcional</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                  />
                </label>
              </>
            ) : (
              <>
                <div className="contribution-context">
                  <div className="goal-card-symbol">
                    <Target size={17} />
                  </div>
                  <div>
                    <small>Te falta para llegar</small>
                    <strong>
                      {money(
                        Math.max(
                          (selected?.target || 0) - (selected?.current || 0),
                          0,
                        ),
                      )}
                    </strong>
                  </div>
                </div>

                <label className="form-field">
                  ¿Cuánto querés sumar?
                  <input
                    autoFocus
                    type="number"
                    value={contribution || ''}
                    onChange={(event) => setContribution(Number(event.target.value))}
                    placeholder="Ej. 10000"
                    min="0.01"
                    max="999999999"
                    step="0.01"
                    required
                  />
                </label>
                <p className="contribution-hint">
                  Esto actualiza el progreso de tu meta. No es una transferencia
                  ni un gasto.
                </p>
              </>
            )}

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
              <button className="button button-primary" disabled={busy}>
                {busy
                  ? 'Guardando…'
                  : modal === 'create'
                    ? 'Crear meta'
                    : 'Sumar aporte'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
