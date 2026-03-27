import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../../backend";
import {
  useApproveOrder,
  useGetAllOrders,
  useGetAllProducts,
  useGetOrderTradingAccounts,
  useRejectOrder,
} from "../../hooks/useQueries";

export default function AdminOrders() {
  const { data: orders, isLoading } = useGetAllOrders();
  const { data: products } = useGetAllProducts();
  const approveOrder = useApproveOrder();
  const rejectOrder = useRejectOrder();
  const { data: tradingAccounts } = useGetOrderTradingAccounts();
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const productMap = new Map(
    products?.map(([id, p]) => [id.toString(), p.name]),
  );
  const tradingAccountMap = new Map(
    (tradingAccounts ?? []).map(([id, acct]) => [id.toString(), acct]),
  );

  const filtered = (orders ?? []).filter(
    ([id, o]) =>
      id.toString().includes(search) ||
      o.cryptoCoin.toLowerCase().includes(search.toLowerCase()) ||
      o.paymentHash.toLowerCase().includes(search.toLowerCase()),
  );

  const handleApprove = async (id: bigint) => {
    setPendingId(id.toString());
    try {
      await approveOrder.mutateAsync(id);
      toast.success("Order approved & license generated!");
    } catch {
      toast.error("Failed to approve order");
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (id: bigint) => {
    setPendingId(id.toString());
    try {
      await rejectOrder.mutateAsync(id);
      toast.success("Order rejected");
    } catch {
      toast.error("Failed to reject order");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div data-ocid="admin.orders.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            Order Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve or reject crypto payments and generate licenses.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="pl-9 bg-secondary border-border w-56 text-sm"
            data-ocid="admin.orders.search_input"
          />
        </div>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="admin.orders.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border border-border p-12 text-center"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="admin.orders.empty_state"
        >
          <p className="text-sm text-muted-foreground">No orders found.</p>
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
                    "Product",
                    "Trading Acct",
                    "Amount",
                    "Coin",
                    "Status",
                    "Payment Hash",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map(([id, order], i) => {
                  const isPending = pendingId === id.toString();
                  return (
                    <tr
                      key={id.toString()}
                      className="hover:bg-secondary/30 transition-colors"
                      data-ocid={`admin.orders.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{id.toString().slice(-6)}
                      </td>
                      <td className="px-4 py-3 text-foreground text-xs">
                        {productMap.get(order.productId.toString()) ??
                          `#${order.productId}`}
                      </td>
                      <td className="px-4 py-3">
                        <code
                          className="text-xs font-mono"
                          style={{ color: "oklch(0.72 0.135 185)" }}
                        >
                          {tradingAccountMap.get(id.toString()) ?? "—"}
                        </code>
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
                          {order.paymentHash.slice(0, 24)}...
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        {order.status === OrderStatus.Pending && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(id)}
                              disabled={isPending}
                              className="gap-1 text-xs h-7 px-2.5"
                              style={{
                                background: "oklch(0.72 0.135 185 / 0.15)",
                                color: "oklch(0.72 0.135 185)",
                              }}
                              data-ocid={`admin.orders.confirm_button.${i + 1}`}
                            >
                              {isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(id)}
                              disabled={isPending}
                              className="gap-1 text-xs h-7 px-2.5 text-destructive hover:text-destructive"
                              data-ocid={`admin.orders.delete_button.${i + 1}`}
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
