import { NextResponse, type NextRequest } from "next/server";
import { localInsights } from "@/lib/insights";
import type { DashboardData, Insight } from "@/lib/types";

type GatewayResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

async function gatewayInsights(data: DashboardData, question?: string): Promise<Insight[]> {
  const baseUrl = process.env.NEON_AI_GATEWAY_BASE_URL;
  const token = process.env.NEON_AI_GATEWAY_TOKEN;

  if (!baseUrl || !token) throw new Error("AI Gateway not configured");

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.NEON_AI_GATEWAY_MODEL || "gpt-5-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a sharp SaaS growth analyst. Reply with JSON only: " +
              '{"insights":[{"id":"slug","tone":"positive|warning|info","title":"short","body":"2 sentences grounded in the numbers","impact":"short metric"}]}. ' +
              "Return exactly 3 specific insights. No markdown.",
          },
          {
            role: "user",
            content: JSON.stringify({
              range: data.range,
              kpis: data.kpis,
              traffic: data.traffic,
              revenue: data.revenue.slice(-14),
              activity: data.activity,
              question: question ?? null,
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) throw new Error(`Gateway returned ${response.status}`);

  const payload = (await response.json()) as GatewayResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty gateway response");

  const parsed = JSON.parse(content) as { insights?: Insight[] };
  if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
    throw new Error("Unexpected gateway payload");
  }

  return parsed.insights.slice(0, 3);
}

export async function POST(request: NextRequest) {
  let data: DashboardData;
  let question: string | undefined;

  try {
    const body = (await request.json()) as { data?: DashboardData; question?: string };
    if (!body.data?.kpis?.length || !body.data?.revenue?.length) {
      return NextResponse.json({ error: "Invalid dashboard payload" }, { status: 400 });
    }
    data = body.data;
    question = body.question?.trim().slice(0, 300) || undefined;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const insights = await gatewayInsights(data, question);
    return NextResponse.json({ insights, source: "neon-ai-gateway" });
  } catch {
    return NextResponse.json({ insights: localInsights(data), source: "built-in" });
  }
}
