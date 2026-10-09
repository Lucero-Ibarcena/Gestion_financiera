import type { Budget, Goal, Session, Transaction, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'luma.accessToken';

function token() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(value: string | null) {
  if (value) {
    localStorage.setItem(TOKEN_KEY, value);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const currentToken = token();
  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('No se pudo conectar con la API. Revisá que el backend esté iniciado.');
  }

  if (!response.ok) {
    let message = 'No se pudo completar la solicitud.';

    try {
      const body = await response.json();
      message = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message || message;
    } catch {
      // La respuesta puede no incluir JSON.
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<Session>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<Session>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request<User>('/auth/me'),
  transactions: () => request<Transaction[]>('/transactions'),

  addTransaction: (payload: Omit<Transaction, 'id' | 'createdAt'>) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTransaction: (id: string, payload: Omit<Transaction, 'id' | 'createdAt'>) =>
    request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteTransaction: (id: string) =>
    request(`/transactions/${id}`, { method: 'DELETE' }),

  budgets: () => request<Budget[]>('/budgets'),

  addBudget: (payload: { category: string; limit: number; period: 'month' }) =>
    request<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteBudget: (id: string) => request(`/budgets/${id}`, { method: 'DELETE' }),
  goals: () => request<Goal[]>('/goals'),

  addGoal: (payload: {
    name: string;
    target: number;
    current: number;
    dueDate?: string;
  }) =>
    request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  contributeGoal: (id: string, amount: number) =>
    request<Goal>(`/goals/${id}/contributions`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  deleteGoal: (id: string) => request(`/goals/${id}`, { method: 'DELETE' }),
};
