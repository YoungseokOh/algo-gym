import { AlertCircle, ExternalLink, Plus, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseLeetCodeUrl, slugToTitle } from "@algo-gym/leetcode";
import { createProblem } from "../lib/api.ts";
import type { ProblemLog } from "../lib/types.ts";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (problem: ProblemLog) => void;
};

export default function AddProblemModal({ open, onClose, onCreated }: Props) {
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("todo");
  const [error, setError] = useState("");
  const [existing, setExisting] = useState<ProblemLog | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => {
    if (!url.trim()) return undefined;
    try {
      const parsed = parseLeetCodeUrl(url);
      return {
        titleSlug: parsed.titleSlug,
        title: slugToTitle(parsed.titleSlug)
      };
    } catch {
      return undefined;
    }
  }, [url]);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setExisting(undefined);

    const result: { problem?: ProblemLog; error?: string; existing?: ProblemLog } = await createProblem({
      url,
      difficulty,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status
    }).catch((err: Error) => ({ error: err.message }));

    setSubmitting(false);
    if (result.problem) {
      onCreated(result.problem);
      setUrl("");
      setTags("");
      onClose();
      return;
    }

    setError(result.error ?? "Failed to create problem.");
    setExisting(result.existing);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-stone-950">Add LeetCode Problem</h2>
          <button className="focus-ring rounded-md p-2 text-stone-600 hover:bg-stone-100" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4 px-5 py-5" onSubmit={submit}>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">LeetCode URL</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
              placeholder="https://leetcode.com/problems/longest-substring-without-repeating-characters/"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-stone-500">Title preview</div>
              <div className="mt-1 min-h-6 font-medium text-stone-900">{preview?.title ?? "Waiting for a valid URL"}</div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-stone-500">Slug preview</div>
              <div className="mt-1 min-h-6 break-all font-mono text-sm text-stone-900">{preview?.titleSlug ?? "-"}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-stone-700">Difficulty</span>
              <select className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                <option value="">Unknown</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-stone-700">Tags</span>
              <input
                className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
                placeholder="sliding-window, hashmap"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Initial status</span>
            <select className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="todo">todo</option>
              <option value="solved">solved</option>
              <option value="failed">failed</option>
              <option value="review">review</option>
            </select>
          </label>

          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div>{error}</div>
                {existing ? (
                  <Link className="mt-2 inline-flex items-center gap-1 font-medium underline" to={`/problems/${existing.titleSlug}`} onClick={onClose}>
                    Open Existing Log <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
            <button className="focus-ring rounded-md px-4 py-2 text-stone-700 hover:bg-stone-100" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60" disabled={submitting} type="submit">
              <Plus className="h-4 w-4" />
              {submitting ? "Creating" : "Create Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
