import { Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer
      className="border-t border-border/40 py-10 mt-auto"
      style={{ background: "oklch(0.065 0.009 258)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.135 185), oklch(0.55 0.14 190))",
              }}
            >
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "oklch(0.065 0.009 258)" }}
                strokeWidth={2.5}
              />
            </div>
            <span className="font-bold text-sm">
              <span style={{ color: "oklch(0.71 0.115 72)" }}>Prop</span>
              <span className="text-foreground">Folio</span>
            </span>
          </div>

          <nav
            className="flex flex-wrap justify-center gap-x-6 gap-y-2"
            aria-label="Footer navigation"
          >
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "FAQ", href: "/#faq" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/login"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Register
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground text-center">
            © {year} PropFolio Solutions. Built with ❤️ using{" "}
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
