import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Save, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AffConfig {
  saleCommission: number;
  renewalCommission: number;
  minCashout: number;
  maxCashout: number;
}

const DEFAULT: AffConfig = {
  saleCommission: 20,
  renewalCommission: 10,
  minCashout: 50,
  maxCashout: 2000,
};

const MOCK_REFERRALS = [
  {
    name: "TradersClub",
    referred: 34,
    earnings: 1820,
    pending: 340,
    status: "Active",
  },
  {
    name: "ForexPulse",
    referred: 21,
    earnings: 1050,
    pending: 210,
    status: "Active",
  },
  {
    name: "PropNetwork",
    referred: 8,
    earnings: 392,
    pending: 80,
    status: "Pending",
  },
];

export default function AdminAffiliates() {
  const [cfg, setCfg] = useState<AffConfig>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pf_aff_config");
    if (stored) setCfg(JSON.parse(stored));
  }, []);

  const handleSave = () => {
    if (cfg.saleCommission < 0 || cfg.saleCommission > 100) {
      toast.error("Sale commission must be 0-100%");
      return;
    }
    if (cfg.renewalCommission < 0 || cfg.renewalCommission > 100) {
      toast.error("Renewal commission must be 0-100%");
      return;
    }
    if (cfg.minCashout < 1) {
      toast.error("Minimum cashout must be at least $1");
      return;
    }
    if (cfg.maxCashout <= cfg.minCashout) {
      toast.error("Max cashout must exceed min cashout");
      return;
    }
    localStorage.setItem("pf_aff_config", JSON.stringify(cfg));
    setSaved(true);
    toast.success("Affiliate settings saved!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-ocid="admin.affiliates.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">
          Affiliate Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure commission rates and cashout limits for the referral
          program.
        </p>
      </div>

      {/* Commission Settings */}
      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div
          className="rounded-xl border border-border p-5"
          style={{ background: "oklch(0.115 0.022 245)" }}
        >
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Commission Rates
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Sale Commission (%)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={cfg.saleCommission}
                  onChange={(e) =>
                    setCfg((c) => ({
                      ...c,
                      saleCommission: Number.parseFloat(e.target.value),
                    }))
                  }
                  min="0"
                  max="100"
                  className="bg-secondary border-border w-28"
                  data-ocid="admin.affiliates.input"
                />
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: "oklch(0.72 0.135 185)" }}
                >
                  {cfg.saleCommission}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paid on every new subscription sale
              </p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Renewal Commission (%)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={cfg.renewalCommission}
                  onChange={(e) =>
                    setCfg((c) => ({
                      ...c,
                      renewalCommission: Number.parseFloat(e.target.value),
                    }))
                  }
                  min="0"
                  max="100"
                  className="bg-secondary border-border w-28"
                  data-ocid="admin.affiliates.input"
                />
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: "oklch(0.71 0.115 72)" }}
                >
                  {cfg.renewalCommission}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paid on each subscription renewal
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border border-border p-5"
          style={{ background: "oklch(0.115 0.022 245)" }}
        >
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Cashout Limits
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Minimum Cashout ($)
              </Label>
              <Input
                type="number"
                value={cfg.minCashout}
                onChange={(e) =>
                  setCfg((c) => ({
                    ...c,
                    minCashout: Number.parseFloat(e.target.value),
                  }))
                }
                min="1"
                className="bg-secondary border-border"
                data-ocid="admin.affiliates.input"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Maximum Cashout per Request ($)
              </Label>
              <Input
                type="number"
                value={cfg.maxCashout}
                onChange={(e) =>
                  setCfg((c) => ({
                    ...c,
                    maxCashout: Number.parseFloat(e.target.value),
                  }))
                }
                min="1"
                className="bg-secondary border-border"
                data-ocid="admin.affiliates.input"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="gap-2 font-semibold mb-8"
        disabled={saved}
        style={{
          background: "oklch(0.72 0.135 185)",
          color: "oklch(0.065 0.009 258)",
        }}
        data-ocid="admin.affiliates.save_button"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" /> Saved!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Save Settings
          </>
        )}
      </Button>

      {/* Affiliate Overview */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="text-sm font-bold text-foreground">
            Affiliate Overview
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {[
                  "Affiliate",
                  "Referred",
                  "Total Earnings",
                  "Pending Payout",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {MOCK_REFERRALS.map((r, i) => (
                <tr
                  key={r.name}
                  className="hover:bg-secondary/30 transition-colors"
                  data-ocid={`admin.affiliates.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {r.referred} users
                  </td>
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    ${r.earnings}
                  </td>
                  <td className="px-4 py-3 text-foreground">${r.pending}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        r.status === "Active"
                          ? "bg-primary/10 text-primary"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
