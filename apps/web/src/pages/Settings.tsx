import { Play, Save, ShieldCheck } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { getConfig, runPrivacyGuard, saveConfig, syncLeetCodeStats, testLlm } from "../lib/api.ts";
import type { AppConfig } from "../lib/types.ts";

export default function SettingsPage() {
  const [config, setConfig] = useState<AppConfig | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [privacy, setPrivacy] = useState<Array<{ name: string; ok: boolean; message: string }> | undefined>();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setConfig(await getConfig());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings.");
    }
  }

  function updateSection<K extends keyof AppConfig>(section: K, key: keyof AppConfig[K], value: string | number | boolean) {
    setConfig((current) => (current ? { ...current, [section]: { ...current[section], [key]: value } } : current));
  }

  function onNumber(section: "llm" | "leetcodeStats", key: "temperature" | "cacheTtlMinutes") {
    return (event: ChangeEvent<HTMLInputElement>) => updateSection(section, key as never, Number(event.target.value));
  }

  async function save() {
    if (!config) return;
    setMessage("");
    setError("");
    try {
      setConfig(await saveConfig(config));
      setMessage("Settings saved to workspace/config.yaml.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    }
  }

  async function runLlmTest() {
    setMessage("");
    setError("");
    const result: { ok: boolean; text?: string; error?: string } = await testLlm().catch((err: Error) => ({ ok: false, error: err.message }));
    if (result.ok) setMessage(`LLM connection returned: ${result.text ?? "ok"}`);
    else setError(result.error ?? "LLM test failed.");
  }

  async function runStatsTest() {
    setMessage("");
    setError("");
    const result = await syncLeetCodeStats().catch((err: Error) => ({ error: err.message }));
    if (result.error) setError(result.error);
    else setMessage("LeetCode stats connection succeeded.");
  }

  async function runGuard() {
    const result = await runPrivacyGuard().catch((err: Error) => ({
      ok: false,
      checks: [{ name: "privacy guard", ok: false, message: err.message }]
    }));
    setPrivacy(result.checks);
    if (result.ok) setMessage("Privacy guard passed.");
    else setError("Privacy guard found an issue.");
  }

  if (!config) {
    return <div className="rounded-lg border border-stone-200 bg-white p-6 text-stone-600">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-950">Settings</h1>
          <p className="mt-1 text-sm text-stone-600">Stored locally in workspace/config.yaml.</p>
        </div>
        <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800" type="button" onClick={save}>
          <Save className="h-4 w-4" />
          Save
        </button>
      </div>

      {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}

      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-stone-950">LLM Settings</h2>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50" type="button" onClick={runLlmTest}>
            <Play className="h-4 w-4" />
            Test Connection
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TextField label="Provider" value={config.llm.provider} onChange={(value) => updateSection("llm", "provider", value)} />
          <TextField label="Base URL" value={config.llm.baseUrl} onChange={(value) => updateSection("llm", "baseUrl", value)} />
          <TextField label="Model" value={config.llm.model} onChange={(value) => updateSection("llm", "model", value)} />
          <TextField label="API key env var" value={config.llm.apiKeyEnv} onChange={(value) => updateSection("llm", "apiKeyEnv", value)} />
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Temperature</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" type="number" step="0.1" min="0" max="2" value={config.llm.temperature} onChange={onNumber("llm", "temperature")} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-stone-950">LeetCode Stats Settings</h2>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50" type="button" onClick={runStatsTest}>
            <Play className="h-4 w-4" />
            Test Stats Connection
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-md border border-stone-200 p-3 text-sm text-stone-700">
            <input className="h-4 w-4 rounded border-stone-300 text-emerald-700" type="checkbox" checked={config.leetcodeStats.enabled} onChange={(event) => updateSection("leetcodeStats", "enabled", event.target.checked)} />
            Enabled
          </label>
          <TextField label="LeetCode username" value={config.leetcodeStats.username} onChange={(value) => updateSection("leetcodeStats", "username", value)} />
          <TextField label="Wrapper base URL" value={config.leetcodeStats.baseUrl} onChange={(value) => updateSection("leetcodeStats", "baseUrl", value)} />
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Cache TTL minutes</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" type="number" min="1" value={config.leetcodeStats.cacheTtlMinutes} onChange={onNumber("leetcodeStats", "cacheTtlMinutes")} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-stone-950">Privacy</h2>
            <p className="mt-1 text-sm text-stone-600">workspace/ is gitignored, problem statements are not fetched, and secrets stay server-side.</p>
          </div>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50" type="button" onClick={runGuard}>
            <ShieldCheck className="h-4 w-4" />
            Run privacy guard
          </button>
        </div>
        {privacy ? (
          <div className="space-y-2">
            {privacy.map((check) => (
              <div key={check.name} className={`rounded-md border px-3 py-2 text-sm ${check.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
                <span className="font-medium">{check.ok ? "PASS" : "FAIL"} {check.name}</span>: {check.message}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input className="focus-ring mt-1 w-full rounded-md border border-stone-300 px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
