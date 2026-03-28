import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Lock, Star, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGetAllProducts } from "../hooks/useQueries";

const PLATFORM_ICONS: Record<string, string> = {
  MT4: "/assets/uploads/image-019d33f6-aff9-7468-af6e-025dcc0bcece-4.png",
  MT5: "/assets/uploads/image-019d33f6-aea6-74f8-827d-eabc37cb3e0b-2.png",
  cTrader: "/assets/uploads/image-019d33f6-ad58-71ca-b5f5-0447e290bbc6-1.png",
};

const PLATFORM_COLORS: Record<string, string> = {
  MT4: "oklch(0.71 0.115 72)",
  MT5: "oklch(0.55 0.18 260)",
  cTrader: "oklch(0.62 0.16 155)",
};

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07 },
  }),
};

function PlatformBadge({ platform }: { platform: string }) {
  const color = PLATFORM_COLORS[platform] ?? "oklch(0.72 0.135 185)";
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ background: `${color} / 0.15`, color }}
    >
      {platform}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{
        background: "oklch(0.72 0.135 185 / 0.12)",
        color: "oklch(0.72 0.135 185)",
      }}
    >
      {type}
    </span>
  );
}

interface ProductCardProps {
  id: bigint;
  name: string;
  description: string;
  platform: string;
  tier: string;
  price: number;
  features: string[];
  isActive: boolean;
  imageUrl?: string;
  billingCycle: "monthly" | "yearly";
  index: number;
}

