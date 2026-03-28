import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, ShoppingCart, Tag, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useCreateOrder, useGetAllProducts } from "../hooks/useQueries";

interface Plan {
  id: string;
  title: string;
  platform: string;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice?: number;
  addonMonthlyPrice: number;
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  plan: Plan | null;
  addonCount: number;
  billingCycle: "monthly" | "annual" | "lifetime";
  isTrial?: boolean;
  trialDurationDays?: number;
}

interface AddonSlot {
  slotId: number;
  value: string;
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
  isTrial = false,
  trialDurationDays = 7,
}: CheckoutModalProps) {
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [paymentHash, setPaymentHash] = useState("");
  const [primaryAccount, setPrimaryAccount] = useState("");
  const [addonSlots, setAddonSlots] = useState<AddonSlot[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const { data: products } = useGetAllProducts();
  const { actor } = useActor();
  const createOrder = useCreateOrder();

  // Pre-fill coupon from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("propfolio_promo_code");
    if (stored) {
      setCouponCode(stored);
    }
  }, []);

  useEffect(() => {
    setAddonSlots((prev) => {
      if (addonCount === prev.length) return prev;
      if (addonCount > prev.length) {
        const extras: AddonSlot[] = [];
        for (let n = prev.length; n < addonCount; n++) {
          extras.push({ slotId: n + 1, value: "" });
        }
        return [...prev, ...extras];
      }
      return prev.slice(0, addonCount);
    });
  }, [addonCount]);

  if (!plan) return null;

  const basePrice =
    billingCycle === "monthly"
      ? plan.monthlyPrice
      : billingCycle === "annual"
        ? plan.yearlyPrice
        : (plan.lifetimePrice ?? plan.monthlyPrice * 24);
  const addonTotal =
    billingCycle === "lifetime" ? 0 : addonCount * plan.addonMonthlyPrice;
  const totalAmount =
    billingCycle === "lifetime"
      ? basePrice
      : basePrice + (billingCycle === "monthly" ? addonTotal : addonTotal * 12);

  const getDiscountedTotal = (): number => {
    if (!appliedCoupon) return totalAmount;
    return (
      Math.round(
        totalAmount * (1 - appliedCoupon.discountPercent / 100) * 100,
      ) / 100
    );
  };

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

  const handleAddonChange = (slotId: number, raw: string) => {
    const val = raw.replace(/[^0-9]/g, "");
    setAddonSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, value: val } : s)),
    );
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (!actor) {
      setCouponError("Not connected to backend");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const discount = await (actor as any).validateCoupon(
        code,
        getProductId(),
        plan.platform,
      );
      if (discount === null || discount === undefined) {
        setCouponError("Invalid or expired coupon");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code, discountPercent: Number(discount) });
        setCouponError("");
        localStorage.removeItem("propfolio_promo_code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!primaryAccount.trim()) {
      toast.error(`Please enter your ${accountLabel}`);
      return;
    }
    if (!/^[0-9]+$/.test(primaryAccount)) {
      toast.error("Account numbers must be numeric");
      return;
    }
    for (const slot of addonSlots) {
      if (!slot.value.trim()) {
        toast.error(
          `Please enter Additional License #${slot.slotId} Account Number`,
        );
        return;
      }
      if (!/^[0-9]+$/.test(slot.value)) {
        toast.error(
          `Additional License #${slot.slotId} Account Number must be numeric`,
        );
        return;
      }
    }
    if (!isTrial && !paymentHash.trim()) {
      toast.error("Please enter your payment transaction hash");
      return;
    }
    const allAccounts = [
      primaryAccount,
      ...addonSlots.map((s) => s.value),
    ].join(",");
    const finalAmount = isTrial ? 0 : getDiscountedTotal();
    try {
      if (isTrial) {
        try {
          await (actor as any).markTrialUsed();
        } catch {
          toast.error("You have already used your free trial.");
          return;
        }
      }
      if (!isTrial && appliedCoupon && actor) {
        try {
          await (actor as any).redeemCoupon(appliedCoupon.code);
        } catch {
          // non-blocking; order still goes through
        }
      }
      await createOrder.mutateAsync({
        productId: getProductId(),
        amount: finalAmount,
        cryptoCoin: isTrial ? "TRIAL" : selectedCoin,
        paymentHash: isTrial ? "FREE_TRIAL" : paymentHash.trim(),
        tradingAccountNumber: allAccounts,
      });
      toast.success(
        isTrial
          ? `Free trial activated! You have ${trialDurationDays} days to explore.`
          : "Order submitted! Admin will review your payment within 24 hours.",
      );
      setPaymentHash("");
      setPrimaryAccount("");
      setAddonSlots((prev) => prev.map((s) => ({ ...s, value: "" })));
      setCouponCode("");
      setAppliedCoupon(null);
      onClose();
    } catch {
      toast.error("Failed to submit order. Please try again.");
    }
  };

  const discountedTotal = getDiscountedTotal();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md border-border overflow-y-auto max-h-[90vh]"
        style={{ background: "oklch(0.115 0.022 245)" }}
        data-ocid="checkout.modal"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <ShoppingCart
              className="w-5 h-5"
              style={{ color: "oklch(0.72 0.135 185)" }}
            />
            {isTrial ? "Start Your Free Trial" : "Complete Your Purchase"}
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
              ${basePrice}/
              {billingCycle === "monthly"
                ? "mo"
                : billingCycle === "annual"
                  ? "yr"
                  : "lifetime"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Billing</span>
            <span className="capitalize text-foreground">
              {billingCycle === "lifetime"
                ? "Lifetime (One-Time)"
                : billingCycle}
            </span>
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
          {appliedCoupon && (
            <div className="flex justify-between text-sm">
              <span style={{ color: "oklch(0.72 0.135 185)" }}>
                🎟 Coupon ({appliedCoupon.discountPercent}% off)
              </span>
              <span style={{ color: "oklch(0.72 0.135 185)" }}>
                -${(totalAmount - discountedTotal).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between font-extrabold">
            <span className="text-foreground">Total</span>
            <div className="text-right">
              {appliedCoupon && (
                <div className="text-xs line-through text-muted-foreground">
                  ${totalAmount}
                  {billingCycle === "lifetime"
                    ? " one-time"
                    : billingCycle === "monthly"
                      ? "/mo"
                      : "/yr"}
                </div>
              )}
              <span style={{ color: "oklch(0.71 0.115 72)" }}>
                ${discountedTotal}
                {billingCycle === "lifetime"
                  ? " one-time"
                  : billingCycle === "monthly"
                    ? "/mo"
                    : "/yr"}
              </span>
            </div>
          </div>
        </div>

        {/* Promo Code */}
        <div
          className="rounded-xl border border-border p-4"
          style={{ background: "oklch(0.09 0.012 252)" }}
        >
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Promo Code
          </Label>
          {localStorage.getItem("propfolio_promo_code") && !appliedCoupon && (
            <p
              className="text-xs mb-2"
              style={{ color: "oklch(0.72 0.135 185)" }}
            >
              Promo code from URL pre-applied. Click Apply to validate.
            </p>
          )}
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponError("");
                if (appliedCoupon) setAppliedCoupon(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              placeholder="Enter promo code..."
              className="font-mono uppercase flex-1"
              style={{
                background: "oklch(0.065 0.009 258)",
                borderColor: "oklch(0.22 0.037 242)",
              }}
              data-ocid="checkout.coupon.input"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className="shrink-0"
              style={{ borderColor: "oklch(0.22 0.037 242)" }}
              data-ocid="checkout.coupon.button"
            >
              {couponLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {appliedCoupon && (
            <div
              className="flex items-center gap-1.5 mt-2 text-sm"
              style={{ color: "oklch(0.72 0.135 185)" }}
              data-ocid="checkout.coupon.success_state"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{appliedCoupon.discountPercent}% discount applied!</span>
            </div>
          )}
          {couponError && (
            <div
              className="flex items-center gap-1.5 mt-2 text-sm"
              style={{ color: "oklch(0.65 0.18 25)" }}
              data-ocid="checkout.coupon.error_state"
            >
              <XCircle className="w-4 h-4" />
              <span>{couponError}</span>
            </div>
          )}
        </div>

        {/* Trading Account Numbers */}
        <div className="space-y-3">
          {/* Primary account */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              {accountLabel}{" "}
              <span style={{ color: "oklch(0.65 0.18 25)" }}>*</span>
            </Label>
            <Input
              value={primaryAccount}
              onChange={(e) =>
                setPrimaryAccount(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder={`Enter your ${accountLabel}...`}
              inputMode="numeric"
              className="bg-secondary border-border font-mono text-sm"
              data-ocid="checkout.trading_account.input"
            />
          </div>

          {/* Additional license seat account fields */}
          {addonSlots.map((slot) => (
            <div key={slot.slotId}>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Additional License #{slot.slotId} Account Number{" "}
                <span style={{ color: "oklch(0.65 0.18 25)" }}>*</span>
              </Label>
              <Input
                value={slot.value}
                onChange={(e) => handleAddonChange(slot.slotId, e.target.value)}
                placeholder={`Enter account number for license #${slot.slotId}...`}
                inputMode="numeric"
                className="bg-secondary border-border font-mono text-sm"
                data-ocid={`checkout.additional_account.input.${slot.slotId}`}
              />
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            Enter the trading account number for each license seat.
          </p>
        </div>

        {/* Crypto Selector */}
        {!isTrial && (
          <>
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
                ⚠ Admin must configure real wallet addresses in Admin &gt;
                Wallets. After sending, paste your transaction ID below.
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
                Send exactly ${discountedTotal} worth of {selectedCoin} then
                paste the TxID.
              </p>
            </div>
          </>
        )}

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
