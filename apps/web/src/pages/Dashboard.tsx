import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddProblemModal from "../components/AddProblemModal.tsx";
import ReviewQueue from "../components/ReviewQueue.tsx";
import StatsCards from "../components/StatsCards.tsx";
import { getStats, listProblems } from "../lib/api.ts";
import type { LocalStats, ProblemLog } from "../lib/types.ts";

export default function Dashboard() {
  const [problems, setProblems] = useState<ProblemLog[]>([]);
  const [stats, setStats] = useState<LocalStats | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const [nextProblems, nextStats] = await Promise.all([listProblems(), getStats()]);
      setProblems(nextProblems);
      setStats(nextStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-950">Training Dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">Local problem logs, review queue, and practice stats.</p>
        </div>
        <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800" type="button" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add LeetCode Problem
        </button>
      </div>

      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">{error}</div> : null}

      <StatsCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-950">Recent Problems</h2>
            <Link className="text-sm font-medium text-emerald-700 hover:underline" to="/problems">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {(stats?.recentProblems ?? problems.slice(0, 6)).length ? (
              (stats?.recentProblems ?? problems.slice(0, 6)).map((problem) => (
                <Link key={problem.titleSlug} to={`/problems/${problem.titleSlug}`} className="flex flex-col gap-2 rounded-md border border-stone-200 p-3 hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-stone-950">{problem.title}</div>
                    <div className="mt-1 text-sm text-stone-600">{problem.difficulty || "Unknown"} / {problem.status}</div>
                  </div>
                  <div className="text-sm text-stone-500">{problem.updatedAt}</div>
                </Link>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Add a LeetCode URL to create your first local log.</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <ReviewQueue problems={problems} />
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="mb-3 text-base font-semibold text-stone-950">Weak Tags</h2>
            <div className="space-y-2">
              {stats?.weakTags.length ? (
                stats.weakTags.map((tag) => (
                  <div key={tag.tag} className="flex items-center justify-between rounded-md border border-stone-200 px-3 py-2">
                    <span className="font-medium text-stone-900">{tag.tag}</span>
                    <span className="text-sm text-stone-600">failed {tag.failed} / solved {tag.solved}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">No weak tags detected yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddProblemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(problem) => {
          void load();
          navigate(`/problems/${problem.titleSlug}`);
        }}
      />
    </div>
  );
}
