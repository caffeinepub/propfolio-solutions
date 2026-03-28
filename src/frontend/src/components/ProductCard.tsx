import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Activity,
  BarChart2,
  Bot,
  Check,
  ChevronDown,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import CheckoutModal from "./CheckoutModal";

export interface ProductCardData {
  id: bigint;
  name: string;
  description: string;
  platform: string;
  tier: string;
  price: number;
  features: string[];
  isActive: boolean;
  addonPrice?: number;
  hasInstructions?: boolean;
  lifetimePrice?: number;
  trialEnabled?: boolean;
  trialDurationDays?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  billingCycle: "monthly" | "annual" | "lifetime";
  index?: number;
  userHasUsedTrial?: boolean;
}

function getTypeIcon(tier: string) {
  const t = tier.toLowerCase();
  if (t.includes("indicator")) return BarChart2;
  if (t.includes("cbot")) return Activity;
  return Bot;
}

function getTypeColor(tier: string) {
  const t = tier.toLowerCase();
  if (t.includes("indicator")) return "oklch(0.72 0.135 185)";
  if (t.includes("cbot")) return "oklch(0.7 0.15 160)";
  return "oklch(0.71 0.115 72)";
}

export default function ProductCard({
  product,
  billingCycle,
  index = 0,
  userHasUsedTrial = false,
}: ProductCardProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const Icon = getTypeIcon(product.tier);
  const typeColor = getTypeColor(product.tier);

  const monthlyPrice = product.price;
  const yearlyPrice = Math.round(product.price * 12 * 0.8);
  const lifetimePrice = product.lifetimePrice ?? 0;
  const displayPrice =
    billingCycle === "monthly"
      ? monthlyPrice
      : billingCycle === "annual"
        ? Math.round(yearlyPrice / 12)
        : lifetimePrice;

  const plan = {
    id: String(product.id),
    title: product.name,
    platform: product.platform,
    monthlyPrice: monthlyPrice,
    yearlyPrice: yearlyPrice,
    lifetimePrice: lifetimePrice,
    addonMonthlyPrice: product.addonPrice ?? 0,
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.4 }}
        className="relative group card-hover rounded-2xl border overflow-hidden flex flex-col"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "oklch(0.22 0.037 242 / 0.4)",
        }}
        data-ocid={`products.item.${index + 1}`}
      >
        {/* Coming Soon Overlay */}
        {!product.isActive && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
            style={{
              background: "oklch(0.065 0.009 258 / 0.82)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Lock
              className="w-8 h-8 mb-3"
              style={{ color: "oklch(0.71 0.115 72)" }}
            />
            <span
              className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border"
              style={{
                color: "oklch(0.71 0.115 72)",
                borderColor: "oklch(0.71 0.115 72 / 0.5)",
                background: "oklch(0.71 0.115 72 / 0.08)",
              }}
            >
              Coming Soon
            </span>
          </div>
        )}

        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}80 100%)`,
                boxShadow: `0 0 20px ${typeColor}30`,
              }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: "oklch(0.065 0.009 258)" }}
                strokeWidth={2.5}
              />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 justify-end">
              <Badge
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full border-0"
                style={{
                  background: "oklch(0.72 0.135 185 / 0.15)",
                  color: "oklch(0.72 0.135 185)",
                }}
              >
                {product.platform.split("/")[0].trim()}
              </Badge>
              <Badge
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full border-0"
                style={{
                  background: `${typeColor}1a`,
                  color: typeColor,
                }}
              >
                {product.tier}
              </Badge>
            </div>
          </div>

          <h3 className="font-bold text-[15px] text-foreground leading-snug mb-2">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Divider */}
        <div
          className="mx-6 border-t"
          style={{ borderColor: "oklch(0.22 0.037 242 / 0.3)" }}
        />

        {/* Features */}
        <div className="px-6 py-4 flex-1">
          <ul className="space-y-2">
            {product.features.slice(0, 4).map((feat) => (
              <li
                key={feat}
                className="flex items-start gap-2.5 text-xs text-muted-foreground"
              >
                <Check
                  className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                  style={{ color: "oklch(0.72 0.135 185)" }}
                />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {product.addonPrice && product.addonPrice > 0 && (
            <p
              className="mt-3 text-xs px-2.5 py-1.5 rounded-lg"
              style={{
                background: "oklch(0.71 0.115 72 / 0.08)",
                color: "oklch(0.71 0.115 72)",
                border: "1px solid oklch(0.71 0.115 72 / 0.2)",
              }}
            >
              + ${product.addonPrice}/mo per additional account
            </p>
          )}
        </div>

        {/* Instructions Accordion */}
        {product.hasInstructions && (
          <div className="px-6 pb-2">
            <Collapsible
              open={instructionsOpen}
              onOpenChange={setInstructionsOpen}
            >
              <CollapsibleTrigger
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                style={{ color: "oklch(0.72 0.135 185)" }}
                data-ocid="products.instructions.toggle"
              >
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200"
                  style={{
                    transform: instructionsOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
                Installation & How to Use
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div
                  className="mt-3 rounded-xl p-4 text-xs text-muted-foreground space-y-2"
                  style={{ background: "oklch(0.09 0.012 252 / 0.8)" }}
                >
                  <p className="font-semibold text-foreground">
                    Installation Steps:
                  </p>
                  <ol className="space-y-1.5 list-decimal list-inside">
                    <li>
                      Download the installer file from your Dashboard &gt;
                      Downloads.
                    </li>
                    <li>Open your trading platform (MT4/MT5/cTrader).</li>
                    <li>Navigate to File &gt; Open Data Folder.</li>
                    <li>
                      Copy the .ex4/.ex5/.algo file to the MQL/Experts folder.
                    </li>
                    <li>
                      Restart the terminal and attach the EA to your chart.
                    </li>
                    <li>Enter your license key in the EA inputs panel.</li>
                  </ol>
                  <p className="pt-1">
                    For full documentation, visit your{" "}
                    <a
                      href="/dashboard/downloads"
                      className="underline"
                      style={{ color: "oklch(0.72 0.135 185)" }}
                    >
                      Downloads page
                    </a>
                    .
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Price + CTA */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-black"
                  style={{ color: "oklch(0.944 0.012 244)" }}
                >
                  ${displayPrice}
                </span>
                <span className="text-xs text-muted-foreground">
                  {billingCycle === "lifetime" ? " one-time" : "/month"}
                </span>
              </div>
              {billingCycle === "annual" && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.72 0.135 185)" }}
                >
                  Billed ${yearlyPrice}/year
                </p>
              )}
              {billingCycle === "lifetime" && (
                <p
                  className="text-xs mt-0.5 font-semibold"
                  style={{ color: "oklch(0.71 0.115 72)" }}
                >
                  Lifetime access — never expires
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={() => product.isActive && setCheckoutOpen(true)}
            disabled={!product.isActive}
            className="w-full rounded-xl font-bold text-sm h-10"
            style={{
              background: product.isActive
                ? "linear-gradient(135deg, oklch(0.65 0.135 185), oklch(0.72 0.135 185))"
                : "oklch(0.22 0.037 242)",
              color: product.isActive
                ? "oklch(0.065 0.009 258)"
                : "oklch(0.5 0.02 242)",
              cursor: product.isActive ? "pointer" : "not-allowed",
            }}
            data-ocid={`products.item.${index + 1}.primary_button`}
          >
            {product.isActive ? "Get Started" : "Coming Soon"}
          </Button>
          {product.isActive &&
            product.trialEnabled &&
            (userHasUsedTrial ? (
              <p
                className="text-center text-xs mt-2"
                style={{ color: "oklch(0.55 0.02 242)" }}
              >
                ✓ Trial already used
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsTrial(true);
                  setCheckoutOpen(true);
                }}
                className="w-full mt-2 text-xs font-bold py-2 rounded-xl border transition-colors"
                style={{
                  borderColor: "oklch(0.72 0.135 185 / 0.4)",
                  color: "oklch(0.72 0.135 185)",
                  background: "oklch(0.72 0.135 185 / 0.07)",
                }}
              >
                🎁 Free Trial ({product.trialDurationDays ?? 7} days)
              </button>
            ))}
        </div>
      </motion.div>

      {product.isActive && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setIsTrial(false);
          }}
          plan={plan}
          addonCount={0}
          billingCycle={billingCycle}
          isTrial={isTrial}
          trialDurationDays={product.trialDurationDays ?? 7}
        />
      )}
    </>
  );
}