function ProductCard({
  id,
  name,
  description,
  platform,
  tier,
  price,
  features,
  isActive,
  imageUrl,
  billingCycle,
  index,
}: ProductCardProps) {
  const navigate = useNavigate();
  const displayPrice =
    billingCycle === "monthly" ? price : Math.round(price * 10);
  const platformColor = PLATFORM_COLORS[platform] ?? "oklch(0.72 0.135 185)";
  const platformIcon = PLATFORM_ICONS[platform];

  const handleGetStarted = () => {
    navigate({ to: "/register", search: { plan: id.toString() } as any });
  };

  return (
    <motion.div
      variants={FADE_UP}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="relative rounded-2xl border flex flex-col overflow-hidden group"
      style={{
        background: "oklch(0.115 0.022 245 / 0.9)",
        borderColor: isActive
          ? "oklch(0.3 0.03 245 / 0.5)"
          : "oklch(0.22 0.037 242 / 0.4)",
        backdropFilter: "blur(12px)",
        boxShadow: isActive
          ? "0 0 0 1px oklch(0.3 0.03 245 / 0.2), 0 8px 32px oklch(0.065 0.009 258 / 0.5)"
          : "none",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      data-ocid={`products.item.${index + 1}`}
    >
      {/* Accent bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background: isActive ? platformColor : "oklch(0.22 0.037 242)",
        }}
      />

      {/* Product image */}
      {imageUrl ? (
        <div className="h-36 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div
          className="h-24 flex items-center justify-center"
          style={{ background: `${platformColor.replace(")", " / 0.06)")}` }}
        >
          {platformIcon ? (
            <img
              src={platformIcon}
              alt={platform}
              className="h-12 w-12 object-contain opacity-80"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black"
              style={{
                background: `${platformColor.replace(")", " / 0.2)")}`,
                color: platformColor,
              }}
            >
              {platform.charAt(0)}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <PlatformBadge platform={platform} />
          <TypeBadge type={tier} />
        </div>

        {/* Name */}
        <h3 className="font-bold text-sm text-foreground leading-snug mb-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Features */}
        {features.length > 0 && (
          <ul className="space-y-1.5 mb-5 flex-1">
            {features.slice(0, 4).map((feat) => (
              <li
                key={feat}
                className="flex items-start gap-2 text-xs"
                style={{ color: "oklch(0.8 0.015 245)" }}
              >
                <Check
                  className="w-3 h-3 flex-shrink-0 mt-0.5"
                  style={{ color: platformColor }}
                  strokeWidth={2.5}
                />
                {feat}
              </li>
            ))}
            {features.length > 4 && (
              <li className="text-xs text-muted-foreground">
                +{features.length - 4} more features
              </li>
            )}
          </ul>
        )}

        {/* Price */}
        <div className="mb-4 mt-auto">
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl font-extrabold"
              style={{ color: "oklch(0.71 0.115 72)" }}
            >
              ${displayPrice}
            </span>
            <span className="text-xs text-muted-foreground">
              /{billingCycle === "monthly" ? "mo" : "yr"}
            </span>
          </div>
          {billingCycle === "yearly" && (
            <p className="text-xs text-muted-foreground mt-0.5">
              That&apos;s ${Math.round((price * 10) / 12)}/mo billed yearly
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled={!isActive}
          onClick={handleGetStarted}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{
            background: isActive
              ? "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))"
              : "oklch(0.18 0.025 243)",
            color: isActive ? "oklch(0.065 0.009 258)" : "oklch(0.5 0.015 245)",
            cursor: isActive ? "pointer" : "not-allowed",
          }}
          data-ocid={`products.primary_button.${index + 1}`}
        >
          {isActive ? (
            <>
              Get Started <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" /> Coming Soon
            </>
          )}
        </button>
      </div>

      {/* Coming Soon Overlay */}
      {!isActive && (
        <div
          className="absolute inset-0 flex items-start justify-end p-3 pointer-events-none"
          style={{ background: "oklch(0.065 0.009 258 / 0.4)" }}
        >
          <span
            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
            style={{
              background: "oklch(0.22 0.037 242)",
              color: "oklch(0.6 0.02 245)",
              border: "1px solid oklch(0.3 0.03 245 / 0.5)",
            }}
          >
            Coming Soon
          </span>
        </div>
      )}
    </motion.div>
  );
}

function ProductSkeleton() {
  return (
    <div
      className="rounded-2xl border border-border overflow-hidden"
      style={{ background: "oklch(0.115 0.022 245)" }}
    >
      <Skeleton className="h-0.5 w-full" />
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="space-y-1.5 pt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <Skeleton className="h-8 w-24 mt-2" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { data: rawProducts, isLoading } = useGetAllProducts();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [platformFilter, setPlatformFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const PLATFORM_FILTERS = ["All", "MT4", "MT5", "cTrader"];
  const TYPE_FILTERS = ["All", "Indicator", "EA", "Cbot", "EA-Automated"];

  const products = (rawProducts ?? []).filter(([, p]) => {
    const matchPlatform =
      platformFilter === "All" || p.platform === platformFilter;
    const matchType = typeFilter === "All" || p.tier === typeFilter;
    return matchPlatform && matchType;
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.065 0.009 258)" }}
    >
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b border-border/50"
        style={{
          background: "oklch(0.065 0.009 258 / 0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-14 h-16 flex items-center justify-between">
          <Link to="/">
            <img
              src="/assets/generated/propfolio-logo-horizontal.dim_1200x400.png"
              alt="PropFolio"
              className="h-8 object-contain"
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="products.nav.link"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="products.nav.link"
            >
              Dashboard
            </Link>
            <Link to="/login">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                data-ocid="products.nav.button"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-8"
            style={{ background: "oklch(0.72 0.135 185)" }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-14 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-6"
              style={{
                borderColor: "oklch(0.72 0.135 185 / 0.4)",
                color: "oklch(0.72 0.135 185)",
                background: "oklch(0.72 0.135 185 / 0.08)",
              }}
            >
              <Zap className="w-3 h-3" /> Advanced Algorithmic Trading Software
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-5">
              The Professional
              <br />
              <span style={{ color: "oklch(0.71 0.115 72)" }}>
                Traders Suite
              </span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Advanced algorithmic trading software for MT4, MT5, and cTrader.
              Choose the tools that match your platform and trading style.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Controls */}
      <div
        className="sticky top-16 z-40 border-b border-border/30"
        style={{
          background: "oklch(0.075 0.011 255 / 0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-14 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Platform filter */}
              <div className="flex items-center gap-1">
                {PLATFORM_FILTERS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatformFilter(p)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background:
                        platformFilter === p
                          ? "oklch(0.72 0.135 185)"
                          : "oklch(0.115 0.022 245)",
                      color:
                        platformFilter === p
                          ? "oklch(0.065 0.009 258)"
                          : "oklch(0.6 0.02 245)",
                      border:
                        platformFilter === p
                          ? "none"
                          : "1px solid oklch(0.22 0.037 242)",
                    }}
                    data-ocid="products.platform.tab"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div
                className="w-px h-5 hidden sm:block"
                style={{ background: "oklch(0.22 0.037 242)" }}
              />

              {/* Type filter */}
              <div className="flex items-center gap-1">
                {TYPE_FILTERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background:
                        typeFilter === t
                          ? "oklch(0.71 0.115 72)"
                          : "oklch(0.115 0.022 245)",
                      color:
                        typeFilter === t
                          ? "oklch(0.065 0.009 258)"
                          : "oklch(0.6 0.02 245)",
                      border:
                        typeFilter === t
                          ? "none"
                          : "1px solid oklch(0.22 0.037 242)",
                    }}
                    data-ocid="products.type.tab"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing toggle */}
            <div
              className="inline-flex items-center rounded-full p-0.5 border border-border/50 flex-shrink-0"
              style={{ background: "oklch(0.09 0.012 252)" }}
            >
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background:
                    billingCycle === "monthly"
                      ? "oklch(0.72 0.135 185)"
                      : "transparent",
                  color:
                    billingCycle === "monthly"
                      ? "oklch(0.065 0.009 258)"
                      : "oklch(0.6 0.02 245)",
                }}
                data-ocid="products.billing.toggle"
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background:
                    billingCycle === "yearly"
                      ? "oklch(0.72 0.135 185)"
                      : "transparent",
                  color:
                    billingCycle === "yearly"
                      ? "oklch(0.065 0.009 258)"
                      : "oklch(0.6 0.02 245)",
                }}
                data-ocid="products.billing.toggle"
              >
                Yearly
                {billingCycle !== "yearly" && (
                  <span
                    className="text-[10px] px-1 py-0.5 rounded font-bold"
                    style={{
                      background: "oklch(0.71 0.115 72 / 0.2)",
                      color: "oklch(0.71 0.115 72)",
                    }}
                  >
                    Save
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 lg:px-14 py-12">
        {isLoading ? (
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="products.loading_state"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            className="text-center py-24 rounded-2xl border border-border"
            style={{ background: "oklch(0.115 0.022 245 / 0.5)" }}
            data-ocid="products.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No products match the selected filters.
            </p>
            <button
              type="button"
              className="mt-4 text-xs font-semibold"
              style={{ color: "oklch(0.72 0.135 185)" }}
              onClick={() => {
                setPlatformFilter("All");
                setTypeFilter("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(([id, p], i) => (
                <ProductCard
                  key={id.toString()}
                  id={id}
                  name={p.name}
                  description={p.description}
                  platform={p.platform}
                  tier={p.tier}
                  price={p.price}
                  features={p.features}
                  isActive={p.isActive}
                  imageUrl={p.fileUrl?.getDirectURL()}
                  billingCycle={billingCycle}
                  index={i}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Combo Deals Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-8">
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(0.71 0.115 72)" }}
            >
              POWER BUNDLES
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground">
              Save More With a Bundle
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto">
              Combine platforms for maximum coverage and deep discounts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Pro-Duo Combo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border p-6"
              style={{
                background: "oklch(0.115 0.022 245)",
                borderColor: "oklch(0.3 0.03 245 / 0.5)",
              }}
              data-ocid="products.bundle.item.1"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-extrabold text-base text-foreground mb-1">
                    Pro-Duo Combo
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Choose ANY 2 Platforms
                  </p>
                  <p className="text-xs text-muted-foreground">
                    e.g. MT5 + cTrader — the perfect dual-platform setup
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.72 0.135 185 / 0.15)",
                        color: "oklch(0.72 0.135 185)",
                      }}
                    >
                      40% OFF
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-muted-foreground line-through">
                    $55/mo
                  </div>
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    ${Math.round(55 * 0.6)}
                    <span className="text-xs text-muted-foreground font-normal">
                      /mo
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: "oklch(0.72 0.135 185)",
                  color: "oklch(0.065 0.009 258)",
                }}
                onClick={() => {
                  window.location.href = "/register?plan=duo";
                }}
                data-ocid="products.bundle.button.1"
              >
                Get Pro-Duo Combo
              </button>
            </motion.div>

            {/* Ultimate Master Pack */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-2xl border p-6 overflow-hidden"
              style={{
                background: "oklch(0.13 0.025 243)",
                borderColor: "oklch(0.71 0.115 72 / 0.5)",
                boxShadow: "0 0 40px oklch(0.71 0.115 72 / 0.12)",
              }}
              data-ocid="products.bundle.item.2"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                }}
              />
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Star
                      className="w-4 h-4"
                      style={{ color: "oklch(0.71 0.115 72)" }}
                      fill="oklch(0.71 0.115 72)"
                    />
                    <h3 className="font-extrabold text-base text-foreground">
                      Ultimate Master Pack
                    </h3>
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
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    All 3 Platforms — MT4, MT5 &amp; cTrader
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The complete arsenal for serious prop traders
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.71 0.115 72 / 0.2)",
                        color: "oklch(0.71 0.115 72)",
                      }}
                    >
                      50% OFF
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-muted-foreground line-through">
                    $75/mo
                  </div>
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    ${Math.round(75 * 0.5)}
                    <span className="text-xs text-muted-foreground font-normal">
                      /mo
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                  color: "oklch(0.065 0.009 258)",
                }}
                onClick={() => {
                  window.location.href = "/register?plan=master";
                }}
                data-ocid="products.bundle.button.2"
              >
                <Zap className="w-4 h-4" /> Get Master Pack
              </button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border/40 py-8 mt-8"
        style={{ background: "oklch(0.065 0.009 258)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-14 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img
            src="/assets/generated/propfolio-logo-horizontal.dim_1200x400.png"
            alt="PropFolio"
            className="h-6 object-contain opacity-60"
          />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with{" "}
            <span style={{ color: "oklch(0.71 0.115 72)" }}>&hearts;</span>{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "oklch(0.72 0.135 185)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
