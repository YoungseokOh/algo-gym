import { Brain, Check, Loader2, MessageSquareText, Save } from "lucide-react";
import { useState } from "react";
import { requestCoach } from "../lib/api.ts";
import type { CoachMode, ProblemLog } from "../lib/types.ts";

type Props = {
  titleSlug: string;
  onProblemUpdated: (problem: ProblemLog) => void;
};

const actions: Array<{ mode: CoachMode; label: string }> = [
  { mode: "hint", label: "Get Hint" },
  { mode: "review", label: "Review My Approach" },
  { mode: "complexity", label: "Analyze Complexity" },
  { mode: "counterexample", label: "Find Counterexample" },
  { mode: "full-review", label: "Full Coach Review" }
];

export default function AiCoachPanel({ titleSlug, onProblemUpdated }: Props) {
  const [saveReview, setSaveReview] = useState(true);
  const [loadingMode, setLoadingMode] = useState<CoachMode | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function run(mode: CoachMode) {
    setLoadingMode(mode);
    setError("");
    setMessage("");

    const result: { text?: string; error?: string; problem?: ProblemLog } = await requestCoach(titleSlug, mode, saveReview).catch((err: Error) => ({ error: err.message }));
    setLoadingMode(undefined);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage(result.text ?? "No coach response returned.");
    if (result.problem) onProblemUpdated(result.problem);
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-950">
            <Brain className="h-5 w-5 text-emerald-700" />
            AI Coach
          </h2>
          <p className="mt-1 text-sm text-stone-600">Uses only your notes, code, and metadata from this local log.</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-stone-700">
          <input className="h-4 w-4 rounded border-stone-300 text-emerald-700" type="checkbox" checked={saveReview} onChange={(event) => setSaveReview(event.target.checked)} />
          Save response
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.mode}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-60"
            type="button"
            disabled={Boolean(loadingMode)}
            onClick={() => run(action.mode)}
          >
            {loadingMode === action.mode ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
            {action.label}
          </button>
        ))}
      </div>

      {message ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-900">
            {saveReview ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            Coach response
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-stone-900">{message}</pre>
        </div>
      ) : null}

      {error ? <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
    </div>
  );
}
