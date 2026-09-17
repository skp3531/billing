import api from './axios';

export interface CashRegister {
  _id: string;
  openedAt: string;
  openedBy: { name: string; email?: string } | string;
  closedAt?: string;
  closedBy?: { name: string; email?: string } | string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  totalCashSales: number;
  totalCashIn: number;
  totalCashOut: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export const cashRegisterApi = {
  getCurrent: async (outletId: string): Promise<CashRegister | null> => {
    const res = await api.get('/cash-registers/current', { params: { outletId } });
    return res.data.data;
  },

  open: async (outletId: string, openingBalance: number, notes?: string): Promise<CashRegister> => {
    const res = await api.post('/cash-registers/open', { openingBalance, notes }, { params: { outletId } });
    return res.data.data;
  },

  close: async (outletId: string, closingBalance: number, notes?: string): Promise<CashRegister> => {
    const res = await api.post('/cash-registers/close', { closingBalance, notes }, { params: { outletId } });
    return res.data.data;
  },

  getHistory: async (outletId: string): Promise<CashRegister[]> => {
    const res = await api.get('/cash-registers/history', { params: { outletId } });
    return res.data.data;
  }
};
