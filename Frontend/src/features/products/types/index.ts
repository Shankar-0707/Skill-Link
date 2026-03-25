export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  organisationId: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  _count?: {
    reservations: number;
  };
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrls?: string[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface AddProductImageDto {
  imageUrl: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
