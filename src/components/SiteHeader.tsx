import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="border-b border-border/60 bg-paper/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
            <span className="font-serif text-primary-foreground text-sm font-semibold">L</span>
          </span>
          <span className="font-serif text-xl tracking-tight">Ledger</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-ink" }} className="text-muted-foreground hover:text-ink transition-colors">
            Home
          </Link>
          {user && (
            <>
              <Link to="/dashboard" activeProps={{ className: "text-ink" }} className="text-muted-foreground hover:text-ink transition-colors">
                Dashboard
              </Link>
              <Link to="/debts" activeProps={{ className: "text-ink" }} className="text-muted-foreground hover:text-ink transition-colors">
                Debts
              </Link>
              <Link to="/strategy" activeProps={{ className: "text-ink" }} className="text-muted-foreground hover:text-ink transition-colors">
                Strategy
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {!loading && (user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          ))}
        </div>
      </div>
    </header>
  );
}
