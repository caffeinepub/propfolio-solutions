import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Plus, Send } from "lucide-react";
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

const CATEGORIES = [
  "Technical Issue",
  "Licensing",
  "Billing",
  "Installation",
  "General",
];

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
        text: "Thank you for reaching out. Please ensure the account number 98765432 is registered in your Licenses page. If the issue persists, please reinstall the EA from your Downloads section.",
        time: "2026-03-21",
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "Question about PropPro upgrade",
    category: "Billing",
    message:
      "How do I upgrade from PropTrader to PropPro? Will my license transfer?",
    status: "Resolved",
    createdAt: "2026-03-15",
    replies: [
      {
        from: "support",
        text: "To upgrade, simply purchase PropPro and your existing accounts will be migrated. Contact us with your current license key for a seamless transition.",
        time: "2026-03-15",
      },
    ],
  },
];

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Technical Issue");
  const [message, setMessage] = useState("");
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("pf_tickets");
    setTickets(stored ? JSON.parse(stored) : SAMPLE_TICKETS);
  }, []);

  const save = (ts: Ticket[]) => {
    setTickets(ts);
    localStorage.setItem("pf_tickets", JSON.stringify(ts));
  };

  const createTicket = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Fill in all fields");
      return;
    }
    const t: Ticket = {
      id: `TKT-${String(Date.now()).slice(-4)}`,
      subject: subject.trim(),
      category,
      message: message.trim(),
      status: "Open",
      createdAt: new Date().toISOString().slice(0, 10),
      replies: [],
    };
    save([t, ...tickets]);
    toast.success("Ticket submitted successfully!");
    setNewOpen(false);
    setSubject("");
    setMessage("");
  };

  const addReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            replies: [
              ...t.replies,
              {
                from: "user" as const,
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

  const statusColor = (s: string) =>
    s === "Resolved"
      ? "bg-primary/10 text-primary"
      : s === "In Progress"
        ? "bg-yellow-500/10 text-yellow-400"
        : "bg-blue-500/10 text-blue-400";

  return (
    <div data-ocid="support.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            Support Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get help from our technical support team.
          </p>
        </div>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 text-sm font-semibold"
              style={{
                background: "oklch(0.72 0.135 185)",
                color: "oklch(0.065 0.009 258)",
              }}
              data-ocid="support.open_modal_button"
            >
              <Plus className="w-4 h-4" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent
            className="border-border max-w-lg"
            style={{ background: "oklch(0.115 0.022 245)" }}
            data-ocid="support.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create Support Ticket
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Subject
                </Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="bg-secondary border-border"
                  data-ocid="support.input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="support.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(0.14 0.025 243)" }}
                  >
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Message
                </Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="bg-secondary border-border min-h-[100px]"
                  data-ocid="support.textarea"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={createTicket}
                  className="flex-1 font-semibold"
                  style={{
                    background: "oklch(0.72 0.135 185)",
                    color: "oklch(0.065 0.009 258)",
                  }}
                  data-ocid="support.submit_button"
                >
                  Submit Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNewOpen(false)}
                  className="flex-1"
                  data-ocid="support.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {viewTicket ? (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewTicket(null)}
            className="mb-4 text-muted-foreground"
            data-ocid="support.button"
          >
            ← Back to Tickets
          </Button>
          <div
            className="rounded-xl border border-border p-5"
            style={{ background: "oklch(0.115 0.022 245)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
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
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor(viewTicket.status)}`}
              >
                {viewTicket.status}
              </span>
            </div>
            <div className="space-y-4 mb-6">
              <div
                className="rounded-lg p-3"
                style={{ background: "oklch(0.09 0.012 252)" }}
              >
                <div className="text-xs text-muted-foreground mb-1 font-semibold">
                  You
                </div>
                <p className="text-sm text-foreground">{viewTicket.message}</p>
              </div>
              {viewTicket.replies.map((r, i) => (
                <div
                  key={`reply-${i}-${r.time}`}
                  className={`rounded-lg p-3 ${
                    r.from === "support" ? "border border-primary/20" : ""
                  }`}
                  style={{
                    background:
                      r.from === "support"
                        ? "oklch(0.72 0.135 185 / 0.06)"
                        : "oklch(0.09 0.012 252)",
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
                    {r.from === "support" ? "PropFolio Support" : "You"} &bull;{" "}
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
                placeholder="Type your reply..."
                className="bg-secondary border-border"
                onKeyDown={(e) => e.key === "Enter" && addReply(viewTicket.id)}
                data-ocid="support.input"
              />
              <Button
                onClick={() => addReply(viewTicket.id)}
                size="icon"
                style={{
                  background: "oklch(0.72 0.135 185)",
                  color: "oklch(0.065 0.009 258)",
                }}
                data-ocid="support.button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div
          className="rounded-xl border border-border p-12 text-center"
          style={{ background: "oklch(0.115 0.022 245)" }}
          data-ocid="support.empty_state"
        >
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No support tickets yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="support.list">
          {tickets.map((t, i) => (
            <button
              type="button"
              key={t.id}
              className="rounded-xl border border-border p-4 cursor-pointer card-hover"
              style={{ background: "oklch(0.115 0.022 245)" }}
              onClick={() => setViewTicket(t)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && setViewTicket(t)
              }
              data-ocid={`support.item.${i + 1}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {t.id}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md"
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
