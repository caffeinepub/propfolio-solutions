import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useSaveProfile } from "../hooks/useQueries";

export default function Register() {
  const {
    isLoggedIn,
    isAdmin,
    isAdminLoading,
    login,
    isLoading,
    loginStatus,
    profile,
  } = useAuth();
  const navigate = useNavigate();
  const saveProfile = useSaveProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"connect" | "profile">("connect");
  const [saving, setSaving] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (isLoggedIn && step === "connect") {
      if (profile?.name) {
        // Already has profile - redirect
        navigate({ to: "/dashboard" });
      } else {
        setStep("profile");
      }
    }
  }, [isLoggedIn, profile, step, isAdmin, navigate]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (isLoggedIn && !isAdminLoading && profile?.name) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoggedIn, isAdmin, isAdminLoading, profile, navigate]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSaving(true);
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        createdAt: BigInt(Date.now()),
      });
      toast.success("Profile saved! Welcome to PropFolio.");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 candlestick-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-8"
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

          {step === "connect" ? (
            <>
              <h1 className="text-2xl font-extrabold text-foreground text-center mb-2">
                Create Account
              </h1>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Start your professional trading journey today
              </p>
              {isLoading ? (
                <div
                  className="flex flex-col items-center gap-4 py-6"
                  data-ocid="register.loading_state"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Initializing...
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    onClick={login}
                    disabled={isLoggingIn}
                    className="w-full py-5 rounded-xl font-bold text-sm mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.72 0.135 185), oklch(0.55 0.14 190))",
                      color: "oklch(0.065 0.009 258)",
                    }}
                    data-ocid="register.primary_button"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      "Connect with Internet Identity"
                    )}
                  </Button>
                  <div
                    className="rounded-xl border border-border/50 p-4 text-xs text-muted-foreground"
                    style={{ background: "oklch(0.09 0.012 252)" }}
                  >
                    <p className="font-semibold text-foreground mb-1">
                      🔒 Zero-Knowledge Authentication
                    </p>
                    <p>
                      No email or password required. Your identity is secured by
                      blockchain cryptography.
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-foreground text-center mb-2">
                Complete Your Profile
              </h1>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Just a few details to set up your account
              </p>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Full Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-secondary border-border"
                    data-ocid="register.input"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-secondary border-border"
                    data-ocid="register.input"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full py-5 rounded-xl font-bold text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.71 0.115 72), oklch(0.75 0.12 75))",
                    color: "oklch(0.065 0.009 258)",
                  }}
                  data-ocid="register.submit_button"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold"
              style={{ color: "oklch(0.72 0.135 185)" }}
              data-ocid="register.link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
