import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateOrder, useGetAllProducts } from "../hooks/useQueries";

interface Plan {
  id: string;
  title: string;
  platform: string;
  monthlyPrice: number;
  yearlyPrice: number;
  addonMonthlyPrice: number;
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  plan: Plan | null;
  addonCount: number;
  billingCycle: "monthly" | "annual";
}

const CRYPTO_OPTIONS = [
  { id: "BTC", label: "Bitcoin (BTC)", symbol: "₿" },
  { id: "ETH", label: "Ethereum (ETH)", symbol: "Ξ" },
  { id: "USDT", label: "Tether (USDT)", symbol: "₮" },
];

const WALLET_ADDRESSES: Record<string, string> = {
  BTC: "bc1q... (Admin BTC wallet — configure in Admin > Wallets)",
  ETH: "0x... (Admin ETH wallet — configure in Admin > Wallets)",
  USDT: "TRX... (Admin USDT wallet — configure in Admin > Wallets)",
};

function getPlatformAccountLabel(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("mt4")) return "MT4 Account Number";
  if (p.includes("mt5")) return "MT5 Account Number";
  if (p.includes("ctrader")) return "cTrader Account Number";
  return "Trading Account Number";
}

export default function CheckoutModal({
  open,
  onClose,
  plan,
  addonCount,
  billingCycle,
}: CheckoutModalProps) {
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [paymentHash, setPaymentHash] = useState("");
  const [tradingAccountNumber, setTradingAccountNumber] = useState("");
  const { data: products } = useGetAllProducts();
  const createOrder = useCreateOrder();

  if (!plan) return null;

  const basePrice =
    billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const addonTotal = addonCount * plan.addonMonthlyPrice;
  const totalAmount =
    basePrice + (billingCycle === "monthly" ? addonTotal : addonTotal * 12);

  const accountLabel = getPlatformAccountLabel(plan.platform);

  const getProductId = (): bigint => {
    if (!products || products.length === 0) return 1n;
    const platformKey = plan.platform.split(" ")[0].toLowerCase();
    const matched = (products as any[]).find((p: any) => {
      const prod = Array.isArray(p) ? p[1] : p;
      return prod?.platform?.toLowerCase().includes(platformKey);
    });
    if (matched) {
      const prod = Array.isArray(matched) ? matched[0] : (matched as any)?.id;
      return typeof prod === "bigint" ? prod : 1n;
    }
    const first = products[0] as any;
    const firstId = Array.isArray(first) ? first[0] : first?.id;
    return typeof firstId === "bigint" ? firstId : 1n;
  };

  const handleTradingAccountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // Allow only numeric characters
    const val = e.target.value.replace(/[^0-9]/g, "");
    setTradingAccountNumber(val);
  };

  const handleSubmit = async () => {
    if (!tradingAccountNumber.trim()) {
      toast.error(`Please enter your ${accountLabel}`);
      return;
    }
    if (!/^[0-9]+$/.test(tradingAccountNumber)) {
      toast.error("Trading account number must be numeric");
      return;
    }
    if (!paymentHash.trim()) {
      toast.error("Please enter your payment transaction hash");
      return;
    }
    try {
      await createOrder.mutateAsync({
        productId: getProductId(),
        amount: totalAmount,
        cryptoCoin: selectedCoin,
        paymentHash: paymentHash.trim(),
        tradingAccountNumber: tradingAccountNumber.trim(),
      });
      toast.success(
        "Order submitted! Admin will review your payment within 24 hours.",
      );
      setPaymentHash("");
      setTradingAccountNumber("");
      onClose();
    } catch {
      toast.error("Failed to submit order. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md border-border"
        style={{ background: "oklch(0.115 0.022 245)" }}
        data-ocid="checkout.modal"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <ShoppingCart
              className="w-5 h-5"
              style={{ color: "oklch(0.72 0.135 185)" }}
            />
            Complete Your Purchase
          </DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div
          className="rounded-xl border border-border p-4 space-y-2"
          style={{ background: "oklch(0.09 0.012 252)" }}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Order Summary
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{plan.title}</span>
            <span className="text-foreground font-semibold">
              ${basePrice}/{billingCycle === "monthly" ? "mo" : "yr"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Billing</span>
            <span className="capitalize text-foreground">{billingCycle}</span>
          </div>
          {addonCount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                +{addonCount} Extra License{addonCount > 1 ? "s" : ""}
              </span>
              <span className="text-foreground">
                +${billingCycle === "monthly" ? addonTotal : addonTotal * 12}/
                {billingCycle === "monthly" ? "mo" : "yr"}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between font-extrabold">
            <span className="text-foreground">Total</span>
            <span style={{ color: "oklch(0.71 0.115 72)" }}>
              ${totalAmount}/{billingCycle === "monthly" ? "mo" : "yr"}
            </span>
          </div>
        </div>

        {/* Trading Account Number */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            {accountLabel}{" "}
            <span style={{ color: "oklch(0.65 0.18 25)" }}>*</span>
          </Label>
          <Input
            value={tradingAccountNumber}
            onChange={handleTradingAccountChange}
            placeholder={`Enter your ${accountLabel}...`}
            inputMode="numeric"
            className="bg-secondary border-border font-mono text-sm"
            data-ocid="checkout.trading_account.input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your trading platform account number — used to bind the license.
          </p>
        </div>

        {/* Crypto Selector */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Select Crypto
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {CRYPTO_OPTIONS.map((coin) => (
              <button
                key={coin.id}
                type="button"
                onClick={() => setSelectedCoin(coin.id)}
                className="rounded-lg border p-3 text-center transition-all text-sm font-semibold"
                style={{
                  borderColor:
                    selectedCoin === coin.id
                      ? "oklch(0.72 0.135 185)"
                      : "oklch(0.22 0.037 242)",
                  background:
                    selectedCoin === coin.id
                      ? "oklch(0.72 0.135 185 / 0.1)"
                      : "oklch(0.09 0.012 252)",
                  color:
                    selectedCoin === coin.id
                      ? "oklch(0.72 0.135 185)"
                      : "oklch(0.725 0.022 242)",
                }}
                data-ocid={`checkout.${coin.id.toLowerCase()}.radio`}
              >
                <div className="text-lg mb-0.5">{coin.symbol}</div>
                <div className="text-xs">{coin.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Wallet Address */}
        <div
          className="rounded-lg border border-border p-3"
          style={{ background: "oklch(0.09 0.012 252)" }}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Send {selectedCoin} to:
          </div>
          <div
            className="text-xs font-mono break-all"
            style={{ color: "oklch(0.72 0.135 185)" }}
          >
            {WALLET_ADDRESSES[selectedCoin]}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠ Admin must configure real wallet addresses in Admin &gt; Wallets.
            After sending, paste your transaction ID below.
          </p>
        </div>

        {/* Payment Hash */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Transaction Hash / TxID
          </Label>
          <Input
            value={paymentHash}
            onChange={(e) => setPaymentHash(e.target.value)}
            placeholder="Paste your transaction hash here..."
            className="bg-secondary border-border font-mono text-xs"
            data-ocid="checkout.txhash.input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Send exactly ${totalAmount} worth of {selectedCoin} then paste the
            TxID.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={createOrder.isPending}
            className="flex-1 font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
              color: "oklch(0.065 0.009 258)",
            }}
            data-ocid="checkout.submit_button"
          >
            {createOrder.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {createOrder.isPending ? "Submitting..." : "Submit Payment"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-ocid="checkout.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
