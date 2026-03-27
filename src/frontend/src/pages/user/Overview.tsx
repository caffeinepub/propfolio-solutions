import {
  AlertCircle,
  Clock,
  CreditCard,
  Key,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { LicenseStatus, OrderStatus } from "../../backend";
import { useAuth } from "../../hooks/useAuth";
import { useGetMyLicenses, useGetMyOrders } from "../../hooks/useQueries";

function countdown(expiryNs: bigint): string {
  const expiryMs = Number(expiryNs / BigInt(1_000_000));
  const diffMs = expiryMs - Date.now();
  if (diffMs <= 0) return "Expired";
  const days = Math.floor(diffMs / 86400000);
  if (days > 0) return `${days}d remaining`;
  const hours = Math.floor(diffMs / 3600000);
  return `${hours}h remaining`;
}

export default function Overview() {
  const { profile } = useAuth();
  const { data: licenses, isLoading: licsLoading } = useGetMyLicenses();
  const { data: orders, isLoading: ordersLoading } = useGetMyOrders();

  const activeLics =
    licenses?.filter(([, l]) => l.status === LicenseStatus.Active) ?? [];
  const pendingOrders =
    orders?.filter(([, o]) => o.status === OrderStatus.Pending) ?? [];

  return (
    <div data-ocid="overview.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">
          Welcome back{profile?.name ? `, ${profile.name}` : ""}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's a summary of your PropFolio account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Active Licenses",
            value: activeLics.length,
            icon: Key,
            color: "oklch(0.72 0.135 185)",
          },
          {
            label: "Total Orders",
            value: orders?.length ?? 0,
            icon: CreditCard,
            color: "oklch(0.71 0.115 72)",
          },
          {
            label: "Pending Payments",
            value: pendingOrders.length,
            icon: AlertCircle,
            color: "oklch(0.577 0.245 27)",
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
            <div className="text-2xl font-extrabold text-foreground">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Active Licenses */}
      <div
        className="rounded-xl border border-border overflow-hidden mb-6"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" /> Active Licenses
          </h2>
        </div>
        {licsLoading ? (
          <div
            className="flex items-center justify-center py-10"
            data-ocid="overview.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activeLics.length === 0 ? (
          <div className="py-10 text-center" data-ocid="overview.empty_state">
            <Key className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No active licenses yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Purchase a subscription from the Pricing section.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {activeLics.map(([id, lic], i) => (
              <div
                key={id.toString()}
                className="px-5 py-4 flex items-center justify-between gap-4"
                data-ocid={`overview.item.${i + 1}`}
              >
                <div>
                  <div className="text-sm font-semibold text-foreground font-mono">
                    {lic.licenseKey}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {lic.platform} &bull; {lic.accountNumbers.length} accounts
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "oklch(0.72 0.135 185)" }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.72 0.135 185)" }}
                    >
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {countdown(lic.expiryDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Recent Orders
          </h2>
        </div>
        {ordersLoading ? (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="overview.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (orders?.length ?? 0) === 0 ? (
          <div className="py-8 text-center" data-ocid="overview.empty_state">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {orders!.slice(0, 5).map(([id, order], i) => (
              <div
                key={id.toString()}
                className="px-5 py-3 flex items-center justify-between gap-4"
                data-ocid={`overview.item.${i + 1}`}
              >
                <div className="text-sm text-foreground">
                  ${order.amount} &mdash; {order.cryptoCoin}
                </div>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
