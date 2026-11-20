import {
  Activity,
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Analytics", icon: BarChart3 },
  { label: "Customers", icon: Users },
  { label: "Transactions", icon: CreditCard },
  { label: "Reports", icon: FileText },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-panel/60 px-4 py-6 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand ring-1 ring-brand/30">
          <Activity className="size-5" strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-base font-bold tracking-[0.18em] text-ink">PULSE</p>
          <p className="text-[10px] uppercase tracking-widest text-muted">Analytics suite</p>
        </div>
      </div>

      <nav className="mt-10 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Workspace
        </p>
        {navigation.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-brand/10 font-semibold text-brand ring-1 ring-brand/20"
                : "text-muted hover:bg-white/5 hover:text-ink"
            }`}
          >
            <Icon className="size-4.5" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-accent/10 p-4">
          <div className="absolute -right-6 -top-6 size-20 rounded-full bg-accent/25 blur-2xl" />
          <Sparkles className="size-5 text-accent" />
          <p className="mt-3 text-sm font-semibold text-ink">AI insights unlocked</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Ask questions about your data and get answers in seconds.
          </p>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-line bg-panel2/60 p-2.5 text-left transition-colors hover:border-brand/30"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-canvas">
            NK
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">Nitin Kumar</p>
            <p className="truncate text-xs text-muted">Workspace admin</p>
          </div>
          <Settings className="ml-auto size-4 text-muted" />
        </button>
      </div>
    </aside>
  );
}
