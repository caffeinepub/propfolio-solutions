import { Clock, DollarSign, Loader2, ShoppingCart, Users } from "lucide-react";
import { OrderStatus } from "../../backend";
import { useGetAllOrders, useGetAllProducts } from "../../hooks/useQueries";

export default function AdminOverview() {
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();
  const { data: products } = useGetAllProducts();

  const pendingOrders =
    orders?.filter(([, o]) => o.status === OrderStatus.Pending) ?? [];
  const approvedOrders =
    orders?.filter(([, o]) => o.status === OrderStatus.Approved) ?? [];
  const totalRevenue = approvedOrders.reduce((sum, [, o]) => sum + o.amount, 0);

  const stats = [
    {
      label: "Total Products",
      value: products?.length ?? 0,
      icon: ShoppingCart,
      color: "oklch(0.72 0.135 185)",
    },
    {
      label: "Total Orders",
      value: orders?.length ?? 0,
      icon: Users,
      color: "oklch(0.71 0.115 72)",
    },
    {
      label: "Revenue (Approved)",
      value: `$${totalRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: "oklch(0.71 0.115 72)",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.length,
      icon: Clock,
      color: "oklch(0.577 0.245 27)",
    },
  ];

  return (
    <div data-ocid="admin.overview.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">
          Admin Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform statistics and quick actions.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
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
            <div className="text-2xl font-extrabold text-foreground">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pending orders quick view */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <h2 className="text-sm font-bold text-foreground">Pending Orders</h2>
          {pendingOrders.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-500/10 text-yellow-400">
              {pendingOrders.length}
            </span>
          )}
        </div>
        {ordersLoading ? (
          <div
            className="flex items-center justify-center py-10"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : pendingOrders.length === 0 ? (
          <div
            className="py-10 text-center"
            data-ocid="admin.overview.empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No pending orders. All clear!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {pendingOrders.slice(0, 5).map(([id, order], i) => (
              <div
                key={id.toString()}
                className="px-5 py-3 flex items-center justify-between gap-4"
                data-ocid={`admin.overview.item.${i + 1}`}
              >
                <div className="text-sm text-foreground">
                  <span className="font-mono text-xs text-muted-foreground mr-2">
                    #{id.toString().slice(-6)}
                  </span>
                  {order.cryptoCoin} &mdash; ${order.amount}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-500/10 text-yellow-400">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
