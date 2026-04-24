import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import type { UpdateProductPayload } from "../types";
import { uploadToCloudinary } from "../../../shared/utils/uploadCloudinary";
import {
  PackagePlus,
  Loader2,
  Info,
  Box,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";

export const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<
    Omit<UpdateProductPayload, "price" | "stockQuantity"> & {
      price?: number;
      stockQuantity?: number;
    }
  >({
    name: "",
    description: "",
    price: undefined,
    stockQuantity: undefined,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const product = await productsApi.findOne(id);
        setFormData({
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          stockQuantity: product.stockQuantity,
        });
      } catch {
        setLoadError("Failed to load product. It may have been deleted.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stockQuantity") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await productsApi.update(id, {
        ...formData,
        price: formData.price ?? 0,
        stockQuantity: formData.stockQuantity ?? 0,
      } as UpdateProductPayload);
      setIsSuccess(true);
      setTimeout(() => navigate("/organisation/products/see_all"), 1800);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error?.response?.data?.message ||
          "An error occurred while updating the product."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-[1.5rem] flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <p className="font-bold text-foreground">{loadError}</p>
          <button
            onClick={() => navigate("/organisation/products/see_all")}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-bold"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/10">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Product Updated!
          </h2>
          <p className="text-muted-foreground font-medium max-w-sm">
            Your changes have been saved. Returning to inventory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground/60">
        <button
          onClick={() => navigate("/organisation")}
          className="hover:text-primary transition-colors"
        >
          Dashboard
        </button>
        <ChevronRight size={14} />
        <button
          onClick={() => navigate("/organisation/products/see_all")}
          className="hover:text-primary transition-colors"
        >
          Products
        </button>
        <ChevronRight size={14} />
        <span className="text-foreground font-semibold">Edit Product</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Edit Product
          </h1>
          <p className="text-muted-foreground font-medium">
            Update the details of your product listing.
          </p>
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
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Save Changes"
            )}
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
              <h2 className="text-lg font-bold text-foreground">
                Basic Information
              </h2>
            </div>
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Product Name
                </label>
                <input
                  required
                  name="name"
                  value={formData.name ?? ""}
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
                  value={formData.description ?? ""}
                  onChange={handleChange}
                  placeholder="Describe your product in detail..."
                  className="w-full p-4 bg-secondary/30 rounded-xl border border-border/80 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">
                Inventory & Pricing
              </h2>
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

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Add Image */}
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <ImageIcon size={18} className="text-primary" />
              <h2 className="text-base font-bold text-foreground">Add Image</h2>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!id || files.length === 0) return;
                setIsUploading(true);
                setError(null);
                try {
                  const urls = await Promise.all(files.map(uploadToCloudinary));
                  await Promise.all(urls.map((url) => productsApi.addImage(id, url)));
                  setUploadSuccess(true);
                  setTimeout(() => setUploadSuccess(false), 3000);
                } catch {
                  setError("Image upload failed. Please try again.");
                } finally {
                  setIsUploading(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }
              }}
            />

            {/* Upload trigger */}
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
                    <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG · Multiple files allowed</p>
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

           
          </div>

          {/* Tips */}
          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <PackagePlus size={18} />
              <span className="font-bold text-sm">Update Tips</span>
            </div>
            <ul className="space-y-3">
              {[
                "Update pricing to stay competitive.",
                "Keep stock levels accurate.",
                "Improve description for better discoverability.",
              ].map((tip, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs text-muted-foreground leading-relaxed font-medium"
                >
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
