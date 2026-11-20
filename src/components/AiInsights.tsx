"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { localInsights } from "@/lib/insights";
import type { DashboardData, Insight, InsightTone } from "@/lib/types";

const toneStyles: Record<InsightTone, { icon: typeof Info; color: string; bg: string }> = {
  positive: { icon: CheckCircle2, color: "text-brand", bg: "bg-brand/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
  info: { icon: Info, color: "text-sky-400", bg: "bg-sky-400/10" },
};

export default function AiInsights({ data }: { data: DashboardData }) {
  const [insights, setInsights] = useState<Insight[]>(() => localInsights(data));
  const [source, setSource] = useState("built-in");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  async function generate(prompt?: string) {
    setLoading(true);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, question: prompt || undefined }),
      });
      if (!response.ok) throw new Error("Insight request failed");
      const payload = (await response.json()) as { insights: Insight[]; source: string };
      setInsights(payload.insights);
      setSource(payload.source);
      setQuestion("");
    } catch {
      setInsights(localInsights(data));
      setSource("built-in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/25">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">AI Insights</h2>
            <p className="text-[11px] text-muted">
              {source === "neon-ai-gateway" ? "Powered by Neon AI Gateway" : "Built-in analysis"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => generate()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          {loading ? "Thinking" : "Refresh"}
        </button>
      </div>

      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto p-4">
        {insights.map((insight, index) => {
          const style = toneStyles[insight.tone] ?? toneStyles.info;
          const Icon = style.icon;
          return (
            <article
              key={insight.id + index}
              className="rise rounded-xl border border-line bg-panel2/60 p-3.5"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.color}`}>
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold leading-snug text-ink">{insight.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{insight.body}</p>
                  {insight.impact ? (
                    <span className="mt-2 inline-block rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-brand">
                      {insight.impact}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (question.trim()) void generate(question.trim());
        }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about your data..."
          className="min-w-0 flex-1 rounded-lg border border-line bg-canvas/60 px-3 py-2 text-xs text-ink outline-none placeholder:text-muted focus:border-brand/40"
          aria-label="Ask a question about your data"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          aria-label="Send question"
          className="flex size-8 items-center justify-center rounded-lg bg-brand text-canvas transition-colors hover:bg-brand/85 disabled:opacity-40"
        >
          <ArrowRight className="size-4" />
        </button>
      </form>
    </section>
  );
}
