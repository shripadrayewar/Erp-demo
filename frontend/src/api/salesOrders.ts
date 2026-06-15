import api from './client';

export interface OrderLineItem {
  id: string;
  productId: string;
  product?: { id: string; name: string; sku: string; category?: { name: string } };
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  accountId: string;
  account?: { id: string; name: string; code: string };
  customerId: string;
  customer?: { id: string; name: string; code: string };
  status: 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  deliveryDate?: string;
  billingAddress: string;
  shippingAddress: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  lineItems?: OrderLineItem[];
  _count?: { lineItems: number };
  createdAt: string;
}

export interface CreateOrderPayload {
  accountId: string;
  customerId: string;
  deliveryDate?: string;
  billingAddress: string;
  shippingAddress: string;
  taxRate?: number;
  notes?: string;
  lineItems: { productId: string; quantity: number; unitPrice: number; discount?: number }[];
}

export const salesOrdersApi = {
  getAll: (params?: Record<string, string>) => api.get<SalesOrder[]>('/sales-orders', { params }).then(r => r.data),
  getOne: (id: string) => api.get<SalesOrder>(`/sales-orders/${id}`).then(r => r.data),
  create: (data: CreateOrderPayload) => api.post<SalesOrder>('/sales-orders', data).then(r => r.data),
  updateStatus: (id: string, status: string) => api.patch<SalesOrder>(`/sales-orders/${id}/status`, { status }).then(r => r.data),
  remove: (id: string) => api.delete(`/sales-orders/${id}`).then(r => r.data),
};
