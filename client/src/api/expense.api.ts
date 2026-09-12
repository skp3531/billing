import api from './axios';
import { Expense } from '../types';

export const getExpenses = () =>
  api.get('/expenses').then((r) => r.data.data as Expense[]);

export const createExpense = (data: Partial<Expense>) =>
  api.post('/expenses', data).then((r) => r.data.data as Expense);

export const updateExpense = (id: string, data: Partial<Expense>) =>
  api.put(`/expenses/${id}`, data).then((r) => r.data.data as Expense);

export const deleteExpense = (id: string) =>
  api.delete(`/expenses/${id}`).then((r) => r.data);
