import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { LicenseStatus } from "../../backend";
import { useGetAllProducts } from "../../hooks/useQueries";
import { useGetMyLicenses } from "../../hooks/useQueries";

const FILE_TYPES = [
  { ext: ".ex4", label: "MT4 Expert Advisor", color: "oklch(0.72 0.135 185)" },
  { ext: ".ex5", label: "MT5 Expert Advisor", color: "oklch(0.71 0.115 72)" },
  { ext: ".algo", label: "cTrader Algorithm", color: "oklch(0.7 0.15 160)" },
];

export default function Downloads() {
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: licenses } = useGetMyLicenses();

  const activeLicPlatforms = new Set(
    licenses
      ?.filter(([, l]) => l.status === LicenseStatus.Active)
      .map(([, l]) => l.platform) ?? [],
  );

  return (
    <div data-ocid="downloads.page">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">Downloads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access your licensed trading software files and documentation.
        </p>
      </div>

      {/* Guide section */}
      <div
        className="rounded-xl border border-border p-5 mb-6"
        style={{
          background: "oklch(0.72 0.135 185 / 0.06)",
          borderColor: "oklch(0.72 0.135 185 / 0.3)",
        }}
      >
        <div className="flex items-start gap-3">
          <FileText
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color: "oklch(0.72 0.135 185)" }}
          />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Installation Guide
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download the setup guide PDF for step-by-step instructions on
              installing and configuring PropFolio software on your trading
              platform.
            </p>
            <button
              type="button"
              className="teal-outline-btn mt-3 text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              data-ocid="downloads.upload_button"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF Guide
            </button>
          </div>
        </div>
      </div>

      {/* Software files */}
      {productsLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="downloads.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (products?.length ?? 0) === 0 ? (
        <div
          className="rounded-xl border border-border p-12 text-center"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="downloads.empty_state"
        >
          <Download className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No software files available yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Purchase a subscription to access download files.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(products ?? []).map(([id, product], i) => {
            const hasAccess = activeLicPlatforms.has(product.platform);
            return (
              <div
                key={id.toString()}
                className="rounded-xl border border-border p-5"
                style={{ background: "oklch(0.115 0.022 245)" }}
                data-ocid={`downloads.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-foreground">
                        {product.name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "oklch(0.22 0.037 242)",
                          color: "oklch(0.725 0.022 242)",
                        }}
                      >
                        {product.platform}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "oklch(0.71 0.115 72 / 0.15)",
                          color: "oklch(0.71 0.115 72)",
                        }}
                      >
                        {product.tier}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {FILE_TYPES.filter((ft) => {
                      if (product.platform === "MT4") return ft.ext === ".ex4";
                      if (product.platform === "MT5") return ft.ext === ".ex5";
                      if (product.platform === "cTrader")
                        return ft.ext === ".algo";
                      return false;
                    }).map((ft) => (
                      <Button
                        key={ft.ext}
                        size="sm"
                        variant="outline"
                        disabled={!hasAccess}
                        className="gap-1.5 text-xs"
                        style={
                          hasAccess
                            ? { borderColor: ft.color, color: ft.color }
                            : undefined
                        }
                        data-ocid="downloads.upload_button"
                      >
                        <Download className="w-3 h-3" /> {ft.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {!hasAccess && (
                  <div
                    className="mt-3 flex items-center gap-2 text-xs"
                    style={{ color: "oklch(0.71 0.115 72)" }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Purchase a {product.platform} license to unlock these files
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
