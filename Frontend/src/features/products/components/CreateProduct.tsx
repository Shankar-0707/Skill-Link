import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import { uploadToCloudinary } from "../../../shared/utils/uploadCloudinary";
import type { CreateProductPayload } from "../types";
import { 
  PackagePlus, 
  Loader2, 
  Info,
  Box,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  ChevronRight,
  UploadCloud,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { PRODUCT_CATEGORIES } from "../../../shared/constants/productCategories";

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<CreateProductPayload, 'price' | 'stockQuantity'> & { price?: number; stockQuantity?: number }>({
    name: "",
    description: "",
    category: "Others",
    price: undefined,
    stockQuantity: undefined,
    imageUrls: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stockQuantity") {
      const numValue = value === "" ? undefined : Number(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setFormData(prev => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...urls],
      }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await productsApi.create({
        ...formData,
        price: formData.price || 0,
        stockQuantity: formData.stockQuantity || 0
      } as CreateProductPayload);
      setIsSuccess(true);
      setTimeout(() => navigate("/organisation/products/see_all"), 2000);
    } catch (err: any) {
      console.error("Failed to create product", err);
      setError(err?.response?.data?.message || "An error occurred while creating the product. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/10">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Product Published</h2>
          <p className="text-muted-foreground font-medium max-w-sm">
            Your item is now live in your catalog. Returning to inventory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Breadcrumbs & Navigation */}
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground/60">
        <button onClick={() => navigate("/organisation")} className="hover:text-primary transition-colors">Dashboard</button>
        <ChevronRight size={14} />
        <button onClick={() => navigate("/organisation/products/see_all")} className="hover:text-primary transition-colors">Products</button>
        <ChevronRight size={14} />
        <span className="text-foreground font-semibold">New Product</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Create New Listing</h1>
          <p className="text-muted-foreground font-medium">Add a new product to your organization's store.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="rounded-xl px-6 h-12 font-bold"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl px-8 h-12 font-bold bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Publish Product"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Info size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Product Name
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Mechanical Keyboard G-500"
                  className="w-full h-12 px-4 bg-secondary/30 rounded-xl border border-border/80 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Describe your product in detail..."
                  className="w-full p-4 bg-secondary/30 rounded-xl border border-border/80 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Category
                </label>
                <div className="relative group">
                  <select
                    required
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-12 px-4 bg-secondary/30 rounded-xl border border-border/80 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium appearance-none cursor-pointer"
                  >
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform group-focus-within:rotate-180" />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              {/* <DollarSign size={20} className="text-primary" /> */}
              <h2 className="text-lg font-bold text-foreground">Inventory & Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Price (INR)
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors font-bold">
                    ₹
                  </div>
                  <input
                    required
                    type="number"
                    step="1"
                    name="price"
                    value={formData.price ?? ""}
                    onChange={handleChange}
                    className="w-full h-12 pl-10 pr-4 bg-secondary/30 rounded-xl border border-border/80 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Available Stock
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Box size={18} />
                  </div>
                  <input
                    required
                    type="number"
                    step="1"
                    name="stockQuantity"
                    value={formData.stockQuantity ?? ""}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 bg-secondary/30 rounded-xl border border-border/80 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* Images Section */}
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <ImageIcon size={18} className="text-primary" />
              <h2 className="text-base font-bold text-foreground">Product Media</h2>
            </div>

            <div className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Upload trigger button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/3 hover:bg-primary/5 hover:border-primary/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={26} className="animate-spin text-primary" />
                    <span className="text-xs font-bold text-primary">Uploading images...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={26} className="text-primary/60" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-foreground">Click to upload images</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG supported · Multiple files allowed</p>
                    </div>
                  </>
                )}
              </button>

              {uploadSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                  <CheckCircle2 size={14} />
                  <span>Images uploaded successfully!</span>
                </div>
              )}

              {/* Image Previews */}
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto no-scrollbar px-1">
                {formData.imageUrls?.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-border/50 bg-secondary/10">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!formData.imageUrls || formData.imageUrls.length === 0) && !isUploading && (
                  <div className="col-span-2 py-4 flex flex-col items-center justify-center text-muted-foreground/30 gap-1">
                    <ImageIcon size={28} strokeWidth={1.5} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">No Images Yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info / Help */}
          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <PackagePlus size={18} />
              <span className="font-bold text-sm">Listing Tips</span>
            </div>
            <ul className="space-y-3">
              {[
                "Use high-quality product images.",
                "Write clear, concise titles.",
                "Detail stock levels accurately.",
                "Set competitive pricing."
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed font-medium">
                  <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
