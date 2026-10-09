import type { Budget, Goal, Transaction } from '../types';

function dateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function demoTransaction(
  id: string,
  monthOffset: number,
  day: number,
  description: string,
  amount: number,
  kind: Transaction['kind'],
  category: string,
): Transaction {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const lastAvailableDay = monthOffset === 0 ? now.getDate() : lastDayOfMonth;
  const transactionDate = new Date(
    year,
    month,
    Math.max(1, Math.min(day, lastAvailableDay)),
    12,
  );
  const date = dateString(transactionDate);

  return {
    id,
    description,
    amount,
    kind,
    category,
    date,
    createdAt: transactionDate.toISOString(),
  };
}

function createDemoTransactions(): Transaction[] {
  const transactions: Transaction[] = [];

  for (let monthOffset = -5; monthOffset <= 0; monthOffset += 1) {
    const monthNumber = monthOffset + 5;
    const currentMonth = monthOffset === 0;
    const suffix = String(monthNumber + 1).padStart(2, '0');

    transactions.push(
      demoTransaction(
        `demo-income-${suffix}`,
        monthOffset,
        1,
        'Ingreso mensual',
        1_420_000 + monthNumber * 12_000,
        'income',
        'Sueldo',
      ),
      demoTransaction(
        `demo-home-${suffix}`,
        monthOffset,
        2,
        'Alquiler',
        410_000 + monthNumber * 4_000,
        'expense',
        'Vivienda',
      ),
      demoTransaction(
        `demo-food-${suffix}`,
        monthOffset,
        5,
        'Supermercado',
        174_500 + monthNumber * 3_500,
        'expense',
        'Comida',
      ),
    );

    if (currentMonth) {
      transactions.push(
        demoTransaction(
          'demo-transport-current',
          monthOffset,
          7,
          'SUBE y viajes',
          38_500,
          'expense',
          'Transporte',
        ),
        demoTransaction(
          'demo-health-current',
          monthOffset,
          8,
          'Farmacia',
          22_200,
          'expense',
          'Salud',
        ),
        demoTransaction(
          'demo-leisure-current',
          monthOffset,
          9,
          'Salida con amigos',
          31_800,
          'expense',
          'Ocio',
        ),
      );
    } else {
      transactions.push(
        demoTransaction(
          `demo-transport-${suffix}`,
          monthOffset,
          12,
          'SUBE y viajes',
          61_000 + monthNumber * 1_500,
          'expense',
          'Transporte',
        ),
      );
    }
  }

  return transactions.sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export const demoTransactions = createDemoTransactions();

const currentMonthKey = dateString(new Date()).slice(0, 7);

function spentInCategory(category: string) {
  return demoTransactions
    .filter(
      (item) =>
        item.kind === 'expense' &&
        item.category === category &&
        item.date.slice(0, 7) === currentMonthKey,
    )
    .reduce((sum, item) => sum + item.amount, 0);
}

export const demoBudgets: Budget[] = [
  {
    id: 'demo-budget-home',
    category: 'Vivienda',
    limit: 460_000,
    period: 'month',
    spent: spentInCategory('Vivienda'),
  },
  {
    id: 'demo-budget-food',
    category: 'Comida',
    limit: 260_000,
    period: 'month',
    spent: spentInCategory('Comida'),
  },
  {
    id: 'demo-budget-transport',
    category: 'Transporte',
    limit: 90_000,
    period: 'month',
    spent: spentInCategory('Transporte'),
  },
  {
    id: 'demo-budget-leisure',
    category: 'Ocio',
    limit: 85_000,
    period: 'month',
    spent: spentInCategory('Ocio'),
  },
];

export const demoGoals: Goal[] = [
  {
    id: 'demo-goal-travel',
    name: 'Viaje al sur',
    target: 1_200_000,
    current: 685_000,
    dueDate: `${new Date().getFullYear()}-12-20`,
  },
  {
    id: 'demo-goal-safety',
    name: 'Fondo de tranquilidad',
    target: 800_000,
    current: 320_000,
  },
];
