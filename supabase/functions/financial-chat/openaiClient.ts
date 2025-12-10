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
  responseMimeType?: string; // For structured outputs (e.g., "application/json")
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
  responseMimeType,
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
  // For JSON responses, use higher token limit to ensure complete structured output
  // topP: 0.95 for balanced creativity and consistency
  const maxTokens = responseMimeType === 'application/json' ? 4096 : 2048;
  
  const body: {
    contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    systemInstruction?: { role: string; parts: Array<{ text: string }> };
    generationConfig: {
      temperature: number;
      maxOutputTokens?: number;
      topP?: number;
      responseMimeType?: string;
    };
  } = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens, // Higher limit for JSON responses
      topP: 0.95, // Balanced sampling for financial advice
    },
  };

  // Add response MIME type for structured outputs (e.g., JSON)
  if (responseMimeType) {
    body.generationConfig.responseMimeType = responseMimeType;
  }

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
    `[openaiClient] Calling Gemini: model=${selectedModel}, promptType=${promptType || 'unknown'}, temperature=${temperature}, systemPromptLength=${systemPrompt.length}, messageCount=${messages.length}, responseMimeType=${responseMimeType || 'text/plain'}, maxOutputTokens=${maxTokens}`,
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
    
    // Check for safety filter blocks or other issues
    if (json.promptFeedback) {
      console.warn("[openaiClient] Gemini prompt feedback:", JSON.stringify(json.promptFeedback));
      if (json.promptFeedback.blockReason) {
        throw new Error(`Gemini blocked response: ${json.promptFeedback.blockReason} - ${json.promptFeedback.safetyRatings?.map((r: any) => `${r.category}:${r.probability}`).join(', ') || 'unknown'}`);
      }
    }

    // Check if candidates array exists and has content
    if (!json.candidates || json.candidates.length === 0) {
      console.error("[openaiClient] No candidates in Gemini response");
      console.error("[openaiClient] Full response:", JSON.stringify(json, null, 2));
      throw new Error("Gemini returned no candidates - check logs for full response");
    }

    const candidate = json.candidates[0];
    
    // Extract content from response first (even if finishReason is not STOP)
    // For JSON mode, content is still in parts[0].text
    const content = candidate?.content?.parts?.[0]?.text;
    
    // Check if candidate was blocked or incomplete
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn("[openaiClient] Gemini candidate finish reason:", candidate.finishReason);
      
      if (candidate.finishReason === 'SAFETY') {
        throw new Error("Gemini blocked response due to safety filters");
      }
      
      if (candidate.finishReason === 'MAX_TOKENS') {
        // For MAX_TOKENS, try to use partial content if available
        if (content && content.trim().length > 0) {
          console.warn("[openaiClient] Response hit token limit but partial content available, attempting to use it");
          // Return partial content - the parser will handle incomplete JSON if needed
          return content;
        }
        throw new Error("Gemini response exceeded token limit and no partial content available");
      }
      
      if (candidate.finishReason === 'RECITATION') {
        throw new Error("Gemini blocked response due to recitation policy");
      }
      
      // For other finish reasons, try to return content if available
      if (content && content.trim().length > 0) {
        console.warn(`[openaiClient] Finish reason was ${candidate.finishReason} but content available, returning it`);
        return content;
      }
      
      throw new Error(`Gemini response incomplete: ${candidate.finishReason}`);
    }

    if (!content) {
      console.error("[openaiClient] No response content from Gemini");
      console.error("[openaiClient] Full response structure:", JSON.stringify(json, null, 2));
      console.error("[openaiClient] Candidates array length:", json.candidates?.length);
      console.error("[openaiClient] First candidate structure:", JSON.stringify(candidate, null, 2));
      console.error("[openaiClient] Candidate content:", candidate?.content);
      console.error("[openaiClient] Candidate parts:", candidate?.content?.parts);
      
      // Try to extract error message if available
      if (json.error) {
        throw new Error(`Gemini API error: ${JSON.stringify(json.error)}`);
      }
      
      // Check for safety ratings that might have blocked
      if (candidate?.safetyRatings) {
        const blockedRatings = candidate.safetyRatings.filter((r: any) => 
          r.probability === 'HIGH' || r.probability === 'MEDIUM'
        );
        if (blockedRatings.length > 0) {
          throw new Error(`Gemini blocked response due to safety ratings: ${blockedRatings.map((r: any) => `${r.category}:${r.probability}`).join(', ')}`);
        }
      }
      
      throw new Error("No response content from Gemini - check logs for full response structure");
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
