import { Link } from "react-router-dom";
import type { ProblemLog } from "../lib/types.ts";

type Props = {
  problems: ProblemLog[];
};

export default function ReviewQueue({ problems }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const queue = problems
    .filter((problem) => problem.status === "review" || problem.status === "failed" || (problem.nextReviewAt && problem.nextReviewAt <= today))
    .slice(0, 6);

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-950">Review Queue</h2>
        <Link className="text-sm font-medium text-emerald-700 hover:underline" to="/problems">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {queue.length ? (
          queue.map((problem) => (
            <Link key={problem.titleSlug} to={`/problems/${problem.titleSlug}`} className="block rounded-md border border-stone-200 p-3 hover:bg-stone-50">
              <div className="font-medium text-stone-950">{problem.title}</div>
              <div className="mt-1 text-sm text-stone-600">
                {problem.status} / {problem.nextReviewAt ? `due ${problem.nextReviewAt}` : `updated ${problem.updatedAt}`}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">No due reviews right now.</div>
        )}
      </div>
    </div>
  );
}
