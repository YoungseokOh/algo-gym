export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAICompatibleConfig = {
  baseUrl: string;
  model: string;
  apiKey?: string;
  temperature?: number;
  timeoutMs?: number;
};

export async function createChatCompletion(
  config: OpenAICompatibleConfig,
  messages: ChatMessage[]
): Promise<string> {
  const baseUrl = config.baseUrl.replace(/\/+$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 60000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {})
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature ?? 0.2,
        stream: false
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`LLM request failed: HTTP ${response.status}${body ? ` - ${body.slice(0, 300)}` : ""}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string }; text?: string }>;
    };
    const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text;
    if (!content) {
      throw new Error("LLM response did not contain message content.");
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}
