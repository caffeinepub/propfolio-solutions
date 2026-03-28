import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Edit,
  Image,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend";
import { ExternalBlob } from "../../backend";
import {
  useCreateProduct,
  useDeleteProduct,
  useGetAllProducts,
  useUpdateProduct,
} from "../../hooks/useQueries";

const PLATFORMS = ["MT4", "MT5", "cTrader"];
const PRODUCT_TYPES = ["Indicator", "EA", "Cbot", "EA-Automated"];

const emptyProduct = (): Partial<Product> => ({
  name: "",
  description: "",
  platform: "MT4",
  tier: "Indicator",
  price: 30,
  features: [],
  isActive: true,
});

export default function AdminProducts() {
  const { data: products, isLoading } = useGetAllProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState<Partial<Product>>(emptyProduct());
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyProduct());
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setFormOpen(true);
  };

  const openEdit = (id: bigint, p: Product) => {
    setEditId(id);
    setForm({ ...p });
    setImageFile(null);
    setUploadProgress(0);
    setImagePreview(p.fileUrl ? p.fileUrl.getDirectURL() : null);
    setFormOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm((f) => ({
      ...f,
      features: [...(f.features ?? []), featureInput.trim()],
    }));
    setFeatureInput("");
  };

  const removeFeature = (i: number) =>
    setForm((f) => ({
      ...f,
      features: f.features?.filter((_, idx) => idx !== i),
    }));

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.price || form.price <= 0) {
      toast.error("Valid price is required");
      return;
    }
    setSaving(true);
    setUploadProgress(0);
    try {
      let fileUrl: ExternalBlob | undefined = form.fileUrl;

      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        fileUrl = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }

      const product: Product = {
        name: form.name!,
        description: form.description ?? "",
        platform: form.platform ?? "MT4",
        tier: form.tier ?? "Indicator",
        price: form.price!,
        features: form.features ?? [],
        isActive: form.isActive ?? true,
        ...(fileUrl ? { fileUrl } : {}),
      };

      if (editId !== null) {
        await updateProduct.mutateAsync({ id: editId, product });
        toast.success("Product updated!");
      } else {
        await createProduct.mutateAsync(product);
        toast.success("Product created!");
      }
      setFormOpen(false);
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div data-ocid="admin.products.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            Product Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit and manage trading software products.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 font-semibold"
          style={{
            background: "oklch(0.72 0.135 185)",
            color: "oklch(0.065 0.009 258)",
          }}
          data-ocid="admin.products.open_modal_button"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="admin.products.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (products?.length ?? 0) === 0 ? (
        <div
          className="rounded-xl border border-border p-12 text-center"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="admin.products.empty_state"
        >
          <p className="text-sm text-muted-foreground">
            No products yet. Create your first product.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(products ?? []).map(([id, p], i) => (
            <div
              key={id.toString()}
              className="rounded-xl border border-border p-5 flex flex-col"
              style={{ background: "oklch(0.115 0.022 245)" }}
              data-ocid={`admin.products.item.${i + 1}`}
            >
              {/* Product image thumbnail */}
              {p.fileUrl && (
                <div className="mb-3 rounded-lg overflow-hidden h-28">
                  <img
                    src={p.fileUrl.getDirectURL()}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground truncate">
                    {p.name}
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 mt-1">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "oklch(0.22 0.037 242)",
                        color: "oklch(0.725 0.022 242)",
                      }}
                    >
                      {p.platform}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "oklch(0.71 0.115 72 / 0.15)",
                        color: "oklch(0.71 0.115 72)",
                      }}
                    >
                      {p.tier}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${p.isActive ? "" : "opacity-50"}`}
                      style={{
                        background: p.isActive
                          ? "oklch(0.72 0.135 185 / 0.15)"
                          : "oklch(0.22 0.037 242)",
                        color: p.isActive
                          ? "oklch(0.72 0.135 185)"
                          : "oklch(0.725 0.022 242)",
                      }}
                    >
                      {p.isActive ? "Active" : "Coming Soon"}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-base font-extrabold"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    ${p.price}/mo
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${p.price * 10}/yr
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                {p.description}
              </p>
              {p.features.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {p.features.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {p.features.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{p.features.length - 3} more
                    </li>
                  )}
                </ul>
              )}
              <div className="flex gap-2 pt-3 border-t border-border/50">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(id, p)}
                  className="flex-1 gap-1 text-xs"
                  data-ocid={`admin.products.edit_button.${i + 1}`}
                >
                  <Edit className="w-3 h-3" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 gap-1 text-xs text-destructive hover:text-destructive"
                      data-ocid={`admin.products.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="border-border"
                    style={{ background: "oklch(0.115 0.022 245)" }}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">
                        Delete Product?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete &ldquo;{p.name}&rdquo;.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="admin.products.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(id)}
                        className="bg-destructive text-destructive-foreground"
                        data-ocid="admin.products.confirm_button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="border-border max-w-lg max-h-[90vh] overflow-y-auto"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="admin.products.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editId ? "Edit Product" : "New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Name */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Name
              </Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="PropFolio MT5 Pro Suite"
                className="bg-secondary border-border"
                data-ocid="admin.products.input"
              />
            </div>

            {/* Platform + Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Platform
                </Label>
                <Select
                  value={form.platform ?? "MT4"}
                  onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="admin.products.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(0.14 0.025 243)" }}
                  >
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Type
                </Label>
                <Select
                  value={form.tier ?? "Indicator"}
                  onValueChange={(v) => setForm((f) => ({ ...f, tier: v }))}
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="admin.products.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(0.14 0.025 243)" }}
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Monthly Price */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Monthly Price (USD)
              </Label>
              <Input
                type="number"
                value={form.price ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: Number.parseFloat(e.target.value),
                  }))
                }
                placeholder="30"
                className="bg-secondary border-border"
                data-ocid="admin.products.input"
              />
              {(form.price ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Yearly price:{" "}
                  <span style={{ color: "oklch(0.71 0.115 72)" }}>
                    ${(form.price ?? 0) * 10}/yr
                  </span>{" "}
                  (auto-calculated)
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Description
              </Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Brief product description"
                className="bg-secondary border-border min-h-[80px]"
                data-ocid="admin.products.textarea"
              />
            </div>

            {/* Features */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Features
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature"
                  className="bg-secondary border-border text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addFeature()}
                  data-ocid="admin.products.input"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addFeature}
                  className="flex-shrink-0"
                  data-ocid="admin.products.button"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {(form.features ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(form.features ?? []).map((f, i) => (
                    <span
                      key={f}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: "oklch(0.22 0.037 242)",
                        color: "oklch(0.944 0.012 244)",
                      }}
                    >
                      {f}
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="text-muted-foreground hover:text-destructive ml-1"
                        data-ocid="admin.products.button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Product Image */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Product Image
              </Label>
              <button
                type="button"
                className="rounded-lg border-2 border-dashed border-border p-4 text-center w-full hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: "oklch(0.09 0.012 252)" }}
                data-ocid="admin.products.dropzone"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-md">
                      <span className="text-xs text-white font-semibold">
                        Click to change
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Click to upload product image
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      PNG, JPG, WEBP accepted
                    </p>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                data-ocid="admin.products.upload_button"
              />
              {imageFile && (
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  {imageFile.name} — will upload on save
                </p>
              )}
              {saving && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Uploading image…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${uploadProgress}%`,
                        background: "oklch(0.72 0.135 185)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-start gap-3">
              <Switch
                checked={form.isActive ?? true}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                data-ocid="admin.products.switch"
              />
              <div>
                <Label className="text-sm text-foreground block">Active</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Uncheck to show &quot;Coming Soon&quot; badge on the Products
                  Page
                </p>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 font-semibold"
                style={{
                  background: "oklch(0.72 0.135 185)",
                  color: "oklch(0.065 0.009 258)",
                }}
                data-ocid="admin.products.save_button"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editId ? (
                  "Save Changes"
                ) : (
                  "Create Product"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="flex-1"
                data-ocid="admin.products.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
