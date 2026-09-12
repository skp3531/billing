import api from './axios';
import { Customer } from '../types';

export const getCustomers = () =>
  api.get('/customers').then((r) => r.data.data as Customer[]);

export const searchCustomers = (search: string) =>
  api.get('/customers', { params: { search } }).then((r) => r.data.data as Customer[]);

export const createCustomer = (data: Partial<Customer>) =>
  api.post('/customers', data).then((r) => r.data.data as Customer);

export const updateCustomer = (id: string, data: Partial<Customer>) =>
  api.put(`/customers/${id}`, data).then((r) => r.data.data as Customer);

export const deleteCustomer = (id: string) =>
  api.delete(`/customers/${id}`).then((r) => r.data);
