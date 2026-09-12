import api from './axios';
import { Order } from '../types';

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderApi = {
  createOrder: async (orderData: Partial<Order>) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async (outletId: string, options: { filter?: 'active' | 'past', status?: string, page?: number, limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (outletId) params.append('outletId', outletId);
    if (options.filter) params.append('filter', options.filter);
    if (options.status) params.append('status', options.status);
    params.append('page', (options.page || 1).toString());
    params.append('limit', (options.limit || 50).toString());
    
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data as PaginatedResponse<Order>;
  },

  getOrderById: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data as Order;
  },

  updateOrderStatus: async (orderId: string, status: string, paymentStatus?: string) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status, paymentStatus });
    return response.data.data as Order;
  },
  
  updateOrderItemStatus: async (orderId: string, itemId: string, status: string) => {
    const response = await api.patch(`/orders/${orderId}/items/${itemId}/status`, { status });
    return response.data.data as Order;
  }
};
