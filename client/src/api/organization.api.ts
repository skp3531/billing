import api from './axios';
import { Organization } from '../types';

export const getOrganization = () =>
  api.get('/organizations/me').then(r => r.data.data as Organization);

export const updateOrganization = (data: Partial<{
  name: string;
  logo: string;
  phone: string;
  email: string;
  gstin: string;
  address: { street: string; city: string; state: string; pincode: string };
}>) => api.put('/organizations/me', data).then(r => r.data.data as Organization);

export const setupOrganization = (data: {
  organization: {
    name: string;
    email: string;
    phone: string;
    gstin?: string;
    address?: { street: string; city: string; state: string; pincode: string };
  };
  outlet: {
    name: string;
    code: string;
    invoicePrefix: string;
    phone?: string;
  };
}) => api.post('/organizations/setup', data).then(r => r.data.data);
