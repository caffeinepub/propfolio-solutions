import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn, isAdmin, logout } = useAuth();

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 border-b border-border/50 backdrop-blur-md"
      style={{ background: "oklch(0.065 0.009 258 / 0.92)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-14 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          data-ocid="nav.link"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.135 185), oklch(0.55 0.14 190))",
            }}
          >
            <TrendingUp
              className="w-4.5 h-4.5"
              style={{ color: "oklch(0.065 0.009 258)" }}
              strokeWidth={2.5}
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            <span style={{ color: "oklch(0.71 0.115 72)" }}>Prop</span>
            <span className="text-foreground">Folio</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex items-center gap-7"
          aria-label="Main navigation"
        >
          <Link
            to="/products"
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            data-ocid="nav.products.link"
          >
            Products
          </Link>
          {[
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/#pricing" },
            { label: "Offers", href: "/#offers" },
            { label: "FAQ", href: "/#faq" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              data-ocid="nav.link"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link to={isAdmin ? "/admin" : "/dashboard"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  data-ocid="nav.link"
                >
                  {isAdmin ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {isAdmin ? "Admin" : "Dashboard"}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2 text-muted-foreground hover:text-destructive"
                data-ocid="nav.link"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  data-ocid="nav.link"
                >
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="rounded-full px-5 font-semibold shadow-teal"
                  style={{
                    background: "oklch(0.72 0.135 185)",
                    color: "oklch(0.065 0.009 258)",
                  }}
                  data-ocid="nav.primary_button"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-border/50 px-6 py-4 space-y-3"
            style={{ background: "oklch(0.09 0.012 252)" }}
          >
            <Link
              to="/products"
              className="block text-sm text-muted-foreground hover:text-primary py-1 font-medium"
              data-ocid="nav.products.link"
              onClick={() => setMobileOpen(false)}
            >
              Products
            </Link>
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "Offers", href: "/#offers" },
              { label: "FAQ", href: "/#faq" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-sm text-muted-foreground hover:text-primary py-1"
                data-ocid="nav.link"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    to={isAdmin ? "/admin" : "/dashboard"}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-ocid="nav.link"
                    >
                      {isAdmin ? "Admin Panel" : "Dashboard"}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full text-destructive"
                    data-ocid="nav.link"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-ocid="nav.link"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full rounded-full font-semibold"
                      style={{
                        background: "oklch(0.72 0.135 185)",
                        color: "oklch(0.065 0.009 258)",
                      }}
                      data-ocid="nav.primary_button"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
