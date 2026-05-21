import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatsCards from "../components/StatsCards.tsx";
import { getLeetCodeStats, getStats, syncLeetCodeStats } from "../lib/api.ts";
import type { LocalStats } from "../lib/types.ts";

type RemoteStats = {
  username?: string;
  syncedAt?: string;
  solved?: {
    total?: number;
    easy?: number;
    medium?: number;
    hard?: number;
  };
  submissions?: Array<Record<string, unknown>>;
  acceptedSubmissions?: Array<Record<string, unknown>>;
  languageStats?: Array<{ language: string; count: number }>;
  contest?: unknown;
};

export default function Stats() {
  const [stats, setStats] = useState<LocalStats | undefined>();
  const [remote, setRemote] = useState<RemoteStats | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const [local, remoteData] = await Promise.all([getStats(), getLeetCodeStats()]);
      setStats(local);
      setRemote((remoteData.stats as RemoteStats | null) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats.");
    }
  }

  async function sync() {
    setSyncing(true);
    setError("");
    setMessage("");
    const result: { stats?: unknown; error?: string } = await syncLeetCodeStats().catch((err: Error) => ({ error: err.message }));
    setSyncing(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setRemote((result.stats as RemoteStats | null) ?? null);
    setMessage("LeetCode stats synced.");
  }

  const statusData = useMemo(() => toChartData(stats?.byStatus), [stats]);
  const difficultyData = useMemo(() => toChartData(stats?.byDifficulty), [stats]);
  const tagData = useMemo(() => toChartData(stats?.byTag).slice(0, 10), [stats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-950">Stats</h1>
          <p className="mt-1 text-sm text-stone-600">Local training progress with optional public LeetCode stats.</p>
        </div>
        <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60" type="button" disabled={syncing} onClick={sync}>
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          Sync LeetCode Stats
        </button>
      </div>

      {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}

      <StatsCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Chart title="Status" data={statusData} />
        <Chart title="Difficulty" data={difficultyData} />
        <Chart title="Top Tags" data={tagData} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="mb-3 text-base font-semibold text-stone-950">Local Details</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Metric label="Average duration" value={stats?.averageDurationMinutes ? `${stats.averageDurationMinutes} min` : "not enough data"} />
            <Metric label="Review queue" value={String(stats?.reviewQueueCount ?? 0)} />
            <Metric label="Failed to solved" value={stats?.failedToSolvedConversionRate === undefined ? "not enough data" : `${stats.failedToSolvedConversionRate}%`} />
            <Metric label="Weekly count" value="available after more dated logs" />
          </dl>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="mb-3 text-base font-semibold text-stone-950">LeetCode Remote Stats</h2>
          {remote ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Username" value={remote.username ?? "-"} />
                <Metric label="Synced" value={remote.syncedAt ? new Date(remote.syncedAt).toLocaleString() : "-"} />
                <Metric label="Total solved" value={String(remote.solved?.total ?? "-")} />
                <Metric label="Easy / Medium / Hard" value={`${remote.solved?.easy ?? "-"} / ${remote.solved?.medium ?? "-"} / ${remote.solved?.hard ?? "-"}`} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-stone-800">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {(remote.languageStats ?? []).slice(0, 8).map((item) => (
                    <span key={item.language} className="rounded-md bg-stone-100 px-2 py-1 text-sm text-stone-700">
                      {item.language}: {item.count}
                    </span>
                  ))}
                  {!remote.languageStats?.length ? <span className="text-sm text-stone-500">No language stats cached.</span> : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">Enable and sync LeetCode stats in Settings.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chart({ title, data }: { title: string; data: Array<{ name: string; value: number }> }) {
  return (
    <div className="h-80 rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold text-stone-950">{title}</h2>
      {data.length ? (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#047857" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-56 items-center justify-center text-sm text-stone-500">No data yet.</div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-stone-200 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-1 font-medium text-stone-950">{value}</dd>
    </div>
  );
}

function toChartData(record?: Record<string, number>) {
  return Object.entries(record ?? {}).map(([name, value]) => ({ name, value }));
}
