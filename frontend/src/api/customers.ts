import api from './client';

export interface Customer {
  id: string;
  code: string;
  name: string;
  accountId: string;
  account?: { id: string; name: string; code: string };
  type: 'ENTERPRISE' | 'SMB' | 'RESIDENTIAL';
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  contactPerson: string;
  industry?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export const customersApi = {
  getAll: (params?: Record<string, string>) => api.get<Customer[]>('/customers', { params }).then(r => r.data),
  getOne: (id: string) => api.get<Customer>(`/customers/${id}`).then(r => r.data),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data).then(r => r.data),
  update: (id: string, data: Partial<Customer>) => api.patch<Customer>(`/customers/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/customers/${id}`).then(r => r.data),
};
