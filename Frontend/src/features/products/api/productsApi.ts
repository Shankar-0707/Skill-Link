import { api } from '../../../services/api/api';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  AddProductImageDto,
  PaginatedResponse
} from '../types';

export const productsApi = {
  /**
   * List the authenticated organisation's own products
   */
  getMyProducts: async (params?: { page?: number; limit?: number; search?: string }) => {
    // Note: If the backend `/products/me/all` doesn't natively support `search`, 
    // it will be ignored by backend, so we will also handle client-side filtering.
    // However, attaching params for pagination.
    const response = await api.get<PaginatedResponse<Product>>('/products/me/all', { params });
    return response.data;
  },

  /**
   * Create a new product
   */
  createProduct: async (data: CreateProductDto) => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  /**
   * Update an existing product
   */
  updateProduct: async (id: string, data: UpdateProductDto) => {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Soft-delete a product
   */
  deleteProduct: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  },

  /**
   * Add an image URL to a product
   */
  addImage: async (productId: string, data: AddProductImageDto) => {
    const response = await api.post(`/products/${productId}/images`, data);
    return response.data;
  },

  /**
   * Remove an image from a product
   */
  removeImage: async (productId: string, imageId: string) => {
    const response = await api.delete<{ message: string }>(`/products/${productId}/images/${imageId}`);
    return response.data;
  }
};
