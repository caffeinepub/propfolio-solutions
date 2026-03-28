import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { Check, Minus, Plus, Star, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import CheckoutModal from "./CheckoutModal";

const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

interface Plan {
  id: string;
  title: string;
  platform: string;
  icon: string;
  monthlyPrice: number;
  yearlyPrice: number;
  addonMonthlyPrice: number;
  features: string[];
  accentColor: string;
}

interface Bundle {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  discountPct: number;
  baseMonthly: number;
  isBestValue: boolean;
}

const PLANS: Plan[] = [
  {
    id: "ctrader",
    title: "cTrader Elite Edition",
    platform: "cTrader (Desktop/Web)",
    icon: "/assets/uploads/image-019d33f6-ad58-71ca-b5f5-0447e290bbc6-1.png",
    monthlyPrice: 30,
    yearlyPrice: 250,
    addonMonthlyPrice: 20,
    features: [
      "Smart Hedge Module (6-Leg Control)",
      "Visual R:R Entry Tracking",
      "Emotional Revenge Trading Guard (Hard Lock)",
      "Dynamic $ Risk Calculation",
      "1-Click Symbol Targeting",
    ],
    accentColor: "#00b264",
  },
  {
    id: "mt5",
    title: "MetaTrader 5 (MT5) Pro Suite",
    platform: "MetaTrader 5",
    icon: "/assets/uploads/image-019d33f6-aea6-74f8-827d-eabc37cb3e0b-2.png",
    monthlyPrice: 25,
    yearlyPrice: 200,
    addonMonthlyPrice: 15,
    features: [
      "Professional News Engine (ForexFactory Sync)",
      "Visual R:R Labels (SL/TP Pips & $)",
      "Advanced Trailing & Profit Lock",
      "Prop Firm Violation Monitor",
      "Revenge Trading Block (1hr Direction Lock)",
    ],
    accentColor: "#1a56db",
  },
  {
    id: "mt4",
    title: "MetaTrader 4 (MT4) Legacy Suite",
    platform: "MetaTrader 4",
    icon: "/assets/uploads/image-019d33f6-aff9-7468-af6e-025dcc0bcece-4.png",
    monthlyPrice: 25,
    yearlyPrice: 200,
    addonMonthlyPrice: 15,
    features: [
      "Full MT5 Feature Set (MT4 Architecture)",
      "Robust Execution Engine",
      "Local & Telegram Alert System",
      "1 Single Account License Included",
      "Additional Account Licenses Available",
    ],
    accentColor: "#d97706",
  },
];

const BUNDLES: Bundle[] = [
  {
    id: "duo",
    title: "Pro-Duo Combo",
    subtitle: "Choose ANY 2 Platforms",
    description: "e.g. MT5 + cTrader — the perfect dual-platform setup",
    discountPct: 40,
    baseMonthly: 55,
    isBestValue: false,
  },
  {
    id: "master",
    title: "The Ultimate PropFolio Master Pack",
    subtitle: "All 3 Platforms — MT4, MT5 & cTrader",
    description: "The complete arsenal for serious prop traders",
    discountPct: 50,
    baseMonthly: 80,
    isBestValue: true,
  },
];

interface PricingControl {
  discountEnabled: boolean;
  discountedPrice: number;
  offerBannerTitle: string;
}

type PricingControls = Record<string, PricingControl>;

const LS_KEY = "pf_pricing_controls";

function loadControls(): PricingControls {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function AddonStepper({
  value,
  onChange,
  pricePerAddon,
}: {
  value: number;
  onChange: (v: number) => void;
  pricePerAddon: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
      <span className="text-xs text-muted-foreground">
        +{value > 0 ? `${value} extra` : "0"} license{value !== 1 ? "s" : ""}
        {value > 0 && (
          <span className="ml-1" style={{ color: "oklch(0.72 0.135 185)" }}>
            (+${value * pricePerAddon}/mo)
          </span>
        )}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          className="w-6 h-6 rounded flex items-center justify-center border border-border text-foreground disabled:opacity-30 hover:border-primary transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-5 text-center text-sm font-bold text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(5, value + 1))}
          disabled={value === 5}
          className="w-6 h-6 rounded flex items-center justify-center border border-border text-foreground disabled:opacity-30 hover:border-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [addons, setAddons] = useState<Record<string, number>>({});
  const [controls, setControls] = useState<PricingControls>({});
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [checkoutAddonCount, setCheckoutAddonCount] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setControls(loadControls());
    const onStorage = () => setControls(loadControls());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getAddon = (id: string) => addons[id] ?? 0;
  const setAddon = (id: string, v: number) =>
    setAddons((prev) => ({ ...prev, [id]: v }));

  const handleCTA = (
    planId: string,
    addonCount: number,
    billingCycle: "monthly" | "annual",
  ) => {
    if (!isLoggedIn) {
      navigate({
        to: "/register",
        search: {
          plan: planId,
          addons: addonCount,
          billing: billingCycle,
        } as any,
      });
      return;
    }
    const plan = PLANS.find((p) => p.id === planId);
    if (plan) {
      setCheckoutPlan(plan);
      setCheckoutAddonCount(addonCount);
      setCheckoutOpen(true);
    }
  };

  const handleBundleCTA = (bundleId: string) => {
    if (!isLoggedIn) {
      navigate({
        to: "/register",
        search: { plan: bundleId } as any,
      });
    } else {
      // Bundle plans use the Master plan as placeholder for checkout
      const proxyPlan: Plan = {
        id: bundleId,
        title: BUNDLES.find((b) => b.id === bundleId)?.title ?? bundleId,
        platform: "Bundle",
        icon: "",
        monthlyPrice: Math.round(
          (BUNDLES.find((b) => b.id === bundleId)?.baseMonthly ?? 0) *
            (1 -
              (BUNDLES.find((b) => b.id === bundleId)?.discountPct ?? 0) / 100),
        ),
        yearlyPrice:
          Math.round(
            (BUNDLES.find((b) => b.id === bundleId)?.baseMonthly ?? 0) *
              (1 -
                (BUNDLES.find((b) => b.id === bundleId)?.discountPct ?? 0) /
                  100),
          ) * 12,
        addonMonthlyPrice: 0,
        features: [],
        accentColor: "oklch(0.71 0.115 72)",
      };
      setCheckoutPlan(proxyPlan);
      setCheckoutAddonCount(0);
      setCheckoutOpen(true);
    }
  };

  const getDisplayPrice = (
    plan: Plan,
  ): { price: number; original?: number } => {
    const ctrl = controls[plan.id];
    const base = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
    if (ctrl?.discountEnabled && ctrl.discountedPrice > 0) {
      return {
        price:
          billing === "monthly"
            ? ctrl.discountedPrice
            : Math.round(ctrl.discountedPrice * 10),
        original: base,
      };
    }
    return { price: base };
  };

  const annualSavingsPct = (plan: Plan) => {
    const monthly12 = plan.monthlyPrice * 12;
    const savings = ((monthly12 - plan.yearlyPrice) / monthly12) * 100;
    return Math.round(savings);
  };

  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.72 0.135 185)" }}
          >
            TRANSPARENT PRICING
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4">
            Choose Your Edge
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Platform-specific tools built for prop traders. Each suite is
            precision-engineered for its native environment.
          </p>

          {/* Billing toggle */}
          <div
            className="inline-flex items-center gap-1 mt-6 rounded-full p-1 border border-border"
            style={{ background: "oklch(0.09 0.012 252)" }}
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className="px-5 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background:
                  billing === "monthly"
                    ? "oklch(0.72 0.135 185)"
                    : "transparent",
                color:
                  billing === "monthly"
                    ? "oklch(0.065 0.009 258)"
                    : "oklch(0.725 0.022 242)",
              }}
              data-ocid="pricing.monthly.toggle"
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className="px-5 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background:
                  billing === "annual"
                    ? "oklch(0.72 0.135 185)"
                    : "transparent",
                color:
                  billing === "annual"
                    ? "oklch(0.065 0.009 258)"
                    : "oklch(0.725 0.022 242)",
              }}
              data-ocid="pricing.annual.toggle"
            >
              Annual
              {billing !== "annual" && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: "oklch(0.71 0.115 72 / 0.2)",
                    color: "oklch(0.71 0.115 72)",
                  }}
                >
                  Save 30%+
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          variants={STAGGER}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {PLANS.map((plan, idx) => {
            const ctrl = controls[plan.id];
            const bannerTitle = ctrl?.offerBannerTitle?.trim();
            const { price, original } = getDisplayPrice(plan);
            const addonCount = getAddon(plan.id);

            return (
              <motion.div
                key={plan.id}
                variants={FADE_UP}
                className="relative rounded-2xl border border-border overflow-hidden flex flex-col card-hover"
                style={{ background: "oklch(0.115 0.022 245)" }}
                data-ocid={`pricing.item.${idx + 1}`}
              >
                {/* Accent top bar */}
                <div className="h-1" style={{ background: plan.accentColor }} />

                {/* Offer banner ribbon */}
                {bannerTitle && (
                  <div
                    className="absolute top-4 right-0 z-10 px-3 py-1 text-xs font-bold shadow-lg"
                    style={{
                      background: "oklch(0.71 0.115 72)",
                      color: "oklch(0.065 0.009 258)",
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)",
                    }}
                  >
                    🏷 {bannerTitle}
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Icon + title */}
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src={plan.icon}
                      alt={plan.platform}
                      className="w-12 h-12 object-contain rounded-lg"
                      style={{
                        background: `${plan.accentColor}18`,
                        padding: "4px",
                      }}
                    />
                    <div>
                      <div className="font-extrabold text-sm text-foreground leading-tight">
                        {plan.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {plan.platform}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-xs text-foreground/90"
                      >
                        <Check
                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                          style={{ color: plan.accentColor }}
                          strokeWidth={2.5}
                        />
                        {feat}
                      </li>
                    ))}
                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check
                        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                        style={{ color: plan.accentColor }}
                        strokeWidth={2.5}
                      />
                      1 Account License Included
                    </li>
                  </ul>

                  {/* Addon stepper */}
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-1.5 font-semibold">
                      Additional Account Licenses (+${plan.addonMonthlyPrice}/mo
                      each)
                    </div>
                    <AddonStepper
                      value={addonCount}
                      onChange={(v) => setAddon(plan.id, v)}
                      pricePerAddon={plan.addonMonthlyPrice}
                    />
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      {original !== undefined && (
                        <span className="text-lg font-bold line-through text-muted-foreground">
                          ${original}
                        </span>
                      )}
                      <span
                        className="text-3xl font-extrabold"
                        style={{ color: "oklch(0.71 0.115 72)" }}
                      >
                        ${price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{billing === "monthly" ? "mo" : "yr"}
                      </span>
                      {billing === "annual" && (
                        <Badge
                          className="text-xs font-bold ml-1"
                          style={{
                            background: "oklch(0.72 0.135 185 / 0.15)",
                            color: "oklch(0.72 0.135 185)",
                            border: "none",
                          }}
                        >
                          Save {annualSavingsPct(plan)}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => handleCTA(plan.id, addonCount, billing)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all gold-glow-btn"
                    data-ocid={`pricing.get_started.button.${idx + 1}`}
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bundle Cards */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.71 0.115 72)" }}
            >
              POWER BUNDLES
            </div>
            <h3 className="text-xl font-extrabold text-foreground">
              Save More With a Bundle
            </h3>
          </div>
          <motion.div
            variants={STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-5"
          >
            {BUNDLES.map((bundle, idx) => {
              const discountedMonthly = Math.round(
                bundle.baseMonthly * (1 - bundle.discountPct / 100),
              );
              const ctrl = controls[bundle.id];
              const bannerTitle = ctrl?.offerBannerTitle?.trim();

              return (
                <motion.div
                  key={bundle.id}
                  variants={FADE_UP}
                  className="relative rounded-2xl border overflow-hidden p-6 card-hover"
                  style={{
                    background: bundle.isBestValue
                      ? "oklch(0.13 0.025 243)"
                      : "oklch(0.115 0.022 245)",
                    borderColor: bundle.isBestValue
                      ? "oklch(0.71 0.115 72 / 0.6)"
                      : "oklch(0.22 0.037 242)",
                    boxShadow: bundle.isBestValue
                      ? "0 0 32px oklch(0.71 0.115 72 / 0.15)"
                      : undefined,
                  }}
                  data-ocid={`pricing.bundle.item.${idx + 1}`}
                >
                  {/* Gold top bar for best value */}
                  {bundle.isBestValue && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background:
                          "linear-gradient(90deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                      }}
                    />
                  )}

                  {/* Offer banner */}
                  {bannerTitle && (
                    <div
                      className="absolute top-4 right-0 z-10 px-3 py-1 text-xs font-bold shadow-lg"
                      style={{
                        background: "oklch(0.71 0.115 72)",
                        color: "oklch(0.065 0.009 258)",
                        clipPath:
                          "polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)",
                      }}
                    >
                      🏷 {bannerTitle}
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {bundle.isBestValue && (
                          <Star
                            className="w-4 h-4"
                            style={{ color: "oklch(0.71 0.115 72)" }}
                            fill="oklch(0.71 0.115 72)"
                          />
                        )}
                        <span className="font-extrabold text-base text-foreground">
                          {bundle.title}
                        </span>
                        {bundle.isBestValue && (
                          <Badge
                            className="text-xs font-bold"
                            style={{
                              background: "oklch(0.71 0.115 72 / 0.2)",
                              color: "oklch(0.71 0.115 72)",
                              border: "none",
                            }}
                          >
                            BEST VALUE
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {bundle.subtitle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {bundle.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground line-through">
                          ${bundle.baseMonthly}/mo
                        </div>
                        <div
                          className="text-2xl font-extrabold"
                          style={{ color: "oklch(0.71 0.115 72)" }}
                        >
                          ${discountedMonthly}
                          <span className="text-xs text-muted-foreground font-normal">
                            /mo
                          </span>
                        </div>
                        <div
                          className="text-xs font-bold"
                          style={{ color: "oklch(0.72 0.135 185)" }}
                        >
                          {bundle.discountPct}% OFF
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleBundleCTA(bundle.id)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
                        style={{
                          background: bundle.isBestValue
                            ? "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))"
                            : "oklch(0.72 0.135 185)",
                          color: "oklch(0.065 0.009 258)",
                        }}
                        data-ocid={`pricing.bundle.button.${idx + 1}`}
                      >
                        <Zap className="w-4 h-4 inline mr-1" />
                        Get Bundle
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Legal Policy Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-border p-6"
          style={{ background: "oklch(0.09 0.012 252)" }}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Policies & Legal
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-bold text-foreground mb-1.5">
                Refund Policy (Try & Buy)
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Strict No-Refund Policy. We offer free trials for all our tools.
                Please test the software extensively before purchasing. Once a
                license is generated, the sale is final.
              </p>
            </div>
            <div>
              <div className="text-sm font-bold text-foreground mb-1.5">
                Subscription Cancellation
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Users can cancel subscriptions at any time via the User
                Dashboard. Access remains active until the end of the current
                billing cycle. No partial refunds for unused days.
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-border">
            {["Terms of Use", "Privacy Policy", "Risk Disclosure"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </motion.div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        plan={checkoutPlan}
        addonCount={checkoutAddonCount}
        billingCycle={billing}
      />
    </section>
  );
}
