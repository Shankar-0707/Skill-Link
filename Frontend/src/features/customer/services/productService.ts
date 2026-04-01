import { productsApi } from "../../products/api/productsApi";
import type { ListProductsParams, PaginatedProducts, Product } from "../../products/types";

/**
 * Customer-facing product service.
 * Wraps the shared productsApi but tailored for customer needs.
 */
export const productService = {
  /**
   * Browse all active products from all organisations.
   */
  browseProducts: async (params?: ListProductsParams): Promise<PaginatedProducts> => {
    return productsApi.findAll(params);
  },

  /**
   * Get specific product details by ID.
   */
  getProductDetail: async (id: string): Promise<Product> => {
    return productsApi.findOne(id);
  }
};
