/** Max size for a single product image upload (bytes). */
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const PRODUCT_IMAGE_ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
