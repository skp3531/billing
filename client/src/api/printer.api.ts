import api from './axios';

export interface PrinterSetting {
  _id: string;
  organizationId: string;
  outletId: string;
  type: 'RECEIPT' | 'KOT';
  paperSize: '58mm' | '80mm';
  headerText?: string;
  footerText?: string;
  showLogo: boolean;
  printCopies: number;
}

export const printerApi = {
  getSettings: async (outletId: string) => {
    const response = await api.get(`/printers?outletId=${outletId}`);
    return response.data.data as PrinterSetting[];
  },
  updateSetting: async (id: string, data: Partial<PrinterSetting>) => {
    const response = await api.put(`/printers/${id}`, data);
    return response.data.data as PrinterSetting;
  }
};
