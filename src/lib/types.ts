export type RangeKey = "7d" | "30d" | "90d";

export interface Kpi {
  label: string;
  value: string;
  delta: number;
  hint: string;
  spark: number[];
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  target: number;
}

export interface TrafficSource {
  name: string;
  value: number;
  color: string;
}

export type ActivityStatus = "Paid" | "Pending" | "Refunded";

export interface Activity {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: ActivityStatus;
  date: string;
}

export interface DashboardData {
  range: RangeKey;
  kpis: Kpi[];
  revenue: RevenuePoint[];
  traffic: TrafficSource[];
  activity: Activity[];
  updatedAt: string;
}

export type InsightTone = "positive" | "warning" | "info";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  body: string;
  impact: string;
}
