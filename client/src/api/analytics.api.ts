import api from './axios';

export const getDashboardMetrics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const getReportData = async (params?: { startDate?: string, endDate?: string }) => {
  const response = await api.get('/analytics/reports', { params });
  return response.data;
};

export const getInventoryReport = async () => {
  const response = await api.get('/analytics/reports/inventory');
  return response.data;
};

export const getProfitLossReport = async (params?: { startDate?: string, endDate?: string }) => {
  const response = await api.get('/analytics/reports/profit-loss', { params });
  return response.data;
};

export const getAdvancedReports = async (params?: { startDate?: string, endDate?: string }) => {
  const res = await api.get('/analytics/reports/advanced', { params });
  return res.data;
};
