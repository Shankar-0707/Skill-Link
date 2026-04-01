import { api } from '../../../services/api/api';
import type { 
  Product, 
  CreateProductPayload, 
  UpdateProductPayload, 
  ListProductsParams, 
  PaginatedProducts,
  ProductImage
} from '../types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

function unwrapResponse<T>(response: ApiEnvelope<T> | T): T {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'success' in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
}

export const productsApi = {
  /**
   * List all active products with filters (public)
   */
  findAll: async (params?: ListProductsParams): Promise<PaginatedProducts> => {
    const response = await api.get('/products', { params });
    return unwrapResponse<PaginatedProducts>(response.data);
  },

  /**
   * Get a single product by ID (public)
   */
  findOne: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return unwrapResponse<Product>(response.data);
  },

  /**
   * List the authenticated org's own products (all states)
   */
  getMyProducts: async (params?: ListProductsParams): Promise<PaginatedProducts> => {
    const response = await api.get('/products/me/all', { params });
    return unwrapResponse<PaginatedProducts>(response.data);
  },

  /**
   * Create a new product
   */
  create: async (data: CreateProductPayload): Promise<Product> => {
    const response = await api.post('/products', data);
    return unwrapResponse<Product>(response.data);
  },

  /**
   * Update a product
   */
  update: async (id: string, data: UpdateProductPayload): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, data);
    return unwrapResponse<Product>(response.data);
  },

  /**
   * Soft-delete a product
   */
  remove: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return unwrapResponse<{ message: string }>(response.data);
  },

  /**
   * Add an image URL to a product
   */
  addImage: async (id: string, imageUrl: string): Promise<ProductImage> => {
    const response = await api.post(`/products/${id}/images`, { imageUrl });
    return unwrapResponse<ProductImage>(response.data);
  },

  /**
   * Upload a product image file to Cloudinary
   */
  uploadImage: async (id: string, file: File): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/products/${id}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrapResponse<ProductImage>(response.data);
  },

  /**
   * Remove an image from a product
   */
  removeImage: async (id: string, imageId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/products/${id}/images/${imageId}`);
    return unwrapResponse<{ message: string }>(response.data);
  },
};
