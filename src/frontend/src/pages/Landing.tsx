import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronDown,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useGetAllProducts } from "../hooks/useQueries";

const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const FEATURES = [
  {
    icon: BarChart3,
    title: "VRR Engine",
    tag: "Variable Risk/Reward",
    desc: "Dynamically adjusts your risk-to-reward ratio based on live market conditions. Maximise gains while keeping drawdowns under control.",
    color: "oklch(0.72 0.135 185)",
  },
  {
    icon: Brain,
    title: "Emotion Control",
    tag: "Algorithm",
    desc: "Removes emotional bias from every trade. The proprietary algorithm enforces discipline, prevents revenge trading, and locks in profits automatically.",
    color: "oklch(0.71 0.115 72)",
  },
  {
    icon: Shield,
    title: "Smart Hedge",
    tag: "System",
    desc: "Real-time correlated hedging across instruments. Protects your capital during high-impact news events and volatile sessions with surgical precision.",
    color: "oklch(0.72 0.135 185)",
  },
];

const PRICING = [
  {
    tier: "PropLite",
    price: "$49",
    period: "/month",
    desc: "Perfect for retail traders starting their prop journey",
    features: [
      "MT4 & MT5 Support",
      "1 Account License",
      "VRR Engine",
      "Email Support",
      "Quarterly Updates",
    ],
    cta: "Get PropLite",
    highlight: false,
  },
  {
    tier: "PropTrader",
    price: "$99",
    period: "/month",
    desc: "Designed for active traders managing multiple accounts",
    features: [
      "MT4, MT5 & cTrader",
      "3 Account Licenses",
      "VRR + Emotion Control",
      "Priority Support",
      "Monthly Updates",
      "Risk Reporting Dashboard",
    ],
    cta: "Get PropTrader",
    highlight: true,
  },
  {
    tier: "PropPro",
    price: "$199",
    period: "/month",
    desc: "For professional traders and fund managers",
    features: [
      "All Platforms",
      "10 Account Licenses",
      "Full Suite (VRR + EC + SH)",
      "24/7 Live Support",
      "Weekly Updates",
      "API Access",
      "White-Label Option",
    ],
    cta: "Get PropPro",
    highlight: false,
  },
  {
    tier: "PropEnterprise",
    price: "Custom",
    period: "",
    desc: "Enterprise-grade for prop firms and trading desks",
    features: [
      "Unlimited Accounts",
      "Custom Integration",
      "Dedicated Manager",
      "SLA Guarantee",
      "On-site Training",
      "Full Customisation",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Which trading platforms are supported?",
    a: "PropFolio Professional Suite supports MetaTrader 4 (MT4), MetaTrader 5 (MT5), and cTrader. Each license is tied to a specific platform to ensure optimal performance.",
  },
  {
    q: "How does the licensing system work?",
    a: "After your payment is approved, a unique 16-character license key is generated and delivered to your dashboard. You bind it to your trading account numbers — the EA/algo validates it on each startup.",
  },
  {
    q: "Can I use one license on multiple accounts?",
    a: "Each plan specifies the number of account slots. PropLite allows 1 account, PropTrader allows 3, and PropPro allows up to 10. You can add or swap account numbers within your license limit at any time.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept cryptocurrency payments including Bitcoin (BTC), Ethereum (ETH), and USDT. After copying our wallet address, you submit your transaction hash for manual verification by our team.",
  },
  {
    q: "How do I receive updates to the software?",
    a: "All updates are delivered directly to your Downloads section in the dashboard. You'll receive a notification when a new version is available. Updates are included for the duration of your active subscription.",
  },
  {
    q: "What if my subscription expires?",
    a: "You'll receive automated reminders 7 days and 1 day before expiry. Once expired, the software stops executing trades. You can renew anytime from your Billing page to restore full functionality.",
  },
];

function FAQItem({
  q,
  a,
  open,
  onToggle,
}: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="border border-border rounded-xl overflow-hidden card-hover cursor-pointer w-full text-left"
      onClick={onToggle}
      style={{ background: "oklch(0.115 0.022 245)" }}
    >
      <div className="flex items-center justify-between gap-4 p-5">
        <span className="font-semibold text-sm text-foreground">{q}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
          {a}
        </div>
      )}
    </button>
  );
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: products } = useGetAllProducts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden candlestick-bg">
        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: "oklch(0.72 0.135 185)" }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8"
            style={{ background: "oklch(0.71 0.115 72)" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-14 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div variants={STAGGER} initial="hidden" animate="show">
              <motion.div
                variants={FADE_UP}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-6"
                style={{
                  borderColor: "oklch(0.72 0.135 185 / 0.4)",
                  color: "oklch(0.72 0.135 185)",
                  background: "oklch(0.72 0.135 185 / 0.08)",
                }}
              >
                <Zap className="w-3 h-3" /> Professional Traders Suite v2.4
              </motion.div>
              <motion.h1
                variants={FADE_UP}
                className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5"
              >
                <span style={{ color: "oklch(0.71 0.115 72)" }}>
                  PropFolio:
                </span>
                <br />
                <span className="text-foreground">The Professional</span>
                <br />
                <span className="text-foreground">Traders Suite</span>
              </motion.h1>
              <motion.p
                variants={FADE_UP}
                className="text-base text-muted-foreground leading-relaxed mb-8 max-w-lg"
              >
                Advanced algorithmic trading software for MT4, MT5, and cTrader.
                Automate your strategy with VRR technology, institutional-grade
                emotion control, and intelligent hedging.
              </motion.p>
              <motion.div variants={FADE_UP} className="flex flex-wrap gap-4">
                <Link to="/register">
                  <button
                    type="button"
                    className="gold-glow-btn px-7 py-3 rounded-full text-sm font-bold flex items-center gap-2"
                    data-ocid="hero.primary_button"
                  >
                    Explore Subscriptions <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a href="/#pricing">
                  <button
                    type="button"
                    className="teal-outline-btn px-7 py-3 rounded-full text-sm font-semibold"
                    data-ocid="hero.secondary_button"
                  >
                    View Platform Demo
                  </button>
                </a>
              </motion.div>
              <motion.div
                variants={FADE_UP}
                className="flex items-center gap-6 mt-8"
              >
                {["MT4", "MT5", "cTrader"].map((p) => (
                  <div key={p} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "oklch(0.72 0.135 185)" }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      {p}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Floating Trading Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { duration: 0.7, delay: 0.2 },
              }}
              className="relative hidden lg:flex flex-col gap-4"
            >
              {/* Main chart card */}
              <div
                className="rounded-2xl border p-5 teal-glow-border"
                style={{
                  background: "oklch(0.115 0.022 245)",
                  borderColor: "oklch(0.72 0.135 185 / 0.4)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">EUR/USD</div>
                    <div className="text-xl font-bold text-foreground">
                      1.08542
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: "oklch(0.72 0.135 185 / 0.15)",
                      color: "oklch(0.72 0.135 185)",
                    }}
                  >
                    +0.34%
                  </span>
                </div>
                {/* Mini chart bars */}
                <div className="flex items-end gap-1 h-14">
                  {[60, 45, 70, 55, 80, 65, 90, 72, 85, 95, 78, 88].map(
                    (h, i) => (
                      <div
                        key={h}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background:
                            i > 8
                              ? "oklch(0.72 0.135 185 / 0.8)"
                              : "oklch(0.22 0.037 242)",
                        }}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4 animate-float">
                <div
                  className="rounded-xl border border-border p-4"
                  style={{ background: "oklch(0.115 0.022 245)" }}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    P&L Today
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: "oklch(0.72 0.135 185)" }}
                  >
                    +$2,847
                  </div>
                  <div className="text-xs text-muted-foreground">+4.8% ↑</div>
                </div>
                <div
                  className="rounded-xl border border-border p-4"
                  style={{ background: "oklch(0.115 0.022 245)" }}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    Active Trades
                  </div>
                  <div className="text-lg font-bold text-foreground">7</div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    4 long · 3 short
                  </div>
                </div>
              </div>

              {/* License status card */}
              <div
                className="rounded-xl border border-border p-4 flex items-center gap-3"
                style={{ background: "oklch(0.115 0.022 245)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.72 0.135 185 / 0.15)" }}
                >
                  <Shield
                    className="w-4 h-4"
                    style={{ color: "oklch(0.72 0.135 185)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">
                    PropPro License Active
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expires in 28 days
                  </div>
                </div>
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "oklch(0.72 0.135 185)" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.72 0.135 185)" }}
            >
              CORE TECHNOLOGY
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground">
              Built for Consistent Profitability
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm">
              Three proprietary systems work in tandem to give you an
              institutional edge in any market condition.
            </p>
          </motion.div>

          <motion.div
            variants={STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={FADE_UP}
                className="rounded-2xl border border-border p-6 card-hover relative overflow-hidden"
                style={{ background: "oklch(0.115 0.022 245)" }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"
                  style={{ background: f.color }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color.replace(")", " / 0.12)")}` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: f.color }}
                >
                  {f.tag}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Offers */}
      <section
        id="offers"
        className="py-16"
        style={{ background: "oklch(0.09 0.012 252)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-14">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.71 0.115 72)" }}
              >
                LIMITED TIME
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground">
                Live Offers
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.72 0.135 185)" }}
              />
              <span className="text-xs text-muted-foreground font-medium">
                Updated live
              </span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(products && products.length > 0
              ? products.slice(0, 3)
              : ([
                  {
                    name: "PropTrader Launch Deal",
                    price: 79,
                    description:
                      "First 3 months at 20% off for new subscribers. Use code: LAUNCH20",
                  },
                  {
                    name: "PropPro Annual Bundle",
                    price: 1799,
                    description:
                      "Save $589 with our annual PropPro plan. Full suite, 10 accounts, priority support.",
                  },
                  {
                    name: "cTrader Exclusive",
                    price: 129,
                    description:
                      "Special pricing for cTrader users this month only. Smart Hedge included free.",
                  },
                ] as any[])
            ).map((item: any, i: number) => (
              <motion.div
                key={String(item.name || item[1]?.name || i)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: i * 0.1 },
                }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border p-5 card-hover"
                style={{ background: "oklch(0.115 0.022 245)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="text-sm font-bold text-foreground leading-snug">
                    {item.name || (item[1] as any)?.name}
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{
                      background: "oklch(0.71 0.115 72 / 0.15)",
                      color: "oklch(0.71 0.115 72)",
                    }}
                  >
                    HOT
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {item.description || (item[1] as any)?.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="text-lg font-extrabold"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    ${item.price || (item[1] as any)?.price}
                  </span>
                  <Link to="/register">
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-full font-semibold teal-outline-btn"
                    >
                      Claim Offer
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.72 0.135 185)" }}
            >
              TRANSPARENT PRICING
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground">
              Choose Your Edge
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm">
              Cancel anytime. All plans include automatic license generation and
              direct file delivery.
            </p>
          </motion.div>

          <motion.div
            variants={STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-5"
          >
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.tier}
                variants={FADE_UP}
                className={`rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? "teal-glow-border scale-[1.02]"
                    : "border-border card-hover"
                }`}
                style={{
                  background: plan.highlight
                    ? "oklch(0.13 0.025 243)"
                    : "oklch(0.115 0.022 245)",
                }}
              >
                {/* Gold header strip */}
                <div
                  className="h-1.5"
                  style={{
                    background: plan.highlight
                      ? "linear-gradient(90deg, oklch(0.72 0.135 185), oklch(0.55 0.14 190))"
                      : "linear-gradient(90deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                  }}
                />
                <div className="p-6 flex flex-col flex-1">
                  {plan.highlight && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star
                        className="w-3 h-3"
                        style={{ color: "oklch(0.72 0.135 185)" }}
                        fill="oklch(0.72 0.135 185)"
                      />
                      <span
                        className="text-xs font-bold"
                        style={{ color: "oklch(0.72 0.135 185)" }}
                      >
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <div className="font-extrabold text-foreground text-lg mb-1">
                    {plan.tier}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className="text-3xl font-extrabold"
                      style={{ color: "oklch(0.71 0.115 72)" }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                    {plan.desc}
                  </p>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2.5 text-sm text-foreground/90"
                      >
                        <Check
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: "oklch(0.72 0.135 185)" }}
                          strokeWidth={2.5}
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={
                      plan.tier === "PropEnterprise" ? "/register" : "/register"
                    }
                  >
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                        plan.highlight ? "" : "gold-glow-btn"
                      }`}
                      style={
                        plan.highlight
                          ? {
                              background:
                                "linear-gradient(135deg, oklch(0.72 0.135 185), oklch(0.55 0.14 190))",
                              color: "oklch(0.065 0.009 258)",
                            }
                          : undefined
                      }
                      data-ocid={`pricing.item.${i + 1}`}
                    >
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-20"
        style={{ background: "oklch(0.09 0.012 252)" }}
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.71 0.115 72)" }}
            >
              FAQ
            </div>
            <h2 className="text-3xl font-extrabold text-foreground">
              Common Questions
            </h2>
          </motion.div>
          <div className="space-y-3" data-ocid="faq.list">
            {FAQS.map((item, i) => (
              <FAQItem
                key={item.q}
                q={item.q}
                a={item.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border p-10 lg:p-16 relative overflow-hidden"
            style={{
              background: "oklch(0.115 0.022 245)",
              borderColor: "oklch(0.72 0.135 185 / 0.3)",
            }}
          >
            <div className="absolute inset-0 candlestick-bg opacity-50" />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-15"
              style={{ background: "oklch(0.72 0.135 185)" }}
            />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4">
                Ready to Trade Like a{" "}
                <span style={{ color: "oklch(0.71 0.115 72)" }}>
                  Professional?
                </span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm">
                Join thousands of traders using PropFolio to achieve consistent
                profitability.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <button
                    type="button"
                    className="gold-glow-btn px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2"
                    data-ocid="cta.primary_button"
                  >
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/login">
                  <button
                    type="button"
                    className="teal-outline-btn px-8 py-3 rounded-full font-semibold text-sm"
                    data-ocid="cta.secondary_button"
                  >
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
