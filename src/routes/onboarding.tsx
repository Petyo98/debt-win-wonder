import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Sparkles, Target, Zap, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to DebtFree" },
      { name: "description", content: "Set up your debt-free journey in 60 seconds." },
    ],
  }),
  component: Onboarding,
});

const STEPS = 4;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [strategy, setStrategy] = useState<"snowball" | "avalanche" | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  const next = () => {
    if (step < STEPS - 1) setStep((s) => s + 1);
    else {
      try {
        localStorage.setItem(
          "debtfree_onboarding",
          JSON.stringify({ name, strategy, goal })
        );
      } catch {
        // ignore (private mode etc.)
      }
      navigate({ to: "/auth" });
    }
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const canContinue =
    (step === 0) ||
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && !!strategy) ||
    (step === 3 && !!goal);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="mx-auto w-full max-w-md px-5 pt-6 flex items-center gap-3">
        <button
          onClick={step === 0 ? () => navigate({ to: "/" }) : back}
          className="h-10 w-10 rounded-full grid place-items-center bg-surface border border-border"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-5 flex-1 flex flex-col pt-10 pb-8">
        {step === 0 && (
          <Step
            kicker="Welcome"
            title="A calmer way to crush your debt."
            body="DebtFree is a coach in your pocket. We'll set you up in under a minute — no judgment, just momentum."
          >
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { icon: Sparkles, label: "Daily action" },
                { icon: Target, label: "Clear goal" },
                { icon: Zap, label: "Fast wins" },
                { icon: HeartPulse, label: "Stress-free" },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl bg-surface border border-border p-4 flex flex-col items-start gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold">{c.label}</p>
                </div>
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step kicker="Step 1 of 3" title="What should we call you?" body="We'll use this to greet you each morning.">
            <div className="mt-8 space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="h-14 rounded-2xl text-base bg-surface border-border"
                autoFocus
              />
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step kicker="Step 2 of 3" title="Pick your style." body="Both work. Pick the one that feels right — you can change it later.">
            <div className="mt-6 space-y-3">
              <ChoiceCard
                selected={strategy === "snowball"}
                onClick={() => setStrategy("snowball")}
                title="Snowball"
                tag="Most popular"
                body="Pay off the smallest balance first. Quick wins build unstoppable momentum."
              />
              <ChoiceCard
                selected={strategy === "avalanche"}
                onClick={() => setStrategy("avalanche")}
                title="Avalanche"
                tag="Saves the most"
                body="Tackle the highest interest rate first. Mathematically optimal — saves real money."
              />
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step kicker="Step 3 of 3" title="What's the dream?" body="Your why. We'll remind you of it on the hard days.">
            <div className="mt-6 space-y-3">
              {[
                { id: "freedom", emoji: "🕊️", label: "Pure financial freedom" },
                { id: "stress", emoji: "🧘", label: "Stop stressing about money" },
                { id: "house", emoji: "🏡", label: "Save for a home" },
                { id: "family", emoji: "👨‍👩‍👧", label: "Provide for my family" },
                { id: "travel", emoji: "✈️", label: "Travel the world" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    "w-full rounded-2xl border p-4 flex items-center gap-3 text-left transition-all",
                    goal === g.id
                      ? "bg-primary-soft border-primary"
                      : "bg-surface border-border hover:border-primary/40"
                  )}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </Step>
        )}

        <div className="mt-auto pt-8">
          <Button
            onClick={next}
            disabled={!canContinue}
            size="lg"
            className="w-full rounded-2xl h-14 text-base font-semibold shadow-glow"
          >
            {step === STEPS - 1 ? "Create my account" : "Continue"}
            <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
          {step === 0 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/auth" className="text-primary font-semibold">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{kicker}</p>
      <h1 className="font-display text-3xl font-extrabold tracking-tight mt-2 leading-tight text-balance">
        {title}
      </h1>
      <p className="text-muted-foreground mt-3 leading-relaxed">{body}</p>
      {children}
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  title,
  tag,
  body,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  tag: string;
  body: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border p-5 transition-all",
        selected
          ? "bg-primary-soft border-primary shadow-soft"
          : "bg-surface border-border hover:border-primary/40"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-bold text-xl">{title}</h3>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {tag}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </button>
  );
}
