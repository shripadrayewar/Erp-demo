import api from './client';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'PARTNER' | 'DISTRIBUTOR' | 'DIRECT';
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  creditLimit: number;
  paymentTerms: string;
  createdAt: string;
  _count?: { customers: number; salesOrders: number };
}

export const accountsApi = {
  getAll: (params?: Record<string, string>) => api.get<Account[]>('/accounts', { params }).then(r => r.data),
  getOne: (id: string) => api.get<Account>(`/accounts/${id}`).then(r => r.data),
  create: (data: Partial<Account>) => api.post<Account>('/accounts', data).then(r => r.data),
  update: (id: string, data: Partial<Account>) => api.patch<Account>(`/accounts/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/accounts/${id}`).then(r => r.data),
};
