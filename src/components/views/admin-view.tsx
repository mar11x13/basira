'use client';

import * as React from 'react';
import { useApp } from '@/lib/store';
import { ViewHeader, SearchBar, EmptyState } from '@/components/shared/view-header';
import { TypeBadge } from '@/components/shared/source-card';
import { useToast } from '@/hooks/use-toast';
import { SOURCE_TYPE_LABELS } from '@/lib/types';
import type { SourceRecord, SourceType, VerificationStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  Flag,
  Ban,
  RotateCcw,
  RefreshCw,
  Loader2,
  ChevronDown,
  ShieldCheck,
  ShieldQuestion,
  ShieldAlert,
  Database,
  MessageSquareText,
  History,
  Users,
  Bookmark as BookmarkIcon,
  AlertTriangle,
  Eye,
  ArrowLeft,
} from 'lucide-react';

// ============================================================================
// AdminView — knowledge-base maintenance panel. Passcode-gated; every
// mutation (create / edit / flag / disable / enable / review) is audit-trailed
// server-side and surfaced in the Audit Trail tab.
// ============================================================================

type SourceStatus = 'ACTIVE' | 'FLAGGED' | 'DISABLED';
type ReviewStatus = 'UNREVIEWED' | 'APPROVED' | 'FLAGGED';

type AdminRecord = SourceRecord & {
  sourceStatus: SourceStatus;
  flagNote?: string | null;
  active: boolean;
};

interface AdminStats {
  byType: Partial<Record<SourceType, number>>;
  byVerification: Partial<Record<VerificationStatus, number>>;
  flagged: number;
  disabled: number;
  questions: { total: number; unreviewed: number };
  audits: number;
  profiles: number;
  bookmarks: number;
}

interface QuestionItem {
  id: string;
  question: string;
  answer: string;
  sources: { slug: string; citation: string }[];
  verification: string; // OK | PARTIAL | FAILED
  reviewStatus: ReviewStatus;
  reviewerNote?: string | null;
  createdAt: string;
}

interface AuditItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

const SOURCE_TYPES: SourceType[] = ['QURAN', 'HADITH', 'DUA', 'DHIKR', 'FIQH', 'GLOSSARY', 'SEERAH', 'SCHOLARLY', 'GENERAL'];
const VERIFICATION_OPTIONS: VerificationStatus[] = ['VERIFIED', 'REFERENCE_PENDING', 'DISPUTED'];

const VERIF_STYLE: Record<VerificationStatus, string> = {
  VERIFIED: 'bg-primary/10 text-primary border-primary/30',
  REFERENCE_PENDING: 'bg-gold/10 text-gold border-gold/40',
  DISPUTED: 'bg-[hsl(12_60%_45%)]/10 text-[hsl(12_60%_45%)] border-[hsl(12_60%_45%)]/30',
};
const VERIF_LABEL: Record<VerificationStatus, string> = {
  VERIFIED: 'Verified',
  REFERENCE_PENDING: 'Ref. pending',
  DISPUTED: 'Disputed',
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-primary/10 text-primary border-primary/30',
  FLAGGED: 'bg-gold/10 text-gold border-gold/40',
  DISABLED: 'bg-muted text-muted-foreground border-border',
};

const REVIEW_STYLE: Record<string, string> = {
  UNREVIEWED: 'bg-muted text-muted-foreground border-border',
  APPROVED: 'bg-primary/10 text-primary border-primary/30',
  FLAGGED: 'bg-gold/10 text-gold border-gold/40',
};

const Q_VERIF: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
  OK: { cls: VERIF_STYLE.VERIFIED, label: 'Citations OK', icon: <ShieldCheck className="h-3 w-3" aria-hidden /> },
  PARTIAL: { cls: VERIF_STYLE.REFERENCE_PENDING, label: 'Partially verified', icon: <ShieldQuestion className="h-3 w-3" aria-hidden /> },
  FAILED: { cls: VERIF_STYLE.DISPUTED, label: 'Verification failed', icon: <ShieldAlert className="h-3 w-3" aria-hidden /> },
};

