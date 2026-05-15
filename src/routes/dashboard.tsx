import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  type Debt,
  type Strategy,
  actionForDate,
  calculateStreak,
  formatMoney,
  formatMoneyDetailed,
  project,
  totalBalance,
  totalMinimums,
} from "@/lib/finance";
import { Flame, CheckCircle2, ArrowRight, Plus, Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Home · DebtFree" },
      { name: "description", content: "Your daily debt-payoff dashboard." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <Dashboard />
      </AppShell>
    </RequireAuth>
  ),
});

type Profile = { display_name: string | null; preferred_strategy: Strategy };
type Checkin = { id: string; checkin_date: string; action_taken: string | null; amount_saved: number | null };

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [paidOffCount, setPaidOffCount] = useState(0);
  const [extraBudget, setExtraBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedAmount, setSavedAmount] = useState("");
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  const todayKey = new Date().toISOString().slice(0, 10);
  const [skippedToday, setSkippedToday] = useState(false);
  const checkedInToday = checkins.some((c) => c.checkin_date === todayKey);
  const streak = useMemo(() => calculateStreak(checkins.map((c) => c.checkin_date)), [checkins]);

  useEffect(() => {
    if (!user) return;
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadAll() {
    setLoading(true);
    const [{ data: prof }, { data: debtRows }, { data: ciRows }, { count: paidCount }] = await Promise.all([
      supabase.from("profiles").select("display_name, preferred_strategy").eq("id", user!.id).maybeSingle(),
      supabase.from("debts").select("*").eq("user_id", user!.id).eq("is_paid_off", false).order("balance"),
      supabase.from("checkins").select("*").eq("user_id", user!.id).order("checkin_date", { ascending: false }).limit(60),
      supabase.from("debts").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("is_paid_off", true),
    ]);

    setProfile(
      (prof as Profile) ?? { display_name: user!.email?.split("@")[0] ?? null, preferred_strategy: "snowball" }
    );
    setDebts(
      (debtRows ?? []).map((d) => ({
        id: d.id,
        name: d.name,
        balance: Number(d.balance),
        apr: Number(d.apr),
        minimum_payment: Number(d.minimum_payment),
      }))
    );
    setCheckins((ciRows ?? []) as Checkin[]);
    setPaidOffCount(paidCount ?? 0);
    setLoading(false);
  }

  // Total starting balance for progress bar
  const [startingTotal, setStartingTotal] = useState(0);
  useEffect(() => {
    if (!user) return;
    void supabase
      .from("debts")
      .select("starting_balance")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const total = (data ?? []).reduce((s, d) => s + Number(d.starting_balance), 0);
        setStartingTotal(total);
      });
  }, [user, debts.length]);

  const minSum = totalMinimums(debts);
  const balanceSum = totalBalance(debts);
  const monthlyBudget = minSum + extraBudget;
  const strategy = profile?.preferred_strategy ?? "snowball";
  const projection = useMemo(
    () => project(debts, monthlyBudget, strategy),
    [debts, monthlyBudget, strategy]
  );
  const baselineProjection = useMemo(
    () => project(debts, minSum, strategy),
    [debts, minSum, strategy]
  );
  const interestSaved = Math.max(0, baselineProjection.totalInterest - projection.totalInterest);
  const progressPct = startingTotal > 0 ? Math.min(100, Math.max(0, ((startingTotal - balanceSum) / startingTotal) * 100)) : 0;

  // Personalized daily action: focus on top-priority debt, suggest a small extra
  const focusDebt = useMemo(() => {
    if (debts.length === 0) return null;
    const sorted = [...debts];
    if (strategy === "snowball") sorted.sort((a, b) => a.balance - b.balance);
    else sorted.sort((a, b) => b.apr - a.apr);
    return sorted[0];
  }, [debts, strategy]);

  const suggestedExtra = useMemo(() => {
    if (!focusDebt) return 0;
    const base = Math.max(10, Math.round(focusDebt.minimum_payment * 0.2 / 5) * 5);
    return Math.min(base, Math.ceil(focusDebt.balance));
  }, [focusDebt]);

  const todayAction = useMemo(() => {
    if (focusDebt && suggestedExtra > 0) {
      return {
        title: `Pay ${formatMoney(suggestedExtra)} extra today toward your ${focusDebt.name}`,
        description: `Every extra dollar on your focus debt shrinks the interest you'll ever pay. One small move, big compounding win.`,
      };
    }
    return actionForDate(new Date());
  }, [focusDebt, suggestedExtra]);

  async function handleCheckin() {
    if (!user) return;
    setSubmittingCheckin(true);
    const amt = savedAmount ? Number(savedAmount) : null;
    const { error } = await supabase.from("checkins").upsert(
      {
        user_id: user.id,
        checkin_date: todayKey,
        action_taken: todayAction.title,
        amount_saved: amt,
      },
      { onConflict: "user_id,checkin_date" }
    );
    setSubmittingCheckin(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Nice. Streak alive. 🔥");
    setSavedAmount("");
    void loadAll();
  }

  function handleSkip() {
    setSkippedToday(true);
    toast("Skipped for today — see you tomorrow.", { icon: "👋" });
  }

  if (loading) {
    return <div className="px-5 pt-10 text-muted-foreground">Loading…</div>;
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const motivation = motivationFor(streak, paidOffCount, balanceSum);

  return (
    <div className="px-5 pt-6 pb-6 space-y-5">
      {/* Greeting */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{greeting},</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            {profile?.display_name ?? "friend"} 👋
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-warning/15 text-warning-foreground px-3 py-1.5">
          <Flame className="h-4 w-4 text-warning" />
          <span className="font-bold text-sm">{streak}</span>
        </div>
      </header>

      {/* Empty state */}
      {debts.length === 0 ? (
        <div className="rounded-3xl bg-surface border border-border p-6 text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-primary-soft text-primary grid place-items-center">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="font-display font-bold text-xl mt-4">Let's get started</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first debt to see your debt-free date and unlock your daily action.
          </p>
          <Link to="/debts" className="block mt-5">
            <Button className="w-full rounded-2xl h-12 font-semibold">
              <Plus className="h-4 w-4" /> Add your first debt
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Hero progress card */}
          <div className="relative rounded-3xl p-6 bg-foreground text-background overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/40 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Debt-free by</p>
            <p className="font-display text-4xl font-extrabold mt-1">
              {projection.payoffDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </p>
            <p className="text-sm opacity-70 mt-1">
              {projection.monthsToFreedom} months · {formatMoney(balanceSum)} to go
            </p>

            <div className="mt-5">
              <div className="flex justify-between text-xs opacity-70 mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-2 rounded-full bg-background/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-3">
            <Tile label="Total debt" value={formatMoney(balanceSum)} />
            <Tile label="Interest saved" value={formatMoney(interestSaved)} hint="vs minimums" />
            <Tile label="Paid off" value={`${paidOffCount}`} hint="cleared" />
          </div>

          {/* Daily action */}
          <div className="rounded-3xl bg-primary-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Today's action
              </p>
              {checkedInToday && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                  <CheckCircle2 className="h-3 w-3" /> DONE
                </span>
              )}
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight">{todayAction.title}</h2>
            <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{todayAction.description}</p>

            {checkedInToday ? (
              <div className="mt-4 rounded-2xl bg-surface/70 p-3 text-center text-sm text-foreground/70">
                Streak: <span className="font-bold text-primary">{streak} days</span> 🔥
              </div>
            ) : skippedToday ? (
              <div className="mt-4 rounded-2xl bg-surface/70 p-3 text-center text-sm text-foreground/70">
                Skipped today. A fresh action drops tomorrow.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="saved" className="sr-only">
                    Amount saved
                  </Label>
                  <Input
                    id="saved"
                    type="number"
                    inputMode="decimal"
                    placeholder="$ Saved (optional)"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    className="h-12 rounded-2xl bg-surface border-transparent text-base"
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Button
                    onClick={handleCheckin}
                    disabled={submittingCheckin}
                    className="h-12 rounded-2xl font-semibold"
                  >
                    {submittingCheckin ? "Saving…" : "Mark as Done"}
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    className="h-12 rounded-2xl font-semibold text-foreground/60 hover:text-foreground"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Motivation */}
          <div className="rounded-3xl border border-border bg-surface p-5 flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-success/15 text-success grid place-items-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-success">
                Coach
              </p>
              <p className="font-medium leading-snug mt-1">{motivation}</p>
            </div>
          </div>

          {/* Plan adjustment */}
          <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Tweak your plan</p>
              <Link to="/strategy" className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Compare <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="font-display text-xl font-bold mt-1">
              Pay {formatMoney(monthlyBudget)} / month
            </p>
            <p className="text-xs text-muted-foreground">
              Min {formatMoney(minSum)} + extra {formatMoney(extraBudget)}
            </p>

            <input
              type="range"
              min={0}
              max={Math.max(500, Math.round(minSum * 2))}
              step={25}
              value={extraBudget}
              onChange={(e) => setExtraBudget(Number(e.target.value))}
              className="w-full mt-4 accent-[var(--primary)]"
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Mini label="Months" value={String(projection.monthsToFreedom)} />
              <Mini label="Interest" value={formatMoney(projection.totalInterest)} />
            </div>
          </div>

          {/* Debts shortcut */}
          <Link
            to="/debts"
            className="block rounded-3xl bg-surface border border-border p-5 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Your debts
                </p>
                <p className="font-display text-lg font-bold mt-0.5">
                  {debts.length} active · {formatMoneyDetailed(balanceSum)}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-extrabold mt-1">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

function motivationFor(streak: number, paid: number, balance: number): string {
  if (paid > 0 && streak >= 7) return `${paid} debt${paid > 1 ? "s" : ""} crushed and a ${streak}-day streak. You're unstoppable.`;
  if (streak >= 7) return `${streak} days in a row. This is what compound momentum feels like.`;
  if (streak >= 3) return `Day ${streak}. The hardest part is starting — and you've already started.`;
  if (paid > 0) return `One down. Each payoff makes the next one faster.`;
  if (balance > 0) return `Small actions, repeated daily, change everything. Take today's action.`;
  return `You're building the habits that set future-you free.`;
}
