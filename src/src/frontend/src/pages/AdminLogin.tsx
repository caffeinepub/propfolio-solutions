import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { createActorWithConfig } from "../config";
import { useAdminPasswordAuth } from "../hooks/useAdminPasswordAuth";

export default function AdminLogin() {
  const { adminLogin } = useAdminPasswordAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const identity = await adminLogin(username, password);

      // Create actor with the derived identity
      const actor = (await createActorWithConfig({
        agentOptions: { identity },
      })) as any;

      // First-time setup: register this principal as admin if not yet registered
      const registered = await actor.isAdminRegistered();
      if (!registered) {
        const principalText = identity.getPrincipal().toString();
        await actor.setupFirstAdmin(principalText);
      }

      // Verify admin access
      const isAdmin = await actor.isCallerAdmin();
      if (isAdmin) {
        navigate({ to: "/admin" });
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message ?? "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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

          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(0.16 0.03 245)" }}
            >
              <ShieldCheck
                className="w-7 h-7"
                style={{ color: "oklch(0.71 0.115 72)" }}
              />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground text-center mb-2">
            Admin Login
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Sign in to access the admin panel
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-ocid="admin_login.modal"
          >
            <div className="space-y-2">
              <label
                htmlFor="admin-username"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Username
              </label>
              <Input
                id="admin-username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl border-border/60 bg-background/50 focus:border-primary"
                autoComplete="username"
                data-ocid="admin_login.input"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-border/60 bg-background/50 focus:border-primary"
                autoComplete="current-password"
                data-ocid="admin_login.textarea"
              />
            </div>

            {error && (
              <div
                className="rounded-xl border border-destructive/40 p-3 text-sm text-destructive"
                style={{ background: "oklch(0.09 0.012 252)" }}
                data-ocid="admin_login.error_state"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-5 rounded-xl font-bold text-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.71 0.115 72), oklch(0.58 0.12 72))",
                color: "oklch(0.065 0.009 258)",
              }}
              data-ocid="admin_login.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...
                </>
              ) : (
                "Login to Admin Panel"
              )}
            </Button>

            <div
              className="rounded-xl border border-border/50 p-4 text-xs text-muted-foreground"
              style={{ background: "oklch(0.09 0.012 252)" }}
            >
              <p className="font-semibold text-foreground mb-1">
                🔑 Default Credentials
              </p>
              <p>
                Username:{" "}
                <span className="text-foreground font-mono">admin</span>
              </p>
              <p>
                Password:{" "}
                <span className="text-foreground font-mono">admin123</span>
              </p>
            </div>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link
              to="/login"
              style={{ color: "oklch(0.72 0.135 185)" }}
              data-ocid="admin_login.link"
            >
              ← Back to User Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
