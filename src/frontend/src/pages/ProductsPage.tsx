import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  ChevronRight,
  Filter,
  Layers,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import ComboBuilder from "../components/ComboBuilder";
import ProductCard, { type ProductCardData } from "../components/ProductCard";
import { useGetAllProducts, useGetLifetimePrices } from "../hooks/useQueries";
import {
  useGetAllProductTrialSettings,
  useHasCallerUsedTrial,
} from "../hooks/useTrialQueries";
import { type Combo, loadCombos } from "../lib/combos";

const STATIC_PRODUCTS: ProductCardData[] = [
  {
    id: 1n,
    name: "PropFolio Professional Traders Suite",
    description:
      "Manual execution suite with advanced risk management tools for serious prop traders.",
    platform: "cTrader / MT4 / MT5",
    tier: "EA",
    price: 30,
    features: [
      "Visual Risk Management (VRR)",
      "Smart Hedging",
      "News Embargo Guard",
      "Tilt/Psychology Lock",
    ],
    isActive: true,
    addonPrice: 20,
    hasInstructions: true,
  },
  {
    id: 2n,
    name: "PropFolio Peak Formation Dashboard",
    description:
      "Identify market peaks and formations with precision using advanced pattern recognition.",
    platform: "MT4/MT5/cTrader",
    tier: "Indicator",
    price: 25,
    features: [
      "Peak Formation Detection",
      "Multi-Timeframe Analysis",
      "Alert System",
      "Dashboard View",
    ],
    isActive: true,
  },
  {
    id: 3n,
    name: "PropFolio SMC Powerhouse",
    description:
      "Smart Money Concepts indicator suite for institutional-level market analysis.",
    platform: "MT4/MT5/cTrader",
    tier: "Indicator",
    price: 25,
    features: [
      "Order Block Detection",
      "Fair Value Gaps",
      "Break of Structure",
      "Change of Character",
    ],
    isActive: true,
  },
  {
    id: 4n,
    name: "PropFolio Advanced Currency Strength",
    description:
      "Real-time currency strength meter for identifying the strongest trading pairs.",
    platform: "MT4/MT5/cTrader",
    tier: "Indicator",
    price: 20,
    features: [
      "Real-Time Strength Meter",
      "8 Major Currencies",
      "Visual Heat Map",
      "Trend Confirmation",
    ],
    isActive: true,
  },
  {
    id: 5n,
    name: "PropFolio GOLD RUSH",
    description:
      "Fully automated EA optimized for XAUUSD gold trading with intelligent risk controls.",
    platform: "MT4/MT5",
    tier: "EA",
    price: 49,
    features: [
      "Fully Automated",
      "Gold-Optimized Algorithm",
      "Smart Stop Loss",
      "News Filter",
    ],
    isActive: false,
  },
  {
    id: 6n,
    name: "PropFolio Liquidity Sweeps",
    description:
      "Detect and trade institutional liquidity sweeps before major price movements.",
    platform: "MT4/MT5/cTrader",
    tier: "Indicator",
    price: 29,
    features: [
      "Liquidity Zone Mapping",
      "Sweep Detection",
      "Entry Signals",
      "Risk Zones",
    ],
    isActive: false,
  },
  {
    id: 7n,
    name: "PropFolio Sentiment Analysis",
    description:
      "Market sentiment dashboard powered by real-time data feeds and positioning data.",
    platform: "MT4/MT5/cTrader",
    tier: "Indicator",
    price: 35,
    features: [
      "Market Sentiment Gauge",
      "COT Data Integration",
      "Retail vs Institutional",
      "Trend Bias",
    ],
    isActive: false,
  },
  {
    id: 8n,
    name: "PropFolio Universal IndicatorEA",
    description:
      "The ultimate hybrid indicator and EA that adapts to any market condition automatically.",
    platform: "MT4/MT5/cTrader",
    tier: "EA",
    price: 59,
    features: [
      "Hybrid Indicator+EA",
      "Auto-Adaptive Algorithm",
      "Multi-Market Support",
      "Cloud Sync",
    ],
    isActive: false,
  },
];

