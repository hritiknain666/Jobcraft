import "server-only";

type AiResponse = {
  text: string;
  model: string;
};

type ResponsesApiPayload = {
  model?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

const DEFAULT_MODEL = "gpt-5.6";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export function isAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function extractOutputText(payload: ResponsesApiPayload) {
  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text!.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function generateCareerAssistantResponse({
  instruction,
  userPrompt,
}: {
  instruction: string;
  userPrompt: string;
}): Promise<AiResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("AI_NOT_CONFIGURED");

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: instruction,
      input: userPrompt,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const requestId = response.headers.get("x-request-id") || "unknown";
    throw new Error(`AI_REQUEST_FAILED:${response.status}:${requestId}`);
  }

  const payload = (await response.json()) as ResponsesApiPayload;
  const text = extractOutputText(payload);
  if (!text) throw new Error("AI_EMPTY_RESPONSE");

  return { text, model: payload.model?.trim() || model };
}
