import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
  replies: { from: "user" | "support"; text: string; time: string }[];
}

const SAMPLE_TICKETS: Ticket[] = [
  {
    id: "TKT-001",
    subject: "MT5 EA not activating on new account",
    category: "Technical Issue",
    message:
      "I've installed the EA on MT5 but it shows license error on account 98765432.",
    status: "In Progress",
    createdAt: "2026-03-20",
    replies: [
      {
        from: "support",
        text: "Thank you for reaching out. Please ensure the account number is registered in your Licenses page.",
        time: "2026-03-21",
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "Question about PropPro upgrade",
    category: "Billing",
    message: "How do I upgrade from PropTrader to PropPro?",
    status: "Resolved",
    createdAt: "2026-03-15",
    replies: [],
  },
  {
    id: "TKT-003",
    subject: "cTrader installation issue",
    category: "Installation",
    message:
      "Getting an error when installing the .algo file on cTrader desktop.",
    status: "Open",
    createdAt: "2026-03-25",
    replies: [],
  },
];

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Resolved"];

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("pf_tickets");
    setTickets(stored ? JSON.parse(stored) : SAMPLE_TICKETS);
  }, []);

  const save = (ts: Ticket[]) => {
    setTickets(ts);
    localStorage.setItem("pf_tickets", JSON.stringify(ts));
  };

  const addReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: "In Progress" as const,
            replies: [
              ...t.replies,
              {
                from: "support" as const,
                text: replyText.trim(),
                time: new Date().toISOString().slice(0, 10),
              },
            ],
          }
        : t,
    );
    save(updated);
    if (viewTicket?.id === ticketId)
      setViewTicket(updated.find((t) => t.id === ticketId) || null);
    setReplyText("");
    toast.success("Reply sent!");
  };

  const updateStatus = (ticketId: string, status: Ticket["status"]) => {
    const updated = tickets.map((t) =>
      t.id === ticketId ? { ...t, status } : t,
    );
    save(updated);
    if (viewTicket?.id === ticketId)
      setViewTicket(updated.find((t) => t.id === ticketId) || null);
    toast.success(`Ticket marked as ${status}`);
  };

  const filtered =
    statusFilter === "All"
      ? tickets
      : tickets.filter((t) => t.status === statusFilter);
  const statusColor = (s: string) =>
    s === "Resolved"
      ? "bg-primary/10 text-primary"
      : s === "In Progress"
        ? "bg-yellow-500/10 text-yellow-400"
        : "bg-blue-500/10 text-blue-400";

  return (
    <div data-ocid="admin.support.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            Support Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and respond to user support tickets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="bg-secondary border-border w-36 text-sm"
              data-ocid="admin.support.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "oklch(0.14 0.025 243)" }}>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewTicket ? (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewTicket(null)}
            className="mb-4 text-muted-foreground"
            data-ocid="admin.support.button"
          >
            ← Back to Tickets
          </Button>
          <div
            className="rounded-xl border border-border p-5"
            style={{ background: "oklch(0.115 0.022 245)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {viewTicket.subject}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {viewTicket.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {viewTicket.createdAt}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={viewTicket.status}
                  onValueChange={(v) =>
                    updateStatus(viewTicket.id, v as Ticket["status"])
                  }
                >
                  <SelectTrigger
                    className="bg-secondary border-border w-36 text-xs"
                    data-ocid="admin.support.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(0.14 0.025 243)" }}
                  >
                    {["Open", "In Progress", "Resolved"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div
                className="rounded-lg p-3"
                style={{ background: "oklch(0.09 0.012 252)" }}
              >
                <div className="text-xs text-muted-foreground mb-1 font-semibold">
                  User
                </div>
                <p className="text-sm text-foreground">{viewTicket.message}</p>
              </div>
              {viewTicket.replies.map((r) => (
                <div
                  key={`${r.from}-${r.time}`}
                  className={"rounded-lg p-3"}
                  style={{
                    background:
                      r.from === "support"
                        ? "oklch(0.72 0.135 185 / 0.06)"
                        : "oklch(0.09 0.012 252)",
                    border:
                      r.from === "support"
                        ? "1px solid oklch(0.72 0.135 185 / 0.2)"
                        : "none",
                  }}
                >
                  <div
                    className="text-xs font-semibold mb-1"
                    style={{
                      color:
                        r.from === "support"
                          ? "oklch(0.72 0.135 185)"
                          : "oklch(0.725 0.022 242)",
                    }}
                  >
                    {r.from === "support" ? "PropFolio Support" : "User"} &bull;{" "}
                    {r.time}
                  </div>
                  <p className="text-sm text-foreground">{r.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type support reply..."
                className="bg-secondary border-border"
                onKeyDown={(e) => e.key === "Enter" && addReply(viewTicket.id)}
                data-ocid="admin.support.input"
              />
              <Button
                onClick={() => addReply(viewTicket.id)}
                size="icon"
                style={{
                  background: "oklch(0.72 0.135 185)",
                  color: "oklch(0.065 0.009 258)",
                }}
                data-ocid="admin.support.button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border border-border p-12 text-center"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="admin.support.empty_state"
        >
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.support.list">
          {filtered.map((t, i) => (
            <button
              type="button"
              key={t.id}
              className="rounded-xl border border-border p-4 cursor-pointer card-hover"
              style={{ background: "oklch(0.115 0.022 245)" }}
              onClick={() => setViewTicket(t)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && setViewTicket(t)
              }
              data-ocid={`admin.support.item.${i + 1}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {t.id}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "oklch(0.22 0.037 242)",
                        color: "oklch(0.725 0.022 242)",
                      }}
                    >
                      {t.category}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">
                    {t.subject}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.replies.length}{" "}
                    {t.replies.length === 1 ? "reply" : "replies"} &bull;{" "}
                    {t.createdAt}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${statusColor(t.status)}`}
                >
                  {t.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