const PLATFORM_FILTERS = ["All", "cTrader", "MT4", "MT5"] as const;
const TYPE_FILTERS = ["All", "Indicator", "EA", "Cbot"] as const;

type PlatformFilter = (typeof PLATFORM_FILTERS)[number];
type TypeFilter = (typeof TYPE_FILTERS)[number];

export default function ProductsPage() {
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "annual" | "lifetime"
  >("monthly");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("All");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");

  const [promoBannerDismissed, setPromoBannerDismissed] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [featuredCombos, setFeaturedCombos] = useState<Combo[]>([]);
  const { data: backendProducts } = useGetAllProducts();
  const { data: lifetimePricesRaw } = useGetLifetimePrices();
  const { data: trialSettingsRaw } = useGetAllProductTrialSettings();
  const { data: userHasUsedTrial } = useHasCallerUsedTrial();

  useEffect(() => {
    setFeaturedCombos(loadCombos().filter((c) => c.isFeatured && c.isActive));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("coupon");
    if (code) {
      setPromoCode(code.toUpperCase());
      localStorage.setItem("propfolio_promo_code", code.toUpperCase());
    }
  }, []);

  const lifetimePriceMap = useMemo(() => {
    const m = new Map<bigint, number>();
    if (lifetimePricesRaw) {
      for (const [id, price] of lifetimePricesRaw) {
        m.set(id, price);
      }
    }
    return m;
  }, [lifetimePricesRaw]);

  const trialSettingsMap = useMemo(() => {
    const m = new Map<
      bigint,
      { trialEnabled: boolean; trialDurationDays: number }
    >();
    if (trialSettingsRaw) {
      for (const [id, settings] of trialSettingsRaw) {
        m.set(id, {
          trialEnabled: settings.trialEnabled,
          trialDurationDays: Number(settings.trialDurationDays),
        });
      }
    }
    return m;
  }, [trialSettingsRaw]);

  const allProducts: ProductCardData[] = useMemo(() => {
    if (backendProducts && backendProducts.length > 0) {
      return backendProducts.map(([id, p]) => ({
        id,
        name: p.name,
        description: p.description,
        platform: p.platform,
        tier: p.tier,
        price: p.price,
        features: p.features,
        isActive: p.isActive,
        lifetimePrice: lifetimePriceMap.get(id) ?? 0,
        addonPrice: 20,
        trialEnabled: trialSettingsMap.get(id)?.trialEnabled ?? false,
        trialDurationDays: trialSettingsMap.get(id)?.trialDurationDays ?? 7,
      }));
    }
    return STATIC_PRODUCTS;
  }, [backendProducts, lifetimePriceMap, trialSettingsMap]);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const platMatch =
        platformFilter === "All" ||
        p.platform.toLowerCase().includes(platformFilter.toLowerCase());
      // Hide lifetime-only filter: if user selected lifetime, only show products with lifetimePrice set
      if (
        billingCycle === "lifetime" &&
        !(p.lifetimePrice && p.lifetimePrice > 0)
      ) {
        return false;
      }
      const typeMatch =
        typeFilter === "All" ||
        p.tier.toLowerCase().includes(typeFilter.toLowerCase());
      return platMatch && typeMatch;
    });
  }, [allProducts, platformFilter, typeFilter, billingCycle]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.065 0.009 258)" }}
    >
      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden candlestick-bg">
        {/* Radial glow behind hero text */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.135 185 / 0.13) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 px-4 py-2 rounded-full"
            style={{
              background: "oklch(0.72 0.135 185 / 0.08)",
              color: "oklch(0.72 0.135 185)",
              border: "1px solid oklch(0.72 0.135 185 / 0.2)",
            }}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Professional Trading Software
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="text-4xl md:text-6xl font-black text-foreground leading-none mb-5"
          >
            The Professional
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.135 185), oklch(0.71 0.115 72))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Traders Suite
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
          >
            Advanced algorithmic trading software for{" "}
            <strong className="text-foreground">MT4, MT5, and cTrader</strong>.
            Built for serious prop traders.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-8"
          >
            {[
              { icon: Layers, label: "8+ Tools", sub: "In the Suite" },
              {
                icon: BarChart2,
                label: "3 Platforms",
                sub: "MT4 / MT5 / cTrader",
              },
              {
                icon: ShieldCheck,
                label: "Professional",
                sub: "Grade Software",
              },
              { icon: Zap, label: "Instant", sub: "License Activation" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl border"
                style={{
                  background: "oklch(0.11 0.02 245 / 0.5)",
                  borderColor: "oklch(0.22 0.037 242 / 0.4)",
                }}
              >
                <s.icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "oklch(0.72 0.135 185)" }}
                />
                <div className="text-left">
                  <div className="text-sm font-bold text-foreground leading-none">
                    {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s.sub}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== BILLING TOGGLE + FILTERS ===== */}
      <div
        className="sticky top-16 z-40 border-b px-4 py-4"
        style={{
          background: "oklch(0.065 0.009 258 / 0.95)",
          backdropFilter: "blur(16px)",
          borderColor: "oklch(0.22 0.037 242 / 0.5)",
        }}
        data-ocid="products.filter.panel"
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-4">
          {/* Billing Toggle */}
          <div
            className="flex items-center gap-1 p-1 rounded-full"
            style={{
              background: "oklch(0.11 0.02 245)",
              border: "1px solid oklch(0.22 0.037 242 / 0.5)",
            }}
          >
            {(["monthly", "annual", "lifetime"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className="relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 flex items-center gap-2"
                style={{
                  background:
                    billingCycle === cycle
                      ? "oklch(0.72 0.135 185)"
                      : "transparent",
                  color:
                    billingCycle === cycle
                      ? "oklch(0.065 0.009 258)"
                      : "oklch(0.725 0.022 242)",
                }}
                data-ocid={`products.billing_${cycle}.toggle`}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                {cycle === "annual" && billingCycle !== "annual" && (
                  <Badge
                    className="text-[9px] font-black px-1.5 py-0 border-0"
                    style={{
                      background: "oklch(0.71 0.115 72 / 0.2)",
                      color: "oklch(0.71 0.115 72)",
                    }}
                  >
                    -20%
                  </Badge>
                )}
                {cycle === "lifetime" && billingCycle !== "lifetime" && (
                  <Badge
                    className="text-[9px] font-black px-1.5 py-0 border-0"
                    style={{
                      background: "oklch(0.65 0.12 300 / 0.2)",
                      color: "oklch(0.75 0.12 300)",
                    }}
                  >
                    ♾
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Spacer on larger screens */}
          <div className="hidden md:block flex-1" />

          {/* Platform filters */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex gap-1">
              {PLATFORM_FILTERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatformFilter(p)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150"
                  style={{
                    background:
                      platformFilter === p
                        ? "oklch(0.72 0.135 185)"
                        : "oklch(0.11 0.02 245)",
                    color:
                      platformFilter === p
                        ? "oklch(0.065 0.009 258)"
                        : "oklch(0.725 0.022 242)",
                    border:
                      platformFilter === p
                        ? "1px solid oklch(0.72 0.135 185)"
                        : "1px solid oklch(0.22 0.037 242 / 0.5)",
                  }}
                  data-ocid={`products.platform_${p.toLowerCase()}.tab`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Type filters */}
          <div className="flex gap-1">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150"
                style={{
                  background:
                    typeFilter === t
                      ? "oklch(0.71 0.115 72)"
                      : "oklch(0.11 0.02 245)",
                  color:
                    typeFilter === t
                      ? "oklch(0.065 0.009 258)"
                      : "oklch(0.725 0.022 242)",
                  border:
                    typeFilter === t
                      ? "1px solid oklch(0.71 0.115 72)"
                      : "1px solid oklch(0.22 0.037 242 / 0.5)",
                }}
                data-ocid={`products.type_${t.toLowerCase()}.tab`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PROMO BANNER ===== */}
      {promoCode && !promoBannerDismissed && (
        <div
          className="max-w-5xl mx-auto px-4 pt-4"
          data-ocid="products.promo.panel"
        >
          <div
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
            style={{
              background: "oklch(0.72 0.135 185 / 0.08)",
              borderColor: "oklch(0.72 0.135 185 / 0.3)",
            }}
          >
            <div
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "oklch(0.72 0.135 185)" }}
            >
              <span className="text-base">🎟</span>
              <span>
                Promo code{" "}
                <strong
                  className="font-mono px-1.5 py-0.5 rounded text-xs"
                  style={{ background: "oklch(0.72 0.135 185 / 0.15)" }}
                >
                  {promoCode}
                </strong>{" "}
                applied! Your discount will be applied at checkout.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPromoBannerDismissed(true)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              data-ocid="products.promo.close_button"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ===== FEATURED BUNDLES ===== */}
      {featuredCombos.length > 0 && (
        <div
          className="max-w-5xl mx-auto px-4 pt-6"
          data-ocid="products.featured_bundles.panel"
        >
          <div className="mb-3 flex items-center gap-2">
            <Layers
              className="w-4 h-4"
              style={{ color: "oklch(0.71 0.115 72)" }}
            />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.71 0.115 72)" }}
            >
              Featured Bundles
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {featuredCombos.map((combo) => {
              const total = combo.productNames.reduce((s, n) => {
                const p = STATIC_PRODUCTS.find((x) => x.name === n);
                return s + (p?.price ?? 0);
              }, 0);
              const discounted =
                combo.discountType === "percent"
                  ? Math.max(
                      0,
                      total - Math.round((total * combo.discountValue) / 100),
                    )
                  : Math.max(0, total - combo.discountValue);
              const saved = total - discounted;

              return (
                <motion.a
                  key={combo.id}
                  href="#combo-builder"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3 no-underline group hover:border-amber-400/50 transition-all"
                  style={{
                    background: "oklch(0.71 0.115 72 / 0.06)",
                    borderColor: "oklch(0.71 0.115 72 / 0.25)",
                    textDecoration: "none",
                  }}
                  data-ocid="products.featured_bundle.link"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {combo.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {combo.tagline}
                    </p>
                  </div>
                  <div
                    className="ml-2 text-xs font-black px-2.5 py-1 rounded-full shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                      color: "oklch(0.065 0.009 258)",
                    }}
                  >
                    {combo.discountType === "percent"
                      ? `Save ${combo.discountValue}%`
                      : `Save $${saved}/mo`}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.a>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== PRODUCT GRID ===== */}
      <section className="py-14 px-4" data-ocid="products.list">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
              data-ocid="products.empty_state"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(0.11 0.02 245)" }}
              >
                <Filter className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">
                No tools match your current filters.
              </p>
              <button
                type="button"
                className="mt-4 text-sm font-semibold flex items-center gap-1 mx-auto"
                style={{ color: "oklch(0.72 0.135 185)" }}
                onClick={() => {
                  setPlatformFilter("All");
                  setTypeFilter("All");
                }}
              >
                Clear filters <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filtered.map((product, i) => (
                  <ProductCard
                    key={String(product.id)}
                    product={product}
                    billingCycle={billingCycle}
                    index={i}
                    userHasUsedTrial={userHasUsedTrial ?? false}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ===== COMBO BUILDER ===== */}
      <ComboBuilder billingCycle={billingCycle} />

      {/* ===== FOOTER ===== */}
      <footer
        className="border-t py-8 px-4"
        style={{ borderColor: "oklch(0.22 0.037 242 / 0.4)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PropFolio Solutions. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
