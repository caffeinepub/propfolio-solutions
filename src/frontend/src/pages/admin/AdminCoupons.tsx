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
import { Edit, Loader2, Plus, Ticket, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import {
  type Coupon,
  useCreateCoupon,
  useDeleteCoupon,
  useGetAllCoupons,
  useUpdateCoupon,
} from "../../hooks/useCouponQueries";
import { useGetAllProducts } from "../../hooks/useQueries";

const PLATFORMS = ["MT4", "MT5", "cTrader"];

function emptyCoupon(): Coupon {
  return {
    code: "",
    discountPercent: 10,
    maxTotalUses: 0n,
    maxPerUser: 1n,
    applicableProductIds: [],
    applicablePlatforms: [],
    expiresAt: 0n,
    isActive: true,
    createdAt: BigInt(Date.now()),
  };
}

function formatExpiry(expiresAt: bigint): string {
  if (expiresAt === 0n) return "Never";
  const ms = Number(expiresAt) / 1_000_000;
  return new Date(ms).toLocaleDateString();
}

function CouponStatsCell({ code }: { code: string }) {
  const { actor } = useActor();
  const [uses, setUses] = useState<bigint | null>(null);

  useEffect(() => {
    if (!actor) return;
    (actor as any)
      .getCouponStats(code)
      .then((s) => setUses(s.totalUses))
      .catch(() => setUses(0n));
  }, [actor, code]);

  if (uses === null) return <span className="text-muted-foreground">—</span>;
  return <span className="font-mono">{uses.toString()}</span>;
}

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useGetAllCoupons();
  const { data: products } = useGetAllProducts();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [formOpen, setFormOpen] = useState(false);
  const [editCode, setEditCode] = useState<string | null>(null);
  const [form, setForm] = useState<Coupon>(emptyCoupon());
  const [expiryDateStr, setExpiryDateStr] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditCode(null);
    setForm(emptyCoupon());
    setExpiryDateStr("");
    setFormOpen(true);
  };

  const openEdit = (code: string, c: Coupon) => {
    setEditCode(code);
    setForm({ ...c });
    if (c.expiresAt > 0n) {
      const ms = Number(c.expiresAt) / 1_000_000;
      const d = new Date(ms);
      setExpiryDateStr(d.toISOString().split("T")[0]);
    } else {
      setExpiryDateStr("");
    }
    setFormOpen(true);
  };

  const togglePlatform = (platform: string) => {
    setForm((f) => {
      const has = f.applicablePlatforms.includes(platform);
      return {
        ...f,
        applicablePlatforms: has
          ? f.applicablePlatforms.filter((p) => p !== platform)
          : [...f.applicablePlatforms, platform],
      };
    });
  };

  const toggleProduct = (id: bigint) => {
    setForm((f) => {
      const has = f.applicableProductIds.some((p) => p === id);
      return {
        ...f,
        applicableProductIds: has
          ? f.applicableProductIds.filter((p) => p !== id)
          : [...f.applicableProductIds, id],
      };
    });
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (form.discountPercent < 1 || form.discountPercent > 100) {
      toast.error("Discount must be between 1 and 100");
      return;
    }
    setSaving(true);
    const coupon: Coupon = {
      ...form,
      code: form.code.trim().toUpperCase(),
      createdAt: editCode ? form.createdAt : BigInt(Date.now()),
      expiresAt: expiryDateStr
        ? BigInt(new Date(expiryDateStr).getTime()) * 1_000_000n
        : 0n,
    };
    try {
      if (editCode) {
        await updateCoupon.mutateAsync({ code: editCode, coupon });
        toast.success("Coupon updated!");
      } else {
        await createCoupon.mutateAsync(coupon);
        toast.success("Coupon created!");
      }
      setFormOpen(false);
    } catch {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteCoupon.mutateAsync(code);
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div data-ocid="admin.coupons.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Ticket
              className="w-5 h-5"
              style={{ color: "oklch(0.72 0.135 185)" }}
            />
            Coupon Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage discount coupon codes.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="font-bold gap-2"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
            color: "oklch(0.065 0.009 258)",
          }}
          data-ocid="admin.coupons.open_modal_button"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "oklch(0.09 0.012 252)" }}
        data-ocid="admin.coupons.table"
      >
        {isLoading ? (
          <div
            className="flex items-center justify-center py-16"
            data-ocid="admin.coupons.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !coupons || coupons.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="admin.coupons.empty_state"
          >
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No coupons yet</p>
            <p className="text-xs mt-1">Create your first coupon code above.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Code
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Discount
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Max Uses
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Per User
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Expires
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Total Used
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(([code, c], idx) => (
                <TableRow
                  key={code}
                  className="border-border hover:bg-secondary/30 transition-colors"
                  data-ocid={`admin.coupons.row.${idx + 1}`}
                >
                  <TableCell>
                    <span
                      className="font-mono font-bold text-sm px-2 py-0.5 rounded"
                      style={{
                        background: "oklch(0.72 0.135 185 / 0.1)",
                        color: "oklch(0.72 0.135 185)",
                      }}
                    >
                      {code}
                    </span>
                  </TableCell>
                  <TableCell
                    className="font-bold"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    {c.discountPercent}%
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.maxTotalUses === 0n ? "∞" : c.maxTotalUses.toString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.maxPerUser === 0n ? "∞" : c.maxPerUser.toString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatExpiry(c.expiresAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <CouponStatsCell code={code} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.isActive ? "default" : "secondary"}
                      className="text-xs"
                      style={
                        c.isActive
                          ? {
                              background: "oklch(0.72 0.135 185 / 0.15)",
                              color: "oklch(0.72 0.135 185)",
                              border: "1px solid oklch(0.72 0.135 185 / 0.3)",
                            }
                          : undefined
                      }
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(code, c)}
                        className="h-7 w-7 p-0"
                        data-ocid={`admin.coupons.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:text-red-400"
                            data-ocid={`admin.coupons.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete coupon <strong>{code}</strong>? This cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="admin.coupons.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(code)}
                              className="bg-red-600 hover:bg-red-700"
                              data-ocid="admin.coupons.confirm_button"
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
          data-ocid="admin.coupons.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editCode ? "Edit Coupon" : "Create Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Code */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Coupon Code *
              </Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                placeholder="e.g. SAVE20"
                className="font-mono uppercase"
                style={{
                  background: "oklch(0.065 0.009 258)",
                  borderColor: "oklch(0.22 0.037 242)",
                }}
                data-ocid="admin.coupons.code.input"
              />
            </div>

            {/* Discount % */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Discount Percentage *
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountPercent: Math.max(
                        1,
                        Math.min(100, Number.parseInt(e.target.value) || 1),
                      ),
                    }))
                  }
                  className="w-24"
                  style={{
                    background: "oklch(0.065 0.009 258)",
                    borderColor: "oklch(0.22 0.037 242)",
                  }}
                  data-ocid="admin.coupons.discount.input"
                />
                <span
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.71 0.115 72)" }}
                >
                  %
                </span>
              </div>
            </div>

            {/* Max Total Uses */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Max Total Uses (0 = unlimited)
              </Label>
              <Input
                type="number"
                min={0}
                value={form.maxTotalUses.toString()}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxTotalUses: BigInt(
                      Math.max(0, Number.parseInt(e.target.value) || 0),
                    ),
                  }))
                }
                style={{
                  background: "oklch(0.065 0.009 258)",
                  borderColor: "oklch(0.22 0.037 242)",
                }}
                data-ocid="admin.coupons.max_uses.input"
              />
            </div>

            {/* Max Per User */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Max Uses Per User (0 = unlimited)
              </Label>
              <Input
                type="number"
                min={0}
                value={form.maxPerUser.toString()}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxPerUser: BigInt(
                      Math.max(0, Number.parseInt(e.target.value) || 0),
                    ),
                  }))
                }
                style={{
                  background: "oklch(0.065 0.009 258)",
                  borderColor: "oklch(0.22 0.037 242)",
                }}
                data-ocid="admin.coupons.per_user.input"
              />
            </div>

            {/* Applicable Platforms */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Applicable Platforms (empty = all)
              </Label>
              <div className="flex gap-4">
                {PLATFORMS.map((plat) => (
                  <label
                    key={plat}
                    htmlFor={`platform-${plat}`}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      id={`platform-${plat}`}
                      checked={form.applicablePlatforms.includes(plat)}
                      onCheckedChange={() => togglePlatform(plat)}
                      data-ocid="admin.coupons.platform.checkbox"
                    />
                    <span>{plat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Applicable Products */}
            {products && products.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Applicable Products (empty = all)
                </Label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(products as Array<[bigint, { name: string }]>).map(
                    ([id, p]) => (
                      <label
                        key={id.toString()}
                        htmlFor={`product-${id.toString()}`}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          id={`product-${id.toString()}`}
                          checked={form.applicableProductIds.some(
                            (pid) => pid === id,
                          )}
                          onCheckedChange={() => toggleProduct(id)}
                          data-ocid="admin.coupons.product.checkbox"
                        />
                        <span className="text-muted-foreground">{p.name}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Expiry Date (leave blank = no expiry)
              </Label>
              <Input
                type="date"
                value={expiryDateStr}
                onChange={(e) => setExpiryDateStr(e.target.value)}
                style={{
                  background: "oklch(0.065 0.009 258)",
                  borderColor: "oklch(0.22 0.037 242)",
                }}
                data-ocid="admin.coupons.expiry.input"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-border">
              <div>
                <Label className="text-sm font-semibold">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive coupons cannot be redeemed.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                data-ocid="admin.coupons.active.switch"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                  color: "oklch(0.065 0.009 258)",
                }}
                data-ocid="admin.coupons.save_button"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {saving
                  ? "Saving..."
                  : editCode
                    ? "Update Coupon"
                    : "Create Coupon"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="flex-1"
                data-ocid="admin.coupons.cancel_button"
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
