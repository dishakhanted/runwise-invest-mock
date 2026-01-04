import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import {
  Suggestion,
  buildSuggestionsFromMessage,
  isApprovalOrDenialMessage,
  parseSummaryAndSuggestionsFromMessage,
} from "@/lib/suggestions";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
}

interface UseFinancialChatProps {
  contextType: "dashboard" | "goal" | "general" | "onboarding" | "net_worth" | "assets" | "liabilities" | "explore" | "market-insights" | "finshorts" | "what-if" | "alternate-investments" | "tax-loss-harvesting";
  contextData?: any;
  initialMessage?: string;
  initialSuggestions?: Suggestion[];
  onClose?: () => void;
}


export const useFinancialChat = ({
  contextType,
  contextData,
  initialMessage,
  initialSuggestions,
  onClose,
}: UseFinancialChatProps) => {
  const [messages, setMessages] = useState<Message[]>(
    initialMessage
      ? [
          {
            role: "assistant",
            content: initialMessage,
            suggestions: initialSuggestions,
          },
        ]
      : [],
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset messages and conversation whenever contextType changes
  useEffect(() => {
    logger.chat('Context type changed, resetting messages', {
      contextType,
      hasInitialMessage: !!initialMessage,
      initialSuggestionsCount: initialSuggestions?.length || 0,
    });
    
    setMessages(
      initialMessage
        ? [
            {
              role: "assistant",
              content: initialMessage,
              suggestions: initialSuggestions,
            },
          ]
        : [],
    );
    // Force a new conversation for each context
    setConversationId(null);
    logger.chat('Conversation reset', { contextType });
  }, [contextType, initialMessage, initialSuggestions]);

  const generateTitle = (firstUserMessage: string) => {
    // Generate a concise title from the first user message
    const message = firstUserMessage.trim();

    // Extract key words (remove common words)
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "my",
      "i",
      "can",
      "you",
      "me",
      "how",
      "what",
      "when",
      "where",
      "why",
    ];
    const words = message
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5);

    if (words.length === 0) {
      // Fallback to first few words
      const fallbackWords = message.split(" ").slice(0, 3);
      return fallbackWords.join(" ").charAt(0).toUpperCase() + fallbackWords.join(" ").slice(1);
    }

    // Capitalize first letter of each word
    const title = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return title;
  };

  const saveConversation = useCallback(
    async (messages: Message[], title?: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        if (!conversationId) {
          // Create new conversation
          const { data, error } = await supabase
            .from("conversations")
            .insert({
              user_id: user.id,
              title: title || "Financial Chat",
              context_type: contextType,
              context_data: contextData,
            })
            .select()
            .single();

          if (error) throw error;
          setConversationId(data.id);
          return data.id;
        } else {
          // Update existing conversation
          const { error } = await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

          if (error) throw error;
          return conversationId;
        }
      } catch (error) {
        console.error("Error saving conversation:", error);
        return null;
      }
    },
    [conversationId, contextType, contextData],
  );

  const saveMessage = useCallback(async (convId: string, role: string, content: string) => {
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: convId,
        role,
        content,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving message:", error);
    }
  }, []);

  const sendMessage = useCallback(
    async (overrideText?: string, options?: { silentUser?: boolean }) => {
      const textToSend = (overrideText ?? input).trim();
      if (!textToSend || isLoading) {
        logger.chat('Send message skipped', { 
          hasText: !!textToSend, 
          isLoading,
          reason: !textToSend ? 'empty' : 'loading',
        });
        return;
      }

      // Detect approval/denial messages to skip auto-generating suggestions
      const isApprovalOrDenial = isApprovalOrDenialMessage(textToSend);
      
        logger.chat('Sending message', {
          contextType,
          isApprovalOrDenial,
          messageLength: textToSend.length,
          silentUser: options?.silentUser || false,
        });

      const userMessage: Message = { role: "user", content: textToSend };
      const newMessages = [...messages, userMessage];
      if (!options?.silentUser) {
        setMessages(newMessages);
      }
      setInput("");
      setIsLoading(true);

      try {
        // Save conversation and get conversation ID
        const title = conversationId ? undefined : generateTitle(textToSend);
        logger.chat('Saving conversation', { conversationId, isNew: !conversationId, title });
        
        const convId = await saveConversation(newMessages, title);

        if (convId) {
          logger.chat('Conversation saved', { conversationId: convId });
          await saveMessage(convId, "user", textToSend);
        }

        // Get auth token (optional - works without auth for testing)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Build request body
        const requestBody: any = {
          messages: newMessages,
          conversationId: convId,
          contextType,
          contextData,
        };

        logger.api('POST', '/functions/v1/financial-chat', {
          contextType,
          hasAuth: !!session,
          messageCount: newMessages.length,
          conversationId: convId,
        });

        // Call edge function with streaming
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify(requestBody),
        });

        logger.api('Response received', {
          status: response.status,
          contentType: response.headers.get("content-type"),
          conversationId: convId,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          logger.error('Edge function error response', {
            status: response.status,
            error: errorData,
            contextType,
            conversationId: convId,
          }, new Error(errorData.error || "Unknown error"));
          
          // Handle specific error codes with friendly messages
          if (response.status === 429) {
            throw new Error("We're experiencing high demand. Please try again in a moment.");
          }
          if (response.status === 402) {
            throw new Error("Service temporarily unavailable. Please try again later.");
          }
          if (response.status >= 500) {
            throw new Error("Something went wrong on our end. Please try again.");
          }
          
          throw new Error(errorData.error || "Failed to get response");
        }

        // Check if response is JSON (goal update) or streaming
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const data = await response.json();
          logger.chat('Received JSON response', {
            hasMessage: !!data.message,
            messageLength: data.message?.length || 0,
            hasSuggestions: !!data.suggestions,
            goalUpdated: data.goalUpdated || false,
            conversationId: convId,
          });

          const rawAssistantMessage: string = data.message ?? "";

          // Use structured suggestions from backend if available
          let summary = data.summary ?? rawAssistantMessage;
          let suggestions: Suggestion[] | undefined = undefined;

          // Convert backend AISuggestion format to frontend Suggestion format
          if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            suggestions = data.suggestions.map((sug: any) => ({
              id: sug.id || `${contextType}-${Date.now()}-${Math.random()}`,
              title: sug.title || '',
              description: sug.body || sug.description || '',
              status: 'pending' as const,
            }));
            
            logger.chat('Using structured suggestions from backend', {
              contextType,
              suggestionsCount: suggestions.length,
              conversationId: convId,
            });
          }

          // Fallback: parse unstructured message only if no structured suggestions
          const isSuggestionContext =
            contextType === "goal" ||
            contextType === "dashboard" ||
            contextType === "net_worth" ||
            contextType === "assets" ||
            contextType === "liabilities";

          if (isSuggestionContext && (!suggestions || suggestions.length === 0) && rawAssistantMessage && !isApprovalOrDenial) {
            const parsed = parseSummaryAndSuggestionsFromMessage(
              rawAssistantMessage,
              contextType
            );

            logger.chat('Parsed suggestions from unstructured message', {
              contextType,
              summaryLength: parsed.summary.length,
              suggestionsCount: parsed.suggestions.length,
              conversationId: convId,
            });

            summary = parsed.summary;
            suggestions = parsed.suggestions;
          }

            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: summary,
                suggestions,
              },
            ]);
          logger.chat('Messages updated with assistant response', {
            messageCount: messages.length + 1,
            hasSuggestions: !!suggestions && suggestions.length > 0,
            conversationId: convId,
          });

          // Save assistant message
          if (convId && rawAssistantMessage) {
            await saveMessage(convId, "assistant", rawAssistantMessage);
            logger.chat('Assistant message saved', { conversationId: convId });
          }

          setIsLoading(false);
          return;
        }

        // Handle streaming response
        logger.chat('Handling streaming response', { conversationId: convId });
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;

                  // Optional: structured suggestions may be sent on some chunks
                  const chunkSuggestions: Suggestion[] | undefined = parsed.suggestions;

                  // Append content if present
                  if (content) {
                    assistantMessage += content;
                  }

                  // Build up suggestions:
                  // - Prefer structured suggestions from the stream if provided
                  // - Otherwise, leave suggestions undefined
                  let suggestions: Suggestion[] | undefined = undefined;

                  if (Array.isArray(chunkSuggestions) && chunkSuggestions.length > 0) {
                    suggestions = chunkSuggestions;
                  }

                  setMessages((prev) => {
                    const last = prev[prev.length - 1];

                    if (last?.role === "assistant") {
                      return prev.map((m, i) =>
                        i === prev.length - 1
                          ? {
                              ...m,
                              content: assistantMessage,
                              suggestions: suggestions ?? m.suggestions,
                            }
                          : m,
                      );
                    }

                    return [
                      ...prev,
                      {
                        role: "assistant",
                        content: assistantMessage,
                        suggestions,
                      },
                    ];
                  });
                } catch (e) {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }

          // After streaming finishes, attach suggestions for AI chat contexts,
          // but don't do this for approval/denial confirmation messages.
