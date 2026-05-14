import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Mail } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "You · DebtFree" }, { name: "description", content: "Your profile and settings." }],
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <ProfilePage />
      </AppShell>
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("display_name, preferred_strategy")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setName(data?.display_name ?? user.email?.split("@")[0] ?? null);
        setStrategy(data?.preferred_strategy ?? "snowball");
      });
  }, [user]);

  async function logout() {
    await supabase.auth.signOut();
    toast.success("See you tomorrow.");
    navigate({ to: "/" });
  }

  return (
    <div className="px-5 pt-6 pb-6 space-y-5">
      <header>
        <p className="text-xs text-muted-foreground">Account</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">You</h1>
      </header>

      <div className="rounded-3xl bg-surface border border-border p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-display font-extrabold text-xl">
          {(name ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-lg truncate">{name ?? "Friend"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-surface border border-border divide-y divide-border">
        <Row icon={<UserIcon className="h-4 w-4" />} label="Strategy" value={strategy ?? "—"} />
        <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user?.email ?? "—"} />
      </div>

      <Button
        variant="outline"
        className="w-full h-12 rounded-2xl font-semibold border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" /> Sign out
      </Button>

      <p className="text-center text-xs text-muted-foreground pt-4">
        DebtFree · Built for the journey.
      </p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary grid place-items-center">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
        <p className="font-medium truncate capitalize">{value}</p>
      </div>
    </div>
  );
}
