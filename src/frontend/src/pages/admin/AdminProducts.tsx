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
  DialogTrigger,
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
import { Check, Edit, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend";
import {
  useCreateProduct,
  useDeleteProduct,
  useGetAllProducts,
  useGetLifetimePrices,
  useSetLifetimePrice,
  useUpdateProduct,
} from "../../hooks/useQueries";
import {
  useGetAllProductTrialSettings,
  useSetProductTrialSettings,
} from "../../hooks/useTrialQueries";

const PLATFORMS = ["MT4", "MT5", "cTrader"];
const TIERS = ["PropLite", "PropTrader", "PropPro", "PropEnterprise"];

const emptyProduct = (): Partial<Product> => ({
  name: "",
  description: "",
  platform: "MT4",
  tier: "PropLite",
  price: 49,
  features: [],
  isActive: true,
});

export default function AdminProducts() {
  const { data: products, isLoading } = useGetAllProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { data: lifetimePrices } = useGetLifetimePrices();
  const setLifetimePrice = useSetLifetimePrice();
  const { data: trialSettings } = useGetAllProductTrialSettings();
  const setProductTrialSettings = useSetProductTrialSettings();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState<Partial<Product>>(emptyProduct());
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [lifetimePriceInput, setLifetimePriceInput] = useState<string>("");
  const [trialEnabled, setTrialEnabled] = useState(false);
  const [trialDurationDays, setTrialDurationDays] = useState<string>("7");

  const openCreate = () => {
    setEditId(null);
    setForm(emptyProduct());
    setLifetimePriceInput("");
    setTrialEnabled(false);
    setTrialDurationDays("7");
    setFormOpen(true);
  };
  const openEdit = (id: bigint, p: Product) => {
    setEditId(id);
    setForm({ ...p });
    const existingLt = lifetimePrices?.find(([lid]) => lid === id);
    setLifetimePriceInput(existingLt ? String(existingLt[1]) : "");
    const existingTrial = trialSettings?.find(([tid]) => tid === id);
    setTrialEnabled(existingTrial ? existingTrial[1].trialEnabled : false);
    setTrialDurationDays(
      existingTrial ? String(existingTrial[1].trialDurationDays) : "7",
    );
    setFormOpen(true);
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
    const product: Product = {
      name: form.name!,
      description: form.description ?? "",
      platform: form.platform ?? "MT4",
      tier: form.tier ?? "PropLite",
      price: form.price!,
      features: form.features ?? [],
      isActive: form.isActive ?? true,
    };
    try {
      if (editId !== null) {
        await updateProduct.mutateAsync({ id: editId, product });
        // Save lifetime price separately
        const ltPrice = lifetimePriceInput
          ? Number.parseFloat(lifetimePriceInput)
          : 0;
        await setLifetimePrice.mutateAsync({
          productId: editId,
          price: ltPrice,
        });
        await setProductTrialSettings.mutateAsync({
          productId: editId,
          trialEnabled,
          trialDurationDays: BigInt(Number(trialDurationDays) || 7),
        });
        toast.success("Product updated!");
      } else {
        const newId = await createProduct.mutateAsync(product);
        // Save lifetime price for new product
        const ltPrice = lifetimePriceInput
          ? Number.parseFloat(lifetimePriceInput)
          : 0;
        if (ltPrice > 0) {
          await setLifetimePrice.mutateAsync({
            productId: newId,
            price: ltPrice,
          });
        }
        if (trialEnabled) {
          await setProductTrialSettings.mutateAsync({
            productId: newId,
            trialEnabled,
            trialDurationDays: BigInt(Number(trialDurationDays) || 7),
          });
        }
        toast.success("Product created!");
      }
      setFormOpen(false);
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
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
              className="rounded-xl border border-border p-5"
              style={{ background: "oklch(0.115 0.022 245)" }}
              data-ocid={`admin.products.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-sm font-bold text-foreground">
                    {p.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
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
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div
                  className="text-lg font-extrabold"
                  style={{ color: "oklch(0.71 0.115 72)" }}
                >
                  ${p.price}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {p.description}
              </p>
              {p.features.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {p.features.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <Check className="w-3 h-3 text-primary" />
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
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Name
              </Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="PropTrader MT5"
                className="bg-secondary border-border"
                data-ocid="admin.products.input"
              />
            </div>
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
                  Tier
                </Label>
                <Select
                  value={form.tier ?? "PropLite"}
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
                    {TIERS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Price (USD/month)
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
                placeholder="49"
                className="bg-secondary border-border"
                data-ocid="admin.products.input"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Lifetime Price (USD, one-time) — leave blank to hide
              </Label>
              <Input
                type="number"
                value={lifetimePriceInput}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    lifetimePrice: e.target.value
                      ? Number.parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="e.g. 299 (optional)"
                className="bg-secondary border-border"
                data-ocid="admin.products.lifetime_price.input"
              />
            </div>
            <div
              className="rounded-xl border border-border p-4 space-y-3"
              style={{ background: "oklch(0.09 0.012 252)" }}
            >
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Free Trial Settings
              </Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={trialEnabled}
                  onCheckedChange={setTrialEnabled}
                  data-ocid="admin.products.trial.switch"
                />
                <span className="text-sm text-foreground">
                  Enable Free Trial
                </span>
              </div>
              {trialEnabled && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Trial Duration (days)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={trialDurationDays}
                    onChange={(e) => setTrialDurationDays(e.target.value)}
                    placeholder="e.g. 7"
                    className="bg-secondary border-border w-32"
                    data-ocid="admin.products.trial_duration.input"
                  />
                </div>
              )}
            </div>
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
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive ?? true}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                data-ocid="admin.products.switch"
              />
              <Label className="text-sm text-foreground">
                Active (visible to users)
              </Label>
            </div>
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
