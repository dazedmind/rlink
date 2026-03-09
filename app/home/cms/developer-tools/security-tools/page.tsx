"use client";

import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  KeyRound,
  Activity,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiKey = {
  id: string;
  name: string;
  prefix: string;       // visible portion e.g. "sk_live_abc123..."
  fullKey?: string;     // only present on first creation
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
};

type RateLimitConfig = {
  route: string;
  label: string;
  maxRequests: number;
  windowMs: number;
};

type ActiveSession = {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

// ─── Mock / placeholder data ─────────────────────────────────────────────────
// [Inference] These would be fetched from real API routes once implemented.
// Replace with actual fetch calls to /api/security/keys, /api/security/sessions, etc.

const MOCK_RATE_LIMITS: RateLimitConfig[] = [
  { route: "POST /api/leads",         label: "Create Lead",         maxRequests: 30,  windowMs: 60_000 },
  { route: "POST /api/inquiries",     label: "Submit Inquiry",      maxRequests: 20,  windowMs: 60_000 },
  { route: "POST /api/reservation",   label: "Create Reservation",  maxRequests: 30,  windowMs: 60_000 },
  { route: "POST /api/newsletter",    label: "Newsletter Subscribe", maxRequests: 10,  windowMs: 60_000 },
  { route: "PATCH /api/*",            label: "Mutations (general)", maxRequests: 60,  windowMs: 60_000 },
  { route: "DELETE /api/*",           label: "Deletions (general)", maxRequests: 30,  windowMs: 60_000 },
];

const AVAILABLE_SCOPES = [
  { value: "read:leads",        label: "Read Leads"        },
  { value: "write:leads",       label: "Write Leads"       },
  { value: "read:inquiries",    label: "Read Inquiries"    },
  { value: "write:inquiries",   label: "Write Inquiries"   },
  { value: "read:reservations", label: "Read Reservations" },
  { value: "write:reservations", label: "Write Reservations" },
  { value: "read:projects",     label: "Read Projects"     },
  { value: "write:projects",    label: "Write Projects"    },
  { value: "read:careers",      label: "Read Careers"      },
  { value: "write:careers",     label: "Write Careers"     },
  { value: "read:articles",     label: "Read Articles"     },
  { value: "write:articles",    label: "Write Articles"    },

];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function copyToClipboard(text: string, label = "Copied") {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied to clipboard.`));
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      active
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "bg-red-50 text-red-500 border border-red-100"
    }`}>
      {active
        ? <><CheckCircle2 size={10} /> Active</>
        : <><XCircle size={10} /> Revoked</>}
    </span>
  );
}

// ─── API Key Row ──────────────────────────────────────────────────────────────

