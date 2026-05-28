import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatMoney, formatMoneyDetailed } from "@/lib/finance";
import { Trash2, Plus, CheckCircle2, Pencil } from "lucide-react";
import { DebtPayoffChart } from "@/components/DebtPayoffChart";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/debts")({
  head: () => ({
    meta: [
      { title: "Debts · DebtFree" },
      { name: "description", content: "Track every debt and log payments." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <DebtsPage />
      </AppShell>
    </RequireAuth>
  ),
});

type DebtRow = {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimum_payment: number;
  starting_balance: number;
  is_paid_off: boolean;
  extra_payment: number;
};

function DebtsPage() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingDebt, setPayingDebt] = useState<DebtRow | null>(null);

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .order("is_paid_off")
      .order("balance");
    if (error) toast.error(error.message);
    setDebts(
      (data ?? []).map((d) => ({
        ...d,
        balance: Number(d.balance),
        apr: Number(d.apr),
        minimum_payment: Number(d.minimum_payment),
        starting_balance: Number(d.starting_balance),
        extra_payment: Number((d as { extra_payment?: number }).extra_payment ?? 0),
      })) as DebtRow[]
    );
    setLoading(false);
  }

  async function deleteDebt(id: string) {
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Debt removed");
    void load();
  }

  if (!user) return null;

  const active = debts.filter((d) => !d.is_paid_off);
  const paid = debts.filter((d) => d.is_paid_off);

  return (
    <div className="px-5 pt-6 pb-6 space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Your portfolio</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Debts</h1>
        </div>
        <Link to="/add-debt">
          <Button size="sm" className="rounded-full h-10 px-4 font-semibold shadow-soft">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </Link>
      </header>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : debts.length === 0 ? (
        <div className="rounded-3xl bg-surface border border-border p-8 text-center">
          <h2 className="font-display font-bold text-xl">Nothing tracked yet</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first debt to start your countdown.
          </p>
          <Link to="/add-debt">
            <Button className="mt-5 rounded-2xl h-12 font-semibold w-full">
              <Plus className="h-4 w-4" /> Add a debt
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((d) => {
            const progress =
              ((d.starting_balance - d.balance) / Math.max(d.starting_balance, 1)) * 100;
            return (
              <div key={d.id} className="rounded-3xl bg-surface border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-lg leading-tight">{d.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.apr}% APR · Min {formatMoney(d.minimum_payment)}/mo
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      to="/edit-debt/$id"
                      params={{ id: d.id }}
                      className="h-9 w-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Edit debt"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteDebt(d.id)}
                      aria-label="Delete debt"
                      className="h-9 w-9 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <p className="font-display text-3xl font-extrabold tracking-tight">
                    {formatMoneyDetailed(d.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    of {formatMoney(d.starting_balance)}
                  </p>
                </div>

                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {Math.round(progress)}% paid off
                </p>

                <Button
                  onClick={() => setPayingDebt(d)}
                  className="mt-4 w-full rounded-2xl h-11 font-semibold"
                >
                  Log payment
                </Button>

                <DebtPayoffPlanner
                  debt={{
                    id: d.id,
                    name: d.name,
                    balance: d.balance,
                    apr: d.apr,
                    minimum_payment: d.minimum_payment,
                  }}
                  initialExtra={d.extra_payment}
                />
              </div>
            );
          })}

          {paid.length > 0 && (
            <div className="pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-success mb-3">
                Paid off · {paid.length}
              </p>
              <div className="space-y-3">
                {paid.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-2xl bg-success/10 border border-success/30 p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-display font-bold">{d.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Cleared {formatMoneyDetailed(d.starting_balance)}
                      </p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!payingDebt} onOpenChange={(o) => !o && setPayingDebt(null)}>
        {payingDebt && (
          <PayDialog
            debt={payingDebt}
            userId={user.id}
            onDone={() => {
              setPayingDebt(null);
              void load();
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function PayDialog({ debt, userId, onDone }: { debt: DebtRow; userId: string; onDone: () => void }) {
  const [amount, setAmount] = useState(debt.minimum_payment.toString());
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const amt = Number(amount);
    const newBalance = Math.max(0, debt.balance - amt);
    const isPaidOff = newBalance <= 0;

    const { error: pErr } = await supabase.from("payments").insert({
      user_id: userId,
      debt_id: debt.id,
      amount: amt,
    });
    if (pErr) {
      setBusy(false);
      return toast.error(pErr.message);
    }
    const { error: dErr } = await supabase
      .from("debts")
      .update({ balance: newBalance, is_paid_off: isPaidOff })
      .eq("id", debt.id);
    setBusy(false);
    if (dErr) return toast.error(dErr.message);
    if (isPaidOff) toast.success(`🎉 ${debt.name} is paid off!`);
    else toast.success(`Logged ${formatMoneyDetailed(amt)}`);
    onDone();
  }

  return (
    <DialogContent className="rounded-3xl">
      <DialogHeader>
        <DialogTitle className="font-display text-xl font-extrabold">
          Log payment · {debt.name}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Current balance:{" "}
          <span className="font-display font-bold text-foreground">
            {formatMoneyDetailed(debt.balance)}
          </span>
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="pa">Amount ($)</Label>
          <Input
            id="pa"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max={debt.balance}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            className="h-14 rounded-2xl bg-surface text-xl font-display font-bold text-center"
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={busy} className="w-full h-12 rounded-2xl font-semibold">
            {busy ? "Logging…" : "Log payment"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function DebtPayoffPlanner({
  debt,
  initialExtra = 0,
}: {
  debt: { id: string; name: string; balance: number; apr: number; minimum_payment: number };
  initialExtra?: number;
}) {
  const [extra, setExtra] = useState(initialExtra);
  const [saving, setSaving] = useState(false);
  const maxExtra = Math.max(100, Math.round(debt.minimum_payment * 4));

  useEffect(() => {
    setExtra(initialExtra);
  }, [initialExtra, debt.id]);

  useEffect(() => {
    if (extra === initialExtra) return;
    const t = setTimeout(async () => {
      setSaving(true);
      const { error } = await supabase
        .from("debts")
        .update({ extra_payment: extra })
        .eq("id", debt.id);
      setSaving(false);
      if (error) toast.error(`Couldn't save: ${error.message}`);
    }, 600);
    return () => clearTimeout(t);
  }, [extra, initialExtra, debt.id]);

  return (
    <div className="mt-5 pt-5 border-t border-border space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={`extra-${debt.id}`} className="text-[10px] font-bold uppercase tracking-widest text-primary">
          Extra / month{" "}
          {saving && (
            <span className="ml-1 text-muted-foreground normal-case tracking-normal italic">saving…</span>
          )}
        </Label>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">$</span>
          <Input
            id={`extra-${debt.id}`}
            type="number"
            inputMode="decimal"
            min={0}
            step={10}
            value={extra}
            onChange={(e) => setExtra(Math.max(0, Number(e.target.value) || 0))}
            className="h-9 w-20 text-right font-display font-bold rounded-xl bg-muted border-transparent"
          />
        </div>
      </div>
      <Slider
        value={[Math.min(extra, maxExtra)]}
        min={0}
        max={maxExtra}
        step={10}
        onValueChange={(v) => setExtra(v[0] ?? 0)}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>$0</span>
        <span>{formatMoney(maxExtra)}</span>
      </div>
      <DebtPayoffChart debt={debt} extraPerMonth={extra} />
    </div>
  );
}
