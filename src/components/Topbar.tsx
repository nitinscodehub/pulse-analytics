import { Bell, Download, RefreshCw, Search } from "lucide-react";
import type { RangeKey } from "@/lib/types";

const ranges: Array<{ key: RangeKey; label: string }> = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
];

type TopbarProps = {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  onRefresh: () => void;
  loading: boolean;
};

export default function Topbar({ range, onRangeChange, onRefresh, loading }: TopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 lg:px-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-ink lg:text-2xl">Overview</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand ring-1 ring-brand/20">
            <span className="live-dot size-1.5 rounded-full bg-brand" />
            Live
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">Here is what is happening with your store.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="hidden items-center gap-2 rounded-xl border border-line bg-panel2/70 px-3 py-2 md:flex">
          <Search className="size-4 text-muted" />
          <input
            type="search"
            placeholder="Search anything..."
            className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-muted xl:w-52"
            aria-label="Search"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>
        </label>

        <div className="flex rounded-xl border border-line bg-panel2/70 p-1">
          {ranges.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onRangeChange(item.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === item.key
                  ? "bg-brand text-canvas shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh data"
          className="flex size-9 items-center justify-center rounded-xl border border-line bg-panel2/70 text-muted transition-colors hover:text-brand"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-xl border border-line bg-panel2/70 text-muted transition-colors hover:text-ink"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
        </button>

        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl border border-line bg-panel2/70 px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-brand/40 sm:flex"
        >
          <Download className="size-4 text-muted" />
          Export
        </button>
      </div>
    </header>
  );
}
