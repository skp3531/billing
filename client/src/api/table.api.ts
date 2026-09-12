import api from './axios';

export interface Table {
  _id: string;
  organizationId: string;
  outletId?: string;
  name: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  createdAt: string;
  updatedAt: string;
}

export const getTables = async () => {
  const response = await api.get('/tables');
  return response.data;
};

export const createTable = async (data: Partial<Table>) => {
  const response = await api.post('/tables', data);
  return response.data;
};

export const updateTable = async (id: string, data: Partial<Table>) => {
  const response = await api.put(`/tables/${id}`, data);
  return response.data;
};

export const deleteTable = async (id: string) => {
  const response = await api.delete(`/tables/${id}`);
  return response.data;
};
