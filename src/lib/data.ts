import type {
  Activity,
  DashboardData,
  Kpi,
  RangeKey,
  RevenuePoint,
  TrafficSource,
} from "./types";

const RANGE_DAYS: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/** Deterministic PRNG so server and client always render identical data. */
function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMERS = [
  ["Aarav Sharma", "aarav@northstar.io", "Business"],
  ["Priya Mehta", "priya@lumenlabs.co", "Pro"],
  ["Rohan Verma", "rohan@stackforge.dev", "Enterprise"],
  ["Sneha Iyer", "sneha@paperplane.app", "Starter"],
  ["Kabir Khan", "kabir@orbitpay.com", "Pro"],
  ["Ananya Rao", "ananya@bloomhive.in", "Business"],
  ["Dev Patel", "dev@quantbase.ai", "Pro"],
  ["Meera Nair", "meera@wavesync.io", "Starter"],
  ["Arjun Bedi", "arjun@fieldnotes.co", "Enterprise"],
  ["Isha Kapoor", "isha@brightside.dev", "Pro"],
] as const;

const STATUSES = ["Paid", "Paid", "Paid", "Pending", "Paid", "Refunded", "Paid", "Pending"] as const;

function makeRevenue(days: number): RevenuePoint[] {
  const rand = seededRandom(days * 7919);
  const today = new Date("2026-11-20T00:00:00Z");
  const points: RevenuePoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);
    const label = day.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    const progress = days - i;
    const trend = 1 + progress / (days * 2.4);
    const wave = 0.86 + 0.22 * Math.sin(progress / 3.1);
    const revenue = Math.round(2350 * trend * wave * (0.88 + rand() * 0.26));
    const target = Math.round(2550 * trend * (0.96 + rand() * 0.08));
    points.push({ date: label, revenue, target });
  }
  return points;
}

function makeKpis(revenue: RevenuePoint[], days: number): Kpi[] {
  const total = revenue.reduce((sum, point) => sum + point.revenue, 0);
  const avg = Math.round(total / revenue.length);
  const orders = Math.round(total / 96);
  const rate = 2.6 + days / 90;
  const spark = (seed: number, base: number) =>
    Array.from({ length: 12 }, (_, i) =>
      Math.round(base * (0.78 + 0.32 * Math.sin(i / 1.7 + seed)) + i * 1.5),
    );

  return [
    {
      label: "Total revenue",
      value: `$${(total / 1000).toFixed(1)}k`,
      delta: days === 7 ? 8.4 : days === 30 ? 14.2 : 21.8,
      hint: `vs previous ${days} days`,
      spark: spark(0.4, avg / 100),
    },
    {
      label: "Active users",
      value: (orders * 3.4).toFixed(0),
      delta: days === 7 ? 5.1 : days === 30 ? 9.7 : 17.3,
      hint: `${Math.round(orders * 0.42)} new this period`,
      spark: spark(1.9, 34),
    },
    {
      label: "Conversion rate",
      value: `${rate.toFixed(1)}%`,
      delta: days === 7 ? 1.2 : days === 30 ? 2.8 : 3.4,
      hint: "checkout → paid",
      spark: spark(3.1, 18),
    },
    {
      label: "Avg. order value",
      value: `$${Math.round(total / orders)}`,
      delta: days === 7 ? -1.4 : days === 30 ? 4.6 : 6.2,
      hint: "across all plans",
      spark: spark(4.7, 26),
    },
  ];
}

const TRAFFIC: TrafficSource[] = [
  { name: "Organic search", value: 42, color: "#34d399" },
  { name: "Direct", value: 26, color: "#6366f1" },
  { name: "Social", value: 19, color: "#f59e0b" },
  { name: "Referral", value: 13, color: "#38bdf8" },
];

function makeActivity(days: number): Activity[] {
  const rand = seededRandom(days * 104729);
  const start = new Date("2026-11-20T00:00:00Z");

  return Array.from({ length: 8 }, (_, index) => {
    const person = CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)];
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() - Math.floor(rand() * Math.min(days, 14)));
    const price = [49, 99, 199, 499][Math.floor(rand() * 4)];

    return {
      id: `INV-${String(4821 - index).padStart(4, "0")}`,
      customer: person[0],
      email: person[1],
      plan: person[2],
      amount: price,
      status: STATUSES[index % STATUSES.length],
      date: day.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
    };
  });
}

export function getDashboardData(range: RangeKey): DashboardData {
  const days = RANGE_DAYS[range];
  const revenue = makeRevenue(days);

  return {
    range,
    kpis: makeKpis(revenue, days),
    revenue,
    traffic: TRAFFIC,
    activity: makeActivity(days),
    updatedAt: "2026-11-20T18:00:00.000Z",
  };
}

export function isRangeKey(value: string): value is RangeKey {
  return value === "7d" || value === "30d" || value === "90d";
}
