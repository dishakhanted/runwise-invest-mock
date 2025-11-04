import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status?: 'pending' | 'approved' | 'denied';
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

  const handleSuggestionAction = useCallback((messageIndex: number, suggestionId: string, action: 'approved' | 'denied') => {
    setMessages(prev => prev.map((msg, idx) => {
      if (idx === messageIndex && msg.suggestions) {
        return {
          ...msg,
          suggestions: msg.suggestions.map(s => 
            s.id === suggestionId ? { ...s, status: action } : s
          )
        };
      }
      return msg;
    }));

    toast({
      title: action === 'approved' ? "Suggestion Approved" : "Suggestion Denied",
      description: `You ${action} this suggestion.`,
    });
  }, [toast]);

  const generateTitle = (firstUserMessage: string) => {
    // Generate a concise title from the first user message
    const words = firstUserMessage.trim().split(' ');
    if (words.length <= 6) return firstUserMessage;
    return words.slice(0, 6).join(' ') + '...';
  };

  const saveConversation = useCallback(async (messages: Message[], title?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      if (!conversationId) {
        // Create new conversation
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: title || 'Financial Chat',
            context_type: contextType,
            context_data: contextData
          })
          .select()
          .single();

        if (error) throw error;
        setConversationId(data.id);
        return data.id;
      } else {
        // Update existing conversation
        const { error } = await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        if (error) throw error;
        return conversationId;
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }, [conversationId, contextType, contextData]);

  const saveMessage = useCallback(async (convId: string, role: string, content: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          role,
          content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
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

      // Get auth token (optional - works without auth for testing)
      const { data: { session } } = await supabase.auth.getSession();

      // Call edge function with streaming
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
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
                  
                  // Check if message contains suggestions (simple pattern matching)
                  let suggestions: Suggestion[] | undefined;
                  if (assistantMessage.includes('Suggestion:') || assistantMessage.includes('I suggest')) {
                    // Extract suggestions (this is a simple implementation)
                    // In production, you'd want the AI to return structured data
                    suggestions = [{
                      id: `suggestion-${Date.now()}`,
                      title: 'Financial Action',
                      description: assistantMessage.split('\n')[0].substring(0, 100),
                      status: 'pending'
                    }];
                  }
                  
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === 'assistant') {
                      return prev.map((m, i) =>
                        i === prev.length - 1 
                          ? { ...m, content: assistantMessage, suggestions } 
                          : m
                      );
                    }
                    return [...prev, { role: 'assistant', content: assistantMessage, suggestions }];
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
    handleClose,
    handleSuggestionAction
  };
};