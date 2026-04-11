export const PRODUCT_CATEGORIES = [
  "Hand Tools",
  "Power Tools",
  "Construction Materials",
  "Electrical Supplies",
  "Plumbing Supplies",
  "Safety Gear",
  "Hardware & Fasteners",
  "Others"
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
