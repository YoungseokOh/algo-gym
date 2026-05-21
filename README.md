# algo-gym

algo-gym is a local-first LeetCode training dashboard. It creates private Markdown practice logs in `workspace/`, lets you edit your own summary, approach, code, stuck point, and reflection, and can ask a server-side OpenAI-compatible coach for hints or reviews.

It is not a SaaS, does not add authentication, does not use a database, and does not scrape LeetCode content.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/algo-gym.git
cd algo-gym
pnpm install
pnpm setup
pnpm dev
```

Current pnpm versions reserve `pnpm setup` for pnpm's own shell setup. This repo also runs workspace setup after `pnpm install`; to run the project setup script manually, use:

```bash
pnpm run setup
```

Open:

- web: http://localhost:5173
- local API: http://localhost:8787

## Add a LeetCode Problem

1. Open the dashboard.
2. Click `Add LeetCode Problem`.
3. Paste a URL like `https://leetcode.com/problems/longest-substring-without-repeating-characters/`.
4. Optionally set difficulty, tags, and initial status.
5. Submit to create a Markdown log under `workspace/content/problems/leetcode/`.

The app parses only the URL slug and generated title. It does not fetch the problem body.

## Run the Local Dashboard

```bash
pnpm dev
```

The root dev script starts both:

- `@algo-gym/local-api` on port `8787`
- `@algo-gym/web` on port `5173`

## Configure Ollama

Default `workspace/config.yaml` points at Ollama's OpenAI-compatible endpoint:

```yaml
llm:
  provider: "openai-compatible"
  baseUrl: "http://localhost:11434/v1"
  model: "qwen3:14b"
```

Run your model locally, then use Settings -> LLM Settings -> Test Connection.

## Configure LM Studio

In Settings, set:

```yaml
baseUrl: "http://localhost:1234/v1"
model: "your-loaded-model"
```

Keep the provider as `openai-compatible`.

## Configure an OpenAI-Compatible API

Set the provider base URL and model in Settings. Put the API key in `workspace/.env` or your shell using the configured env var name:

```bash
export ALGO_GYM_LLM_API_KEY="your-key"
```

The browser never calls commercial LLM APIs directly and never stores API keys in localStorage.

## Configure LeetCode Stats Sync

Settings -> LeetCode Stats Settings supports an `alfa-leetcode-api` style wrapper.

Default base URL:

```txt
https://alfa-leetcode-api.onrender.com
```

You can point it at a local Docker wrapper instead. The MVP calls statistics endpoints only and caches normalized output at:

```txt
workspace/data/leetcode-stats.json
```

## Privacy Policy for Local Workspace

- `workspace/` is ignored by git.
- `.env` and `.env.*` are ignored by git.
- Problem statements are not fetched or stored.
- Official solutions, premium content, discussions, hidden tests, and raw selected problem content are not fetched or stored.
- AI coaching receives only your own summary, approach, stuck point, code, notes, metadata, and prior AI reviews.

Run:

```bash
pnpm guard:privacy
```

## What This Project Does Not Do

- No scraping.
- No crawling.
- No problem statement storage.
- No official solution fetching.
- No premium content handling.
- No SaaS.
- No authentication.
- No database.

## Open-Source Contribution Guide

Keep changes local-first and privacy-preserving. Do not add LeetCode scraping, auth, hosted storage, or telemetry. Prefer small TypeScript modules, Markdown files, and server-side adapters for anything that may need a secret.

Before opening a PR:

```bash
pnpm lint
pnpm test
pnpm guard:privacy
```