function ApiKeyRow({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex items-start gap-4 px-6 py-4 border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
      <div className="mt-0.5 h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <KeyRound size={14} className="text-slate-500" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold">{apiKey.name}</p>
          <StatusPill active={apiKey.isActive} />
        </div>

        {/* Key display */}
        <div className="mt-1.5 flex items-center gap-2">
          <code className="text-xs font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-600 max-w-xs truncate">
            {apiKey.fullKey && revealed
              ? apiKey.fullKey
              : `${apiKey.prefix}${"•".repeat(20)}`}
          </code>
          {apiKey.fullKey && (
            <button
              onClick={() => setRevealed((r) => !r)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={revealed ? "Hide key" : "Reveal key"}
            >
              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          )}
          <button
            onClick={() => copyToClipboard(apiKey.fullKey ?? apiKey.prefix, "Key")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy key"
          >
            <Copy size={13} />
          </button>
        </div>

        {/* Scopes */}
        {apiKey.scopes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {apiKey.scopes.map((s) => (
              <span key={s} className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Clock size={10} /> Created {formatDate(apiKey.createdAt)}</span>
          {apiKey.lastUsedAt && <span>Last used {formatDate(apiKey.lastUsedAt)}</span>}
          {apiKey.expiresAt
            ? <span className="text-amber-600 flex items-center gap-1"><AlertTriangle size={10} /> Expires {formatDate(apiKey.expiresAt)}</span>
            : <span>No expiry</span>}
        </div>
      </div>

      {apiKey.isActive && (
        <button
          onClick={() => onRevoke(apiKey.id)}
          className="mt-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md p-1.5 transition-colors shrink-0"
          title="Revoke key"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Generate Key Modal ───────────────────────────────────────────────────────

function GenerateKeyModal({
  isOpen,
  onClose,
  onGenerated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (key: ApiKey) => void;
}) {
  const [name, setName]               = useState("");
  const [scopes, setScopes]           = useState<string[]>([]);
  const [expiresIn, setExpiresIn]     = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) { setName(""); setScopes([]); setExpiresIn(""); }
  }, [isOpen]);

  const toggleScope = (s: string) =>
    setScopes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleGenerate = async () => {
    if (!name.trim()) { toast.error("Key name is required."); return; }

    setIsSubmitting(true);
    try {
      // [Inference] Replace with real POST /api/security/keys once implemented
      await new Promise((r) => setTimeout(r, 600));

      const chars   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const random  = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const fullKey = `sk_live_${random}`;
      const prefix  = `sk_live_${random.slice(0, 8)}`;

      const newKey: ApiKey = {
        id:         crypto.randomUUID(),
        name:       name.trim(),
        prefix,
        fullKey,
        scopes,
        createdAt:  new Date().toISOString(),
        lastUsedAt: null,
        expiresAt:  expiresIn
          ? new Date(Date.now() + Number(expiresIn) * 24 * 60 * 60 * 1000).toISOString()
          : null,
        isActive: true,
      };

      onGenerated(newKey);
      toast.success("API key generated. Copy it now — it won't be shown again.");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate New API Key</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Key Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              placeholder="e.g. Website Integration, CRM Sync"
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring placeholder:text-muted-foreground"
            />
          </div>

          {/* Expiry */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Expiry
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
            >
              <option value="">Never expires</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
            </select>
          </div>

          {/* Scopes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Permissions (Scopes)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {AVAILABLE_SCOPES.map((s) => (
                <label
                  key={s.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    scopes.includes(s.value)
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={scopes.includes(s.value)}
                    onChange={() => toggleScope(s.value)}
                  />
                  <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                    scopes.includes(s.value) ? "bg-primary border-primary" : "border-slate-300"
                  }`}>
                    {scopes.includes(s.value) && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  {s.label}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Leave empty to grant full access. Restrict scopes for third-party integrations.
            </p>
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isSubmitting} className="gap-2">
            <KeyRound size={14} />
            {isSubmitting ? "Generating..." : "Generate Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function SecurityToolsManager() {
  const [apiKeys, setApiKeys]             = useState<ApiKey[]>([]);
  const [sessions, setSessions]           = useState<ActiveSession[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [revokeTarget, setRevokeTarget]   = useState<string | null>(null);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activeKeyCount  = apiKeys.filter((k) => k.isActive).length;
  const revokedKeyCount = apiKeys.filter((k) => !k.isActive).length;
  const sessionCount    = sessions.length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGenerated = (key: ApiKey) => {
    setApiKeys((prev) => [key, ...prev]);
  };

  const handleRevoke = async (id: string) => {
    // [Inference] Replace with DELETE /api/security/keys/:id once implemented
    setApiKeys((prev) =>
      prev.map((k) => k.id === id ? { ...k, isActive: false, fullKey: undefined } : k)
    );
    toast.success("API key revoked.");
    setRevokeTarget(null);
  };

  const handleRevokeSession = async (id: string) => {
    // [Inference] Replace with DELETE /api/security/sessions/:id once implemented
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session revoked.");
  };

  const statCards = [
    {
      label: "Active API Keys",
      value: activeKeyCount,
      icon: KeyRound,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Revoked Keys",
      value: revokedKeyCount,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Active Sessions",
      value: sessionCount,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Rate Limited Routes",
      value: MOCK_RATE_LIMITS.length,
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Security Tools"
          description="Manage API keys, monitor active sessions, and configure security policies."
        />

        <div className="flex flex-col gap-8 mt-8">

          {/* ── Stats ────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="h-[130px] flex flex-col justify-end border border-border rounded-xl p-5 bg-white shadow-sm"
              >
                <p className={`text-4xl font-bold ${card.color}`}>{card.value}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-5 w-5 rounded flex items-center justify-center ${card.bg}`}>
                    <card.icon size={12} className={card.color} />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── API Keys ─────────────────────────────────── */}
          <SectionCard
            icon={KeyRound}
            title="API Keys"
            description="Keys used to authenticate external integrations with your system."
            action={
              <Button size="sm" className="gap-2" onClick={() => setShowGenerateModal(true)}>
                <Plus size={13} /> Generate Key
              </Button>
            }
          >
            {apiKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <KeyRound size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">No API keys yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Generate a key to allow external services to access your API.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-2 mt-1" onClick={() => setShowGenerateModal(true)}>
                  <Plus size={13} /> Generate First Key
                </Button>
              </div>
            ) : (
              <div>
                {apiKeys.map((key) => (
                  <ApiKeyRow
                    key={key.id}
                    apiKey={key}
                    onRevoke={(id) => setRevokeTarget(id)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Generate Key Modal ─────────────────────── */}
      <GenerateKeyModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerated={handleGenerated}
      />

      {/* ── Revoke Confirm Dialog ──────────────────── */}
      <Dialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to revoke this key? Any integrations using it will immediately lose access. This cannot be undone.
          </p>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokeTarget && handleRevoke(revokeTarget)}>
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main>
  );
}

export default SecurityToolsManager;