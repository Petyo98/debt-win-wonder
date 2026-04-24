import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-ledger.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledger — Pay off debt with quiet discipline" },
      {
        name: "description",
        content:
          "An editorial debt-payoff companion. Snowball or avalanche, daily proactive actions, and a clear date you'll be free.",
      },
      { property: "og:title", content: "Ledger — Pay off debt with quiet discipline" },
      { property: "og:description", content: "An editorial debt-payoff companion. Snowball or avalanche, daily actions, a clear payoff date." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24 pb-20 md:pb-32 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px w-8 bg-brass" /> Vol. 1 · A debt-free practice
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] tracking-tight text-balance">
              Pay off debt with{" "}
              <em className="text-brass not-italic font-normal italic">quiet discipline.</em>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Ledger is a daily companion for becoming debt-free. Choose your strategy,
              take one small action a day, and watch the date you'll be free move closer.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/auth">
                <Button size="lg" className="px-8">Begin your ledger</Button>
              </Link>
              <Link to="/strategy">
                <Button size="lg" variant="ghost">See how it works →</Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-brass/10 rounded-sm rotate-1" />
            <img
              src={heroImg}
              alt="An open ledger book with a brass pen on cream linen"
              width={1536}
              height={1280}
              className="relative w-full h-auto rounded-sm shadow-paper object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-brass mb-4">The Practice</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight">
              Three habits. One quiet, deliberate path to freedom.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: "I.",
                title: "Choose your method",
                body: "Snowball for momentum, avalanche for math. Compare both and watch the date you'll be debt-free move years closer.",
              },
              {
                num: "II.",
                title: "One action a day",
                body: "A new prompt every morning — small, specific, doable. Build a streak. The discipline is the point.",
              },
              {
                num: "III.",
                title: "Watch the line fall",
                body: "Log payments, see the curve bend toward zero, and celebrate every debt paid off.",
              },
            ].map((p) => (
              <div key={p.num} className="space-y-4">
                <div className="font-serif text-3xl text-brass">{p.num}</div>
                <h3 className="font-serif text-2xl">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
          <p className="font-serif text-3xl md:text-4xl leading-snug italic text-balance">
            "Beware of little expenses; a small leak will sink a great ship."
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            — Benjamin Franklin
          </p>
          <div className="mt-12">
            <Link to="/auth">
              <Button size="lg" className="px-10">Start your first entry</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Ledger · A practice in becoming debt-free.
      </footer>
    </div>
  );
}
