import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Save, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WalletConfig {
  BTC: string;
  ETH: string;
  USDT: string;
  LTC: string;
}

const DEFAULT_WALLETS: WalletConfig = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  USDT: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  LTC: "",
};

const COIN_COLORS: Record<string, string> = {
  BTC: "oklch(0.71 0.115 72)",
  ETH: "oklch(0.6 0.1 280)",
  USDT: "oklch(0.72 0.135 185)",
  LTC: "oklch(0.75 0.02 242)",
};

export default function AdminWallets() {
  const [wallets, setWallets] = useState<WalletConfig>(DEFAULT_WALLETS);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pf_wallets");
    if (stored) setWallets(JSON.parse(stored));
  }, []);

  const handleSave = () => {
    localStorage.setItem("pf_wallets", JSON.stringify(wallets));
    setSaved(true);
    toast.success("Wallet addresses saved!");
    setTimeout(() => setSaved(false), 2000);
  };

  const copy = (addr: string, coin: string) => {
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopied(coin);
    toast.success("Address copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div data-ocid="admin.wallets.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">
          Crypto Wallets
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage receiving wallet addresses for manual crypto payments. These
          are shown to users when they place orders.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        {(Object.keys(wallets) as (keyof WalletConfig)[]).map((coin) => (
          <div
            key={coin}
            className="rounded-xl border border-border p-5"
            style={{ background: "oklch(0.115 0.022 245)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm"
                style={{
                  background: `${COIN_COLORS[coin].replace(")", " / 0.15)")}`,
                  color: COIN_COLORS[coin],
                }}
              >
                {coin}
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  {coin} Address
                </div>
                <div className="text-xs text-muted-foreground">
                  {coin === "USDT"
                    ? "ERC-20 / TRC-20"
                    : coin === "ETH"
                      ? "Ethereum Mainnet"
                      : coin === "BTC"
                        ? "Bitcoin Mainnet"
                        : "Litecoin"}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                value={wallets[coin]}
                onChange={(e) =>
                  setWallets((w) => ({ ...w, [coin]: e.target.value }))
                }
                placeholder={`Enter ${coin} wallet address`}
                className="bg-secondary border-border font-mono text-xs flex-1"
                data-ocid="admin.wallets.input"
              />
              <button
                type="button"
                onClick={() => copy(wallets[coin], coin)}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                data-ocid="admin.wallets.button"
              >
                {copied === coin ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {wallets[coin] && (
              <div className="mt-2 flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: COIN_COLORS[coin] }}
                />
                <span className="text-xs" style={{ color: COIN_COLORS[coin] }}>
                  Address configured
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="rounded-xl border border-border p-4 mb-6"
        style={{
          background: "oklch(0.71 0.115 72 / 0.06)",
          borderColor: "oklch(0.71 0.115 72 / 0.3)",
        }}
      >
        <div className="flex items-start gap-3">
          <Wallet
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            style={{ color: "oklch(0.71 0.115 72)" }}
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Security note:</strong> These
            addresses are displayed to users during checkout. After a user sends
            payment, they submit the transaction hash which you manually verify
            before approving the order.
          </p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="gap-2 font-semibold"
        disabled={saved}
        style={{
          background: "oklch(0.72 0.135 185)",
          color: "oklch(0.065 0.009 258)",
        }}
        data-ocid="admin.wallets.save_button"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" /> Saved!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Save Wallet Addresses
          </>
        )}
      </Button>
    </div>
  );
}
