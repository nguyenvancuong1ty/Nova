import type { LlmMessage } from "./types";

interface OpenRouterClientOptions {
  apiKey: string;
  baseUrl: string;
  appName?: string;
  appUrl?: string;
  fetchImpl?: typeof fetch;
}

interface GenerateRequest {
  model: string;
  messages: LlmMessage[];
  temperature?: number;
  max_tokens?: number;
}

const MAX_CONTENT_RETRIES = 2;
const MAX_RETRY_TOKENS = 16_384;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function extractMessageContent(payload: unknown): string | null {
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })
    ?.choices?.[0]?.message?.content;

  if (isNonEmptyString(content)) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          isNonEmptyString((part as { text?: unknown }).text)
        ) {
          return (part as { text: string }).text.trim();
        }

        return "";
      })
      .filter(Boolean)
      .join("\n");

    return text || null;
  }

  return null;
}

export function createOpenRouterClient(options: OpenRouterClientOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async generate(request: GenerateRequest) {
      let attempt = 0;
      let nextRequest = { ...request };

      while (attempt <= MAX_CONTENT_RETRIES) {
        const response = await fetchImpl(`${options.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
            ...(options.appName ? { "X-Title": options.appName } : {}),
            ...(options.appUrl ? { Referer: options.appUrl } : {}),
          },
          body: JSON.stringify(nextRequest),
        });

        if (!response.ok) {
          const message =
            "text" in response
              ? await response.text()
              : "OpenRouter request failed";
          throw new Error(
            `OpenRouter request failed (${response.status}): ${message}`,
          );
        }

        const payload = await response.json();
        const content = extractMessageContent(payload);
        if (content) {
          return { content, raw: payload };
        }

        if (attempt === MAX_CONTENT_RETRIES) {
          throw new Error("OpenRouter response did not include message content");
        }

        nextRequest = {
          ...nextRequest,
          max_tokens: Math.min(
            Math.max((nextRequest.max_tokens ?? 256) * 2, 256),
            MAX_RETRY_TOKENS,
          ),
        };
        attempt += 1;
      }

      throw new Error("OpenRouter response did not include message content");
    },
  };
}
