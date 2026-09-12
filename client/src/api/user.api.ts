import api from './axios';
import { User } from '../types';

export const getUsers = () => api.get('/users').then(r => r.data.data as User[]);

export const getUser = (id: string) => api.get(`/users/${id}`).then(r => r.data.data as User);

export const createUser = (data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  roleId: string;
  outletIds: string[];
}) => api.post('/users', data).then(r => r.data.data as User);

export const updateUser = (id: string, data: Partial<{
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  outletIds: string[];
  active: boolean;
}>) => api.put(`/users/${id}`, data).then(r => r.data.data as User);

export const deactivateUser = (id: string) =>
  api.delete(`/users/${id}`).then(r => r.data.data as User);
