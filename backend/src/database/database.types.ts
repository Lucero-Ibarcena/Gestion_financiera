export type AccountUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type TransactionKind = 'income' | 'expense';

export type MoneyTransaction = {
  id: string;
  userId: string;
  description: string;
  amount: number;
  kind: TransactionKind;
  category: string;
  date: string;
  createdAt: string;
};

export type Budget = {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'month';
  createdAt: string;
};

export type SavingsGoal = {
  id: string;
  userId: string;
  name: string;
  target: number;
  current: number;
  dueDate?: string;
  createdAt: string;
};

export type DatabaseState = {
  users: AccountUser[];
  transactions: MoneyTransaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
};
