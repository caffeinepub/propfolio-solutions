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
import { Calendar, Plus, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Promo {
  id: string;
  code: string;
  discount: number;
  expiry: string;
  usageCount: number;
  maxUsage: number;
}

const SAMPLE_PROMOS: Promo[] = [
  {
    id: "1",
    code: "LAUNCH20",
    discount: 20,
    expiry: "2026-06-30",
    usageCount: 47,
    maxUsage: 100,
  },
  {
    id: "2",
    code: "PROPVIP30",
    discount: 30,
    expiry: "2026-04-30",
    usageCount: 12,
    maxUsage: 50,
  },
];

export default function AdminPromotions() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [maxUsage, setMaxUsage] = useState("100");

  useEffect(() => {
    const stored = localStorage.getItem("pf_promos");
    setPromos(stored ? JSON.parse(stored) : SAMPLE_PROMOS);
  }, []);

  const save = (ps: Promo[]) => {
    setPromos(ps);
    localStorage.setItem("pf_promos", JSON.stringify(ps));
  };

  const create = () => {
    if (!code.trim() || !discount || !expiry) {
      toast.error("Fill in all fields");
      return;
    }
    const p: Promo = {
      id: Date.now().toString(),
      code: code.trim().toUpperCase(),
      discount: Number.parseFloat(discount),
      expiry,
      usageCount: 0,
      maxUsage: Number.parseInt(maxUsage),
    };
    save([p, ...promos]);
    toast.success("Promo code created!");
    setOpen(false);
    setCode("");
    setDiscount("");
    setExpiry("");
  };

  const del = (id: string) => {
    save(promos.filter((p) => p.id !== id));
    toast.success("Promo deleted");
  };

  return (
    <div data-ocid="admin.promotions.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            Promotion Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage discount codes and special offers.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 font-semibold"
              style={{
                background: "oklch(0.72 0.135 185)",
                color: "oklch(0.065 0.009 258)",
              }}
              data-ocid="admin.promotions.open_modal_button"
            >
              <Plus className="w-4 h-4" /> New Promo
            </Button>
          </DialogTrigger>
          <DialogContent
            className="border-border"
            style={{ background: "oklch(0.115 0.022 245)" }}
            data-ocid="admin.promotions.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create Promo Code
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Code
                </Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="LAUNCH20"
                  className="bg-secondary border-border uppercase"
                  data-ocid="admin.promotions.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Discount %
                  </Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="20"
                    min="1"
                    max="100"
                    className="bg-secondary border-border"
                    data-ocid="admin.promotions.input"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Max Uses
                  </Label>
                  <Input
                    type="number"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value)}
                    placeholder="100"
                    className="bg-secondary border-border"
                    data-ocid="admin.promotions.input"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Expiry Date
                </Label>
                <Input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="bg-secondary border-border"
                  data-ocid="admin.promotions.input"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={create}
                  className="flex-1 font-semibold"
                  style={{
                    background: "oklch(0.72 0.135 185)",
                    color: "oklch(0.065 0.009 258)",
                  }}
                  data-ocid="admin.promotions.submit_button"
                >
                  Create Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  data-ocid="admin.promotions.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {promos.length === 0 ? (
        <div
          className="rounded-xl border border-border p-12 text-center"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="admin.promotions.empty_state"
        >
          <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No promo codes yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((p, i) => {
            const expired = new Date(p.expiry) < new Date();
            return (
              <div
                key={p.id}
                className={`rounded-xl border p-5 ${expired ? "opacity-60" : ""}`}
                style={{
                  background: "oklch(0.115 0.022 245)",
                  borderColor: expired
                    ? "oklch(0.22 0.037 242)"
                    : "oklch(0.72 0.135 185 / 0.3)",
                }}
                data-ocid={`admin.promotions.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <code
                    className="text-base font-extrabold font-mono"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    {p.code}
                  </code>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${expired ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
                  >
                    {expired ? "Expired" : "Active"}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-foreground mb-1">
                  {p.discount}% off
                </div>
                <div className="space-y-1 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Expires {p.expiry}
                  </div>
                  <div>
                    {p.usageCount} / {p.maxUsage} uses
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 mb-4">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (p.usageCount / p.maxUsage) * 100)}%`,
                      background: "oklch(0.72 0.135 185)",
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => del(p.id)}
                  className="w-full gap-1.5 text-xs text-destructive hover:text-destructive"
                  data-ocid={`admin.promotions.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3 h-3" /> Delete Promo
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
