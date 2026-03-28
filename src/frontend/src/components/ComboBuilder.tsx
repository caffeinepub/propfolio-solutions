import { Button } from "@/components/ui/button";
import { Check, Layers, Package, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { type Combo, loadCombos } from "../lib/combos";
import CheckoutModal from "./CheckoutModal";

interface ComboBuilderProps {
  billingCycle: "monthly" | "annual" | "lifetime";
}

const ALL_PRODUCTS = [
  { name: "PropFolio Professional Traders Suite", price: 30 },
  { name: "PropFolio Peak Formation Dashboard", price: 25 },
  { name: "PropFolio SMC Powerhouse", price: 25 },
  { name: "PropFolio Advanced Currency Strength", price: 20 },
  { name: "PropFolio GOLD RUSH", price: 49 },
  { name: "PropFolio Liquidity Sweeps", price: 29 },
  { name: "PropFolio Sentiment Analysis", price: 35 },
  { name: "PropFolio Universal IndicatorEA", price: 59 },
];

function getTotalPrice(productNames: string[]): number {
  return productNames.reduce((sum, name) => {
    const p = ALL_PRODUCTS.find((x) => x.name === name);
    return sum + (p?.price ?? 0);
  }, 0);
}

function getDiscountedPrice(combo: Combo): number {
  const total = getTotalPrice(combo.productNames);
  if (combo.discountType === "percent") {
    return Math.max(0, total - Math.round((total * combo.discountValue) / 100));
  }
  return Math.max(0, total - combo.discountValue);
}

function getSavingsLabel(combo: Combo): string {
  const total = getTotalPrice(combo.productNames);
  const discounted = getDiscountedPrice(combo);
  const saved = total - discounted;
  if (combo.discountType === "percent") {
    return `SAVE ${combo.discountValue}%`;
  }
  return `SAVE $${saved}/mo`;
}

export default function ComboBuilder({ billingCycle }: ComboBuilderProps) {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [checkoutCombo, setCheckoutCombo] = useState<Combo | null>(null);

  useEffect(() => {
    setCombos(loadCombos().filter((c) => c.isActive));
  }, []);

  const getDisplayPrice = (combo: Combo) => {
    const monthly = getDiscountedPrice(combo);
    if (billingCycle === "annual") return Math.round(monthly * 12 * 0.8);
    return monthly;
  };

  const icons = [Package, Zap, Layers, Package];

  if (combos.length === 0) {
    return null;
  }

  return (
    <section
      id="combo-builder"
      className="py-20 px-4"
      style={{ background: "oklch(0.075 0.01 255)" }}
      data-ocid="combo.section"
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-4 py-2 rounded-full"
            style={{
              background: "oklch(0.71 0.115 72 / 0.1)",
              color: "oklch(0.71 0.115 72)",
              border: "1px solid oklch(0.71 0.115 72 / 0.2)",
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            Bundle & Save
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            Power in Numbers
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Combine our best tools for maximum alpha and save more when you
            bundle.
          </p>
        </motion.div>

        {/* Combo Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {combos.map((combo, i) => {
            const Icon = icons[i % icons.length];
            const price = getDisplayPrice(combo);

            return (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                className="relative rounded-2xl border p-6 flex flex-col gap-5"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  backdropFilter: "blur(16px)",
                  borderColor: "oklch(0.71 0.115 72 / 0.3)",
                  boxShadow: "0 0 32px oklch(0.71 0.115 72 / 0.06)",
                }}
                data-ocid={`combo.${i + 1}.card`}
              >
                {/* SAVE badge */}
                <div
                  className="absolute top-4 right-4 text-xs font-black px-3 py-1 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.68 0.12 70), oklch(0.75 0.13 75))",
                    color: "oklch(0.065 0.009 258)",
                  }}
                >
                  {getSavingsLabel(combo)}
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 pr-16">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.71 0.115 72), oklch(0.6 0.1 65))",
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: "oklch(0.065 0.009 258)" }}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <p className="font-black text-foreground text-[15px]">
                      {combo.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {combo.tagline}
                    </p>
                  </div>
                </div>

                {/* Included Products */}
                <ul className="space-y-2.5">
                  {combo.productNames.map((prod) => (
                    <li
                      key={prod}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "oklch(0.72 0.135 185 / 0.15)" }}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{ color: "oklch(0.72 0.135 185)" }}
                        />
                      </div>
                      <span className="line-clamp-1">{prod}</span>
                    </li>
                  ))}
                </ul>

                {/* Pricing */}
                <div
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: "oklch(0.09 0.012 252 / 0.8)" }}
                >
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-2xl font-black"
                        style={{ color: "oklch(0.71 0.115 72)" }}
                      >
                        $
                        {billingCycle === "annual"
                          ? Math.round(price / 12)
                          : price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {billingCycle === "annual"
                        ? "Billed annually"
                        : "Billed monthly"}
                    </div>
                  </div>

                  <Button
                    onClick={() => setCheckoutCombo(combo)}
                    className="rounded-xl font-bold text-sm border-2 px-5"
                    style={{
                      background: "transparent",
                      borderColor: "oklch(0.71 0.115 72 / 0.6)",
                      color: "oklch(0.71 0.115 72)",
                    }}
                    data-ocid={`combo.${i + 1}.primary_button`}
                  >
                    Get Combo
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Checkout for combo */}
      {checkoutCombo && (
        <CheckoutModal
          open={!!checkoutCombo}
          onClose={() => setCheckoutCombo(null)}
          plan={{
            id: checkoutCombo.id,
            title: checkoutCombo.name,
            platform: "MT4/MT5/cTrader",
            monthlyPrice: getDiscountedPrice(checkoutCombo),
            yearlyPrice: Math.round(
              getDiscountedPrice(checkoutCombo) * 12 * 0.8,
            ),
            addonMonthlyPrice: 0,
          }}
          addonCount={0}
          billingCycle={billingCycle}
        />
      )}
    </section>
  );
}
