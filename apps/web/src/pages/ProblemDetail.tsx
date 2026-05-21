import { ExternalLink, RotateCcw, Save } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AiCoachPanel from "../components/AiCoachPanel.tsx";
import { getProblem, updateProblem } from "../lib/api.ts";
import type { ProblemLog } from "../lib/types.ts";

export default function ProblemDetail() {
  const { titleSlug = "" } = useParams();
  const [problem, setProblem] = useState<ProblemLog | undefined>();
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, [titleSlug]);

  async function load() {
    setError("");
    try {
      const next = await getProblem(titleSlug);
      setProblem(next);
      setTagsText(next.tags.join(", "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load problem.");
    }
  }

  function updateField<K extends keyof ProblemLog>(key: K, value: ProblemLog[K]) {
    setProblem((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateSection(key: keyof ProblemLog["sections"], value: string) {
    setProblem((current) => (current ? { ...current, sections: { ...current.sections, [key]: value } } : current));
  }

  function onNumberChange(key: "durationMinutes" | "attempts") {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setProblem((current) => {
        if (!current) return current;
        return {
          ...current,
          [key]: value === "" ? undefined : Number(value)
        };
      });
    };
  }

  async function save() {
    if (!problem) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await updateProblem(problem.titleSlug, {
        ...problem,
        tags: tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      });
      setProblem(saved);
      setTagsText(saved.tags.join(", "));
      setMessage("Saved to Markdown.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save problem.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !problem) {
    return (
      <div className="space-y-4">
        <Link className="text-sm font-medium text-emerald-700 hover:underline" to="/problems">
          Back to problems
        </Link>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>
      </div>
    );
  }

  if (!problem) {
    return <div className="rounded-lg border border-stone-200 bg-white p-6 text-stone-600">Loading problem...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link className="text-sm font-medium text-emerald-700 hover:underline" to="/problems">
            Back to problems
          </Link>
          <input
            className="focus-ring mt-2 w-full rounded-md border border-transparent bg-transparent px-0 text-2xl font-semibold text-stone-950 focus:border-stone-300 focus:bg-white focus:px-3"
            value={problem.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
          <div className="mt-1 break-all font-mono text-sm text-stone-500">{problem.titleSlug}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50" href={problem.url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open in LeetCode
          </a>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50" type="button" onClick={load}>
            <RotateCcw className="h-4 w-4" />
            Reload
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60" disabled={saving} type="button" onClick={save}>
            <Save className="h-4 w-4" />
            {saving ? "Saving" : "Save"}
          </button>
        </div>
      </div>

      {problem.isSample ? <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">This is read-only sample content. Add a LeetCode URL to create a workspace log.</div> : null}
      {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="mb-3 text-base font-semibold text-stone-950">Metadata</h2>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">URL</span>
                <input className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" value={problem.url} onChange={(event) => updateField("url", event.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Difficulty</span>
                <select className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" value={problem.difficulty} onChange={(event) => updateField("difficulty", event.target.value as ProblemLog["difficulty"])}>
                  <option value="">Unknown</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Status</span>
                <select className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" value={problem.status} onChange={(event) => updateField("status", event.target.value as ProblemLog["status"])}>
                  <option value="todo">todo</option>
                  <option value="solved">solved</option>
                  <option value="failed">failed</option>
                  <option value="review">review</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Tags</span>
                <input className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" value={tagsText} onChange={(event) => setTagsText(event.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-stone-700">Duration</span>
                  <input className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" type="number" min="0" value={problem.durationMinutes ?? ""} onChange={onNumberChange("durationMinutes")} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-stone-700">Attempts</span>
                  <input className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" type="number" min="0" value={problem.attempts ?? 0} onChange={onNumberChange("attempts")} />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Next review</span>
                <input className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" type="date" value={problem.nextReviewAt ?? ""} onChange={(event) => updateField("nextReviewAt", event.target.value || undefined)} />
              </label>
            </div>
          </div>

          <AiCoachPanel titleSlug={problem.titleSlug} onProblemUpdated={(next) => {
            setProblem(next);
            setTagsText(next.tags.join(", "));
          }} />
        </div>

        <div className="space-y-4">
          <Editor label="My Problem Summary" value={problem.sections.summary} onChange={(value) => updateSection("summary", value)} minRows={6} />
          <Editor label="My Approach" value={problem.sections.approach} onChange={(value) => updateSection("approach", value)} minRows={8} />
          <Editor label="Stuck Point" value={problem.sections.stuckPoint} onChange={(value) => updateSection("stuckPoint", value)} minRows={4} />
          <Editor label="Code" value={problem.sections.code} onChange={(value) => updateSection("code", value)} minRows={14} mono />
          <Editor label="What I Learned" value={problem.sections.learned} onChange={(value) => updateSection("learned", value)} minRows={5} />
          <Editor label="AI Reviews" value={problem.sections.aiReviews} onChange={(value) => updateSection("aiReviews", value)} minRows={10} />
        </div>
      </div>
    </div>
  );
}

function Editor({
  label,
  value,
  onChange,
  minRows,
  mono
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minRows: number;
  mono?: boolean;
}) {
  return (
    <label className="block rounded-lg border border-stone-200 bg-white p-4">
      <span className="text-base font-semibold text-stone-950">{label}</span>
      <textarea
        className={`focus-ring mt-3 w-full resize-y rounded-md border border-stone-300 px-3 py-2 leading-6 ${mono ? "font-mono text-sm" : ""}`}
        rows={minRows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
