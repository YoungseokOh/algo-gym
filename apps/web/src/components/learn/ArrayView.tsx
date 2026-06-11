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

const boxColors: Record<ArrayHighlight, string> = {
  compare: "border-amber-400 bg-amber-100 text-amber-900",
  swap: "border-rose-400 bg-rose-100 text-rose-900",
  sorted: "border-emerald-400 bg-emerald-100 text-emerald-900",
  pivot: "border-violet-400 bg-violet-100 text-violet-900",
  window: "border-sky-300 bg-sky-100 text-sky-900",
  found: "border-emerald-500 bg-emerald-200 text-emerald-900",
  active: "border-sky-500 bg-sky-200 text-sky-900",
  discard: "border-stone-200 bg-stone-100 text-stone-400"
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
  const usedRoles = new Set(Object.values(frame.highlights));
  const boxes = frame.display === "boxes";
  const numericMax = Math.max(...frame.values.map((v) => (typeof v === "number" ? v : 0)), 1);

  return (
    <div>
      <div className={`flex flex-wrap justify-center gap-1.5 sm:gap-2 ${boxes ? "items-start" : "h-56 items-end"}`}>
        {frame.values.map((value, index) => {
          const role = frame.highlights[index];
          const pointerLabels = frame.pointers.filter((p) => p.index === index).map((p) => p.label);
          const sublabel = frame.sublabels?.[index];
          return (
            <div key={index} className="flex w-8 flex-col items-center gap-1 sm:w-10">
              {boxes ? (
                <div
                  className={`flex h-9 w-full items-center justify-center rounded-md border text-sm font-semibold transition-colors duration-150 sm:h-10 ${
                    role ? boxColors[role] : "border-stone-300 bg-white text-stone-800"
                  }`}
                >
                  {value}
                </div>
              ) : (
                <>
                  <span className="text-xs font-medium text-stone-700">{value}</span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-200 ${role ? barColors[role] : "bg-stone-400"}`}
                    style={{ height: `${Math.max((Number(value) / numericMax) * 160, 8)}px` }}
                  />
                </>
              )}
              <span className="text-[10px] text-stone-500">{index}</span>
              <span className="h-4 font-mono text-[10px] font-semibold text-violet-700">{sublabel ?? ""}</span>
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
