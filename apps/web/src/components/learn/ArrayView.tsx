import type { ArrayFrame, ArrayHighlight } from "../../learn/types.ts";

const barColors: Record<ArrayHighlight, string> = {
  compare: "bg-amber-400",
  swap: "bg-rose-500",
  sorted: "bg-emerald-500",
  pivot: "bg-violet-500",
  window: "bg-sky-300",
  found: "bg-emerald-600",
  active: "bg-sky-500",
  discard: "bg-stone-300"
};

const legend: Array<{ role: ArrayHighlight; label: string }> = [
  { role: "compare", label: "비교 중" },
  { role: "swap", label: "교환/이동" },
  { role: "active", label: "주목" },
  { role: "window", label: "현재 구간" },
  { role: "pivot", label: "피벗" },
  { role: "found", label: "발견" },
  { role: "sorted", label: "확정" },
  { role: "discard", label: "제외됨" }
];

export default function ArrayView({ frame }: { frame: ArrayFrame }) {
  const max = Math.max(...frame.values, 1);
  const usedRoles = new Set(Object.values(frame.highlights));

  return (
    <div>
      <div className="flex h-56 items-end justify-center gap-1.5 sm:gap-2">
        {frame.values.map((value, index) => {
          const role = frame.highlights[index];
          const pointerLabels = frame.pointers.filter((p) => p.index === index).map((p) => p.label);
          return (
            <div key={index} className="flex w-8 flex-col items-center gap-1 sm:w-10">
              <span className="text-xs font-medium text-stone-700">{value}</span>
              <div
                className={`w-full rounded-t-md transition-all duration-200 ${role ? barColors[role] : "bg-stone-400"}`}
                style={{ height: `${Math.max((value / max) * 160, 8)}px` }}
              />
              <span className="text-[10px] text-stone-500">{index}</span>
              <span className="h-4 text-[10px] font-semibold text-emerald-700">{pointerLabels.join("·")}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {legend
          .filter(({ role }) => usedRoles.has(role))
          .map(({ role, label }) => (
            <span key={role} className="inline-flex items-center gap-1 text-[11px] text-stone-600">
              <span className={`h-2.5 w-2.5 rounded-sm ${barColors[role]}`} />
              {label}
            </span>
          ))}
      </div>
    </div>
  );
}
