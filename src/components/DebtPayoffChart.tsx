import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, project, type Debt } from "@/lib/finance";

type Props = {
  debt: Debt;
  /** Optional extra paid above the minimum each month (defaults to 0). */
  extraPerMonth?: number;
};

export function DebtPayoffChart({ debt, extraPerMonth = 0 }: Props) {
  const { data, monthsToFreedom, totalInterest, payoffDate } = useMemo(() => {
    const proj = project([debt], debt.minimum_payment + extraPerMonth, "avalanche");
    const start = new Date();
    start.setDate(1);
    const data = proj.schedule.map((p) => {
      const d = new Date(start);
      d.setMonth(d.getMonth() + p.month);
      return {
        month: p.month,
        label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        balance: Math.round(p.remainingBalance),
      };
    });
    return {
      data,
      monthsToFreedom: proj.monthsToFreedom,
      totalInterest: proj.totalInterest,
      payoffDate: proj.payoffDate,
    };
  }, [debt, extraPerMonth]);

  if (debt.balance <= 0 || data.length <= 1) return null;

  const yearsLabel =
    monthsToFreedom >= 12
      ? `${Math.floor(monthsToFreedom / 12)}y ${monthsToFreedom % 12}m`
      : `${monthsToFreedom}m`;

  return (
    <div className="mt-5 pt-5 border-t border-border/60">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-brass">Payoff timeline</p>
        <p className="text-xs text-muted-foreground">
          Paid off in <span className="font-serif text-ink">{yearsLabel}</span> ·
          {" "}<span className="font-serif text-ink">{formatMoney(totalInterest)}</span> interest ·
          {" "}{payoffDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${debt.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brass)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--brass)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => formatMoney(Number(v))}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 2,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value: number) => [formatMoney(value), "Balance"]}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--brass)"
              strokeWidth={1.5}
              fill={`url(#grad-${debt.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
