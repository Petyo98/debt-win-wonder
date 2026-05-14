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
    <div className="mt-1">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Payoff timeline</p>
        <p className="text-[11px] text-muted-foreground">
          <span className="font-display font-bold text-foreground">{yearsLabel}</span> ·
          {" "}<span className="font-display font-bold text-foreground">{formatMoney(totalInterest)}</span> interest
        </p>
      </div>
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${debt.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
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
              width={44}
              tickFormatter={(v) => formatMoney(Number(v))}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value: number) => [formatMoney(value), "Balance"]}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--primary)"
              strokeWidth={2}
              fill={`url(#grad-${debt.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 text-right">
        Free by {payoffDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
      </p>
    </div>
  );
}
