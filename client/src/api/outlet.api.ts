import api from './axios';
import { Outlet } from '../types';

export const getOutlets = () => api.get('/outlets').then(r => r.data.data as Outlet[]);

export const getOutlet = (id: string) => api.get(`/outlets/${id}`).then(r => r.data.data as Outlet);

export const createOutlet = (data: {
  name: string;
  code: string;
  invoicePrefix: string;
  phone?: string;
  gstin?: string;
  address?: { street: string; city: string; state: string; pincode: string };
}) => api.post('/outlets', data).then(r => r.data.data as Outlet);

export const updateOutlet = (id: string, data: Partial<{
  name: string;
  code: string;
  invoicePrefix: string;
  phone: string;
  gstin: string;
  active: boolean;
  address: { street: string; city: string; state: string; pincode: string };
}>) => api.put(`/outlets/${id}`, data).then(r => r.data.data as Outlet);
