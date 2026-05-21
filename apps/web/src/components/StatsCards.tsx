import { CheckCircle2, Clock3, ListTodo, RotateCcw, XCircle } from "lucide-react";
import type { LocalStats } from "../lib/types.ts";

type Props = {
  stats?: LocalStats;
};

export default function StatsCards({ stats }: Props) {
  const cards = [
    { label: "Total", value: stats?.totalProblems ?? 0, icon: ListTodo, tone: "text-stone-700" },
    { label: "Solved", value: stats?.byStatus.solved ?? 0, icon: CheckCircle2, tone: "text-emerald-700" },
    { label: "Failed", value: stats?.byStatus.failed ?? 0, icon: XCircle, tone: "text-rose-700" },
    { label: "Review", value: stats?.byStatus.review ?? 0, icon: RotateCcw, tone: "text-amber-700" },
    { label: "Queue", value: stats?.reviewQueueCount ?? 0, icon: Clock3, tone: "text-sky-700" }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-stone-600">{label}</span>
            <Icon className={`h-5 w-5 ${tone}`} />
          </div>
          <div className="mt-3 text-3xl font-semibold text-stone-950">{value}</div>
        </div>
      ))}
    </div>
  );
}
