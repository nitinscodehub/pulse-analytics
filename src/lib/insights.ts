import type { DashboardData, Insight } from "./types";

/**
 * Deterministic analyst fallback. Keeps the AI panel useful even with no
 * gateway credentials configured (e.g. a fresh clone or an offline demo).
 */
export function localInsights(data: DashboardData): Insight[] {
  const [revenueKpi, usersKpi, conversionKpi, aovKpi] = data.kpis;
  const bestDay = data.revenue.reduce((best, point) =>
    point.revenue > best.revenue ? point : best,
  );
  const topChannel = [...data.traffic].sort((a, b) => b.value - a.value)[0];
  const missed = data.revenue.filter((point) => point.revenue < point.target).length;
  const pending = data.activity.filter((item) => item.status === "Pending").length;

  const insights: Insight[] = [
    {
      id: "momentum",
      tone: "positive",
      title: "Revenue momentum is ahead of plan",
      body: `${revenueKpi.value} booked over the last ${data.range} with ${revenueKpi.delta}% growth. ${bestDay.date} was the strongest day at $${bestDay.revenue.toLocaleString()}.`,
      impact: `+${revenueKpi.delta}% vs target`,
    },
    {
      id: "funnel",
      tone: "warning",
      title: "Conversion is the next growth lever",
      body: `Traffic is healthy but checkout converts at ${conversionKpi.value}. ${missed} of ${data.revenue.length} days finished below target, so small funnel wins compound fast.`,
      impact: `${conversionKpi.delta} pts up`,
    },
    {
      id: "channels",
      tone: "info",
      title: `${topChannel.name} drives the pipeline`,
      body: `${topChannel.name} contributes ${topChannel.value}% of sessions while ${usersKpi.hint}. Average order value is ${aovKpi.value} and ${pending} invoices are still pending.`,
      impact: `${topChannel.value}% of traffic`,
    },
    {
      id: "ops",
      tone: "info",
      title: "Follow up on open invoices",
      body: `${pending} pending and ${data.activity.filter((item) => item.status === "Refunded").length} refunded transactions need attention. A 48-hour follow-up usually recovers most of them.`,
      impact: "Quick ops win",
    },
  ];

  return insights.slice(0, 3);
}
