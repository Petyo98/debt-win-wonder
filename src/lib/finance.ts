// Debt payoff projection utilities (Snowball vs Avalanche)

export type Debt = {
  id: string;
  name: string;
  balance: number;
  apr: number; // annual percentage rate, e.g. 19.99
  minimum_payment: number;
};

export type Strategy = "snowball" | "avalanche";

export type Projection = {
  monthsToFreedom: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: Date;
  schedule: { month: number; remainingBalance: number }[];
};

const MAX_MONTHS = 600; // 50 years safety cap

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatMoneyDetailed(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function totalMinimums(debts: Debt[]): number {
  return debts.reduce((s, d) => s + d.minimum_payment, 0);
}

export function totalBalance(debts: Debt[]): number {
  return debts.reduce((s, d) => s + d.balance, 0);
}

function sortDebts(debts: Debt[], strategy: Strategy): Debt[] {
  const arr = debts.map((d) => ({ ...d }));
  if (strategy === "snowball") {
    arr.sort((a, b) => a.balance - b.balance);
  } else {
    arr.sort((a, b) => b.apr - a.apr);
  }
  return arr;
}

export function project(
  inputDebts: Debt[],
  monthlyBudget: number,
  strategy: Strategy
): Projection {
  const debts = inputDebts
    .map((d) => ({ ...d }))
    .filter((d) => d.balance > 0);

  if (debts.length === 0) {
    return {
      monthsToFreedom: 0,
      totalInterest: 0,
      totalPaid: 0,
      payoffDate: new Date(),
      schedule: [{ month: 0, remainingBalance: 0 }],
    };
  }

  const minSum = totalMinimums(debts);
  let budget = Math.max(monthlyBudget, minSum);

  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const schedule: { month: number; remainingBalance: number }[] = [
    { month: 0, remainingBalance: totalBalance(debts) },
  ];

  while (debts.some((d) => d.balance > 0.01) && month < MAX_MONTHS) {
    month++;

    // 1. Apply interest
    for (const d of debts) {
      if (d.balance > 0) {
        const interest = (d.balance * (d.apr / 100)) / 12;
        d.balance += interest;
        totalInterest += interest;
      }
    }

    // 2. Pay minimums
    let remainingBudget = budget;
    for (const d of debts) {
      if (d.balance > 0) {
        const pay = Math.min(d.minimum_payment, d.balance);
        d.balance -= pay;
        remainingBudget -= pay;
        totalPaid += pay;
      }
    }

    // 3. Apply extra to highest priority active debt
    const ordered = sortDebts(
      debts.filter((d) => d.balance > 0),
      strategy
    );
    for (const target of ordered) {
      if (remainingBudget <= 0) break;
      const live = debts.find((d) => d.id === target.id)!;
      if (live.balance <= 0) continue;
      const extra = Math.min(remainingBudget, live.balance);
      live.balance -= extra;
      remainingBudget -= extra;
      totalPaid += extra;
    }

    schedule.push({
      month,
      remainingBalance: debts.reduce((s, d) => s + Math.max(d.balance, 0), 0),
    });
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    monthsToFreedom: month,
    totalInterest,
    totalPaid,
    payoffDate,
    schedule,
  };
}

export function compareStrategies(debts: Debt[], monthlyBudget: number) {
  return {
    snowball: project(debts, monthlyBudget, "snowball"),
    avalanche: project(debts, monthlyBudget, "avalanche"),
  };
}

// Daily action prompts to keep momentum
export const DAILY_ACTIONS: { title: string; description: string }[] = [
  {
    title: "Skip one impulse buy",
    description: "Pause before any non-essential purchase today and put what you would have spent toward your debt.",
  },
  {
    title: "Make coffee at home",
    description: "Brew at home instead of buying out — log the savings as today's win.",
  },
  {
    title: "Audit one subscription",
    description: "Open your subscriptions list and cancel one you barely use.",
  },
  {
    title: "Pack a meal",
    description: "Bring lunch from home today. The savings go straight to your highest-priority debt.",
  },
  {
    title: "Call a creditor",
    description: "Ask one creditor for a lower APR or a hardship plan. A 3-minute call can save hundreds.",
  },
  {
    title: "Round up a payment",
    description: "Add an extra $10–$25 to today's planned payment toward your focus debt.",
  },
  {
    title: "Sell one thing",
    description: "List one item you don't use. Even $20 accelerates your payoff date.",
  },
];

export function actionForDate(date: Date): { title: string; description: string } {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_ACTIONS[dayOfYear % DAILY_ACTIONS.length];
}

export function calculateStreak(checkinDates: string[]): number {
  if (checkinDates.length === 0) return 0;
  const set = new Set(checkinDates);
  let streak = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  // Allow today not yet checked in — start from yesterday if today missing
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!set.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
