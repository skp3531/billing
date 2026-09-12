import api from './axios';
import { Role } from '../types';

export const getRoles = () => api.get('/roles').then(r => r.data.data as Role[]);

export const getRole = (id: string) => api.get(`/roles/${id}`).then(r => r.data.data as Role);

export const createRole = (data: {
  name: string;
  permissions: string[];
}) => api.post('/roles', data).then(r => r.data.data as Role);

export const updateRole = (id: string, data: Partial<{
  name: string;
  permissions: string[];
}>) => api.put(`/roles/${id}`, data).then(r => r.data.data as Role);
