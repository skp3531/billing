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

  constructor() {
    super('RestoPOS_Offline');
    this.version(1).stores({
      categories: '_id',
      menuItems: '_id',
      offlineOrders: '++id, status'
    });
  }
}

export const db = new RestoPOSDB();