const isSuggestionContext =
  contextType === "goal" ||
  contextType === "dashboard" ||
  contextType === "net_worth" ||
  contextType === "assets" ||
  contextType === "liabilities";

if (isSuggestionContext && assistantMessage && !isApprovalOrDenial) {
            const parsed = parseSummaryAndSuggestionsFromMessage(
              assistantMessage,
              contextType
            );

            logger.chat('Parsed suggestions from streaming response', {
              contextType,
              summaryLength: parsed.summary.length,
              suggestionsCount: parsed.suggestions.length,
              conversationId: convId,
            });

            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1 && m.role === "assistant"
                  ? {
                      ...m,
                      content: parsed.summary,
                      suggestions: parsed.suggestions,
                    }
                  : m,
              ),
            );
          }

          // Save assistant message
          if (convId && assistantMessage) {
            await saveMessage(convId, "assistant", assistantMessage);
            logger.chat('Streaming assistant message saved', { 
              conversationId: convId,
              messageLength: assistantMessage.length,
            });
          }
        } else {
          logger.warn('No reader available for streaming response', { conversationId: convId });
        }
      } catch (error: any) {
        logger.error('Error sending message', {
          contextType,
          conversationId,
          error: error.message,
          stack: error.stack,
        }, error);
        
        // Show user-friendly error message
        const errorMessage = error.message || "Failed to send message";
        
        toast({
          title: "Unable to send message",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Add a fallback assistant message so the user knows what happened
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm sorry, I encountered an issue processing your request. Please try again in a moment.",
          },
        ]);
      } finally {
        setIsLoading(false);
        logger.chat('Send message completed', { contextType, conversationId });
      }
    },
    [input, messages, isLoading, contextType, contextData, conversationId, saveConversation, saveMessage, toast],
  );

  const handleSuggestionAction = useCallback(
    (messageIndex: number, suggestionId: string, action: "approved" | "denied" | "know_more") => {
      logger.chat('Suggestion action triggered', {
        messageIndex,
        suggestionId,
        action,
        contextType,
      });

      const message = messages[messageIndex];
      const suggestion = message.suggestions?.find((s) => s.id === suggestionId);

      if (!suggestion) {
        logger.warn('Suggestion not found', { messageIndex, suggestionId, action });
      } else {
        logger.chat('Suggestion found', { suggestionTitle: suggestion.title, action });
      }

      // Update suggestion status only for approve/deny
      if (action === "approved" || action === "denied") {
        setMessages((prev) =>
          prev.map((msg, idx) => {
            if (idx === messageIndex && msg.suggestions) {
              return {
                ...msg,
                suggestions: msg.suggestions.map((s) => (s.id === suggestionId ? { ...s, status: action } : s)),
              };
            }
            return msg;
          }),
        );
      }

      console.log("About to trigger AI response for action");

      // ✅ All actions (Approve / Deny / Know More) should be *silent*: no user bubble
      if (action === "approved" && suggestion) {
        const userMessage = `I approve the suggestion: "${suggestion.title}"`;
        logger.chat('Sending approval message', { suggestionTitle: suggestion.title });
        sendMessage(userMessage, { silentUser: true });
      } else if (action === "denied" && suggestion) {
        const userMessage = `I decline the suggestion: "${suggestion.title}"`;
        logger.chat('Sending denial message', { suggestionTitle: suggestion.title });
        sendMessage(userMessage, { silentUser: true });
      } else if (action === "know_more" && suggestion) {
        const userMessage = `I want to know more about the suggestion: "${suggestion.title}"`;
        logger.chat('Sending know-more message', { suggestionTitle: suggestion.title });
        sendMessage(userMessage, { silentUser: true });
      }
    },
    [messages, sendMessage, contextType],
  );

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleClose,
    handleSuggestionAction,
  };
};
