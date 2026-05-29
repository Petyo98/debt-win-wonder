import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Enter a valid email").max(255),
});

interface Props {
  variant?: "light" | "dark";
  source?: string;
}

export function WaitlistForm({ variant = "light", source = "landing" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name: name || undefined, email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("waitlist").insert({
      name: parsed.data.name ?? null,
      email: parsed.data.email,
      source,
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        setDone(true);
        toast.success("You're already on the list!");
        return;
      }
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
    toast.success("You're on the list! We'll be in touch.");
  };

  const isDark = variant === "dark";

  if (done) {
    return (
      <div
        className={`rounded-2xl p-5 flex items-center gap-3 ${
          isDark ? "bg-background/10 text-background" : "bg-primary-soft text-primary"
        }`}
      >
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">You're on the list!</p>
          <p className={`text-sm ${isDark ? "text-background/80" : "text-primary/80"}`}>
            We'll email you the moment DebtFree is ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        className={`h-12 rounded-xl ${isDark ? "bg-background/10 border-background/20 text-background placeholder:text-background/60" : ""}`}
      />
      <Input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={255}
        className={`h-12 rounded-xl ${isDark ? "bg-background/10 border-background/20 text-background placeholder:text-background/60" : ""}`}
      />
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className={`w-full rounded-2xl h-14 text-base font-semibold ${
          isDark ? "bg-primary text-primary-foreground hover:bg-primary/90" : "shadow-glow"
        }`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Get early access <ArrowRight className="ml-1 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}
