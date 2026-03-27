import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, Copy, Key, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LicenseStatus } from "../../backend";
import { useGetMyLicenses } from "../../hooks/useQueries";

function CountdownBadge({ expiryNs }: { expiryNs: bigint }) {
  const expiryMs = Number(expiryNs / BigInt(1_000_000));
  const diffMs = expiryMs - Date.now();
  if (diffMs <= 0)
    return <span className="text-xs text-destructive">Expired</span>;
  const days = Math.floor(diffMs / 86400000);
  return <span className="text-xs text-muted-foreground">{days}d left</span>;
}

export default function Licenses() {
  const { data: licenses, isLoading } = useGetMyLicenses();
  const [copied, setCopied] = useState<string | null>(null);
  const [accountInput, setAccountInput] = useState("");
  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    toast.success("License key copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div data-ocid="licenses.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">License Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your active license keys and registered account numbers.
        </p>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="licenses.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (licenses?.length ?? 0) === 0 ? (
        <div
          className="rounded-xl border border-border p-12 text-center"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="licenses.empty_state"
        >
          <Key className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No licenses yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Licenses are generated automatically after payment approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(licenses ?? []).map(([id, lic], i) => (
            <div
              key={id.toString()}
              className="rounded-xl border border-border p-5 space-y-4"
              style={{ background: "oklch(0.115 0.022 245)" }}
              data-ocid={`licenses.item.${i + 1}`}
            >
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      License Key
                    </span>
                    <Badge
                      variant={
                        lic.status === LicenseStatus.Active
                          ? "default"
                          : "destructive"
                      }
                      className={
                        lic.status === LicenseStatus.Active
                          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
                          : ""
                      }
                    >
                      {lic.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-foreground bg-secondary px-3 py-1.5 rounded-lg">
                      {lic.licenseKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyKey(lic.licenseKey)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-primary transition-colors"
                      data-ocid="licenses.button"
                    >
                      {copied === lic.licenseKey ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {lic.platform}
                  </div>
                  <CountdownBadge expiryNs={lic.expiryDate} />
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {Number(lic.maxAccounts)} account slots
                  </div>
                </div>
              </div>

              {/* Account numbers */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Registered Accounts
                </div>
                {lic.accountNumbers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No accounts registered yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {lic.accountNumbers.map((acct) => (
                      <span
                        key={acct}
                        className="text-xs px-2.5 py-1 rounded-md font-mono"
                        style={{
                          background: "oklch(0.22 0.037 242)",
                          color: "oklch(0.944 0.012 244)",
                        }}
                      >
                        {acct}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {lic.accountNumbers.length < Number(lic.maxAccounts) &&
                lic.status === LicenseStatus.Active && (
                  <Dialog
                    open={activeDialogId === id.toString()}
                    onOpenChange={(open) =>
                      setActiveDialogId(open ? id.toString() : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs border-primary/30 text-primary"
                        data-ocid="licenses.open_modal_button"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Account Number
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="border-border"
                      style={{ background: "oklch(0.115 0.022 245)" }}
                      data-ocid="licenses.dialog"
                    >
                      <DialogHeader>
                        <DialogTitle className="text-foreground">
                          Add Account Number
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <p className="text-xs text-muted-foreground">
                          Enter your MT4/MT5/cTrader account number to register
                          it with this license.
                        </p>
                        <Input
                          value={accountInput}
                          onChange={(e) => setAccountInput(e.target.value)}
                          placeholder="e.g. 12345678"
                          className="bg-secondary border-border"
                          data-ocid="licenses.input"
                        />
                        <div className="flex gap-3">
                          <Button
                            onClick={() => {
                              toast.info(
                                "Account registration will be available in a future update.",
                              );
                              setActiveDialogId(null);
                              setAccountInput("");
                            }}
                            className="flex-1 text-sm"
                            style={{
                              background: "oklch(0.72 0.135 185)",
                              color: "oklch(0.065 0.009 258)",
                            }}
                            data-ocid="licenses.confirm_button"
                          >
                            Register Account
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setActiveDialogId(null)}
                            className="flex-1 text-sm"
                            data-ocid="licenses.cancel_button"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
