import api from './axios';
import { MenuItem } from '../types';

export const getMenuItems = (params?: Record<string, any>) =>
  api.get('/menu-items', { params }).then((r) => r.data.data as MenuItem[]);

export const getMenuItem = (id: string) =>
  api.get(`/menu-items/${id}`).then((r) => r.data.data as MenuItem);

export const createMenuItem = (data: Partial<MenuItem>) =>
  api.post('/menu-items', data).then((r) => r.data.data as MenuItem);

export const updateMenuItem = (id: string, data: Partial<MenuItem>) =>
  api.put(`/menu-items/${id}`, data).then((r) => r.data.data as MenuItem);

export const deleteMenuItem = (id: string) =>
  api.delete(`/menu-items/${id}`).then((r) => r.data);
