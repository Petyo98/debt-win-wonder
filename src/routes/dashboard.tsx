import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Ledger" },
      { name: "description", content: "Your daily debt-payoff dashboard." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
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
  const todayAction = useMemo(() => actionForDate(new Date()), []);
  const checkedInToday = checkins.some((c) => c.checkin_date === todayKey);
  const streak = useMemo(
    () => calculateStreak(checkins.map((c) => c.checkin_date)),
    [checkins]
  );

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
    setDebts((debtRows ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      balance: Number(d.balance),
      apr: Number(d.apr),
      minimum_payment: Number(d.minimum_payment),
    })));
    setCheckins((ciRows ?? []) as Checkin[]);
    setPaidOffCount(paidCount ?? 0);
    setLoading(false);
  }

  const minSum = totalMinimums(debts);
  const balanceSum = totalBalance(debts);
  const monthlyBudget = minSum + extraBudget;
  const projection = useMemo(
    () => project(debts, monthlyBudget, profile?.preferred_strategy ?? "snowball"),
    [debts, monthlyBudget, profile]
  );
  const focusDebt = useMemo(() => {
    if (debts.length === 0) return null;
    if (profile?.preferred_strategy === "avalanche") {
      return [...debts].sort((a, b) => b.apr - a.apr)[0];
    }
    return [...debts].sort((a, b) => a.balance - b.balance)[0];
  }, [debts, profile]);

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
    toast.success("Logged. Keep the streak alive.");
    setSavedAmount("");
    void loadAll();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-6 py-20 font-serif italic text-muted-foreground">
          Reading your entries…
        </div>
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16 space-y-12">
        {/* Greeting */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass mb-3">Today · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
            {greeting}, {profile?.display_name ?? "friend"}.
          </h1>
        </div>

        {debts.length === 0 ? (
          <Card className="p-10 text-center bg-card border-border/60 rounded-sm shadow-paper">
            <h2 className="font-serif text-2xl mb-3">Your ledger is empty.</h2>
            <p className="text-muted-foreground mb-6">Add your first debt to begin the practice.</p>
            <Link to="/debts">
              <Button>Add your first debt</Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Top stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard label="Total balance" value={formatMoney(balanceSum)} />
              <StatCard
                label="Debt-free by"
                value={projection.payoffDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                hint={`${projection.monthsToFreedom} months`}
              />
              <StatCard label="Current streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} hint={`${paidOffCount} debt${paidOffCount === 1 ? "" : "s"} paid off`} />
            </div>

            {/* Today's action */}
            <Card className="p-8 md:p-10 bg-card border-border/60 rounded-sm shadow-paper">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex-1 space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-brass">Today's action</p>
                  <h2 className="font-serif text-3xl md:text-4xl tracking-tight">{todayAction.title}</h2>
                  <p className="text-muted-foreground leading-relaxed max-w-xl">{todayAction.description}</p>
                </div>
                <div className="md:w-64 space-y-3">
                  {checkedInToday ? (
                    <div className="rounded-sm border border-success/40 bg-success/10 p-4 text-center">
                      <p className="font-serif text-success text-lg">✓ Logged for today</p>
                      <p className="text-sm text-muted-foreground mt-1">Streak: {streak} days</p>
                    </div>
                  ) : (
                    <>
                      <Label htmlFor="saved" className="text-xs uppercase tracking-widest">Amount saved (optional)</Label>
                      <Input
                        id="saved"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="$"
                        value={savedAmount}
                        onChange={(e) => setSavedAmount(e.target.value)}
                      />
                      <Button onClick={handleCheckin} disabled={submittingCheckin} className="w-full">
                        {submittingCheckin ? "Logging…" : "Log today's action"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Focus debt */}
            {focusDebt && (
              <Card className="p-8 bg-card border-border/60 rounded-sm shadow-paper">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">Focus debt · {profile?.preferred_strategy}</p>
                    <h3 className="font-serif text-2xl">{focusDebt.name}</h3>
                    <p className="text-muted-foreground mt-1">
                      {formatMoneyDetailed(focusDebt.balance)} remaining · {focusDebt.apr}% APR
                    </p>
                  </div>
                  <Link to="/debts">
                    <Button variant="outline">Log a payment →</Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* Projection sliders */}
            <Card className="p-8 bg-card border-border/60 rounded-sm shadow-paper space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">The plan</p>
                <h3 className="font-serif text-2xl mb-1">If you pay {formatMoney(monthlyBudget)} a month…</h3>
                <p className="text-muted-foreground text-sm">
                  Minimums: {formatMoney(minSum)} · Extra: {formatMoney(extraBudget)}
                </p>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-widest mb-3 block">Add extra each month</Label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(500, Math.round(minSum * 2))}
                  step={25}
                  value={extraBudget}
                  onChange={(e) => setExtraBudget(Number(e.target.value))}
                  className="w-full accent-[var(--brass)]"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>{formatMoney(Math.max(500, Math.round(minSum * 2)))}</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <Mini label="Months to freedom" value={String(projection.monthsToFreedom)} />
                <Mini label="Total interest" value={formatMoney(projection.totalInterest)} />
                <Mini label="Debt-free date" value={projection.payoffDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })} />
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Progress toward zero</span>
                  <span>{Math.round((1 - balanceSum / Math.max(balanceSum, 1)) * 100)}%</span>
                </div>
                <Progress value={paidOffCount > 0 ? 10 : 0} className="h-1" />
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-6 bg-card border-border/60 rounded-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</p>
      <p className="font-serif text-3xl tracking-tight">{value}</p>
      {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-brass pl-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="font-serif text-2xl">{value}</p>
    </div>
  );
}
