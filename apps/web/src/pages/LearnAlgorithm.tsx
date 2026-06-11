import { ArrowLeft, Lightbulb } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import VisualizerPlayer from "../components/learn/VisualizerPlayer.tsx";
import { getAlgorithm } from "../learn/index.ts";

export default function LearnAlgorithm() {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const algorithm = algorithmId ? getAlgorithm(algorithmId) : undefined;

  if (!algorithm) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <p className="text-stone-700">해당 알고리즘을 찾을 수 없습니다.</p>
        <Link className="mt-2 inline-block text-sm font-medium text-emerald-700 hover:underline" to="/learn">
          Learn 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link className="focus-ring inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline" to="/learn">
          <ArrowLeft className="h-4 w-4" />
          Learn 목록
        </Link>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-950">
              {algorithm.koTitle} <span className="text-base font-normal text-stone-500">{algorithm.title}</span>
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">{algorithm.summary}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <span className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 font-mono text-xs text-stone-700">
              시간 {algorithm.complexity.time}
            </span>
            <span className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 font-mono text-xs text-stone-700">
              공간 {algorithm.complexity.space}
            </span>
          </div>
        </div>
        {algorithm.complexity.note ? (
          <p className="mt-1 text-xs text-stone-500">참고: {algorithm.complexity.note}</p>
        ) : null}
      </div>

      <VisualizerPlayer key={algorithm.id} algorithm={algorithm} />

      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <h2 className="mb-3 inline-flex items-center gap-2 text-base font-semibold text-stone-950">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          핵심 포인트
        </h2>
        <ul className="space-y-2">
          {algorithm.insight.map((point, index) => (
            <li key={index} className="flex gap-2 text-sm leading-6 text-stone-700">
              <span className="mt-0.5 shrink-0 text-emerald-700">•</span>
              {point}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
