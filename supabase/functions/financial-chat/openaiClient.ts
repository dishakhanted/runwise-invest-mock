/**
 * LLM Client for Financial Chat Edge Function
 * 
 * This file now uses Google Gemini API under the hood, but preserves the same
 * interface (callChatModel) so that index.ts and other callers don't need to change.
 * The filename remains openaiClient.ts to avoid breaking imports across the codebase.
 * 
 * Deno / Supabase Edge compatible using Gemini REST API.
 */

// Gemini API configuration from environment variables
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL_MAIN = Deno.env.get("GEMINI_MODEL_MAIN") || "gemini-2.5-flash";
const DEFAULT_TEMPERATURE = 0.2;

if (!GEMINI_API_KEY) {
  // Don't throw if you want the function to still respond with a nice error later.
  // For now we just log it – the function will throw inside callChatModel if used.
  console.warn("[openaiClient] GEMINI_API_KEY is not set");
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CallChatModelOptions {
  systemPrompt: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  useCheapModel?: boolean; // Ignored for now, uses GEMINI_MODEL_MAIN
  promptType?: string; // For logging purposes
}

/**
 * Calls Google Gemini generateContent API
 * 
 * Maps our message format to Gemini's format:
 * - user messages → role: "user"
 * - assistant messages → role: "model"
 * - system prompt → systemInstruction (not in contents array)
 */
export async function callChatModel({
  systemPrompt,
  messages,
  model,
  temperature = DEFAULT_TEMPERATURE,
  useCheapModel = false, // Currently ignored, uses main model
  promptType,
}: CallChatModelOptions): Promise<string> {
  const selectedModel = model || GEMINI_MODEL_MAIN;

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Filter out system messages from the messages array (we handle systemPrompt separately)
  // Convert our message format to Gemini's format
  const contents = messages
    .filter((msg) => msg.role !== "system") // System messages go to systemInstruction
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  // Build request body for Gemini API with optimized generation config
  // maxOutputTokens: 2048 for longer, richer financial explanations
  // topP: 0.95 for balanced creativity and consistency
  const body: {
    contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    systemInstruction?: { role: string; parts: Array<{ text: string }> };
    generationConfig: {
      temperature: number;
      maxOutputTokens?: number;
      topP?: number;
    };
  } = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: 2048, // Allow longer, more detailed responses
      topP: 0.95, // Balanced sampling for financial advice
    },
  };

  // Add system instruction if systemPrompt is provided
  if (systemPrompt) {
    body.systemInstruction = {
      role: "system",
      parts: [{ text: systemPrompt }],
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`;

  // Enhanced logging with promptType and systemPrompt details
  console.log(
    `[openaiClient] Calling Gemini: model=${selectedModel}, promptType=${promptType || 'unknown'}, temperature=${temperature}, systemPromptLength=${systemPrompt.length}, messageCount=${messages.length}`,
  );

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => "Unknown error");
      console.error(
        `[openaiClient] Gemini API error: ${resp.status} ${resp.statusText}`,
        errorText,
      );
      throw new Error(`Gemini API error: ${resp.status} - ${errorText.substring(0, 200)}`);
    }

    const json = await resp.json();

    // Parse Gemini response
    // Expected structure: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
    const candidate = json.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("[openaiClient] No response content from Gemini", JSON.stringify(json));
      throw new Error("No response content from Gemini");
    }

    console.log(
      `[openaiClient] Response received: promptType=${promptType || 'unknown'}, responseLength=${content.length} chars`,
    );
    return content;
  } catch (error) {
    console.error("[openaiClient] Gemini API error:", error);
    // Re-throw with context if it's not already an Error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Gemini API error: ${String(error)}`);
  }
}
