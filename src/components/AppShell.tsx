import { Link, useLocation } from "@tanstack/react-router";
import { Home, Wallet, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/debts", label: "Debts", icon: Wallet },
  { to: "/strategy", label: "Plan", icon: TrendingUp },
  { to: "/profile", label: "You", icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md pb-28 safe-top">{children}</main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 safe-bottom">
        <div className="mx-auto max-w-md px-4 pb-3">
          <div className="rounded-2xl bg-surface/90 backdrop-blur-xl border border-border shadow-lift grid grid-cols-4">
            {tabs.map((t) => {
              const active = pathname === t.to || (t.to !== "/dashboard" && pathname.startsWith(t.to));
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-xl transition-all",
                      active && "bg-primary-soft",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
                  </span>
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
