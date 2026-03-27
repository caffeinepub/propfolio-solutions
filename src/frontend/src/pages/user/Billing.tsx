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
import { Check, Copy, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../../backend";
import {
  useCreateOrder,
  useGetAllProducts,
  useGetMyOrders,
} from "../../hooks/useQueries";

const WALLETS = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  USDT: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
};

export default function Billing() {
  const { data: orders, isLoading } = useGetMyOrders();
  const { data: products } = useGetAllProducts();
  const createOrder = useCreateOrder();
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [coin, setCoin] = useState("USDT");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copyWallet = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (!hash.trim()) {
      toast.error("Please enter the transaction hash");
      return;
    }
    const prodEntry = products?.find(
      ([id]) => id.toString() === selectedProduct,
    );
    if (!prodEntry) return;
    const [prodId, prod] = prodEntry;
    setSubmitting(true);
    try {
      await createOrder.mutateAsync({
        productId: prodId,
        amount: prod.price,
        cryptoCoin: coin,
        paymentHash: hash.trim(),
      });
      toast.success("Order submitted! Our team will verify your payment.");
      setNewOrderOpen(false);
      setHash("");
      setSelectedProduct("");
    } catch {
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-ocid="billing.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            Billing & Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your order history and submit new payments.
          </p>
        </div>
        <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 text-sm font-semibold"
              style={{
                background: "oklch(0.72 0.135 185)",
                color: "oklch(0.065 0.009 258)",
              }}
              data-ocid="billing.open_modal_button"
            >
              <CreditCard className="w-4 h-4" /> New Order
            </Button>
          </DialogTrigger>
          <DialogContent
            className="border-border max-w-lg"
            style={{ background: "oklch(0.115 0.022 245)" }}
            data-ocid="billing.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Submit New Payment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Select Product
                </Label>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="billing.select"
                  >
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(0.14 0.025 243)" }}
                  >
                    {(products ?? []).map(([id, p]) => (
                      <SelectItem key={id.toString()} value={id.toString()}>
                        {p.name} — ${p.price}/{p.platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Payment Coin
                </Label>
                <Select value={coin} onValueChange={setCoin}>
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="billing.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(0.14 0.025 243)" }}
                  >
                    {Object.keys(WALLETS).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet address */}
              <div
                className="rounded-xl border border-border p-4"
                style={{ background: "oklch(0.09 0.012 252)" }}
              >
                <p className="text-xs text-muted-foreground mb-2 font-semibold">
                  Send {coin} to this address:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-foreground font-mono flex-1 break-all">
                    {WALLETS[coin as keyof typeof WALLETS]}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      copyWallet(WALLETS[coin as keyof typeof WALLETS])
                    }
                    className="p-1.5 rounded text-muted-foreground hover:text-primary flex-shrink-0"
                    data-ocid="billing.button"
                  >
                    {copied === WALLETS[coin as keyof typeof WALLETS] ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Transaction Hash
                </Label>
                <Input
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="0x... or TxID"
                  className="bg-secondary border-border font-mono text-xs"
                  data-ocid="billing.input"
                />
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Paste the transaction
                  hash after sending payment
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="flex-1 font-semibold"
                  style={{
                    background: "oklch(0.72 0.135 185)",
                    color: "oklch(0.065 0.009 258)",
                  }}
                  data-ocid="billing.submit_button"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNewOrderOpen(false)}
                  className="flex-1"
                  data-ocid="billing.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="billing.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (orders?.length ?? 0) === 0 ? (
        <div
          className="rounded-xl border border-border p-12 text-center"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="billing.empty_state"
        >
          <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden"
          style={{ background: "oklch(0.115 0.022 245)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {[
                    "Order",
                    "Amount",
                    "Coin",
                    "Status",
                    "Payment Hash",
                    "Actions",
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
                {orders!.map(([id, order], i) => (
                  <tr
                    key={id.toString()}
                    className="hover:bg-secondary/30 transition-colors"
                    data-ocid={`billing.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{id.toString().slice(-6)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      ${order.amount}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {order.cryptoCoin}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          order.status === OrderStatus.Approved
                            ? "bg-primary/10 text-primary"
                            : order.status === OrderStatus.Pending
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-muted-foreground">
                        {order.paymentHash.slice(0, 20)}...
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {order.status === OrderStatus.Pending && (
                        <span className="text-xs text-muted-foreground">
                          Awaiting verification
                        </span>
                      )}
                      {order.status === OrderStatus.Approved && (
                        <span
                          className="text-xs"
                          style={{ color: "oklch(0.72 0.135 185)" }}
                        >
                          License issued
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
