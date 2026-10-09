import { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  Lightbulb,
  Target,
  WalletCards,
} from 'lucide-react';
import type { PageKey } from '../types';
import './SupportPage.css';

const questions = [
  {
    question: '¿Puedo probar la aplicación antes de crear una cuenta?',
    answer:
      'Sí. Podés recorrer el resumen, los movimientos, los presupuestos y las metas usando datos ficticios. Para anotar, editar o guardar tu propia información, necesitás crear una cuenta o iniciar sesión.',
  },
  {
    question: '¿Finanzas Claras se conecta a mi banco?',
    answer:
      'No. Finanzas Claras no se conecta a bancos ni procesa pagos. Vos anotás los movimientos que querés tener en cuenta; tu dinero sigue en tus cuentas habituales.',
  },
  {
    question: '¿Qué significa el saldo registrado?',
    answer:
      'Es la suma de los ingresos que anotaste menos los gastos que anotaste. Es una referencia personal, no es el saldo de una cuenta bancaria.',
  },
  {
    question: '¿Cómo se calcula el progreso de un presupuesto?',
    answer:
      'Finanzas Claras suma los gastos que anotaste en esa categoría durante el mes actual y los compara con el límite que elegiste. Si falta una categoría, podés crearla desde Presupuestos.',
  },
  {
    question: '¿Aportar a una meta registra un gasto?',
    answer:
      'No. Sumar un aporte solo actualiza el avance de la meta. No modifica el saldo registrado ni crea un movimiento. Si querés reflejar dinero apartado en tu organización, podés anotarlo con el detalle que te resulte claro.',
  },
  {
    question: '¿Dónde se guardan mis datos?',
    answer:
      'En esta instalación, los datos se guardan en un archivo del backend dentro de la carpeta backend/data. El correo identifica tu cuenta y la contraseña se almacena protegida con un hash.',
  },
  {
    question: '¿Puedo corregir un movimiento que anoté mal?',
    answer:
      'Sí. En Movimientos, usá el ícono de edición en la fila correspondiente. También podés eliminar un registro que ya no necesites.',
  },
];

type SupportPageProps = {
  onNavigate: (page: PageKey) => void;
};

export default function SupportPage({ onNavigate }: SupportPageProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="support-page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Estamos para orientarte</div>
          <h1>Centro de ayuda</h1>
          <p>Ideas claras para usar Finanzas Claras y sentirte más en control.</p>
        </div>
      </header>

      <section className="support-hero">
        <div className="support-hero-icon">
          <CircleHelp size={23} />
        </div>
        <div>
          <span>EMPEZÁ POR LO SIMPLE</span>
          <h2>Ordenar tus finanzas no tiene que ser complicado.</h2>
          <p>
            Registrá lo que ya sabés, revisá el panorama y elegí un próximo paso
            posible.
          </p>
        </div>
        <div className="support-hero-art">
          <i />
          <i />
          <i />
          <span>l</span>
        </div>
      </section>

      <div className="support-layout">
        <div className="support-main">
          <section className="support-quickstart">
            <div className="support-section-title">
              <div>
                <h2>Un recorrido rápido</h2>
                <p>Cuatro pasos para hacer tu espacio propio.</p>
              </div>
              <BookOpen size={18} />
            </div>

            <div className="quickstart-steps">
              <button onClick={() => onNavigate('transactions')}>
                <span className="step-number">01</span>
                <span className="step-icon">
                  <WalletCards size={17} />
                </span>
                <span className="step-copy">
                  <strong>Anotá tus movimientos</strong>
                  <small>Empezá por un gasto reciente o un ingreso.</small>
                </span>
                <ArrowRight size={15} />
              </button>

              <button onClick={() => onNavigate('home')}>
                <span className="step-number">02</span>
                <span className="step-icon income-step">
                  <ArrowDownLeft size={17} />
                </span>
                <span className="step-copy">
                  <strong>Mirá el resumen</strong>
                  <small>Ingresos, gastos y saldo registrado.</small>
                </span>
                <ArrowRight size={15} />
              </button>

              <button onClick={() => onNavigate('budgets')}>
                <span className="step-number">03</span>
                <span className="step-icon budget-step">
                  <Lightbulb size={17} />
                </span>
                <span className="step-copy">
                  <strong>Elegí un límite</strong>
                  <small>Probá con una categoría que quieras cuidar.</small>
                </span>
                <ArrowRight size={15} />
              </button>

              <button onClick={() => onNavigate('goals')}>
                <span className="step-number">04</span>
                <span className="step-icon goal-step">
                  <Target size={17} />
                </span>
                <span className="step-copy">
                  <strong>Poné una meta</strong>
                  <small>Algo que te ilusione y te dé dirección.</small>
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>

          <section className="faq-section">
            <div className="support-section-title">
              <div>
                <h2>Preguntas frecuentes</h2>
                <p>Respuestas para volver cuando las necesites.</p>
              </div>
              <span className="faq-count">{questions.length} temas</span>
            </div>

            <div className="faq-list">
              {questions.map((item, index) => (
                <article
                  className={`faq-item ${open === index ? 'expanded' : ''}`}
                  key={item.question}
                >
                  <button
                    className="faq-question"
                    onClick={() => setOpen(open === index ? null : index)}
                    aria-expanded={open === index}
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={16} />
                  </button>
                  {open === index && <p>{item.answer}</p>}
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="support-aside">
          <section className="support-aside-card">
            <div className="aside-card-icon">
              <ArrowUpRight size={17} />
            </div>
            <h3>Un consejo amable</h3>
            <p>
              No hace falta registrar todo de una vez. Elegí una semana, anotá lo
              que recuerdes y seguí desde ahí.
            </p>
            <div className="aside-card-divider" />
            <span>La constancia se construye de a poco.</span>
          </section>

          <section className="support-aside-card support-aside-privacy">
            <div className="aside-card-icon">
              <CircleHelp size={17} />
            </div>
            <h3>¿Algo no te queda claro?</h3>
            <p>
              Empezá por estas preguntas o explorá cada sección. Siempre podés
              volver a esta guía desde el menú.
            </p>
            <button onClick={() => onNavigate('home')}>
              Volver al resumen <ArrowRight size={14} />
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}
