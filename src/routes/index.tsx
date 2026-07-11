import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Calendar, ShieldCheck } from "lucide-react";
import { WaitlistForm } from "@/components/WaitlistForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DebtFree — Pay off debt faster, one calm day at a time" },
      {
        name: "description",
        content:
          "DebtFree is your mobile debt payoff coach. Daily actions, motivating progress, and a clear path to your debt-free date.",
      },
      { property: "og:title", content: "DebtFree — Your debt payoff coach" },
      { property: "og:description", content: "Daily actions, motivating progress, a clear debt-free date." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-md px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">
            ⏣
          </div>
          <span className="font-display font-bold text-lg tracking-tight">DebtFree</span>
        </div>
        <Link to="/auth">
          <Button variant="ghost" size="sm" className="rounded-full">
            Sign in
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-md px-5 pt-10 pb-12">
        <div className="absolute inset-x-0 -top-10 h-80 bg-mesh blur-3xl opacity-80 -z-10" />
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Your debt payoff coach
        </div>
        <h1 className="font-display text-[40px] leading-[1.05] tracking-tight font-extrabold text-balance">
          Pay off debt
          <br />
          <span className="text-primary">faster</span>, calmer,
          <br />
          one day at a time.
        </h1>
        <p className="mt-5 text-base text-muted-foreground leading-relaxed">
          DebtFree gives you one small action each day, tracks every win, and shows the exact
          date you'll be free. No budgets. No shame. Just momentum.
        </p>

        <div className="mt-8 space-y-3">
          <WaitlistForm source="hero" />
          <p className="text-center text-xs text-muted-foreground">
            Join the waitlist · Be first when we launch
          </p>
        </div>

        {/* Phone-like preview */}
        <div className="mt-12 rounded-3xl bg-surface border border-border shadow-lift p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Debt-free by</p>
              <p className="font-display font-bold text-2xl">Mar 2027</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary-soft grid place-items-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[42%] rounded-full bg-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">42% of the way there</p>
          <div className="mt-4 rounded-2xl bg-primary-soft/60 p-4">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Today</p>
            <p className="font-semibold mt-1">Skip one impulse buy</p>
            <p className="text-xs text-muted-foreground mt-1">Save $12 → ~3 days off your payoff</p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-md px-5 py-12 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">How it works</p>
        <h2 className="font-display text-3xl font-bold tracking-tight">Three habits. One free life.</h2>

        {[
          { icon: Target, title: "Pick a strategy", body: "Snowball for momentum or avalanche for math. We'll show you which saves more." },
          { icon: Calendar, title: "One action a day", body: "A small, specific prompt every morning. Build a streak. Stay motivated." },
          { icon: ShieldCheck, title: "Watch the line fall", body: "Log payments, see your debt-free date move closer, celebrate every payoff." },
        ].map((p, i) => (
          <div key={p.title} className="rounded-2xl bg-surface border border-border p-5 flex gap-4 items-start">
            <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
              <p.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Step {i + 1}</p>
              <h3 className="font-display font-bold text-lg mt-0.5">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">{p.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <section className="mx-auto max-w-md px-5 pb-16">
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            DebtFree helps you identify opportunities to repay debt more efficiently through planning, tracking, and
            personalized suggestions. We do not provide financial advice, lending services, debt settlement, or credit
            repair services.
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          DebtFree · Built for the journey, not the shame.
        </p>
        <p className="text-center text-xs text-muted-foreground mt-3 space-x-3">
          <Link to="/terms" className="hover:text-foreground underline-offset-2 hover:underline">
            Terms
          </Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-foreground underline-offset-2 hover:underline">
            Privacy
          </Link>
        </p>
      </section>
    </div>
  );
}
