"use client";

import { useCallback, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import AiInsights from "./AiInsights";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { ActivityStatus, DashboardData, Kpi, RangeKey } from "@/lib/types";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #243040",
  background: "#101720",
  fontSize: 12,
};

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 28 - ((value - min) / span) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-9 w-24 shrink-0" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#34d399" : "#fb7185"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const positive = kpi.delta >= 0;
  const DeltaIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="card card-hover rise p-4 lg:p-5">
      <p className="text-xs font-medium text-muted">{kpi.label}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tracking-tight text-ink lg:text-[26px]">{kpi.value}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                positive ? "bg-brand/10 text-brand" : "bg-rose-400/10 text-rose-400"
              }`}
            >
              <DeltaIcon className="size-3" />
              {Math.abs(kpi.delta)}%
            </span>
            <span className="text-[11px] text-muted">{kpi.hint}</span>
          </div>
        </div>
        <Sparkline values={kpi.spark} positive={positive} />
      </div>
    </article>
  );
}

const statusStyles: Record<ActivityStatus, string> = {
  Paid: "bg-brand/10 text-brand ring-brand/20",
  Pending: "bg-amber-400/10 text-amber-400 ring-amber-400/20",
  Refunded: "bg-rose-400/10 text-rose-400 ring-rose-400/20",
};

export default function Dashboard({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [range, setRange] = useState<RangeKey>(initialData.range);
  const [loading, setLoading] = useState(false);

  const syncedAt = new Date(data.updatedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  const load = useCallback(async (next: RangeKey) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/metrics?range=${next}`);
      if (!response.ok) throw new Error("Could not load metrics");
      const fresh = (await response.json()) as DashboardData;
      setData(fresh);
      setRange(next);
    } finally {
      setLoading(false);
    }
  }, []);

  const topChannel = [...data.traffic].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar
          range={range}
          onRangeChange={(next) => {
            if (next !== range) void load(next);
          }}
          onRefresh={() => void load(range)}
          loading={loading}
        />

        <div className={`space-y-5 px-5 py-6 lg:px-8 ${loading ? "opacity-70" : ""} transition-opacity`}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
            <section className="card p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Revenue overview</h2>
                  <p className="mt-1 text-[11px] text-muted">
                    Actual vs target · last {data.range}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-brand" /> Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-accent" /> Target
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#243040" strokeDasharray="3 5" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#8b9aae", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={26}
                    />
                    <YAxis
                      tick={{ fill: "#8b9aae", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "#8b9aae" }}
                      itemStyle={{ color: "#e9f0f8" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      fill="transparent"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#34d399"
                      strokeWidth={2.5}
                      fill="url(#revenueFill)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card p-5">
              <div className="mb-2">
                <h2 className="text-sm font-semibold text-ink">Traffic sources</h2>
                <p className="mt-1 text-[11px] text-muted">Where your visitors come from</p>
              </div>

              <div className="relative h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.traffic}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {data.traffic.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#e9f0f8" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-ink">{topChannel.value}%</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    {topChannel.name.split(" ")[0]}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                {data.traffic.map((source) => (
                  <div key={source.name} className="flex items-center gap-2 text-xs">
                    <span className="size-2 rounded-full" style={{ background: source.color }} />
                    <span className="text-muted">{source.name}</span>
                    <span className="ml-auto font-semibold text-ink">{source.value}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Recent transactions</h2>
                  <p className="mt-1 text-[11px] text-muted">Latest customer activity</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand/70"
                >
                  View all <ArrowRight className="size-3.5" />
                </button>
              </div>

              <div className="scroll-thin overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">Customer</th>
                      <th className="px-3 py-3 font-medium">Plan</th>
                      <th className="px-3 py-3 font-medium">Amount</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.activity.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-5 py-3">
                          <p className="text-xs font-medium text-ink">{item.customer}</p>
                          <p className="text-[11px] text-muted">{item.email}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted">{item.plan}</td>
                        <td className="px-3 py-3 text-xs font-semibold text-ink">
                          ${item.amount}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ${statusStyles[item.status]}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <AiInsights data={data} />
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 pb-2 pt-1 text-[11px] text-muted">
            <p>Pulse Analytics · Built with Next.js, Recharts &amp; Neon</p>
            <p>Last synced at {syncedAt} UTC</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
