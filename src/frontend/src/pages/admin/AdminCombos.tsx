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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Layers, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type Combo,
  createCombo,
  loadCombos,
  saveCombos,
} from "../../lib/combos";

const ALL_PRODUCTS = [
  { name: "PropFolio Professional Traders Suite", price: 30 },
  { name: "PropFolio Peak Formation Dashboard", price: 25 },
  { name: "PropFolio SMC Powerhouse", price: 25 },
  { name: "PropFolio Advanced Currency Strength", price: 20 },
  { name: "PropFolio GOLD RUSH", price: 49 },
  { name: "PropFolio Liquidity Sweeps", price: 29 },
  { name: "PropFolio Sentiment Analysis", price: 35 },
  { name: "PropFolio Universal IndicatorEA", price: 59 },
];

function emptyForm(): Omit<Combo, "id" | "createdAt"> {
  return {
    name: "",
    tagline: "",
    productNames: [],
    discountType: "percent",
    discountValue: 10,
    isFeatured: false,
    isActive: true,
  };
}

export default function AdminCombos() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    setCombos(loadCombos());
  }, []);

  const persist = (next: Combo[]) => {
    saveCombos(next);
    setCombos(next);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (combo: Combo) => {
    setEditId(combo.id);
    setForm({
      name: combo.name,
      tagline: combo.tagline,
      productNames: combo.productNames,
      discountType: combo.discountType,
      discountValue: combo.discountValue,
      isFeatured: combo.isFeatured,
      isActive: combo.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Combo name is required");
      return;
    }
    if (form.productNames.length < 2) {
      toast.error("Select at least 2 products for a combo");
      return;
    }
    if (form.discountValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    if (editId) {
      persist(combos.map((c) => (c.id === editId ? { ...c, ...form } : c)));
      toast.success("Combo updated");
    } else {
      persist([...combos, createCombo(form)]);
      toast.success("Combo created");
    }
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    persist(combos.filter((c) => c.id !== id));
    toast.success("Combo deleted");
  };

  const toggleActive = (id: string, val: boolean) => {
    persist(combos.map((c) => (c.id === id ? { ...c, isActive: val } : c)));
  };

  const toggleFeatured = (id: string, val: boolean) => {
    persist(combos.map((c) => (c.id === id ? { ...c, isFeatured: val } : c)));
  };

  const computeTotalPrice = (productNames: string[]) =>
    productNames.reduce((sum, name) => {
      const p = ALL_PRODUCTS.find((x) => x.name === name);
      return sum + (p?.price ?? 0);
    }, 0);

  const computeDiscountedPrice = (combo: Combo | typeof form) => {
    const total = computeTotalPrice(combo.productNames);
    if (combo.discountType === "percent") {
      return Math.max(
        0,
        total - Math.round((total * combo.discountValue) / 100),
      );
    }
    return Math.max(0, total - combo.discountValue);
  };

  const toggleProduct = (name: string) => {
    setForm((prev) => ({
      ...prev,
      productNames: prev.productNames.includes(name)
        ? prev.productNames.filter((n) => n !== name)
        : [...prev.productNames, name],
    }));
  };

  return (
    <div className="space-y-6" data-ocid="admin.combos.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
            }}
          >
            <Layers
              className="w-5 h-5"
              style={{ color: "oklch(0.065 0.009 258)" }}
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">
              Combo Builder
            </h1>
            <p className="text-xs text-muted-foreground">
              Create and manage product bundle deals
            </p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="font-bold text-sm rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
            color: "oklch(0.065 0.009 258)",
            border: "none",
          }}
          data-ocid="admin.combos.create_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Combo
        </Button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "oklch(0.09 0.012 252)",
          borderColor: "oklch(0.22 0.037 242)",
        }}
      >
        {combos.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="admin.combos.empty_state"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "oklch(0.12 0.018 252)" }}
            >
              <Layers className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              No combos yet
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first bundle deal to boost sales.
            </p>
            <Button
              onClick={openCreate}
              size="sm"
              variant="outline"
              className="border-border"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Combo
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "oklch(0.22 0.037 242)" }}>
                <TableHead className="text-muted-foreground text-xs">
                  Name
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Products
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Discount
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Final Price
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Featured
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Active
                </TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combos.map((combo, i) => (
                <TableRow
                  key={combo.id}
                  style={{ borderColor: "oklch(0.22 0.037 242 / 0.5)" }}
                  data-ocid={`admin.combos.row.item.${i + 1}`}
                >
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {combo.name}
                      </p>
                      {combo.tagline && (
                        <p className="text-xs text-muted-foreground">
                          {combo.tagline}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {combo.productNames.map((n) => (
                        <Badge
                          key={n}
                          variant="outline"
                          className="text-[10px] border-border text-muted-foreground"
                        >
                          {n.replace("PropFolio ", "")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-bold text-sm"
                      style={{ color: "oklch(0.71 0.115 72)" }}
                    >
                      {combo.discountType === "percent"
                        ? `${combo.discountValue}% off`
                        : `$${combo.discountValue} off`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-foreground">
                      ${computeDiscountedPrice(combo)}/mo
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={combo.isFeatured}
                      onCheckedChange={(v) => toggleFeatured(combo.id, v)}
                      data-ocid={`admin.combos.featured.switch.${i + 1}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={combo.isActive}
                      onCheckedChange={(v) => toggleActive(combo.id, v)}
                      data-ocid={`admin.combos.active.switch.${i + 1}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(combo)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        data-ocid={`admin.combos.edit_button.${i + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            data-ocid={`admin.combos.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          style={{
                            background: "oklch(0.09 0.012 252)",
                            borderColor: "oklch(0.22 0.037 242)",
                          }}
                          data-ocid="admin.combos.dialog"
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">
                              Delete Combo
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Are you sure you want to delete{" "}
                              <strong className="text-foreground">
                                {combo.name}
                              </strong>
                              ? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              className="border-border"
                              data-ocid="admin.combos.cancel_button"
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(combo.id)}
                              className="bg-destructive text-destructive-foreground"
                              data-ocid="admin.combos.confirm_button"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          style={{
            background: "oklch(0.09 0.012 252)",
            borderColor: "oklch(0.22 0.037 242)",
          }}
          data-ocid="admin.combos.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editId ? "Edit Combo" : "Create Combo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Combo Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Pro-Duo Combo"
                className="border-border bg-background"
                data-ocid="admin.combos.name.input"
              />
            </div>

            {/* Tagline */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tagline
              </Label>
              <Input
                value={form.tagline}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tagline: e.target.value }))
                }
                placeholder="e.g. The Essential Pair"
                className="border-border bg-background"
                data-ocid="admin.combos.tagline.input"
              />
            </div>

            {/* Products */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Included Products * (select at least 2)
              </Label>
              <div
                className="rounded-xl border p-3 space-y-2"
                style={{ borderColor: "oklch(0.22 0.037 242)" }}
              >
                {ALL_PRODUCTS.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => toggleProduct(p.name)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && toggleProduct(p.name)
                    }
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <Checkbox
                      checked={form.productNames.includes(p.name)}
                      onCheckedChange={() => toggleProduct(p.name)}
                      data-ocid="admin.combos.product.checkbox"
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">
                      {p.name.replace("PropFolio ", "")}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ${p.price}/mo
                    </span>
                  </div>
                ))}
              </div>
              {form.productNames.length >= 2 && (
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.72 0.135 185)" }}
                >
                  Original total: ${computeTotalPrice(form.productNames)}/mo
                </p>
              )}
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Discount
              </Label>
              <div className="flex gap-2">
                {(["percent", "fixed"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, discountType: type }))
                    }
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all border"
                    style={{
                      background:
                        form.discountType === type
                          ? "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))"
                          : "transparent",
                      color:
                        form.discountType === type
                          ? "oklch(0.065 0.009 258)"
                          : "oklch(0.725 0.022 242)",
                      borderColor:
                        form.discountType === type
                          ? "transparent"
                          : "oklch(0.22 0.037 242)",
                    }}
                    data-ocid={`admin.combos.discount_${type}.toggle`}
                  >
                    {type === "percent" ? "Percentage %" : "Fixed Amount $"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={form.discountType === "percent" ? 99 : 9999}
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      discountValue: Math.max(1, Number(e.target.value)),
                    }))
                  }
                  className="border-border bg-background"
                  data-ocid="admin.combos.discount_value.input"
                />
                <span className="text-sm text-muted-foreground shrink-0">
                  {form.discountType === "percent" ? "% off" : "$ off"}
                </span>
              </div>
              {form.productNames.length >= 2 && (
                <p
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.71 0.115 72)" }}
                >
                  Final price: ${computeDiscountedPrice(form)}/mo
                </p>
              )}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={form.isFeatured}
                  onCheckedChange={(v) =>
                    setForm((p) => ({ ...p, isFeatured: v }))
                  }
                  data-ocid="admin.combos.form.featured.switch"
                />
                <Label
                  htmlFor="featured"
                  className="text-sm text-foreground cursor-pointer flex items-center gap-1"
                >
                  <Star
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  />
                  Featured
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((p) => ({ ...p, isActive: v }))
                  }
                  data-ocid="admin.combos.form.active.switch"
                />
                <Label
                  htmlFor="active"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Active
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="flex-1 border-border"
                data-ocid="admin.combos.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                  color: "oklch(0.065 0.009 258)",
                  border: "none",
                }}
                data-ocid="admin.combos.save_button"
              >
                {editId ? "Update Combo" : "Create Combo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
