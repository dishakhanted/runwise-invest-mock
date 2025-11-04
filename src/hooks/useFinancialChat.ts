import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseFinancialChatProps {
  contextType: 'dashboard' | 'goal' | 'general';
  contextData?: any;
  initialMessage: string;
  onClose?: () => void;
}

export const useFinancialChat = ({
  contextType,
  contextData,
  initialMessage,
  onClose
}: UseFinancialChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: initialMessage }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateTitle = (firstUserMessage: string) => {
    // Generate a concise title from the first user message
    const words = firstUserMessage.trim().split(' ');
    if (words.length <= 6) return firstUserMessage;
    return words.slice(0, 6).join(' ') + '...';
  };

  const saveConversation = useCallback(async (messages: Message[], title?: string) => {
    // Disabled for testing - conversations won't be saved
    return null;
  }, [conversationId, contextType, contextData]);

  const saveMessage = useCallback(async (convId: string, role: string, content: string) => {
    // Disabled for testing - messages won't be saved
    return;
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Save conversation and get conversation ID
      const title = conversationId ? undefined : generateTitle(input.trim());
      const convId = await saveConversation(newMessages, title);

      if (convId) {
        // Save user message
        await saveMessage(convId, 'user', input.trim());
      }

      // Call edge function with streaming (no auth for testing)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: newMessages,
            conversationId: convId,
            contextType,
            contextData
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  assistantMessage += content;
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === 'assistant') {
                      return prev.map((m, i) =>
                        i === prev.length - 1 ? { ...m, content: assistantMessage } : m
                      );
                    }
                    return [...prev, { role: 'assistant', content: assistantMessage }];
                  });
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }

        // Save assistant message
        if (convId && assistantMessage) {
          await saveMessage(convId, 'assistant', assistantMessage);
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      // Remove the failed user message
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, contextType, contextData, conversationId, saveConversation, saveMessage, toast]);

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
    handleClose
  };
};