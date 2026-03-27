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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Settings2, Tag, Trash2 } from "lucide-react";
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

interface PricingControl {
  discountEnabled: boolean;
  discountedPrice: number;
  offerBannerTitle: string;
}

type PricingControls = Record<string, PricingControl>;

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

const PRICING_PLAN_LABELS: Record<string, string> = {
  ctrader: "cTrader Elite Edition",
  mt5: "MetaTrader 5 (MT5) Pro Suite",
  mt4: "MetaTrader 4 (MT4) Legacy Suite",
  duo: "Pro-Duo Combo (Bundle)",
  master: "Ultimate PropFolio Master Pack (Bundle)",
};

const PRICING_PLAN_IDS = ["ctrader", "mt5", "mt4", "duo", "master"];
const LS_PRICING = "pf_pricing_controls";

function loadPricingControls(): PricingControls {
  try {
    const raw = localStorage.getItem(LS_PRICING);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePricingControls(controls: PricingControls) {
  localStorage.setItem(LS_PRICING, JSON.stringify(controls));
}

function defaultControl(): PricingControl {
  return { discountEnabled: false, discountedPrice: 0, offerBannerTitle: "" };
}

export default function AdminPromotions() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [maxUsage, setMaxUsage] = useState("100");
  const [pricingControls, setPricingControls] = useState<PricingControls>({});

  useEffect(() => {
    const stored = localStorage.getItem("pf_promos");
    setPromos(stored ? JSON.parse(stored) : SAMPLE_PROMOS);
    setPricingControls(loadPricingControls());
  }, []);

  const savePromos = (ps: Promo[]) => {
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
    savePromos([p, ...promos]);
    toast.success("Promo code created!");
    setOpen(false);
    setCode("");
    setDiscount("");
    setExpiry("");
  };

  const del = (id: string) => {
    savePromos(promos.filter((p) => p.id !== id));
    toast.success("Promo deleted");
  };

  const getControl = (planId: string): PricingControl =>
    pricingControls[planId] ?? defaultControl();

  const updateControl = (planId: string, patch: Partial<PricingControl>) => {
    setPricingControls((prev) => {
      const updated = {
        ...prev,
        [planId]: { ...defaultControl(), ...prev[planId], ...patch },
      };
      savePricingControls(updated);
      return updated;
    });
  };

  const saveControl = (planId: string) => {
    savePricingControls(pricingControls);
    toast.success(`Pricing controls saved for ${PRICING_PLAN_LABELS[planId]}`);
  };

  return (
    <div data-ocid="admin.promotions.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">
          Promotion Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage discount codes, offer banners, and live pricing controls.
        </p>
      </div>

      <Tabs defaultValue="promo-codes" data-ocid="admin.promotions.tab">
        <TabsList
          className="mb-6"
          style={{ background: "oklch(0.09 0.012 252)" }}
        >
          <TabsTrigger
            value="promo-codes"
            className="gap-2"
            data-ocid="admin.promotions.promo_tab"
          >
            <Tag className="w-3.5 h-3.5" /> Promo Codes
          </TabsTrigger>
          <TabsTrigger
            value="pricing-controls"
            className="gap-2"
            data-ocid="admin.promotions.pricing_tab"
          >
            <Settings2 className="w-3.5 h-3.5" /> Pricing Controls
          </TabsTrigger>
        </TabsList>

        {/* ---- Promo Codes Tab ---- */}
        <TabsContent value="promo-codes">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Create and manage discount codes for checkout.
            </p>
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
              <p className="text-sm text-muted-foreground">
                No promo codes yet.
              </p>
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
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          expired
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
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
        </TabsContent>

        {/* ---- Pricing Controls Tab ---- */}
        <TabsContent value="pricing-controls">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Enable discount mode and set offer banners for each pricing card
              on the landing page. Changes are reflected instantly.
            </p>
          </div>
          <div className="space-y-4">
            {PRICING_PLAN_IDS.map((planId, i) => {
              const ctrl = getControl(planId);
              return (
                <div
                  key={planId}
                  className="rounded-xl border border-border p-5"
                  style={{ background: "oklch(0.115 0.022 245)" }}
                  data-ocid={`admin.pricing.item.${i + 1}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Plan Name */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground">
                        {PRICING_PLAN_LABELS[planId]}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ID: {planId}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-end gap-4">
                      {/* Discount Mode toggle */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Discount Mode
                        </Label>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={ctrl.discountEnabled}
                            onCheckedChange={(v) =>
                              updateControl(planId, { discountEnabled: v })
                            }
                            data-ocid={`admin.pricing.discount.switch.${i + 1}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {ctrl.discountEnabled ? "On" : "Off"}
                          </span>
                        </div>
                      </div>

                      {/* Discounted Price (shown when enabled) */}
                      {ctrl.discountEnabled && (
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Discounted Price ($)
                          </Label>
                          <Input
                            type="number"
                            value={ctrl.discountedPrice || ""}
                            onChange={(e) =>
                              updateControl(planId, {
                                discountedPrice: Number(e.target.value),
                              })
                            }
                            placeholder="e.g. 20"
                            min="0"
                            className="bg-secondary border-border w-28 h-8 text-sm"
                            data-ocid={`admin.pricing.discount_price.input.${i + 1}`}
                          />
                        </div>
                      )}

                      {/* Offer Banner Title */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Offer Banner
                        </Label>
                        <Input
                          value={ctrl.offerBannerTitle}
                          onChange={(e) =>
                            updateControl(planId, {
                              offerBannerTitle: e.target.value,
                            })
                          }
                          placeholder="e.g. Easter Sale"
                          className="bg-secondary border-border w-40 h-8 text-sm"
                          data-ocid={`admin.pricing.banner.input.${i + 1}`}
                        />
                      </div>

                      {/* Save button */}
                      <Button
                        size="sm"
                        onClick={() => saveControl(planId)}
                        style={{
                          background: "oklch(0.72 0.135 185)",
                          color: "oklch(0.065 0.009 258)",
                        }}
                        className="font-semibold h-8"
                        data-ocid={`admin.pricing.save_button.${i + 1}`}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Preview of banner */}
                  {ctrl.offerBannerTitle.trim() && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Banner preview:
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          background: "oklch(0.71 0.115 72 / 0.2)",
                          color: "oklch(0.71 0.115 72)",
                        }}
                      >
                        🏷 {ctrl.offerBannerTitle}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
