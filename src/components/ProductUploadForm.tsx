import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, Sparkles } from "lucide-react";

interface ProductUploadFormProps {
  onSubmit: (data: { images: string[]; name: string; description: string; categories: string[] }) => void;
  isLoading?: boolean;
  initialData?: { images: string[]; name: string; description: string; categories: string[] } | null;
}

const productCategories = [
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Health & Fitness",
  "Food & Beverage",
  "Technology & Gadgets",
  "Home & Living",
  "Travel & Experiences",
  "Pet Products",
  "Other",
];

const ProductUploadForm = ({ onSubmit, isLoading, initialData }: ProductUploadFormProps) => {
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [categories, setCategories] = useState<string[]>(initialData?.categories ?? []);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 || !name || !description || categories.length === 0) return;
    onSubmit({ images, name, description, categories });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-3">
        <Label className="text-foreground font-body font-medium">
          Product Images
        </Label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors bg-surface/30"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-body">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-muted-foreground/60 font-body mt-1">
            PNG, JPG up to 10MB each
          </p>
        </div>

        {images.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group"
              >
                <img
                  src={img}
                  alt={`Product ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="product-name" className="text-foreground font-body font-medium">
          Product Name
        </Label>
        <Input
          id="product-name"
          placeholder="e.g. Lumière Eau de Parfum"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-surface border-border font-body"
        />
      </div>

      {/* Categories - multi-select */}
      <div className="space-y-2">
        <Label className="text-foreground font-body font-medium">
          Product Categories
          <span className="text-muted-foreground font-normal ml-2 text-xs">
            (select all that apply)
          </span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {productCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                categories.includes(cat)
                  ? "bg-primary/20 border border-primary/40 text-foreground"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="product-desc" className="text-foreground font-body font-medium">
          Product Description
        </Label>
        <Textarea
          id="product-desc"
          placeholder="Describe your product, target audience, and what kind of sponsored content you're looking for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-surface border-border font-body min-h-[120px]"
          rows={5}
        />
      </div>

      <Button
        type="submit"
        disabled={images.length === 0 || !name || !description || categories.length === 0 || isLoading}
        className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-base py-6 shadow-gold hover:opacity-90 transition-opacity disabled:opacity-40"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Finding Best Matches...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Find Matching Creators
          </span>
        )}
      </Button>
    </form>
  );
};

export default ProductUploadForm;
