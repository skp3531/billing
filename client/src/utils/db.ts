import Dexie, { Table } from 'dexie';
import { Category, MenuItem } from '../types';

export interface OfflineOrder {
  id?: string;
  payload: any;
  status: 'queued' | 'synced' | 'failed';
  createdAt: number;
}

export class RestoPOSDB extends Dexie {
  categories!: Table<Category, string>;
  menuItems!: Table<MenuItem, string>;
  offlineOrders!: Table<OfflineOrder, string>;
  holdBills!: Table<any>;

  constructor() {
    super('RestoPOS_Offline');
    this.version(2).stores({
      categories: '_id',
      menuItems: '_id',
      offlineOrders: '++id, status',
      holdBills: '++id, orderType, createdAt'
    });
  }
}

export const db = new RestoPOSDB();
