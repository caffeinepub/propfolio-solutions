import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const NAV = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Promotions", path: "/admin/promotions", icon: Tag },
  { label: "Wallets", path: "/admin/wallets", icon: Wallet },
  { label: "Affiliates", path: "/admin/affiliates", icon: Users },
  { label: "Support", path: "/admin/support", icon: MessageSquare },
  { label: "Files", path: "/admin/files", icon: FolderOpen },
  { label: "Brand Assets", path: "/admin/brand-assets", icon: ImageIcon },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminDashboard() {
  const { isLoggedIn, isAdmin, isLoading, isAdminLoading, logout } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdminLoading) {
      if (!isLoggedIn) navigate({ to: "/admin-login" });
      else if (!isAdmin) navigate({ to: "/dashboard" });
    }
  }, [isLoading, isAdminLoading, isLoggedIn, isAdmin, navigate]);

  if (isLoading || isAdminLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "oklch(0.09 0.012 252)" }}
      >
        <div className="h-16 flex items-center px-5 border-b border-border/50 gap-2">
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
          <div>
            <span className="font-extrabold text-sm">
              <span style={{ color: "oklch(0.71 0.115 72)" }}>Prop</span>
              <span className="text-foreground">Folio</span>
            </span>
            <div className="flex items-center gap-1">
              <Shield
                className="w-2.5 h-2.5"
                style={{ color: "oklch(0.71 0.115 72)" }}
              />
              <span
                className="text-xs"
                style={{ color: "oklch(0.71 0.115 72)" }}
              >
                Admin
              </span>
            </div>
          </div>
        </div>

        <nav
          className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto"
          aria-label="Admin navigation"
        >
          {NAV.map((item) => {
            const active =
              currentPath === item.path ||
              (item.path !== "/admin" && currentPath.startsWith(item.path));
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
                data-ocid={`admin.sidebar.${item.label.toLowerCase().replace(" ", "_")}.link`}
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

        <div className="p-3 border-t border-border/50 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground"
            data-ocid="admin.sidebar.link"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> User Dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive w-full transition-colors"
            data-ocid="admin.logout.button"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        <header
          className="h-14 border-b border-border/40 flex items-center px-5 gap-4"
          style={{ background: "oklch(0.09 0.012 252 / 0.9)" }}
        >
          <button
            type="button"
            className="lg:hidden p-1.5 text-muted-foreground"
            onClick={() => setSidebarOpen((v) => !v)}
            data-ocid="admin.toggle"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <div className="text-sm font-semibold text-foreground">
            Admin &mdash;{" "}
            {NAV.find(
              (n) =>
                n.path === currentPath ||
                (n.path !== "/admin" && currentPath.startsWith(n.path)),
            )?.label || "Overview"}
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