const AUDIT_STYLE: Record<string, { badge: string; dot: string }> = {
  CREATE: { badge: 'bg-primary/10 text-primary border-primary/30', dot: 'bg-primary' },
  UPDATE: { badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground/60' },
  FLAG: { badge: 'bg-gold/10 text-gold border-gold/40', dot: 'bg-gold' },
  DISABLE: { badge: 'bg-[hsl(12_60%_45%)]/10 text-[hsl(12_60%_45%)] border-[hsl(12_60%_45%)]/30', dot: 'bg-[hsl(12_60%_45%)]' },
  ENABLE: { badge: 'bg-primary/10 text-primary border-primary/30', dot: 'bg-primary' },
  LOGIN: { badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground/60' },
  REVIEW: { badge: 'bg-[hsl(335_18%_42%)]/10 text-[hsl(335_18%_42%)] border-[hsl(335_18%_42%)]/30', dot: 'bg-[hsl(335_18%_42%)]' },
};

// ---------- tiny fetch helper (relative paths only) ----------
async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(url, init);
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      /* empty body */
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

// ---------- small badges ----------
function VerificationPill({ status }: { status: VerificationStatus }) {
  return (
    <Badge variant="outline" className={cn('text-[0.62rem] uppercase tracking-wide font-semibold rounded-md px-1.5 py-0', VERIF_STYLE[status])}>
      {VERIF_LABEL[status]}
    </Badge>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('text-[0.62rem] uppercase tracking-wide font-semibold rounded-md px-1.5 py-0', STATUS_STYLE[status] ?? STATUS_STYLE.DISABLED)}>
      {status}
    </Badge>
  );
}

function ActionPill({ action }: { action: string }) {
  const s = AUDIT_STYLE[action] ?? AUDIT_STYLE.UPDATE;
  return (
    <Badge variant="outline" className={cn('text-[0.62rem] uppercase tracking-wide font-semibold rounded-md px-1.5 py-0', s.badge)}>
      {action}
    </Badge>
  );
}

// ============================================================================
// Root component — gate / dashboard switch.
// ============================================================================
export function AdminView() {
  const setView = useApp((s) => s.setView);
  const { toast } = useToast();
  const [authed, setAuthed] = React.useState<boolean | null>(null); // null = checking session

  // Probe for an existing admin session cookie.
  React.useEffect(() => {
    let cancelled = false;
    void api('/api/admin/stats').then(({ ok }) => {
      if (!cancelled) setAuthed(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = React.useCallback(async () => {
    await api('/api/admin/login', { method: 'DELETE' });
    setAuthed(false);
    toast({ title: 'Logged out', description: 'Admin session ended.' });
  }, [toast]);

  const handleAuthLost = React.useCallback(() => {
    setAuthed(false);
    toast({ title: 'Admin session expired', description: 'Please enter the admin key again.', variant: 'destructive' });
  }, [toast]);

  return (
    <div>
      <ViewHeader
        title="Knowledge Base Admin"
        description="Maintain the Islamic source database — every change is audit-trailed. Default key in dev: basira-admin-999."
      />

      {authed === null ? (
        <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading admin panel">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : authed ? (
        <AdminDashboard onLogout={handleLogout} onAuthLost={handleAuthLost} />
      ) : (
        <AdminGate onSuccess={() => setAuthed(true)} onBack={() => setView('home')} />
      )}
    </div>
  );
}

// ============================================================================
// Gate — passcode entry.
// ============================================================================
function AdminGate({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [key, setKey] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const k = key.trim();
    if (!k) {
      setError('Please enter the admin key.');
      return;
    }
    setBusy(true);
    setError(null);
    const { ok, data } = await api<{ error?: string }>('/api/admin/login', jsonInit('POST', { key: k }));
    setBusy(false);
    if (ok) onSuccess();
    else setError(data?.error ?? 'Incorrect admin key.');
  };

  return (
    <Card className="paper-card max-w-md mx-auto border-border/80 overflow-hidden">
      <div className="pattern-khatim pattern-fade h-1.5 w-full" aria-hidden />
      <CardContent className="p-6 sm:p-8 text-center space-y-5">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Admin access</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Enter the admin key to maintain the knowledge base. Every change you make is recorded in the audit trail.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3 text-left" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="admin-key" className="sr-only">
              Admin key
            </Label>
            <Input
              id="admin-key"
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError(null);
              }}
              placeholder="Admin key"
              autoComplete="current-password"
              className="h-11 rounded-xl"
              aria-invalid={!!error}
              aria-describedby={error ? 'admin-key-error' : undefined}
            />
            {error ? (
              <p id="admin-key-error" className="text-xs text-destructive flex items-center gap-1.5" role="alert">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {error}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden /> : <Lock className="h-4 w-4 mr-2" aria-hidden />}
            {busy ? 'Checking…' : 'Enter admin key'}
          </Button>
        </form>

        <Button variant="ghost" className="h-11 rounded-xl text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden />
          Back to BASIRA
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Dashboard — tabs + data loading.
// ============================================================================
function AdminDashboard({ onLogout, onAuthLost }: { onLogout: () => void; onAuthLost: () => void }) {
  const { toast } = useToast();
  const openRecord = useApp((s) => s.openRecord);

  const [tab, setTab] = React.useState('overview');

  // stats
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [statsError, setStatsError] = React.useState(false);

  // sources list + filters
  const [items, setItems] = React.useState<AdminRecord[] | null>(null);
  const [listError, setListError] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [debouncedQ, setDebouncedQ] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // dialogs
  const [flagTarget, setFlagTarget] = React.useState<AdminRecord | null>(null);
  const [disableTarget, setDisableTarget] = React.useState<AdminRecord | null>(null);
  const [editing, setEditing] = React.useState<{ mode: 'edit'; record: AdminRecord } | { mode: 'create' } | null>(null);

  // AI answers review
  const [questions, setQuestions] = React.useState<QuestionItem[] | null>(null);
  const [qFilter, setQFilter] = React.useState('ALL');
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [expandedQs, setExpandedQs] = React.useState<Set<string>>(new Set());
  const [reviewBusyId, setReviewBusyId] = React.useState<string | null>(null);

  // audit trail
  const [audit, setAudit] = React.useState<AuditItem[] | null>(null);

  // debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  // ---- loaders ----
  const loadStats = React.useCallback(async () => {
    const { ok, status, data } = await api<AdminStats>('/api/admin/stats');
    if (ok && data) {
      setStats(data);
      setStatsError(false);
    } else if (status === 401) {
      onAuthLost();
    } else {
      setStatsError(true);
    }
  }, [onAuthLost]);

  React.useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const loadItems = React.useCallback(async () => {
    setListError(false);
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (typeFilter !== 'ALL') params.set('type', typeFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    params.set('limit', '200');
    const { ok, status, data } = await api<{ items: AdminRecord[] }>(`/api/admin/content?${params.toString()}`);
    if (ok && data) {
      setItems(data.items ?? []);
    } else if (status === 401) {
      onAuthLost();
    } else {
      setListError(true);
      setItems([]);
    }
  }, [debouncedQ, typeFilter, statusFilter, onAuthLost]);

  React.useEffect(() => {
    if (tab === 'sources') void loadItems();
  }, [tab, loadItems]);

  const loadQuestions = React.useCallback(async () => {
    const url = qFilter === 'ALL' ? '/api/admin/questions' : `/api/admin/questions?status=${qFilter}`;
    const { ok, status, data } = await api<{ items: QuestionItem[] }>(url);
    if (ok && data) {
      setQuestions(data.items ?? []);
    } else if (status === 401) {
      onAuthLost();
    } else {
      setQuestions([]);
    }
  }, [qFilter, onAuthLost]);

  React.useEffect(() => {
    if (tab === 'answers') void loadQuestions();
  }, [tab, loadQuestions]);

  const loadAudit = React.useCallback(async () => {
    const { ok, status, data } = await api<{ items: AuditItem[] }>('/api/admin/audit?limit=80');
    if (ok && data) {
      setAudit(data.items ?? []);
    } else if (status === 401) {
      onAuthLost();
    } else {
      setAudit([]);
    }
  }, [onAuthLost]);

  React.useEffect(() => {
    if (tab === 'audit') void loadAudit();
  }, [tab, loadAudit]);

  // ---- mutations ----
  const rowAction = async (record: AdminRecord, body: Record<string, unknown>, message: string) => {
    setBusyId(record.id);
    const { ok, status, data } = await api<{ error?: string }>(
      `/api/admin/content/${encodeURIComponent(record.id)}`,
      jsonInit('PATCH', body)
    );
    setBusyId(null);
    if (ok) {
      toast({ title: message, description: record.citation });
      void loadItems();
      void loadStats();
      if (tab === 'audit') void loadAudit();
    } else if (status === 401) {
      onAuthLost();
    } else {
      toast({ title: 'Action failed', description: data?.error ?? 'Please try again.', variant: 'destructive' });
    }
  };

  const reviewQuestion = async (item: QuestionItem, reviewStatus: 'APPROVED' | 'FLAGGED') => {
    setReviewBusyId(item.id);
    const note = (notes[item.id] ?? '').trim() || (item.reviewerNote ?? '');
    const { ok, status, data } = await api<{ error?: string }>(
      '/api/admin/questions',
      jsonInit('PATCH', { id: item.id, reviewStatus, reviewerNote: note })
    );
    setReviewBusyId(null);
    if (ok) {
      toast({
        title: reviewStatus === 'APPROVED' ? 'Answer approved' : 'Answer flagged for review',
        description: 'Your decision was recorded in the audit trail.',
      });
      void loadQuestions();
      void loadStats();
    } else if (status === 401) {
      onAuthLost();
    } else {
      toast({ title: 'Could not save review', description: data?.error ?? 'Please try again.', variant: 'destructive' });
    }
  };

  const toggleExpand = (id: string) =>
    setExpandedQs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const refreshAll = () => {
    void loadStats();
    if (tab === 'sources') void loadItems();
    if (tab === 'answers') void loadQuestions();
    if (tab === 'audit') void loadAudit();
  };

  const totalRecords = stats ? Object.values(stats.byType).reduce((a, b) => a + (b ?? 0), 0) : 0;

  return (
    <div className="space-y-5">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Badge variant="secondary" className="h-8 rounded-lg px-2.5 gap-1.5 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
          Admin session active
        </Badge>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={refreshAll}
            aria-label="Refresh admin data"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="default" className="h-11 rounded-xl text-muted-foreground" onClick={() => void onLogout()}>
            <LogOut className="h-4 w-4 mr-2" aria-hidden />
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full h-11 rounded-xl">
          <TabsTrigger value="overview" className="text-[0.68rem] sm:text-sm px-1 leading-tight">
            Overview
          </TabsTrigger>
          <TabsTrigger value="sources" className="text-[0.68rem] sm:text-sm px-1 leading-tight">
            Sources
          </TabsTrigger>
          <TabsTrigger value="answers" className="text-[0.68rem] sm:text-sm px-1 leading-tight">
            AI Answers
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-[0.68rem] sm:text-sm px-1 leading-tight">
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* ————————— Overview ————————— */}
        <TabsContent value="overview" className="space-y-4 mt-0">
          {statsError ? (
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8" aria-hidden />}
              title="Could not load statistics"
              hint="The server did not respond. Try the refresh button above."
            />
          ) : !stats ? (
            <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading statistics">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBig label="Total records" value={totalRecords} icon={<Database className="h-4.5 w-4.5" aria-hidden />} />
                <StatBig label="Flagged" value={stats.flagged} icon={<Flag className="h-4.5 w-4.5" aria-hidden />} accent="gold" />
                <StatBig label="Disabled" value={stats.disabled} icon={<Ban className="h-4.5 w-4.5" aria-hidden />} accent="clay" />
                <StatBig label="Audit entries" value={stats.audits} icon={<History className="h-4.5 w-4.5" aria-hidden />} />
              </div>

              <Card className="paper-card border-border/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-display">Records by type</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SOURCE_TYPES.map((t) => (
                    <div
                      key={t}
                      className="rounded-xl border border-border/70 bg-card p-3 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-muted-foreground leading-tight">{SOURCE_TYPE_LABELS[t]}</span>
                      <span className="font-display text-lg font-semibold text-foreground tabular-nums leading-none">
                        {stats.byType[t] ?? 0}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="paper-card border-border/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-display">Verification breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(
                      [
                        { status: 'VERIFIED' as VerificationStatus, label: 'Verified', desc: 'Checked against the source database', dot: 'bg-primary' },
                        { status: 'REFERENCE_PENDING' as VerificationStatus, label: 'Reference pending', desc: 'Text authentic — number not fully confirmed', dot: 'bg-gold' },
                        { status: 'DISPUTED' as VerificationStatus, label: 'Disputed', desc: 'Scholars differ — honest note shown', dot: 'bg-[hsl(12_60%_45%)]' },
                      ]
                    ).map((row) => {
                      const count = stats.byVerification[row.status] ?? 0;
                      const pct = totalRecords ? Math.round((count / totalRecords) * 100) : 0;
                      return (
                        <div key={row.status} className="flex items-center gap-3">
                          <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', row.dot)} aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-snug">
                              {row.label}
                              <span className="text-muted-foreground font-normal"> · {count}</span>
                            </p>
                            <p className="text-[0.68rem] text-muted-foreground leading-snug">{row.desc}</p>
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0">{pct}%</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="paper-card border-border/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-display">AI answers &amp; sessions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2.5">
                    <MiniStat label="Questions asked" value={stats.questions.total} icon={<MessageSquareText className="h-3.5 w-3.5" aria-hidden />} />
                    <MiniStat label="Unreviewed" value={stats.questions.unreviewed} icon={<ShieldQuestion className="h-3.5 w-3.5" aria-hidden />} />
                    <MiniStat label="Anonymous profiles" value={stats.profiles} icon={<Users className="h-3.5 w-3.5" aria-hidden />} />
                    <MiniStat label="Bookmarks saved" value={stats.bookmarks} icon={<BookmarkIcon className="h-3.5 w-3.5" aria-hidden />} />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ————————— Sources ————————— */}
        <TabsContent value="sources" className="space-y-4 mt-0">
          {/* filter row */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <SearchBar
                value={q}
                onChange={setQ}
                placeholder="Search title, text, collection…"
                className="flex-1"
                ariaLabel="Search source records"
              />
              <Button size="default" className="h-11 rounded-xl shrink-0" onClick={() => setEditing({ mode: 'create' })}>
                <Plus className="h-4 w-4 mr-2" aria-hidden />
                Add record
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl bg-card" aria-label="Filter by source type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  {SOURCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {SOURCE_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl bg-card" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="FLAGGED">Flagged</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {items ? `${items.length} record${items.length === 1 ? '' : 's'}` : 'Loading…'}
              {debouncedQ ? ` matching “${debouncedQ}”` : ''}
            </p>
          </div>

          {items === null ? (
            <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading source records">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 md:h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : listError ? (
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8" aria-hidden />}
              title="Could not load records"
              hint="The server did not respond. Try the refresh button above."
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Database className="h-8 w-8" aria-hidden />}
              title="No records match"
              hint="Try clearing the search or filters — or add a new record."
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block rounded-xl border border-border/70 overflow-x-auto">
                <Table className="min-w-[880px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-28">Type</TableHead>
                      <TableHead>Title / citation</TableHead>
                      <TableHead className="w-40">Collection</TableHead>
                      <TableHead className="w-24 text-center">Hadith</TableHead>
                      <TableHead className="w-28">Verification</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-56 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((r) => (
                      <TableRow
                        key={r.id}
                        className={cn('cursor-pointer', r.sourceStatus === 'DISABLED' && 'opacity-60')}
                        onClick={() => openRecord(r)}
                      >
                        <TableCell>
                          <TypeBadge type={r.sourceType} />
                        </TableCell>
                        <TableCell className="max-w-[22rem]">
                          <p className="text-sm font-medium leading-snug truncate">{r.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.citation}</p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <p className="truncate">{r.collection ?? '—'}</p>
                          {r.book ? <p className="truncate opacity-75">{r.book}</p> : null}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {r.sourceType === 'HADITH' || r.hadithNumber != null ? (
                            r.hadithNumber != null ? (
                              <span className="tabular-nums">{r.hadithNumber}</span>
                            ) : (
                              <span className="text-gold">— pending</span>
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <VerificationPill status={r.verificationStatus} />
                        </TableCell>
                        <TableCell>
                          <span title={r.flagNote ?? undefined}>
                            <StatusPill status={r.sourceStatus} />
                          </span>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider delayDuration={200}>
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg text-muted-foreground"
                                    aria-label={`Inspect ${r.citation}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openRecord(r);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" aria-hidden />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Inspect record</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg text-muted-foreground"
                                    aria-label={`Edit ${r.citation}`}
                                    disabled={busyId === r.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditing({ mode: 'edit', record: r });
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" aria-hidden />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit record</TooltipContent>
                              </Tooltip>
                              {r.sourceStatus === 'DISABLED' ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-lg text-primary"
                                      aria-label={`Re-enable ${r.citation}`}
                                      disabled={busyId === r.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void rowAction(r, { action: 'ENABLE' }, 'Record re-enabled');
                                      }}
                                    >
                                      {busyId === r.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                      ) : (
                                        <RotateCcw className="h-4 w-4" aria-hidden />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Re-enable record</TooltipContent>
                                </Tooltip>
                              ) : (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-lg text-gold"
                                        aria-label={`Flag ${r.citation}`}
                                        disabled={busyId === r.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFlagTarget(r);
                                        }}
                                      >
                                        <Flag className="h-4 w-4" aria-hidden />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Flag for review</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-lg text-[hsl(12_60%_45%)]"
                                        aria-label={`Disable ${r.citation}`}
                                        disabled={busyId === r.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDisableTarget(r);
                                        }}
                                      >
                                        <Ban className="h-4 w-4" aria-hidden />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Disable record</TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {items.map((r) => (
                  <article
                    key={r.id}
                    className={cn(
                      'paper-card rounded-xl border border-border/70 p-4 cursor-pointer transition-colors active:bg-muted/40',
                      r.sourceStatus === 'DISABLED' && 'opacity-60'
                    )}
                    onClick={() => openRecord(r)}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypeBadge type={r.sourceType} />
                        <StatusPill status={r.sourceStatus} />
                      </div>
                      <VerificationPill status={r.verificationStatus} />
                    </div>
                    <h3 className="font-medium text-sm mt-2 leading-snug">{r.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.citation}
                      {r.book ? ` · ${r.book}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.collection ?? '—'}
                      {r.sourceType === 'HADITH' || r.hadithNumber != null
                        ? r.hadithNumber != null
                          ? ` · No. ${r.hadithNumber}`
                          : ' · number pending'
                        : ''}
                    </p>
                    {r.flagNote ? (
                      <p className="text-xs text-gold mt-1.5 italic leading-snug">⚑ {r.flagNote}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="default"
                        className="h-11 rounded-xl text-xs flex-1 min-w-[88px]"
                        disabled={busyId === r.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing({ mode: 'edit', record: r });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                        Edit
                      </Button>
                      {r.sourceStatus === 'DISABLED' ? (
                        <Button
                          variant="outline"
                          size="default"
                          className="h-11 rounded-xl text-xs flex-1 min-w-[88px] text-primary"
                          disabled={busyId === r.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            void rowAction(r, { action: 'ENABLE' }, 'Record re-enabled');
                          }}
                        >
                          {busyId === r.id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" aria-hidden />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                          )}
                          Enable
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="default"
                            className="h-11 rounded-xl text-xs flex-1 min-w-[80px] text-gold"
                            disabled={busyId === r.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFlagTarget(r);
                            }}
                          >
                            <Flag className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                            Flag
                          </Button>
                          <Button
                            variant="outline"
                            size="default"
                            className="h-11 rounded-xl text-xs flex-1 min-w-[96px] text-[hsl(12_60%_45%)]"
                            disabled={busyId === r.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDisableTarget(r);
                            }}
                          >
                            <Ban className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                            Disable
                          </Button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ————————— AI Answers ————————— */}
        <TabsContent value="answers" className="space-y-4 mt-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={qFilter} onValueChange={setQFilter}>
              <SelectTrigger className="w-full sm:w-56 h-11 rounded-xl bg-card" aria-label="Filter AI answers by review status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All answers</SelectItem>
                <SelectItem value="UNREVIEWED">Unreviewed</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="FLAGGED">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {questions ? `${questions.length} answer${questions.length === 1 ? '' : 's'}` : 'Loading…'}
            </p>
          </div>

          {questions === null ? (
            <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading AI answers">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <EmptyState
              icon={<MessageSquareText className="h-8 w-8" aria-hidden />}
              title="No answers here"
              hint={qFilter === 'ALL' ? 'No questions have been asked yet.' : `No ${qFilter.toLowerCase()} answers right now.`}
            />
          ) : (
            questions.map((item) => (
              <QuestionCard
                key={item.id}
                item={item}
                note={notes[item.id] ?? ''}
                onNoteChange={(v) => setNotes((n) => ({ ...n, [item.id]: v }))}
                expanded={expandedQs.has(item.id)}
                onToggleExpand={() => toggleExpand(item.id)}
                onReview={(status) => void reviewQuestion(item, status)}
                busy={reviewBusyId === item.id}
              />
            ))
          )}
        </TabsContent>

        {/* ————————— Audit Trail ————————— */}
        <TabsContent value="audit" className="space-y-4 mt-0">
          {audit === null ? (
            <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading audit trail">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : audit.length === 0 ? (
            <EmptyState icon={<History className="h-8 w-8" aria-hidden />} title="No audit entries yet" />
          ) : (
            <ol className="relative ml-2 border-l border-border/70" aria-label="Audit trail, newest first">
              {audit.map((entry) => {
                const style = AUDIT_STYLE[entry.action] ?? AUDIT_STYLE.UPDATE;
                return (
                  <li key={entry.id} className="relative pl-5 pb-5 last:pb-0">
                    <span
                      className={cn('absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background', style.dot)}
                      aria-hidden
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <ActionPill action={entry.action} />
                      <span className="text-xs font-medium text-foreground/85">
                        {entry.entity}
                        {entry.entityId ? <span className="text-muted-foreground font-normal"> · {entry.entityId.slice(0, 10)}</span> : null}
                      </span>
                      <time className="text-[0.65rem] text-muted-foreground ml-auto" dateTime={entry.createdAt}>
                        {fmtDateTime(entry.createdAt)}
                      </time>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      <DeltaList title="Before" data={entry.before} />
                      <DeltaList title="After" data={entry.after} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </TabsContent>
      </Tabs>

      {/* ————— dialogs ————— */}
      {flagTarget ? (
        <FlagDialog
          record={flagTarget}
          onClose={() => setFlagTarget(null)}
          onDone={() => {
            void loadItems();
            void loadStats();
            if (tab === 'audit') void loadAudit();
          }}
          onAuthLost={onAuthLost}
        />
      ) : null}

      <AlertDialog open={!!disableTarget} onOpenChange={(o) => !o && setDisableTarget(null)}>
        <AlertDialogContent className="max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Disable this record?</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              {disableTarget?.citation} will be hidden from all user-facing views — the reader, search, and AI answer
              grounding. It stays safely in the database with its audit history and can be re-enabled at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-11 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-11 rounded-xl bg-[hsl(12_60%_45%)] text-white hover:bg-[hsl(12_60%_50%)]"
              onClick={() => {
                const target = disableTarget;
                setDisableTarget(null);
                if (target) void rowAction(target, { action: 'DISABLE' }, 'Record disabled');
              }}
            >
              <Ban className="h-4 w-4 mr-2" aria-hidden />
              Disable record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editing ? (
        <RecordFormDialog
          target={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void loadItems();
            void loadStats();
            if (tab === 'audit') void loadAudit();
          }}
          onAuthLost={onAuthLost}
        />
      ) : null}
    </div>
  );
}

// ============================================================================
// Sub-components.
// ============================================================================
function StatBig({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: 'gold' | 'clay';
}) {
  return (
    <Card className="paper-card border-border/80">
      <CardContent className="p-4 flex items-center gap-3">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
            accent === 'gold' ? 'bg-gold/10 text-gold' : accent === 'clay' ? 'bg-[hsl(12_60%_45%)]/10 text-[hsl(12_60%_45%)]' : 'bg-primary/10 text-primary'
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xl font-display font-semibold tabular-nums leading-none">{value}</p>
          <p className="text-[0.65rem] text-muted-foreground mt-1 uppercase tracking-wider truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <p className="text-[0.62rem] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <span className="text-primary shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </p>
      <p className="font-display text-lg font-semibold tabular-nums mt-1">{value}</p>
    </div>
  );
}

function QuestionCard({
  item,
  note,
  onNoteChange,
  expanded,
  onToggleExpand,
  onReview,
  busy,
}: {
  item: QuestionItem;
  note: string;
  onNoteChange: (v: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onReview: (status: 'APPROVED' | 'FLAGGED') => void;
  busy: boolean;
}) {
  const openRecordBySlug = useApp((s) => s.openRecordBySlug);
  const verif = Q_VERIF[item.verification] ?? Q_VERIF.OK;

  return (
    <Card className="paper-card border-border/80">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-sm font-medium leading-snug flex-1 min-w-[12rem]">{item.question}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className={cn('text-[0.62rem] font-semibold rounded-md px-1.5 py-0 gap-1', verif.cls)}>
              {verif.icon}
              {verif.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-[0.62rem] uppercase tracking-wide font-semibold rounded-md px-1.5 py-0', REVIEW_STYLE[item.reviewStatus] ?? REVIEW_STYLE.UNREVIEWED)}
            >
              {item.reviewStatus.toLowerCase()}
            </Badge>
          </div>
        </div>

        <div className={cn('text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap', !expanded && 'line-clamp-4')}>
          {item.answer}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={onToggleExpand}
          aria-expanded={expanded}
        >
          <ChevronDown className={cn('h-3.5 w-3.5 mr-1 transition-transform', expanded && 'rotate-180')} aria-hidden />
          {expanded ? 'Show less' : 'Show full answer'}
        </Button>

        {item.sources?.length ? (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[0.62rem] uppercase tracking-wider text-muted-foreground/80 font-semibold w-full sm:sr-only">
              Sources used
            </span>
            {item.sources.map((s, i) => (
              <button
                key={`${s.slug}-${i}`}
                type="button"
                onClick={() => void openRecordBySlug(s.slug)}
                className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 text-primary text-[0.65rem] font-semibold px-2 py-1 hover:bg-primary/20 transition-colors focus-ring"
                aria-label={`Open source: ${s.citation || s.slug}`}
              >
                {s.citation || s.slug}
              </button>
            ))}
          </div>
        ) : null}

        {item.reviewerNote ? (
          <p className="text-xs text-muted-foreground italic leading-relaxed">Reviewer note: {item.reviewerNote}</p>
        ) : null}

        <Separator />

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Optional reviewer note (recorded in the audit trail)"
            className="h-11 rounded-xl flex-1"
            aria-label={`Reviewer note for: ${item.question.slice(0, 60)}`}
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="default"
              className="h-11 rounded-xl flex-1 sm:flex-none text-primary"
              disabled={busy}
              onClick={() => onReview('APPROVED')}
            >
              {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden /> : <ShieldCheck className="h-4 w-4 mr-1.5" aria-hidden />}
              Approve
            </Button>
            <Button
              variant="outline"
              size="default"
              className="h-11 rounded-xl flex-1 sm:flex-none text-gold"
              disabled={busy}
              onClick={() => onReview('FLAGGED')}
            >
              <Flag className="h-4 w-4 mr-1.5" aria-hidden />
              Flag
            </Button>
          </div>
        </div>

        <p className="text-[0.65rem] text-muted-foreground">
          <time dateTime={item.createdAt}>{fmtDateTime(item.createdAt)}</time> · asked anonymously
        </p>
      </CardContent>
    </Card>
  );
}

function DeltaList({ title, data }: { title: string; data: Record<string, unknown> | null }) {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data).slice(0, 12);
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-[0.62rem] uppercase tracking-wider font-semibold text-muted-foreground/80">{title}</p>
      <dl className="mt-1 space-y-0.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex gap-1.5 text-[0.68rem] leading-snug">
            <dt className="text-muted-foreground shrink-0 font-medium">{k}:</dt>
            <dd className="text-foreground/80 break-words min-w-0">{renderDeltaValue(v)}</dd>
          </div>
        ))}
        {Object.keys(data).length > 12 ? (
          <p className="text-[0.62rem] text-muted-foreground">+{Object.keys(data).length - 12} more…</p>
        ) : null}
      </dl>
    </div>
  );
}

function renderDeltaValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (Array.isArray(v)) return v.length ? v.map(String).join(', ') : '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

// ————— Flag dialog —————
function FlagDialog({
  record,
  onClose,
  onDone,
  onAuthLost,
}: {
  record: AdminRecord;
  onClose: () => void;
  onDone: () => void;
  onAuthLost: () => void;
}) {
  const { toast } = useToast();
  const [note, setNote] = React.useState(record.flagNote ?? '');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setNote(record.flagNote ?? '');
  }, [record]);

  const submit = async () => {
    setBusy(true);
    const { ok, status, data } = await api<{ error?: string }>(
      `/api/admin/content/${encodeURIComponent(record.id)}`,
      jsonInit('PATCH', { action: 'FLAG', flagNote: note.trim() || undefined })
    );
    setBusy(false);
    if (ok) {
      toast({ title: 'Record flagged', description: `${record.citation} — marked for scholarly review.` });
      onClose();
      onDone();
    } else if (status === 401) {
      onAuthLost();
    } else {
      toast({ title: 'Could not flag record', description: data?.error ?? 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display">Flag for scholarly review</DialogTitle>
          <DialogDescription>
            {record.citation} — {record.title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="flag-note" className="text-sm font-medium">
            Why is this flagged?
          </Label>
          <Textarea
            id="flag-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. Grading of this report is debated — needs scholarly review."
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            The record stays visible to users but is marked as needing review — nothing is ever silently removed.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" className="h-11 rounded-xl" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button className="h-11 rounded-xl" onClick={() => void submit()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden /> : <Flag className="h-4 w-4 mr-2" aria-hidden />}
            Flag record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ————— Create / Edit record dialog —————
interface FormState {
  slug: string;
  sourceType: SourceType | '';
  title: string;
  collection: string;
  book: string;
  chapter: string;
  hadithNumber: string;
  narrator: string;
  grade: string;
  arabicText: string;
  transliteration: string;
  englishText: string;
  explanation: string;
  practicalSteps: string;
  referenceNote: string;
  topics: string;
  keywords: string;
  category: string;
  verificationStatus: VerificationStatus;
  reviewer: string;
  translationSource: string;
}

const EMPTY_FORM: FormState = {
  slug: '',
  sourceType: '',
  title: '',
  collection: '',
  book: '',
  chapter: '',
  hadithNumber: '',
  narrator: '',
  grade: '',
  arabicText: '',
  transliteration: '',
  englishText: '',
  explanation: '',
  practicalSteps: '',
  referenceNote: '',
  topics: '',
  keywords: '',
  category: '',
  verificationStatus: 'VERIFIED',
  reviewer: '',
  translationSource: 'BASIRA Simple English rendering (public domain)',
};

function recordToForm(r: AdminRecord): FormState {
  return {
    slug: r.slug,
    sourceType: r.sourceType,
    title: r.title ?? '',
    collection: r.collection ?? '',
    book: r.book ?? '',
    chapter: r.chapter ?? '',
    hadithNumber: r.hadithNumber != null ? String(r.hadithNumber) : '',
    narrator: r.narrator ?? '',
    grade: r.grade ?? '',
    arabicText: r.arabicText ?? '',
    transliteration: r.transliteration ?? '',
    englishText: r.englishText ?? '',
    explanation: r.explanation ?? '',
    practicalSteps: r.practicalSteps?.join('\n') ?? '',
    referenceNote: r.referenceNote ?? '',
    topics: r.topics.join(', '),
    keywords: r.keywords.join(', '),
    category: r.category ?? '',
    verificationStatus: r.verificationStatus,
    reviewer: r.reviewer ?? '',
    translationSource: r.translationSource ?? '',
  };
}

function FormField({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground/80">
        {label}
        {required ? (
          <span className="text-[hsl(12_60%_45%)] ml-0.5" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint ? <p className="text-[0.68rem] text-muted-foreground leading-snug">{hint}</p> : null}
    </div>
  );
}

function RecordFormDialog({
  target,
  onClose,
  onSaved,
  onAuthLost,
}: {
  target: { mode: 'edit'; record: AdminRecord } | { mode: 'create' };
  onClose: () => void;
  onSaved: () => void;
  onAuthLost: () => void;
}) {
  const { toast } = useToast();
  const isEdit = target.mode === 'edit';
  const [form, setForm] = React.useState<FormState>(() => (target.mode === 'edit' ? recordToForm(target.record) : EMPTY_FORM));
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(null);
    const slug = form.slug.trim();
    const english = form.englishText.trim();
    const title = form.title.trim();

    if (!title) {
      setError('Title is required.');
      return;
    }
    if (!english) {
      setError('English text is required.');
      return;
    }
    if (!isEdit && !slug) {
      setError('Slug is required — e.g. bukhari-57 or quran-2-286.');
      return;
    }
    if (!isEdit && !form.sourceType) {
      setError('Choose a source type.');
      return;
    }

    let hadithNumber: number | null = null;
    const hn = form.hadithNumber.trim();
    if (hn) {
      const n = Number(hn);
      if (!Number.isFinite(n) || n < 0) {
        setError('Hadith number must be a non-negative number — or leave it empty while the reference is pending.');
        return;
      }
      hadithNumber = Math.round(n);
    }

    // Empty optional strings clear the field server-side (PATCH stores '' as-is).
    const body: Record<string, unknown> = {
      title,
      collection: form.collection.trim(),
      book: form.book.trim(),
      chapter: form.chapter.trim(),
      hadithNumber,
      narrator: form.narrator.trim(),
      grade: form.grade.trim(),
      arabicText: form.arabicText.trim(),
      transliteration: form.transliteration.trim(),
      englishText: english,
      explanation: form.explanation.trim(),
      practicalSteps: form.practicalSteps,
      referenceNote: form.referenceNote.trim(),
      topics: form.topics,
      keywords: form.keywords,
      category: form.category.trim(),
      verificationStatus: form.verificationStatus,
      reviewer: form.reviewer.trim(),
      translationSource: form.translationSource.trim() || 'BASIRA Simple English rendering (public domain)',
    };
    if (!isEdit) {
      body.slug = slug;
      body.sourceType = form.sourceType;
    }

    setBusy(true);
    const { ok, status, data } = isEdit
      ? await api<{ error?: string }>(`/api/admin/content/${encodeURIComponent(target.record.id)}`, jsonInit('PATCH', body))
      : await api<{ error?: string }>('/api/admin/content', jsonInit('POST', body));
    setBusy(false);

    if (ok) {
      toast({
        title: isEdit ? 'Record saved' : 'Record created',
        description: `${slug || target.record.slug} — change recorded in the audit trail.`,
      });
      onSaved();
    } else if (status === 401) {
      onAuthLost();
    } else if (status === 409) {
      setError(data?.error ?? `Slug "${slug}" already exists.`);
    } else {
      setError(data?.error ?? 'Could not save the record. Please try again.');
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-soft rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? 'Edit source record' : 'New source record'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Editing ${target.record.citation} — every change is audit-trailed.`
              : 'Create a new record in the knowledge base. Required fields are marked.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isEdit ? (
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
              <TypeBadge type={target.record.sourceType} />
              <span className="text-xs text-muted-foreground font-mono break-all">{target.record.slug}</span>
            </div>
          ) : (
            <>
              <FormField label="Slug" htmlFor="rf-slug" required hint="Stable id — e.g. bukhari-57, quran-2-286">
                <Input
                  id="rf-slug"
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  className="h-10 rounded-lg font-mono text-sm"
                  placeholder="bukhari-57"
                  autoComplete="off"
                />
              </FormField>
              <FormField label="Type" htmlFor="rf-type" required>
                <Select value={form.sourceType || undefined} onValueChange={(v) => set('sourceType', v as SourceType)}>
                  <SelectTrigger id="rf-type" className="w-full h-10 rounded-lg bg-card">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {SOURCE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </>
          )}

          <FormField label="Title" htmlFor="rf-title" required>
            <Input
              id="rf-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="h-10 rounded-lg"
              placeholder="e.g. The best of you are those who learn the Qur'an"
            />
          </FormField>
          <FormField label="Category" htmlFor="rf-category" hint="e.g. morning-evening, fiqh-of-salah, letter-A">
            <Input id="rf-category" value={form.category} onChange={(e) => set('category', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
          <FormField label="Collection" htmlFor="rf-collection" hint='e.g. "Sahih al-Bukhari"'>
            <Input id="rf-collection" value={form.collection} onChange={(e) => set('collection', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
          <FormField label="Book" htmlFor="rf-book" hint="e.g. Book of Belief">
            <Input id="rf-book" value={form.book} onChange={(e) => set('book', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
          <FormField label="Chapter" htmlFor="rf-chapter">
            <Input id="rf-chapter" value={form.chapter} onChange={(e) => set('chapter', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
          <FormField label="Hadith number" htmlFor="rf-hadith" hint="Leave empty while the number is pending verification.">
            <Input
              id="rf-hadith"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.hadithNumber}
              onChange={(e) => set('hadithNumber', e.target.value)}
              className="h-10 rounded-lg tabular-nums"
              placeholder="pending"
            />
          </FormField>
          <FormField label="Narrator" htmlFor="rf-narrator" hint="Companion who narrated it">
            <Input id="rf-narrator" value={form.narrator} onChange={(e) => set('narrator', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
          <FormField label="Grade" htmlFor="rf-grade" hint='e.g. "Sahih" or "Hasan"'>
            <Input id="rf-grade" value={form.grade} onChange={(e) => set('grade', e.target.value)} className="h-10 rounded-lg" />
          </FormField>

          <FormField label="Arabic text" htmlFor="rf-arabic" className="sm:col-span-2">
            <Textarea
              id="rf-arabic"
              value={form.arabicText}
              onChange={(e) => set('arabicText', e.target.value)}
              rows={4}
              dir="rtl"
              className="font-arabic text-lg leading-loose rounded-lg"
            />
          </FormField>
          <FormField label="Transliteration" htmlFor="rf-translit" className="sm:col-span-2">
            <Textarea id="rf-translit" value={form.transliteration} onChange={(e) => set('transliteration', e.target.value)} rows={2} className="rounded-lg" />
          </FormField>
          <FormField label="English text" htmlFor="rf-english" required className="sm:col-span-2">
            <Textarea
              id="rf-english"
              value={form.englishText}
              onChange={(e) => set('englishText', e.target.value)}
              rows={5}
              className="rounded-lg"
              placeholder="The plain-English rendering of the source text…"
            />
          </FormField>
          <FormField label="Explanation" htmlFor="rf-explanation" className="sm:col-span-2">
            <Textarea id="rf-explanation" value={form.explanation} onChange={(e) => set('explanation', e.target.value)} rows={4} className="rounded-lg" />
          </FormField>
          <FormField label="Practical steps" htmlFor="rf-steps" hint="One step per line." className="sm:col-span-2">
            <Textarea id="rf-steps" value={form.practicalSteps} onChange={(e) => set('practicalSteps', e.target.value)} rows={3} className="rounded-lg" />
          </FormField>
          <FormField label="Reference note" htmlFor="rf-refnote" hint="Shown when a reference is pending or disputed." className="sm:col-span-2">
            <Textarea id="rf-refnote" value={form.referenceNote} onChange={(e) => set('referenceNote', e.target.value)} rows={2} className="rounded-lg" />
          </FormField>

          <FormField label="Topics" htmlFor="rf-topics" hint="Comma separated — e.g. patience, trials">
            <Input id="rf-topics" value={form.topics} onChange={(e) => set('topics', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
          <FormField label="Keywords" htmlFor="rf-keywords" hint="Comma separated extra search terms">
            <Input id="rf-keywords" value={form.keywords} onChange={(e) => set('keywords', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
          <FormField label="Verification status" htmlFor="rf-verif">
            <Select value={form.verificationStatus} onValueChange={(v) => set('verificationStatus', v as VerificationStatus)}>
              <SelectTrigger id="rf-verif" className="w-full h-10 rounded-lg bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERIFICATION_OPTIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {VERIF_LABEL[v]}
                    {v === 'REFERENCE_PENDING' ? ' — number not fully confirmed' : v === 'DISPUTED' ? ' — scholars differ' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Reviewer" htmlFor="rf-reviewer" hint="Who reviewed this record">
            <Input id="rf-reviewer" value={form.reviewer} onChange={(e) => set('reviewer', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
          <FormField label="Translation source" htmlFor="rf-translation" className="sm:col-span-2">
            <Input id="rf-translation" value={form.translationSource} onChange={(e) => set('translationSource', e.target.value)} className="h-10 rounded-lg" />
          </FormField>
        </div>

        {error ? (
          <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}

        <DialogFooter className="gap-2">
          <Button variant="ghost" className="h-11 rounded-xl" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button className="h-11 rounded-xl" onClick={() => void submit()} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
            ) : (
              <Pencil className="h-4 w-4 mr-2" aria-hidden />
            )}
            {isEdit ? 'Save changes' : 'Create record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
