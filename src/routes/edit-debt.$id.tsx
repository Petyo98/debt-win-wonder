import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatMoneyDetailed } from "@/lib/finance";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/edit-debt/$id")({
  head: () => ({
    meta: [
      { title: "Edit Debt · DebtFree" },
      { name: "description", content: "Update a debt in your payoff plan." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <EditDebtPage />
    </RequireAuth>
  ),
});

function EditDebtPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams({ from: "/edit-debt/$id" });
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minPay, setMinPay] = useState("");
  const [remainingMonths, setRemainingMonths] = useState("");
  const [extraPayment, setExtraPayment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    async function load() {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        toast.error("Debt not found");
        navigate({ to: "/debts" });
        return;
      }
      setName(data.name);
      setBalance(String(data.balance));
      setApr(String(data.apr));
      setMinPay(String(data.minimum_payment));
      setRemainingMonths(data.remaining_months ? String(data.remaining_months) : "");
      setExtraPayment(String((data as { extra_payment?: number }).extra_payment ?? 0));
      setLoading(false);
    }
    void load();
  }, [user, id, navigate]);

  function handleCancel() {
    navigate({ to: "/debts" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !id) return;
    setBusy(true);
    const { error } = await supabase
      .from("debts")
      .update({
        name: name.trim(),
        balance: Number(balance),
        apr: Number(apr),
        minimum_payment: Number(minPay),
        remaining_months: remainingMonths ? Number(remainingMonths) : null,
        extra_payment: Number(extraPayment),
      })
      .eq("id", id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Debt updated");
    navigate({ to: "/debts" });
  }

  const canSubmit =
    name.trim().length > 0 &&
    balance !== "" &&
    Number(balance) >= 0 &&
    apr !== "" &&
    minPay !== "" &&
    Number(minPay) >= 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

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
            <h1 className="font-display text-lg font-extrabold tracking-tight">Edit Debt</h1>
          </div>
        </header>

        <form onSubmit={submit} className="px-5 pt-6 pb-10 space-y-5">
          {/* Debt name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-sm font-semibold">
              Debt name
            </Label>
            <Input
              id="edit-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Visa, Student loan"
              className="h-12 rounded-2xl bg-surface text-base"
              autoFocus
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-balance" className="text-sm font-semibold">
              Current balance
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-display font-bold">
                $
              </span>
              <Input
                id="edit-balance"
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
            <Label htmlFor="edit-apr" className="text-sm font-semibold">
              Interest rate (APR)
            </Label>
            <div className="relative">
              <Input
                id="edit-apr"
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
            <Label htmlFor="edit-min" className="text-sm font-semibold">
              Minimum monthly payment
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-display font-bold">
                $
              </span>
              <Input
                id="edit-min"
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
          </div>

          {/* Remaining months */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-months" className="text-sm font-semibold">
              Estimated remaining months
            </Label>
            <Input
              id="edit-months"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={remainingMonths}
              onChange={(e) => setRemainingMonths(e.target.value)}
              placeholder="Optional"
              className="h-12 rounded-2xl bg-surface text-base font-display font-bold"
            />
          </div>

          {/* Extra payment */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-extra" className="text-sm font-semibold">
              Extra paid per month
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-display font-bold">
                $
              </span>
              <Input
                id="edit-extra"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                placeholder="0.00"
                className="h-12 rounded-2xl bg-surface text-base pl-8 font-display font-bold"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={busy || !canSubmit}
              className="w-full h-12 rounded-2xl font-semibold text-base shadow-soft"
            >
              {busy ? "Saving…" : "Save changes"}
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
