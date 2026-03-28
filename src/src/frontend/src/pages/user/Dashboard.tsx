import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  CreditCard,
  Download,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const NAV = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Downloads", path: "/dashboard/downloads", icon: Download },
  { label: "Licenses", path: "/dashboard/licenses", icon: Key },
  { label: "Billing", path: "/dashboard/billing", icon: CreditCard },
  { label: "Support", path: "/dashboard/support", icon: MessageSquare },
  { label: "Referral", path: "/dashboard/referral", icon: Users },
];

export default function Dashboard() {
  const { isLoggedIn, isLoading, logout, profile } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isLoggedIn, navigate]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="dashboard.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "oklch(0.09 0.012 252)" }}
      >
        <div className="h-16 flex items-center px-5 border-b border-border/50">
          <Link
            to="/"
            className="flex items-center gap-2"
            data-ocid="sidebar.link"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.135 185), oklch(0.55 0.14 190))",
              }}
            >
              <TrendingUp
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.065 0.009 258)" }}
                strokeWidth={2.5}
              />
            </div>
            <span className="font-extrabold text-sm">
              <span style={{ color: "oklch(0.71 0.115 72)" }}>Prop</span>
              <span className="text-foreground">Folio</span>
            </span>
          </Link>
        </div>

        {profile && (
          <div className="px-4 py-3 border-b border-border/50">
            <div className="text-xs font-semibold text-foreground truncate">
              {profile.name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {profile.email}
            </div>
          </div>
        )}

        <nav
          className="flex-1 py-4 px-3 space-y-0.5"
          aria-label="Dashboard navigation"
        >
          {NAV.map((item) => {
            const active =
              currentPath === item.path ||
              (item.path !== "/dashboard" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path as any}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                data-ocid={`sidebar.${item.label.toLowerCase()}.link`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {active && (
                  <div
                    className="ml-auto w-1 h-4 rounded-full"
                    style={{ background: "oklch(0.72 0.135 185)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive w-full transition-colors"
            data-ocid="sidebar.logout.button"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Top bar */}
        <header
          className="h-14 border-b border-border/40 flex items-center px-5 gap-4"
          style={{ background: "oklch(0.09 0.012 252 / 0.9)" }}
        >
          <button
            type="button"
            className="lg:hidden p-1.5 text-muted-foreground"
            onClick={() => setSidebarOpen((v) => !v)}
            data-ocid="dashboard.toggle"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <div className="text-sm font-semibold text-foreground">
            {NAV.find(
              (n) =>
                n.path === currentPath ||
                (n.path !== "/dashboard" && currentPath.startsWith(n.path)),
            )?.label || "Dashboard"}
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
