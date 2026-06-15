import api from './client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: { id: string; name: string };
  type: 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION';
  unitPrice: number;
  costPrice: number;
  unit: string;
  stockQty: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export const inventoryApi = {
  getCategories: () => api.get<Category[]>('/inventory/categories').then(r => r.data),
  createCategory: (data: Partial<Category>) => api.post<Category>('/inventory/categories', data).then(r => r.data),
  updateCategory: (id: string, data: Partial<Category>) => api.patch<Category>(`/inventory/categories/${id}`, data).then(r => r.data),
  deleteCategory: (id: string) => api.delete(`/inventory/categories/${id}`).then(r => r.data),

  getProducts: (params?: Record<string, string>) => api.get<Product[]>('/inventory/products', { params }).then(r => r.data),
  getProduct: (id: string) => api.get<Product>(`/inventory/products/${id}`).then(r => r.data),
  createProduct: (data: Partial<Product>) => api.post<Product>('/inventory/products', data).then(r => r.data),
  updateProduct: (id: string, data: Partial<Product>) => api.patch<Product>(`/inventory/products/${id}`, data).then(r => r.data),
  deleteProduct: (id: string) => api.delete(`/inventory/products/${id}`).then(r => r.data),
};
