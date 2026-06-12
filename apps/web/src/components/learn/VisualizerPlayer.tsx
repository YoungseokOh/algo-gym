import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Shuffle, SkipBack } from "lucide-react";
import { useEffect, useState } from "react";
import type { AlgorithmDef } from "../../learn/types.ts";
import ArrayView from "./ArrayView.tsx";
import CodePanel from "./CodePanel.tsx";
import GridView from "./GridView.tsx";

const speeds = [
  { label: "0.5×", intervalMs: 1100 },
  { label: "1×", intervalMs: 600 },
  { label: "2×", intervalMs: 300 },
  { label: "4×", intervalMs: 120 }
];

// 알고리즘이 바뀌면 LearnAlgorithm이 key로 리마운트하므로, 프레임은 마운트 시 한 번 + 셔플 시에만 생성된다.
export default function VisualizerPlayer({ algorithm }: { algorithm: AlgorithmDef }) {
  const [frames, setFrames] = useState(() => algorithm.createFrames());
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);

  const frame = frames[Math.min(frameIndex, frames.length - 1)];
  const atEnd = frameIndex >= frames.length - 1;

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= frames.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, speeds[speedIndex].intervalMs);
    return () => window.clearInterval(id);
  }, [playing, speedIndex, frames.length]);

  function shuffle() {
    setPlaying(false);
    setFrames(algorithm.createFrames());
    setFrameIndex(0);
  }

  function togglePlay() {
    if (atEnd && !playing) {
      setFrameIndex(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  }

  const controlClass =
    "focus-ring inline-flex items-center justify-center rounded-md border border-stone-300 p-2 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        {frame.kind === "array" ? <ArrayView frame={frame} /> : <GridView frame={frame} />}

        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
          {frame.message}
        </div>

        {frame.vars && Object.keys(frame.vars).length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(frame.vars).map(([name, value]) => (
              <span key={name} className="rounded-md bg-stone-100 px-2 py-1 font-mono text-xs text-stone-700">
                {name} = {value}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className={controlClass} type="button" title="처음으로" onClick={() => { setPlaying(false); setFrameIndex(0); }}>
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            className={controlClass}
            type="button"
            title="한 단계 뒤로"
            disabled={frameIndex === 0}
            onClick={() => { setPlaying(false); setFrameIndex((i) => Math.max(0, i - 1)); }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            type="button"
            onClick={togglePlay}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "일시정지" : atEnd ? "다시 재생" : "재생"}
          </button>
          <button
            className={controlClass}
            type="button"
            title="한 단계 앞으로"
            disabled={atEnd}
            onClick={() => { setPlaying(false); setFrameIndex((i) => Math.min(frames.length - 1, i + 1)); }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button className={controlClass} type="button" title="새 입력으로 다시 시작" onClick={shuffle}>
            <Shuffle className="h-4 w-4" />
          </button>
          <button className={controlClass} type="button" title="같은 입력으로 처음부터" onClick={() => { setPlaying(false); setFrameIndex(0); }}>
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="ml-auto flex items-center gap-1">
            {speeds.map((speed, index) => (
              <button
                key={speed.label}
                className={`focus-ring rounded-md px-2 py-1 text-xs font-medium ${index === speedIndex ? "bg-emerald-700 text-white" : "text-stone-600 hover:bg-stone-100"}`}
                type="button"
                onClick={() => setSpeedIndex(index)}
              >
                {speed.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            className="focus-ring h-2 w-full cursor-pointer accent-emerald-700"
            type="range"
            min={0}
            max={frames.length - 1}
            value={frameIndex}
            onChange={(event) => { setPlaying(false); setFrameIndex(Number(event.target.value)); }}
          />
          <span className="whitespace-nowrap text-xs text-stone-500">
            {frameIndex + 1} / {frames.length}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-stone-950">코드 따라가기</h2>
        <CodePanel code={algorithm.code} activeLine={frame.codeLine} />
      </div>
    </div>
  );
}
