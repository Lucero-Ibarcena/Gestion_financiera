export type User = {
  id: string;
  name: string;
  email: string;
};

export type TransactionKind = 'income' | 'expense';

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  kind: TransactionKind;
  category: string;
  date: string;
  createdAt: string;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  period: 'month';
  spent: number;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  dueDate?: string;
};

export type PageKey = 'home' | 'transactions' | 'budgets' | 'goals' | 'support';

export type Session = {
  accessToken: string;
  user: User;
};
