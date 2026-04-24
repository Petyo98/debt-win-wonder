import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { compareStrategies, formatMoney, type Debt, type Strategy, totalMinimums } from "@/lib/finance";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Strategy · Ledger" },
      { name: "description", content: "Compare snowball and avalanche payoff strategies." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <StrategyPage />
    </RequireAuth>
  ),
});

function StrategyPage() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [strategy, setStrategy] = useState<Strategy>("snowball");
  const [extra, setExtra] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [{ data: prof }, { data: debtRows }] = await Promise.all([
        supabase.from("profiles").select("preferred_strategy").eq("id", user.id).maybeSingle(),
        supabase.from("debts").select("*").eq("user_id", user.id).eq("is_paid_off", false),
      ]);
      if (prof) setStrategy((prof.preferred_strategy as Strategy) ?? "snowball");
      setDebts(
        (debtRows ?? []).map((d) => ({
          id: d.id,
          name: d.name,
          balance: Number(d.balance),
          apr: Number(d.apr),
          minimum_payment: Number(d.minimum_payment),
        }))
      );
      setLoading(false);
    })();
  }, [user]);

  const minSum = totalMinimums(debts);
  const monthly = minSum + extra;
  const compared = useMemo(() => compareStrategies(debts, monthly), [debts, monthly]);

  const better: Strategy =
    compared.avalanche.totalInterest < compared.snowball.totalInterest ? "avalanche" : "snowball";
  const interestSaved = Math.abs(compared.snowball.totalInterest - compared.avalanche.totalInterest);

  async function saveStrategy(s: Strategy) {
    setStrategy(s);
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, preferred_strategy: s }, { onConflict: "id" });
    if (error) toast.error(error.message);
    else toast.success(`Strategy set: ${s}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16 space-y-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">The method</p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Choose your path.</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            Two proven strategies. Snowball pays the smallest balance first for emotional momentum.
            Avalanche pays the highest interest first to save the most money. Both work — pick the one you'll stick with.
          </p>
        </div>

        {loading ? (
          <p className="font-serif italic text-muted-foreground">Calculating…</p>
        ) : debts.length === 0 ? (
          <Card className="p-10 text-center bg-card border-border/60 rounded-sm">
            <p className="font-serif text-xl mb-2">Add some debts first.</p>
            <p className="text-muted-foreground">Once you have entries, you'll see the projection here.</p>
          </Card>
        ) : (
          <>
            <Card className="p-6 bg-card border-border/60 rounded-sm">
              <Label className="text-xs uppercase tracking-widest mb-3 block">Extra each month above minimums ({formatMoney(minSum)})</Label>
              <input
                type="range"
                min={0}
                max={Math.max(500, minSum * 2)}
                step={25}
                value={extra}
                onChange={(e) => setExtra(Number(e.target.value))}
                className="w-full accent-[var(--brass)]"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Total monthly: <span className="font-serif text-ink">{formatMoney(monthly)}</span> · Extra: {formatMoney(extra)}
              </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <StrategyCard
                title="Snowball"
                subtitle="Smallest balance first"
                projection={compared.snowball}
                isBetter={better === "snowball"}
                isSelected={strategy === "snowball"}
                onSelect={() => saveStrategy("snowball")}
              />
              <StrategyCard
                title="Avalanche"
                subtitle="Highest APR first"
                projection={compared.avalanche}
                isBetter={better === "avalanche"}
                isSelected={strategy === "avalanche"}
                onSelect={() => saveStrategy("avalanche")}
              />
            </div>

            <Card className="p-8 bg-primary text-primary-foreground rounded-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-brass mb-3">The verdict</p>
              <p className="font-serif text-2xl md:text-3xl tracking-tight">
                {interestSaved < 1
                  ? "Either path costs about the same — pick the one that feels right."
                  : `${better === "avalanche" ? "Avalanche" : "Snowball"} saves you ${formatMoney(interestSaved)} in interest.`}
              </p>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function StrategyCard({
  title,
  subtitle,
  projection,
  isBetter,
  isSelected,
  onSelect,
}: {
  title: string;
  subtitle: string;
  projection: ReturnType<typeof compareStrategies>["snowball"];
  isBetter: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card className={`p-8 rounded-sm border ${isSelected ? "border-brass bg-card" : "border-border/60 bg-card"}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-serif text-3xl tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {isBetter && (
          <span className="text-xs uppercase tracking-widest text-brass border border-brass/40 rounded-sm px-2 py-1">
            Saves more
          </span>
        )}
      </div>
      <div className="space-y-4">
        <Row label="Months to freedom" value={String(projection.monthsToFreedom)} />
        <Row label="Debt-free date" value={projection.payoffDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })} />
        <Row label="Total interest" value={formatMoney(projection.totalInterest)} />
        <Row label="Total paid" value={formatMoney(projection.totalPaid)} />
      </div>
      <Button
        className="w-full mt-6"
        variant={isSelected ? "secondary" : "default"}
        onClick={onSelect}
        disabled={isSelected}
      >
        {isSelected ? "Your current strategy" : `Choose ${title}`}
      </Button>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dashed border-border/60 pb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-serif text-lg">{value}</span>
    </div>
  );
}
