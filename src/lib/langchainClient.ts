// LangChain client utilities for frontend use
import { ChatOpenAI } from "@langchain/openai";

/**
 * Creates a LangChain LLM instance
 * Note: This is for frontend reference. Edge functions will initialize their own instances.
 */
export function createLLM(apiKey: string, model: string = "gpt-4o-mini") {
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: model,
    temperature: 0.7,
  });
}

/**
 * Helper to format messages for LangChain
 */
export function formatMessagesForLangChain(messages: Array<{ role: string; content: string }>) {
  return messages.map(msg => ({
    role: msg.role as "system" | "user" | "assistant",
    content: msg.content,
  }));
}
