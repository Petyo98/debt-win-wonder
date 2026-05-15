import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatMoneyDetailed } from "@/lib/finance";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/add-debt")({
  head: () => ({
    meta: [
      { title: "Add Debt · DebtFree" },
      { name: "description", content: "Add a new debt to your payoff plan." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AddDebtPage />
    </RequireAuth>
  ),
});

function AddDebtPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minPay, setMinPay] = useState("");
  const [remainingMonths, setRemainingMonths] = useState("");
  const [busy, setBusy] = useState(false);

  function handleCancel() {
    navigate({ to: "/debts" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const bal = Number(balance);
    const debtName = name.trim();
    const { error } = await supabase.from("debts").insert({
      user_id: user.id,
      name: debtName,
      balance: bal,
      starting_balance: bal,
      apr: Number(apr),
      minimum_payment: Number(minPay),
      remaining_months: remainingMonths ? Number(remainingMonths) : null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${debtName} added 🎉`, {
      description: `${formatMoneyDetailed(bal)} at ${apr}% APR is now being tracked.`,
    });
    navigate({ to: "/debts" });
  }

  const canSubmit =
    name.trim().length > 0 &&
    balance !== "" &&
    Number(balance) > 0 &&
    apr !== "" &&
    minPay !== "" &&
    Number(minPay) > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-5 h-14">
            <button
              onClick={handleCancel}
              className="h-9 w-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-extrabold tracking-tight">Add Debt</h1>
          </div>
        </header>

        <form onSubmit={submit} className="px-5 pt-6 pb-10 space-y-5">
          {/* Debt name */}
          <div className="space-y-1.5">
            <Label htmlFor="debt-name" className="text-sm font-semibold">
              Debt name
            </Label>
            <Input
              id="debt-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Visa, Student loan, Car loan"
              className="h-12 rounded-2xl bg-surface text-base"
              autoFocus
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="debt-amount" className="text-sm font-semibold">
              Current balance
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-display font-bold">
                $
              </span>
              <Input
                id="debt-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="h-12 rounded-2xl bg-surface text-base pl-8 font-display font-bold"
              />
            </div>
          </div>

          {/* Interest rate */}
          <div className="space-y-1.5">
            <Label htmlFor="debt-apr" className="text-sm font-semibold">
              Interest rate (APR)
            </Label>
            <div className="relative">
              <Input
                id="debt-apr"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="100"
                required
                value={apr}
                onChange={(e) => setApr(e.target.value)}
                placeholder="0.00"
                className="h-12 rounded-2xl bg-surface text-base pr-8 font-display font-bold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                %
              </span>
            </div>
          </div>

          {/* Minimum payment */}
          <div className="space-y-1.5">
            <Label htmlFor="debt-min" className="text-sm font-semibold">
              Minimum monthly payment
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-display font-bold">
                $
              </span>
              <Input
                id="debt-min"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                value={minPay}
                onChange={(e) => setMinPay(e.target.value)}
                placeholder="0.00"
                className="h-12 rounded-2xl bg-surface text-base pl-8 font-display font-bold"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The smallest amount you must pay each month.
            </p>
          </div>

          {/* Remaining months */}
          <div className="space-y-1.5">
            <Label htmlFor="debt-months" className="text-sm font-semibold">
              Estimated remaining months
            </Label>
            <Input
              id="debt-months"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={remainingMonths}
              onChange={(e) => setRemainingMonths(e.target.value)}
              placeholder="Optional — e.g. 24"
              className="h-12 rounded-2xl bg-surface text-base font-display font-bold"
            />
            <p className="text-xs text-muted-foreground">
              Your best guess. We will recalculate this automatically as you pay it down.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={busy || !canSubmit}
              className="w-full h-12 rounded-2xl font-semibold text-base shadow-soft"
            >
              {busy ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={busy}
              className="w-full h-12 rounded-2xl font-semibold text-base"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
