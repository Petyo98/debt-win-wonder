import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatMoneyDetailed } from "@/lib/finance";
import { Trash2 } from "lucide-react";
import { DebtPayoffChart } from "@/components/DebtPayoffChart";

export const Route = createFileRoute("/debts")({
  head: () => ({
    meta: [
      { title: "Debts · Ledger" },
      { name: "description", content: "Track every debt and log payments." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DebtsPage />
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
};

function DebtsPage() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [payingDebt, setPayingDebt] = useState<DebtRow | null>(null);

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="font-serif text-muted-foreground italic">Opening your ledger…</div>
      </div>
    );
  }


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

  const active = debts.filter((d) => !d.is_paid_off);
  const paid = debts.filter((d) => d.is_paid_off);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16 space-y-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">The book</p>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Your debts</h1>
          </div>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button>+ Add debt</Button>
            </DialogTrigger>
            <AddDebtDialog
              userId={user!.id}
              onAdded={() => {
                setOpenAdd(false);
                void load();
              }}
            />
          </Dialog>
        </div>

        {loading ? (
          <p className="font-serif italic text-muted-foreground">Reading your entries…</p>
        ) : debts.length === 0 ? (
          <Card className="p-10 text-center bg-card border-border/60 rounded-sm">
            <h2 className="font-serif text-2xl mb-2">No entries yet.</h2>
            <p className="text-muted-foreground">Add your first debt to begin.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {active.map((d) => {
              const progress = ((d.starting_balance - d.balance) / Math.max(d.starting_balance, 1)) * 100;
              return (
                <Card key={d.id} className="p-6 bg-card border-border/60 rounded-sm">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="font-serif text-xl">{d.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {d.apr}% APR · Min {formatMoneyDetailed(d.minimum_payment)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl">{formatMoneyDetailed(d.balance)}</p>
                      <p className="text-xs text-muted-foreground">of {formatMoneyDetailed(d.starting_balance)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPayingDebt(d)}>
                        Log payment
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteDebt(d.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brass transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% paid off</p>
                  <DebtPayoffChart
                    debt={{
                      id: d.id,
                      name: d.name,
                      balance: d.balance,
                      apr: d.apr,
                      minimum_payment: d.minimum_payment,
                    }}
                  />
                </Card>
              );
            })}

            {paid.length > 0 && (
              <div className="pt-8">
                <p className="text-xs uppercase tracking-[0.2em] text-success mb-4">Paid off · {paid.length}</p>
                <div className="space-y-3">
                  {paid.map((d) => (
                    <Card key={d.id} className="p-5 bg-success/5 border-success/30 rounded-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-lg">{d.name}</h3>
                          <p className="text-sm text-muted-foreground">Cleared {formatMoneyDetailed(d.starting_balance)}</p>
                        </div>
                        <span className="font-serif text-success text-2xl">✓</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={!!payingDebt} onOpenChange={(o) => !o && setPayingDebt(null)}>
        {payingDebt && (
          <PayDialog
            debt={payingDebt}
            userId={user!.id}
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

function AddDebtDialog({ userId, onAdded }: { userId: string; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minPay, setMinPay] = useState("");
  const [busy, setBusy] = useState(false);

  function resetForm() {
    setName("");
    setBalance("");
    setApr("");
    setMinPay("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const bal = Number(balance);
    const debtName = name;
    const { error } = await supabase.from("debts").insert({
      user_id: userId,
      name,
      balance: bal,
      starting_balance: bal,
      apr: Number(apr),
      minimum_payment: Number(minPay),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${debtName} added to your ledger`, {
      description: `${formatMoneyDetailed(bal)} at ${apr}% APR is now being tracked.`,
    });
    resetForm();
    onAdded();
  }

  return (
    <DialogContent className="bg-card">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">New debt entry</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="dn">Name</Label>
          <Input id="dn" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Visa card" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="db">Balance ($)</Label>
            <Input id="db" type="number" step="0.01" min="0" required value={balance} onChange={(e) => setBalance(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="da">APR (%)</Label>
            <Input id="da" type="number" step="0.01" min="0" max="100" required value={apr} onChange={(e) => setApr(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="dm">Minimum payment ($)</Label>
          <Input id="dm" type="number" step="0.01" min="0" required value={minPay} onChange={(e) => setMinPay(e.target.value)} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={busy}>{busy ? "Adding…" : "Add to ledger"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
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
    <DialogContent className="bg-card">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">Log payment · {debt.name}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Current balance: <span className="font-serif text-ink">{formatMoneyDetailed(debt.balance)}</span>
        </p>
        <div>
          <Label htmlFor="pa">Amount ($)</Label>
          <Input id="pa" type="number" step="0.01" min="0.01" max={debt.balance} required value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={busy}>{busy ? "Logging…" : "Log payment"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
