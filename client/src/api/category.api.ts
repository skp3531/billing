import api from './axios';
import { Category } from '../types';

export const getCategories = () =>
  api.get('/categories').then((r) => r.data.data as Category[]);

export const getCategory = (id: string) =>
  api.get(`/categories/${id}`).then((r) => r.data.data as Category);

export const createCategory = (data: Partial<Category>) =>
  api.post('/categories', data).then((r) => r.data.data as Category);

export const updateCategory = (id: string, data: Partial<Category>) =>
  api.put(`/categories/${id}`, data).then((r) => r.data.data as Category);

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`).then((r) => r.data);
