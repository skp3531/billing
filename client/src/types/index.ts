export interface Organization {
  _id: string;
  name: string;
  logo?: string;
  phone: string;
  email: string;
  address: { street: string; city: string; state: string; pincode: string };
  gstin: string;
  active: boolean;
  recipe?: { rawMaterialId: string; quantity: number }[];
  modulesEnabled?: { tables: boolean; kitchen: boolean };
  printSize?: string;
}

export interface Outlet {
  _id: string;
  organizationId: string;
  name: string;
  code: string;
  address: { street: string; city: string; state: string; pincode: string };
  phone: string;
  gstin?: string;
  invoicePrefix: string;
  active: boolean;
  recipe?: { rawMaterialId: string; quantity: number }[];
}

export interface Role {
  _id: string;
  organizationId: string;
  name: string;
  permissions: string[];
  isSystem: boolean;
}

export interface User {
  _id: string;
  organizationId: string;
  outletIds: string[];
  name: string;
  email: string;
  phone?: string;
  roleId: string | Role;
  active: boolean;
  recipe?: { rawMaterialId: string; quantity: number }[];
  lastLogin?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  organizationId: string;
  roleName: string;
  permissions: string[];
  outletIds: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
  organization: Organization;
  outlets: Outlet[];
  currentOutlet: Outlet;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

export interface Category {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  active: boolean;
  recipe?: { rawMaterialId: string; quantity: number }[];
}

export interface MenuVariant {
  name: string;
  price?: number;
}

export interface ModifierOption {
  name: string;
  price: number;
  isVeg: boolean;
}

export interface ModifierGroup {
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface MenuItem {
  _id: string;
  organizationId: string;
  categoryId: string | Category;
  name: string;
  description?: string;
  shortCode: string;
  image?: string;
  basePrice: number;
  taxRate: number;
  taxType: 'INCLUSIVE' | 'EXCLUSIVE';
  hsnCode?: string;
  isVeg: boolean;
  spicinessLevel: number;
  variants: MenuVariant[];
  modifierGroups: ModifierGroup[];
  active: boolean;
  recipe?: { rawMaterialId: string; quantity: number }[];
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED' | 'placed' | 'accepted' | 'ready';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'PENDING' | 'SPLIT';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export interface OrderItemModifier {
  name: string;
  price: number;
}

export interface OrderItem {
  _id?: string;
  menuItemId: string | MenuItem;
  name: string;
  variant?: string | { name: string; price: number };
  modifiers: OrderItemModifier[];
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  itemTotal?: number;
  notes?: string;
  status?: 'PENDING' | 'PREPARED';
  station?: string;
}

export interface Order {
  priority?: 'NORMAL' | 'HIGH' | 'VIP';
  timeline?: { status: string; timestamp: Date; by?: string; note?: string }[];
  _id: string;
  organizationId: string;
  outletId: string;
  orderNumber: string;
  type: OrderType;
  orderType?: string;
  tableNumber?: string;
  customerId?: string;
  customer?: { name?: string; phone?: string; };
  items: OrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Customer {
  _id: string;
  organizationId: string;
  name: string;
  phone?: string;
  email?: string;
  totalSpent: number;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  organizationId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
