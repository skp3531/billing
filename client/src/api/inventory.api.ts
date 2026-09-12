import api from './axios';

// Suppliers
export const getSuppliers = () => api.get('/suppliers');
export const createSupplier = (data: any) => api.post('/suppliers', data);
export const updateSupplier = (id: string, data: any) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id: string) => api.delete(`/suppliers/${id}`);

// Raw Materials (Inventory)
export const getRawMaterials = () => api.get('/raw-materials');
export const createRawMaterial = (data: any) => api.post('/raw-materials', data);
export const updateRawMaterial = (id: string, data: any) => api.put(`/raw-materials/${id}`, data);
export const deleteRawMaterial = (id: string) => api.delete(`/raw-materials/${id}`);

// Purchases
export const getPurchases = () => api.get('/purchases');
export const createPurchase = (data: any) => api.post('/purchases', data);
export const updatePurchaseStatus = (id: string, status: string) => api.patch(`/purchases/${id}/status`, { status });
