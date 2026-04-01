export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  createdAt: string;
}

export interface Product {
  imageUrl: any;
  category: any;
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  organisationId: string;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  organisation?: {
    businessName: string;
    businessType: string;
  };
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrls?: string[];
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface ListProductsParams {
  organisationId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
