import type { CellState, GridFrame } from "../../learn/types.ts";

const cellColors: Record<CellState, string> = {
  empty: "bg-white border-stone-200",
  wall: "bg-stone-700 border-stone-700",
  start: "bg-emerald-600 border-emerald-700",
  goal: "bg-rose-500 border-rose-600",
  frontier: "bg-amber-300 border-amber-400",
  visited: "bg-sky-200 border-sky-300",
  current: "bg-violet-500 border-violet-600",
  path: "bg-emerald-400 border-emerald-500"
};

const legend: Array<{ state: CellState; label: string }> = [
  { state: "start", label: "시작" },
  { state: "goal", label: "도착" },
  { state: "current", label: "현재 칸" },
  { state: "frontier", label: "큐/스택 대기" },
  { state: "visited", label: "방문 완료" },
  { state: "path", label: "복원된 경로" },
  { state: "wall", label: "벽" }
];

export default function GridView({ frame }: { frame: GridFrame }) {
  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${frame.cells[0].length}, minmax(0, 1fr))` }}>
          {frame.cells.flatMap((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`h-6 w-6 rounded-sm border transition-colors duration-150 sm:h-7 sm:w-7 ${cellColors[cell]}`}
              />
            ))
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {legend.map(({ state, label }) => (
          <span key={state} className="inline-flex items-center gap-1 text-[11px] text-stone-600">
            <span className={`h-2.5 w-2.5 rounded-sm border ${cellColors[state]}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
