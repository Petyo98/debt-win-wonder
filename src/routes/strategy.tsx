import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  compareStrategies,
  formatMoney,
  type Debt,
  type Strategy,
  totalMinimums,
} from "@/lib/finance";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Plan · DebtFree" },
      { name: "description", content: "Compare snowball and avalanche payoff strategies." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <StrategyPage />
      </AppShell>
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
    <div className="px-5 pt-6 pb-6 space-y-5">
      <header>
        <p className="text-xs text-muted-foreground">Your method</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Choose your plan</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Both work. Pick the one you'll stick with — you can switch any time.
        </p>
      </header>

      {loading ? (
        <p className="text-muted-foreground">Calculating…</p>
      ) : debts.length === 0 ? (
        <div className="rounded-3xl bg-surface border border-border p-6 text-center">
          <p className="font-display text-lg font-bold">Add a debt first</p>
          <p className="text-sm text-muted-foreground mt-1">Then we'll project your timeline.</p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-surface border border-border p-5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">
              Extra each month above {formatMoney(minSum)}
            </Label>
            <input
              type="range"
              min={0}
              max={Math.max(500, minSum * 2)}
              step={25}
              value={extra}
              onChange={(e) => setExtra(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Total monthly:{" "}
              <span className="font-display font-bold text-foreground">{formatMoney(monthly)}</span>
            </p>
          </div>

          <div className="space-y-4">
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

          <div className="rounded-3xl bg-foreground text-background p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">The verdict</p>
            <p className="font-display text-xl font-extrabold mt-2 leading-tight">
              {interestSaved < 1
                ? "Either path costs about the same — pick the one that feels right."
                : `${better === "avalanche" ? "Avalanche" : "Snowball"} saves you ${formatMoney(
                    interestSaved
                  )} in interest.`}
            </p>
          </div>
        </>
      )}
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
    <button
      onClick={onSelect}
      disabled={isSelected}
      className={cn(
        "block w-full text-left rounded-3xl border p-5 transition-all",
        isSelected
          ? "bg-primary-soft border-primary shadow-soft"
          : "bg-surface border-border hover:border-primary/40"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-2xl font-extrabold">{title}</h3>
            {isSelected && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {isBetter && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-success/15 text-success px-2 py-1 rounded-full">
            Saves more
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Mini label="Months" value={String(projection.monthsToFreedom)} />
        <Mini
          label="Free by"
          value={projection.payoffDate.toLocaleDateString(undefined, { month: "short", year: "2-digit" })}
        />
        <Mini label="Interest" value={formatMoney(projection.totalInterest)} />
        <Mini label="Total paid" value={formatMoney(projection.totalPaid)} />
      </div>
      {!isSelected && (
        <Button asChild={false} className="mt-5 w-full rounded-2xl h-11 font-semibold pointer-events-none">
          Choose {title}
        </Button>
      )}
    </button>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-base font-bold mt-0.5">{value}</p>
    </div>
  );
}
