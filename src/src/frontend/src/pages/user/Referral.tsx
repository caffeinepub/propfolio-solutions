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
import {
  Check,
  Copy,
  DollarSign,
  Loader2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";

const MOCK_STATS = {
  referred: 12,
  pendingEarnings: 145.5,
  totalEarnings: 892.0,
  availableBalance: 247.0,
};
const MOCK_HISTORY = [
  {
    name: "Alex T.",
    plan: "PropTrader",
    commission: 19.8,
    date: "2026-03-20",
    type: "Sale",
  },
  {
    name: "Maria K.",
    plan: "PropPro",
    commission: 39.8,
    date: "2026-03-18",
    type: "Sale",
  },
  {
    name: "James W.",
    plan: "PropTrader",
    commission: 9.9,
    date: "2026-03-10",
    type: "Renewal",
  },
  {
    name: "Sophie L.",
    plan: "PropLite",
    commission: 4.9,
    date: "2026-03-05",
    type: "Sale",
  },
  {
    name: "David M.",
    plan: "PropPro",
    commission: 19.9,
    date: "2026-02-28",
    type: "Renewal",
  },
];
const COINS = ["BTC", "ETH", "USDT", "BNB"];
const NETWORKS = {
  BTC: ["Bitcoin"],
  ETH: ["Ethereum", "Arbitrum", "Optimism"],
  USDT: ["TRC-20", "ERC-20", "BEP-20"],
  BNB: ["BEP-20"],
};

export default function Referral() {
  const { identity } = useAuth();
  const ref = identity?.getPrincipal().toString().slice(-8) ?? "PROPF001";
  const refLink = `${window.location.origin}/register?ref=${ref}`;
  const [copied, setCopied] = useState(false);
  const [cashoutOpen, setCashoutOpen] = useState(false);
  const [coin, setCoin] = useState("USDT");
  const [network, setNetwork] = useState("TRC-20");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCashout = async () => {
    const amt = Number.parseFloat(amount);
    if (!address.trim()) {
      toast.error("Enter wallet address");
      return;
    }
    if (Number.isNaN(amt) || amt < 50) {
      toast.error("Minimum cashout is $50");
      return;
    }
    if (amt > MOCK_STATS.availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success(
      "Cashout request submitted! Admin will process within 3-5 business days.",
    );
    setCashoutOpen(false);
    setAmount("");
    setAddress("");
    setSubmitting(false);
  };

  return (
    <div data-ocid="referral.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">
          Referral Program
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earn commissions by referring traders to PropFolio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Referred",
            value: MOCK_STATS.referred,
            icon: Users,
            color: "oklch(0.72 0.135 185)",
            format: (v: number) => `${v} users`,
          },
          {
            label: "Total Earnings",
            value: MOCK_STATS.totalEarnings,
            icon: TrendingUp,
            color: "oklch(0.71 0.115 72)",
            format: (v: number) => `$${v.toFixed(2)}`,
          },
          {
            label: "Pending",
            value: MOCK_STATS.pendingEarnings,
            icon: DollarSign,
            color: "oklch(0.7 0.15 160)",
            format: (v: number) => `$${v.toFixed(2)}`,
          },
          {
            label: "Available",
            value: MOCK_STATS.availableBalance,
            icon: Wallet,
            color: "oklch(0.71 0.115 72)",
            format: (v: number) => `$${v.toFixed(2)}`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border p-5"
            style={{ background: "oklch(0.115 0.022 245)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color.replace(")", " / 0.12)")}` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div
              className="text-xl font-extrabold"
              style={{ color: stat.color }}
            >
              {stat.format(stat.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div
        className="rounded-xl border border-border p-5 mb-6"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <h2 className="text-sm font-bold text-foreground mb-1">
          Your Referral Link
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Share this link and earn 20% commission on each referred sale and 10%
          on renewals.
        </p>
        <div className="flex gap-2">
          <Input
            value={refLink}
            readOnly
            className="bg-secondary border-border text-xs font-mono"
            data-ocid="referral.input"
          />
          <Button
            onClick={() => copy(refLink)}
            size="icon"
            variant="outline"
            className="flex-shrink-0"
            data-ocid="referral.button"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Your code:</span>
          <code
            className="text-xs font-mono px-2 py-1 rounded"
            style={{
              background: "oklch(0.71 0.115 72 / 0.15)",
              color: "oklch(0.71 0.115 72)",
            }}
          >
            {ref}
          </code>
        </div>
      </div>

      {/* Cashout button */}
      <div className="flex justify-end mb-6">
        <Dialog open={cashoutOpen} onOpenChange={setCashoutOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                color: "oklch(0.065 0.009 258)",
              }}
              data-ocid="referral.open_modal_button"
            >
              <Wallet className="w-4 h-4" /> Request Cashout
            </Button>
          </DialogTrigger>
          <DialogContent
            className="border-border max-w-md"
            style={{ background: "oklch(0.115 0.022 245)" }}
            data-ocid="referral.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Request Cashout
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div
                className="rounded-xl border border-border p-3"
                style={{ background: "oklch(0.09 0.012 252)" }}
              >
                <p className="text-xs text-muted-foreground">
                  Available balance:{" "}
                  <span
                    className="font-bold"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    ${MOCK_STATS.availableBalance.toFixed(2)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Min: $50 &bull; Max: $2,000 per request
                </p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Coin
                </Label>
                <Select
                  value={coin}
                  onValueChange={(v) => {
                    setCoin(v);
                    setNetwork(NETWORKS[v as keyof typeof NETWORKS][0]);
                  }}
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="referral.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(0.14 0.025 243)" }}
                  >
                    {COINS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Network
                </Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="referral.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(0.14 0.025 243)" }}
                  >
                    {NETWORKS[coin as keyof typeof NETWORKS].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Wallet Address
                </Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={`Your ${coin} wallet address`}
                  className="bg-secondary border-border font-mono text-xs"
                  data-ocid="referral.input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Amount (USD)
                </Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Min $50"
                  className="bg-secondary border-border"
                  data-ocid="referral.input"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCashout}
                  disabled={submitting}
                  className="flex-1 font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                    color: "oklch(0.065 0.009 258)",
                  }}
                  data-ocid="referral.submit_button"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit Request"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCashoutOpen(false)}
                  className="flex-1"
                  data-ocid="referral.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* History */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="text-sm font-bold text-foreground">
            Commission History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["Referral", "Plan", "Type", "Commission", "Date"].map((h) => (
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
              {MOCK_HISTORY.map((row, i) => (
                <tr
                  key={row.name}
                  className="hover:bg-secondary/30 transition-colors"
                  data-ocid={`referral.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.plan}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        row.type === "Sale"
                          ? "bg-primary/10 text-primary"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    +${row.commission.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {row.date}
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
