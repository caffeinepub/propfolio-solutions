import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Check,
  Key,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  License,
  PaymentGatewaySettings,
  SiteSettings,
} from "../../backend";
import { LicenseStatus } from "../../backend";
import {
  useAddAdminAccount,
  useExtendLicense,
  useGetAdminAccounts,
  useGetAllLicenses,
  useGetPaymentGatewaySettings,
  useGetSiteSettings,
  useManuallyGenerateLicense,
  useReassignLicense,
  useRemoveAdminAccount,
  useRevokeLicense,
  useSavePaymentGatewaySettings,
  useSaveSiteSettings,
} from "../../hooks/useAdminSettingsQueries";
import { useGetAllProducts } from "../../hooks/useQueries";
import {
  useGetUsersWhoUsedTrial,
  useResetUserTrial,
} from "../../hooks/useTrialQueries";

function truncate(str: string, n = 12) {
  if (!str) return "";
  if (str.length <= n) return str;
  return `${str.slice(0, n)}…`;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString();
}

// ─── Admin Accounts Tab ───────────────────────────────────────────────────────
function AdminAccountsTab() {
  const { data: accounts, isLoading } = useGetAdminAccounts();
  const addAccount = useAddAdminAccount();
  const removeAccount = useRemoveAdminAccount();
  const [form, setForm] = useState({ username: "", principalText: "" });

  const handleAdd = async () => {
    if (!form.username.trim() || !form.principalText.trim()) {
      toast.error("Username and principal ID are required");
      return;
    }
    try {
      await addAccount.mutateAsync(form);
      toast.success("Admin account added successfully");
      setForm({ username: "", principalText: "" });
    } catch {
      toast.error("Failed to add admin account");
    }
  };

  const handleRemove = async (principalId: string, username: string) => {
    try {
      await removeAccount.mutateAsync(principalId);
      toast.success(`Removed ${username}`);
    } catch {
      toast.error("Failed to remove admin account");
    }
  };

  return (
    <div className="space-y-6" data-ocid="admin.accounts.panel">
      {/* Add form */}
      <div
        className="rounded-xl border border-border p-5"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <UserPlus
            className="w-4 h-4"
            style={{ color: "oklch(0.72 0.135 185)" }}
          />
          Add Admin Account
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Username
            </Label>
            <Input
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              placeholder="e.g. superadmin"
              className="bg-secondary border-border"
              data-ocid="admin.accounts.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Principal ID
            </Label>
            <Input
              value={form.principalText}
              onChange={(e) =>
                setForm((f) => ({ ...f, principalText: e.target.value }))
              }
              placeholder="e.g. aaaaa-aa..."
              className="bg-secondary border-border font-mono text-xs"
              data-ocid="admin.accounts.input"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={addAccount.isPending}
          className="gap-2 font-semibold"
          style={{
            background: "oklch(0.72 0.135 185)",
            color: "oklch(0.065 0.009 258)",
          }}
          data-ocid="admin.accounts.submit_button"
        >
          {addAccount.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add Account
        </Button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Shield
              className="w-4 h-4"
              style={{ color: "oklch(0.71 0.115 72)" }}
            />
            Admin Accounts ({accounts?.length ?? 0})
          </h3>
        </div>
        {isLoading ? (
          <div
            className="flex items-center justify-center py-10"
            data-ocid="admin.accounts.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (accounts?.length ?? 0) === 0 ? (
          <div
            className="text-center py-10 text-sm text-muted-foreground"
            data-ocid="admin.accounts.empty_state"
          >
            No admin accounts configured.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Principal ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts?.map((acc, i) => (
                <TableRow
                  key={acc.principalId}
                  data-ocid={`admin.accounts.row.${i + 1}`}
                >
                  <TableCell className="font-semibold text-foreground">
                    {acc.username}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {truncate(acc.principalId, 20)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(acc.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleRemove(acc.principalId, acc.username)
                      }
                      disabled={removeAccount.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                      data-ocid={`admin.accounts.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

// ─── License Management Tab ───────────────────────────────────────────────────
function LicenseManagementTab() {
  const { data: licenses, isLoading } = useGetAllLicenses();
  const { data: products } = useGetAllProducts();
  const revoke = useRevokeLicense();
  const extend = useExtendLicense();
  const reassign = useReassignLicense();
  const generate = useManuallyGenerateLicense();

  const [extendState, setExtendState] = useState<Record<string, string>>({});
  const [reassignState, setReassignState] = useState<Record<string, string>>(
    {},
  );
  const [genForm, setGenForm] = useState({
    userId: "",
    productId: "",
    durationDays: "30",
    open: false,
  });

  const handleRevoke = async (id: bigint) => {
    try {
      await revoke.mutateAsync(id);
      toast.success("License revoked");
    } catch {
      toast.error("Failed to revoke license");
    }
  };

  const handleExtend = async (id: bigint) => {
    const days = Number(extendState[id.toString()] ?? "0");
    if (!days || days <= 0) {
      toast.error("Enter valid days");
      return;
    }
    try {
      await extend.mutateAsync({ licenseId: id, extraDays: BigInt(days) });
      toast.success(`Extended by ${days} days`);
      setExtendState((s) => ({ ...s, [id.toString()]: "" }));
    } catch {
      toast.error("Failed to extend license");
    }
  };

  const handleReassign = async (id: bigint) => {
    const principal = reassignState[id.toString()]?.trim();
    if (!principal) {
      toast.error("Enter a principal ID");
      return;
    }
    try {
      await reassign.mutateAsync({
        licenseId: id,
        newUserPrincipal: principal,
      });
      toast.success("License reassigned");
      setReassignState((s) => ({ ...s, [id.toString()]: "" }));
    } catch {
      toast.error("Failed to reassign license");
    }
  };

  const handleGenerate = async () => {
    if (!genForm.userId.trim() || !genForm.productId || !genForm.durationDays) {
      toast.error("All fields are required");
      return;
    }
    try {
      const newId = await generate.mutateAsync({
        userId: genForm.userId.trim(),
        productId: BigInt(genForm.productId),
        durationDays: BigInt(genForm.durationDays),
      });
      toast.success(`License generated! ID: ${newId}`);
      setGenForm({
        userId: "",
        productId: "",
        durationDays: "30",
        open: false,
      });
    } catch {
      toast.error("Failed to generate license");
    }
  };

  const statusColor = (s: LicenseStatus) => {
    if (s === LicenseStatus.Active)
      return {
        bg: "oklch(0.72 0.135 185 / 0.15)",
        color: "oklch(0.72 0.135 185)",
      };
    if (s === LicenseStatus.Revoked)
      return { bg: "oklch(0.5 0.2 20 / 0.15)", color: "oklch(0.65 0.2 20)" };
    return { bg: "oklch(0.45 0.01 242 / 0.15)", color: "oklch(0.65 0.01 242)" };
  };

  return (
    <div className="space-y-5" data-ocid="admin.licenses.panel">
      {/* Generate Form */}
      <div
        className="rounded-xl border border-border p-5"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Key
              className="w-4 h-4"
              style={{ color: "oklch(0.71 0.115 72)" }}
            />
            Generate License Key
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setGenForm((f) => ({ ...f, open: !f.open }))}
            className="text-xs gap-1.5"
            style={{ color: "oklch(0.72 0.135 185)" }}
            data-ocid="admin.licenses.open_modal_button"
          >
            <Plus className="w-3.5 h-3.5" />
            {genForm.open ? "Cancel" : "New License"}
          </Button>
        </div>
        {genForm.open && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  User Principal
                </Label>
                <Input
                  value={genForm.userId}
                  onChange={(e) =>
                    setGenForm((f) => ({ ...f, userId: e.target.value }))
                  }
                  placeholder="Principal ID..."
                  className="bg-secondary border-border font-mono text-xs"
                  data-ocid="admin.licenses.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Product
                </Label>
                <Select
                  value={genForm.productId}
                  onValueChange={(v) =>
                    setGenForm((f) => ({ ...f, productId: v }))
                  }
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="admin.licenses.select"
                  >
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map(([id, p]) => (
                      <SelectItem key={id.toString()} value={id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Duration (days)
                </Label>
                <Input
                  type="number"
                  value={genForm.durationDays}
                  onChange={(e) =>
                    setGenForm((f) => ({ ...f, durationDays: e.target.value }))
                  }
                  placeholder="30"
                  min="1"
                  className="bg-secondary border-border"
                  data-ocid="admin.licenses.input"
                />
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generate.isPending}
              className="gap-2 font-semibold"
              style={{
                background: "oklch(0.71 0.115 72)",
                color: "oklch(0.065 0.009 258)",
              }}
              data-ocid="admin.licenses.submit_button"
            >
              {generate.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              Generate License
            </Button>
          </div>
        )}
      </div>

      {/* Licenses Table */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-bold text-foreground">
            All Licenses ({licenses?.length ?? 0})
          </h3>
        </div>
        {isLoading ? (
          <div
            className="flex items-center justify-center py-10"
            data-ocid="admin.licenses.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (licenses?.length ?? 0) === 0 ? (
          <div
            className="text-center py-10 text-sm text-muted-foreground"
            data-ocid="admin.licenses.empty_state"
          >
            No licenses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses?.map(([id, lic]: [bigint, License], i: number) => {
                  const colors = statusColor(lic.status);
                  return (
                    <TableRow
                      key={id.toString()}
                      data-ocid={`admin.licenses.row.${i + 1}`}
                    >
                      <TableCell>
                        <span className="font-mono text-xs text-foreground">
                          {truncate(lic.licenseKey, 14)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {lic.platform}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: colors.bg, color: colors.color }}
                        >
                          {lic.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {truncate(lic.userId.toString(), 12)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(lic.expiryDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {/* Revoke */}
                          {lic.status === LicenseStatus.Active && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRevoke(id)}
                              disabled={revoke.isPending}
                              className="text-xs text-destructive hover:bg-destructive/10 gap-1"
                              data-ocid={`admin.licenses.delete_button.${i + 1}`}
                            >
                              <AlertTriangle className="w-3 h-3" /> Revoke
                            </Button>
                          )}
                          {/* Extend */}
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              placeholder="days"
                              value={extendState[id.toString()] ?? ""}
                              onChange={(e) =>
                                setExtendState((s) => ({
                                  ...s,
                                  [id.toString()]: e.target.value,
                                }))
                              }
                              className="bg-secondary border-border h-7 text-xs w-16 px-1.5"
                              data-ocid="admin.licenses.input"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExtend(id)}
                              disabled={extend.isPending}
                              className="h-7 text-xs gap-1"
                              style={{ color: "oklch(0.72 0.135 185)" }}
                              data-ocid="admin.licenses.button"
                            >
                              <RefreshCw className="w-3 h-3" /> Extend
                            </Button>
                          </div>
                          {/* Reassign */}
                          <div className="flex gap-1">
                            <Input
                              placeholder="principal"
                              value={reassignState[id.toString()] ?? ""}
                              onChange={(e) =>
                                setReassignState((s) => ({
                                  ...s,
                                  [id.toString()]: e.target.value,
                                }))
                              }
                              className="bg-secondary border-border h-7 text-xs w-24 px-1.5 font-mono"
                              data-ocid="admin.licenses.input"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReassign(id)}
                              disabled={reassign.isPending}
                              className="h-7 text-xs gap-1"
                              style={{ color: "oklch(0.71 0.115 72)" }}
                              data-ocid="admin.licenses.button"
                            >
                              <RefreshCw className="w-3 h-3" /> Reassign
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Site Settings Tab ────────────────────────────────────────────────────────
function SiteSettingsTab() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const save = useSaveSiteSettings();
  const [form, setForm] = useState<SiteSettings>({
    siteName: "",
    tagline: "",
    contactEmail: "",
    supportEmail: "",
    maintenanceMode: false,
    twitterUrl: "",
    telegramUrl: "",
    discordUrl: "",
    youtubeUrl: "",
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      await save.mutateAsync(form);
      toast.success("Site settings saved!");
    } catch {
      toast.error("Failed to save site settings");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="admin.site_settings.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const field = (
    label: string,
    key: keyof SiteSettings,
    placeholder = "",
    mono = false,
  ) => (
    <div>
      <Label className="text-xs text-muted-foreground mb-1.5 block">
        {label}
      </Label>
      <Input
        value={(form[key] as string) ?? ""}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`bg-secondary border-border ${mono ? "font-mono text-xs" : ""}`}
        data-ocid="admin.site_settings.input"
      />
    </div>
  );

  return (
    <div className="space-y-6" data-ocid="admin.site_settings.panel">
      <div
        className="rounded-xl border border-border p-5 space-y-4"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <h3 className="text-sm font-bold text-foreground mb-2">General</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("Site Name", "siteName", "PropFolio")}
          {field("Tagline", "tagline", "Professional Trading Suite")}
          {field("Contact Email", "contactEmail", "contact@propfolio.com")}
          {field("Support Email", "supportEmail", "support@propfolio.com")}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Maintenance Mode
            </p>
            <p className="text-xs text-muted-foreground">
              When enabled, users see a maintenance page
            </p>
          </div>
          <Switch
            checked={form.maintenanceMode}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, maintenanceMode: v }))
            }
            data-ocid="admin.site_settings.switch"
          />
        </div>
      </div>

      <div
        className="rounded-xl border border-border p-5 space-y-4"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <h3 className="text-sm font-bold text-foreground mb-2">Social Links</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("Twitter / X", "twitterUrl", "https://twitter.com/...")}
          {field("Telegram", "telegramUrl", "https://t.me/...")}
          {field("Discord", "discordUrl", "https://discord.gg/...")}
          {field("YouTube", "youtubeUrl", "https://youtube.com/...")}
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={save.isPending}
        className="gap-2 font-semibold"
        style={{
          background: "oklch(0.72 0.135 185)",
          color: "oklch(0.065 0.009 258)",
        }}
        data-ocid="admin.site_settings.save_button"
      >
        {save.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Site Settings
      </Button>
    </div>
  );
}

// ─── Payment Gateway Tab ──────────────────────────────────────────────────────
const COINS = [
  { id: "BTC", label: "Bitcoin", color: "oklch(0.71 0.115 72)" },
  { id: "ETH", label: "Ethereum", color: "oklch(0.6 0.1 280)" },
  { id: "USDT", label: "Tether", color: "oklch(0.72 0.135 185)" },
  { id: "LTC", label: "Litecoin", color: "oklch(0.75 0.02 242)" },
];

type CoinNetworks = Record<string, string>;
type CoinQRs = Record<string, string>;

function PaymentGatewayTab() {
  const { data: settings, isLoading } = useGetPaymentGatewaySettings();
  const save = useSavePaymentGatewaySettings();
  const [form, setForm] = useState<PaymentGatewaySettings>({
    enabledCoins: ["BTC", "ETH", "USDT"],
    paymentInstructions: "",
    btcAddress: "",
    ethAddress: "",
    usdtAddress: "",
    ltcAddress: "",
  });

  const [coinNetworks, setCoinNetworks] = useState<CoinNetworks>({});
  const [coinQRs, setCoinQRs] = useState<CoinQRs>({});

  // Load persisted network labels and QR images on mount
  useEffect(() => {
    try {
      const storedNetworks = localStorage.getItem("pf_coin_networks");
      if (storedNetworks) setCoinNetworks(JSON.parse(storedNetworks));
      const storedQRs = localStorage.getItem("pf_coin_qrs");
      if (storedQRs) setCoinQRs(JSON.parse(storedQRs));
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  // Refs for hidden file inputs, one per coin
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toggleCoin = (coinId: string) => {
    setForm((f) => ({
      ...f,
      enabledCoins: f.enabledCoins.includes(coinId)
        ? f.enabledCoins.filter((c) => c !== coinId)
        : [...f.enabledCoins, coinId],
    }));
  };

  const addressKey = (coin: string): keyof PaymentGatewaySettings => {
    return `${coin.toLowerCase()}Address` as keyof PaymentGatewaySettings;
  };

  const handleQRUpload = (coinId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCoinQRs((prev) => ({ ...prev, [coinId]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQR = (coinId: string) => {
    setCoinQRs((prev) => {
      const next = { ...prev };
      delete next[coinId];
      return next;
    });
    // Reset the file input
    if (fileInputRefs.current[coinId]) {
      fileInputRefs.current[coinId]!.value = "";
    }
  };

  const handleSave = async () => {
    try {
      await save.mutateAsync(form);
      // Persist network labels and QR images to localStorage
      localStorage.setItem("pf_coin_networks", JSON.stringify(coinNetworks));
      localStorage.setItem("pf_coin_qrs", JSON.stringify(coinQRs));
      toast.success("Payment gateway settings saved!");
    } catch {
      toast.error("Failed to save payment gateway settings");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="admin.payment.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="admin.payment.panel">
      {/* Coin Toggles */}
      <div
        className="rounded-xl border border-border p-5"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <h3 className="text-sm font-bold text-foreground mb-4">
          Enabled Coins
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COINS.map((coin) => {
            const enabled = form.enabledCoins.includes(coin.id);
            return (
              <button
                key={coin.id}
                type="button"
                onClick={() => toggleCoin(coin.id)}
                className="rounded-xl border p-4 flex flex-col items-center gap-2 transition-all"
                style={{
                  background: enabled
                    ? `${coin.color.replace(")", " / 0.1)")}`
                    : "oklch(0.09 0.012 252)",
                  borderColor: enabled ? coin.color : "oklch(0.22 0.037 242)",
                }}
                data-ocid="admin.payment.toggle"
              >
                <span
                  className="text-sm font-extrabold"
                  style={{
                    color: enabled ? coin.color : "oklch(0.55 0.02 242)",
                  }}
                >
                  {coin.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  {coin.label}
                </span>
                {enabled && (
                  <Check
                    className="w-3.5 h-3.5"
                    style={{ color: coin.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wallet Addresses */}
      <div
        className="rounded-xl border border-border p-5 space-y-6"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <h3 className="text-sm font-bold text-foreground">Wallet Addresses</h3>
        {COINS.filter((c) => form.enabledCoins.includes(c.id)).map((coin) => (
          <div
            key={coin.id}
            className="rounded-lg border border-border/50 p-4 space-y-3"
            style={{ background: "oklch(0.095 0.018 252)" }}
          >
            {/* Coin header */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-extrabold px-2 py-0.5 rounded"
                style={{
                  background: `${coin.color.replace(")", " / 0.12)")}`,
                  color: coin.color,
                }}
              >
                {coin.id}
              </span>
              <span className="text-xs text-muted-foreground">
                {coin.label}
              </span>
            </div>

            {/* Wallet Address */}
            <div>
              <Label
                className="text-xs mb-1.5 block"
                style={{ color: coin.color }}
              >
                {coin.id} Address
              </Label>
              <Input
                value={(form[addressKey(coin.id)] as string) ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [addressKey(coin.id)]: e.target.value,
                  }))
                }
                placeholder={`Enter ${coin.id} wallet address`}
                className="bg-secondary border-border font-mono text-xs"
                data-ocid="admin.payment.input"
              />
            </div>

            {/* Network */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Network
              </Label>
              <Input
                value={coinNetworks[coin.id] ?? ""}
                onChange={(e) =>
                  setCoinNetworks((prev) => ({
                    ...prev,
                    [coin.id]: e.target.value,
                  }))
                }
                placeholder={
                  coin.id === "BTC"
                    ? "e.g. Bitcoin Mainnet"
                    : coin.id === "ETH"
                      ? "e.g. ERC-20"
                      : coin.id === "USDT"
                        ? "e.g. TRC-20 / ERC-20 / BEP-20"
                        : "e.g. Litecoin Mainnet"
                }
                className="bg-secondary border-border text-xs"
                data-ocid="admin.payment.input"
              />
            </div>

            {/* QR Code */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <QrCode className="w-3 h-3" />
                QR Code Image
              </Label>
              <div className="flex items-center gap-3">
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => {
                    fileInputRefs.current[coin.id] = el;
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleQRUpload(coin.id, file);
                  }}
                />

                {/* Upload button */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRefs.current[coin.id]?.click()}
                  className="gap-1.5 text-xs border-border bg-secondary hover:bg-secondary/80 h-8"
                  data-ocid="admin.payment.upload_button"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {coinQRs[coin.id] ? "Replace QR" : "Upload QR"}
                </Button>

                {/* QR preview thumbnail */}
                {coinQRs[coin.id] && (
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-md overflow-hidden border border-border/60 flex-shrink-0"
                      style={{ width: 80, height: 80 }}
                    >
                      <img
                        src={coinQRs[coin.id]}
                        alt={`${coin.id} QR code`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQR(coin.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      data-ocid="admin.payment.delete_button"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {form.enabledCoins.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Enable at least one coin above to configure wallet addresses.
          </p>
        )}
      </div>

      {/* Payment Instructions */}
      <div
        className="rounded-xl border border-border p-5"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Payment Instructions (shown to users at checkout)
        </Label>
        <Textarea
          value={form.paymentInstructions}
          onChange={(e) =>
            setForm((f) => ({ ...f, paymentInstructions: e.target.value }))
          }
          placeholder="Send the exact amount to the wallet address above. Paste your transaction hash below..."
          rows={4}
          className="bg-secondary border-border text-sm resize-none"
          data-ocid="admin.payment.textarea"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={save.isPending}
        className="gap-2 font-semibold"
        style={{
          background: "oklch(0.72 0.135 185)",
          color: "oklch(0.065 0.009 258)",
        }}
        data-ocid="admin.payment.save_button"
      >
        {save.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Payment Settings
      </Button>
    </div>
  );
}

// ─── License Auth Service Tab ─────────────────────────────────────────────────
function LicenseAuthTab() {
  const [canisterId, setCanisterId] = useState(
    () => localStorage.getItem("pf_license_auth_canister_id") ?? "",
  );
  const [oldToken, setOldToken] = useState("");
  const [newToken, setNewToken] = useState("");
  const [confirmToken, setConfirmToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!canisterId.trim()) {
      toast.error("Canister ID is required");
      return;
    }
    if (!oldToken.trim() || !newToken.trim()) {
      toast.error("Current and new tokens are required");
      return;
    }
    if (newToken !== confirmToken) {
      toast.error("New tokens do not match");
      return;
    }
    if (newToken.length < 8) {
      toast.error("New token must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const url = `https://${canisterId.trim()}.raw.icp0.io/admin/set-token`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_token: oldToken, new_token: newToken }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        localStorage.setItem("pf_license_auth_canister_id", canisterId.trim());
        toast.success("Admin token updated successfully!");
        setOldToken("");
        setNewToken("");
        setConfirmToken("");
      } else {
        toast.error(data.message ?? "Failed to update token");
      }
    } catch {
      toast.error("Network error — check the canister ID and try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-ocid="admin.license_auth.panel">
      <div
        className="rounded-xl border border-border p-5 space-y-4"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Shield
            className="w-4 h-4"
            style={{ color: "oklch(0.71 0.115 72)" }}
          />
          License Auth Service — Admin Token
        </h3>
        <p className="text-xs text-muted-foreground">
          Change the admin token used to authenticate sync calls to the{" "}
          <code className="bg-secondary px-1 py-0.5 rounded text-xs">
            license_auth_service
          </code>{" "}
          canister. Find your canister ID in the Caffeine deployment panel.
        </p>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Canister ID
          </Label>
          <Input
            value={canisterId}
            onChange={(e) => setCanisterId(e.target.value)}
            placeholder="e.g. aaaaa-aa..."
            className="bg-secondary border-border font-mono text-xs"
            data-ocid="admin.license_auth.input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Saved locally in your browser.
          </p>
        </div>

        {/* Verify URL Display */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            License Verify URL
          </Label>
          {canisterId.trim() ? (
            <div className="flex items-center gap-2">
              <code
                className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-cyan-400 break-all select-all"
                style={{ userSelect: "all" }}
              >
                {`https://${canisterId.trim()}.raw.icp0.io/verify`}
              </code>
              <button
                type="button"
                className="shrink-0 px-3 py-2 text-xs rounded border border-border bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://${canisterId.trim()}.raw.icp0.io/verify`,
                  );
                  toast.success("URL copied!");
                }}
              >
                Copy
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Enter your Canister ID above to generate the verify URL.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Use this URL in your MetaTrader / cTrader WebRequest calls.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Current Token
            </Label>
            <Input
              type="password"
              value={oldToken}
              onChange={(e) => setOldToken(e.target.value)}
              placeholder="Current admin token"
              className="bg-secondary border-border"
              data-ocid="admin.license_auth.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              New Token
            </Label>
            <Input
              type="password"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              placeholder="New token (min 8 chars)"
              className="bg-secondary border-border"
              data-ocid="admin.license_auth.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Confirm New Token
            </Label>
            <Input
              type="password"
              value={confirmToken}
              onChange={(e) => setConfirmToken(e.target.value)}
              placeholder="Repeat new token"
              className="bg-secondary border-border"
              data-ocid="admin.license_auth.input"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="gap-2 font-semibold"
          style={{
            background: "oklch(0.71 0.115 72)",
            color: "oklch(0.065 0.009 258)",
          }}
          data-ocid="admin.license_auth.submit_button"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Key className="w-4 h-4" />
          )}
          Update Admin Token
        </Button>
      </div>
    </div>
  );
}

// ─── Trial Users Tab ─────────────────────────────────────────────────────────
function TrialUsersTab() {
  const { data: trialUsers, isLoading, refetch } = useGetUsersWhoUsedTrial();
  const resetTrial = useResetUserTrial();

  const handleReset = async (principalId: string) => {
    try {
      await resetTrial.mutateAsync(principalId);
      toast.success("Trial reset successfully");
      refetch();
    } catch {
      toast.error("Failed to reset trial");
    }
  };

  const truncatePrincipal = (p: string) =>
    p.length > 20 ? `${p.slice(0, 10)}...${p.slice(-8)}` : p;

  return (
    <div className="space-y-4" data-ocid="admin.trial_users.panel">
      <div
        className="rounded-xl border border-border p-5 space-y-4"
        style={{ background: "oklch(0.115 0.022 245)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.135 185)" }}
            />
            Users Who Used Free Trial
          </h3>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            data-ocid="admin.trial_users.button"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Each user can only use one free trial. Use Reset to allow a user to
          claim another trial.
        </p>

        {isLoading ? (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="admin.trial_users.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : !trialUsers || trialUsers.length === 0 ? (
          <div
            className="rounded-lg border border-border p-6 text-center"
            style={{ background: "oklch(0.09 0.012 252)" }}
            data-ocid="admin.trial_users.empty_state"
          >
            <p className="text-sm text-muted-foreground">No trial users yet.</p>
          </div>
        ) : (
          <div
            className="rounded-lg border border-border overflow-hidden"
            data-ocid="admin.trial_users.table"
          >
            <Table>
              <TableHeader>
                <TableRow
                  style={{ borderColor: "oklch(0.22 0.037 242 / 0.4)" }}
                >
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Principal ID
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialUsers.map((principalId, i) => (
                  <TableRow
                    key={principalId}
                    style={{ borderColor: "oklch(0.22 0.037 242 / 0.3)" }}
                  >
                    <TableCell>
                      <span
                        className="font-mono text-xs"
                        style={{ color: "oklch(0.72 0.135 185)" }}
                        title={principalId}
                      >
                        {truncatePrincipal(principalId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={resetTrial.isPending}
                        onClick={() => handleReset(principalId)}
                        className="text-xs h-7 gap-1"
                        data-ocid={`admin.trial_users.button.${i + 1}`}
                      >
                        {resetTrial.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Reset Trial
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSettings() {
  return (
    <div data-ocid="admin.settings.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <Settings
            className="w-5 h-5"
            style={{ color: "oklch(0.72 0.135 185)" }}
          />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure admin accounts, licenses, site preferences, payment gateway,
          and licensing service.
        </p>
      </div>

      <Tabs defaultValue="accounts">
        <TabsList className="mb-6 bg-secondary border border-border flex-wrap h-auto">
          <TabsTrigger value="accounts" data-ocid="admin.settings.tab">
            Admin Accounts
          </TabsTrigger>
          <TabsTrigger value="licenses" data-ocid="admin.settings.tab">
            License Management
          </TabsTrigger>
          <TabsTrigger value="site" data-ocid="admin.settings.tab">
            Site Settings
          </TabsTrigger>
          <TabsTrigger value="payment" data-ocid="admin.settings.tab">
            Payment Gateway
          </TabsTrigger>
          <TabsTrigger value="licenseauth" data-ocid="admin.settings.tab">
            License Auth Service
          </TabsTrigger>
          <TabsTrigger value="trialusers" data-ocid="admin.settings.tab">
            Trial Users
          </TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <AdminAccountsTab />
        </TabsContent>
        <TabsContent value="licenses">
          <LicenseManagementTab />
        </TabsContent>
        <TabsContent value="site">
          <SiteSettingsTab />
        </TabsContent>
        <TabsContent value="payment">
          <PaymentGatewayTab />
        </TabsContent>
        <TabsContent value="licenseauth">
          <LicenseAuthTab />
        </TabsContent>
        <TabsContent value="trialusers">
          <TrialUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
