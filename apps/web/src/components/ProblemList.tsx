import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ProblemLog } from "../lib/types.ts";

type Props = {
  problems: ProblemLog[];
};

export default function ProblemList({ problems }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");

  const tags = useMemo(() => Array.from(new Set(problems.flatMap((problem) => problem.tags))).sort(), [problems]);

  const filtered = useMemo(() => {
    return problems.filter((problem) => {
      const q = query.trim().toLowerCase();
      return (
        (!q || problem.title.toLowerCase().includes(q) || problem.titleSlug.includes(q)) &&
        (!status || problem.status === status) &&
        (!difficulty || problem.difficulty === difficulty) &&
        (!tag || problem.tags.includes(tag))
      );
    });
  }, [difficulty, problems, query, status, tag]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 lg:grid-cols-[1fr_160px_160px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            className="focus-ring w-full rounded-md border border-stone-300 py-2 pl-9 pr-3"
            placeholder="Search title or slug"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="focus-ring rounded-md border border-stone-300 px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All status</option>
          <option value="todo">todo</option>
          <option value="solved">solved</option>
          <option value="failed">failed</option>
          <option value="review">review</option>
        </select>
        <select className="focus-ring rounded-md border border-stone-300 px-3 py-2" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          <option value="">All difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select className="focus-ring rounded-md border border-stone-300 px-3 py-2" value={tag} onChange={(event) => setTag(event.target.value)}>
          <option value="">All tags</option>
          {tags.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <div className="grid grid-cols-12 gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <div className="col-span-6">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Updated</div>
        </div>
        {filtered.length ? (
          filtered.map((problem) => (
            <Link key={problem.titleSlug} to={`/problems/${problem.titleSlug}`} className="grid grid-cols-12 gap-3 border-b border-stone-100 px-4 py-4 hover:bg-stone-50">
              <div className="col-span-12 min-w-0 sm:col-span-6">
                <div className="truncate font-medium text-stone-950">{problem.title}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {problem.isSample ? <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">sample</span> : null}
                  {problem.tags.map((item) => (
                    <span key={item} className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-4 text-sm text-stone-700 sm:col-span-2">{problem.difficulty || "-"}</div>
              <div className="col-span-4 text-sm text-stone-700 sm:col-span-2">{problem.status}</div>
              <div className="col-span-4 text-sm text-stone-700 sm:col-span-2">{problem.updatedAt || "-"}</div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-stone-500">No problem logs match the current filters.</div>
        )}
      </div>
    </div>
  );
}
