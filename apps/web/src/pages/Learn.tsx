import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { algorithms, categoryOrder } from "../learn/index.ts";

export default function Learn() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-950">Learn</h1>
        <p className="mt-1 text-sm text-stone-600">
          핵심 알고리즘을 단계별 애니메이션으로 배우는 공간입니다. 재생하면서 코드의 어느 줄이 실행되는지, 자료가 어떻게 변하는지 함께 따라가 보세요.
        </p>
      </div>

      {categoryOrder.map((category) => {
        const items = algorithms.filter((algorithm) => algorithm.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category}>
            <h2 className="mb-3 text-base font-semibold text-stone-950">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((algorithm) => (
                <Link
                  key={algorithm.id}
                  to={`/learn/${algorithm.id}`}
                  className="focus-ring group flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-stone-950">{algorithm.koTitle}</h3>
                      <p className="text-xs text-stone-500">{algorithm.title}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        algorithm.difficulty === "기초" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {algorithm.difficulty}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-5 text-stone-600">{algorithm.summary}</p>
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-stone-500">
                      <Clock className="h-3.5 w-3.5" />
                      {algorithm.complexity.time}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 group-hover:underline">
                      학습하기
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
