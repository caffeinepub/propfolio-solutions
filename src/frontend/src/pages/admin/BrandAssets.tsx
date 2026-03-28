import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ImageIcon } from "lucide-react";

const BRAND_ASSETS = [
  {
    file: "/assets/generated/propfolio-logo-horizontal.dim_1200x400.png",
    name: "propfolio-logo-horizontal.png",
    dimensions: "1200 × 400",
    useCase: "Email Headers & Presentations",
    badge: "Horizontal Logo",
  },
  {
    file: "/assets/generated/propfolio-icon-only.dim_512x512.png",
    name: "propfolio-icon-only.png",
    dimensions: "512 × 512",
    useCase: "App Icon, Google Play, App Store",
    badge: "Icon",
  },
  {
    file: "/assets/generated/propfolio-profile-square.dim_800x800.png",
    name: "propfolio-profile-square.png",
    dimensions: "800 × 800",
    useCase: "Social Media Profile Picture",
    badge: "Profile",
  },
  {
    file: "/assets/generated/propfolio-cover-banner.dim_1500x500.png",
    name: "propfolio-cover-banner.png",
    dimensions: "1500 × 500",
    useCase: "Twitter/X Cover, LinkedIn Banner",
    badge: "Cover Banner",
  },
  {
    file: "/assets/generated/propfolio-og-image.dim_1200x630.png",
    name: "propfolio-og-image.png",
    dimensions: "1200 × 630",
    useCase: "Link Previews, OG Image",
    badge: "OG Image",
  },
  {
    file: "/assets/generated/propfolio-favicon.dim_256x256.png",
    name: "propfolio-favicon.png",
    dimensions: "256 × 256",
    useCase: "Favicon Source (convert to .ico)",
    badge: "Favicon",
  },
];

export default function BrandAssets() {
  return (
    <div data-ocid="brand_assets.section">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Brand Assets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Official PropFolio brand files for marketing, social media, and
          integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BRAND_ASSETS.map((asset) => (
          <div
            key={asset.file}
            className="rounded-xl border border-border/60 overflow-hidden flex flex-col"
            style={{ background: "oklch(0.11 0.012 252)" }}
            data-ocid="brand_assets.card"
          >
            {/* Preview */}
            <div
              className="flex items-center justify-center p-4 min-h-[140px] relative"
              style={{
                background:
                  "repeating-conic-gradient(oklch(0.15 0.01 252) 0% 25%, oklch(0.12 0.01 252) 0% 50%) 0 0 / 16px 16px",
              }}
            >
              <img
                src={asset.file}
                alt={asset.name}
                className="max-h-[120px] max-w-full object-contain drop-shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const placeholder = (e.target as HTMLImageElement)
                    .nextElementSibling;
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = "flex";
                  }
                }}
              />
              <div className="hidden flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">Preview unavailable</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-3 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {asset.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {asset.useCase}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 text-xs border-primary/30"
                  style={{ color: "oklch(0.72 0.135 185)" }}
                >
                  {asset.badge}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: "oklch(0.16 0.014 252)",
                    color: "oklch(0.71 0.115 72)",
                  }}
                >
                  {asset.dimensions}
                </span>

                <a
                  href={asset.file}
                  download={asset.name}
                  data-ocid="brand_assets.download_button"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-8 text-xs border-border/60 hover:border-primary/50 hover:text-primary"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-6 rounded-lg p-4 text-sm border border-border/40"
        style={{ background: "oklch(0.11 0.012 252)" }}
      >
        <p className="text-muted-foreground">
          <span
            style={{ color: "oklch(0.71 0.115 72)" }}
            className="font-semibold"
          >
            Tip:{" "}
          </span>
          To convert PNG files to ICO, SVG, or BMP format, use{" "}
          <a
            href="https://cloudconvert.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
            style={{ color: "oklch(0.72 0.135 185)" }}
          >
            cloudconvert.com
          </a>{" "}
          — free and no signup required.
        </p>
      </div>
    </div>
  );
}
