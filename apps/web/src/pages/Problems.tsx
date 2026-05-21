import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddProblemModal from "../components/AddProblemModal.tsx";
import ProblemList from "../components/ProblemList.tsx";
import { listProblems } from "../lib/api.ts";
import type { ProblemLog } from "../lib/types.ts";

export default function Problems() {
  const [problems, setProblems] = useState<ProblemLog[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setProblems(await listProblems());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load problems.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-950">Problems</h1>
          <p className="mt-1 text-sm text-stone-600">Filter and open local Markdown problem logs.</p>
        </div>
        <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800" type="button" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add LeetCode Problem
        </button>
      </div>

      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">{error}</div> : null}
      <ProblemList problems={problems} />

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
