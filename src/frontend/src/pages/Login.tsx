import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { isLoggedIn, isAdmin, isLoading, login, isAdminLoading, loginStatus } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && !isAdminLoading) {
      navigate({ to: isAdmin ? "/admin" : "/dashboard" });
    }
  }, [isLoggedIn, isAdmin, isAdminLoading, navigate]);

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 candlestick-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-8"
          style={{ background: "oklch(0.72 0.135 185)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-8"
          style={{ background: "oklch(0.71 0.115 72)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
        className="w-full max-w-md relative"
      >
        <div
          className="rounded-2xl border border-border p-8 shadow-2xl"
          style={{ background: "oklch(0.115 0.022 245)" }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.135 185), oklch(0.55 0.14 190))",
                }}
              >
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: "oklch(0.065 0.009 258)" }}
                  strokeWidth={2.5}
                />
              </div>
              <span className="font-extrabold text-xl">
                <span style={{ color: "oklch(0.71 0.115 72)" }}>Prop</span>
                <span className="text-foreground">Folio</span>
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Sign in to access your trading dashboard
          </p>

          {isLoading ? (
            <div
              className="flex flex-col items-center gap-4 py-6"
              data-ocid="login.loading_state"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Initializing secure connection...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full py-5 rounded-xl font-bold text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.135 185), oklch(0.55 0.14 190))",
                  color: "oklch(0.065 0.009 258)",
                }}
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing
                    In...
                  </>
                ) : (
                  "Sign In Securely"
                )}
              </Button>

              <div
                className="rounded-xl border border-border/50 p-4 text-xs text-muted-foreground"
                style={{ background: "oklch(0.09 0.012 252)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  🔒 Secure Blockchain Authentication
                </p>
                <p>
                  Your identity is verified via Internet Identity — a secure,
                  anonymous blockchain login. No password required.
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            New to PropFolio?{" "}
            <Link
              to="/register"
              className="font-semibold"
              style={{ color: "oklch(0.72 0.135 185)" }}
              data-ocid="login.link"
            >
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
