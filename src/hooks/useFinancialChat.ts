import { useState, useCallback, useEffect } from "react";
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
  contextType: 'dashboard' | 'goal' | 'general' | 'onboarding';
  contextData?: any;
  initialMessage?: string;
  initialSuggestions?: Suggestion[];
  onClose?: () => void;
}

const buildGoalSuggestionsFromMessage = (assistantMessage: string): Suggestion[] => {
  // Split into lines, ignore empty ones
  const lines = assistantMessage
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  // Use the first line as a "headline" style title,
  // and the rest as description.
  const title = lines[0].slice(0, 80);
  const description = lines.slice(1).join(" ").slice(0, 300);

  return [
    {
      id: `goal-suggestion-${Date.now()}`,
      title: title || "Recommendation",
      description: description || assistantMessage.slice(0, 300),
      status: "pending",
    },
  ];
};

export const useFinancialChat = ({
  contextType,
  contextData,
  initialMessage = "",
  initialSuggestions,
  onClose
}: UseFinancialChatProps) => {
  const [messages, setMessages] = useState<Message[]>(
    initialMessage ? [
      { 
        role: "assistant", 
        content: initialMessage,
        suggestions: initialSuggestions 
      }
    ] : []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset messages when initial message or suggestions change only if no active conversation
  useEffect(() => {
    if (conversationId) return; // preserve ongoing chats when context changes (e.g., goal updates)
    setMessages(
      initialMessage ? [
        { 
          role: "assistant", 
          content: initialMessage,
          suggestions: initialSuggestions 
        }
      ] : []
    );
  }, [initialMessage, initialSuggestions, conversationId]);

  const handleSuggestionAction = useCallback((messageIndex: number, suggestionId: string, action: 'approved' | 'denied' | 'know_more') => {
    console.log('handleSuggestionAction called:', { messageIndex, suggestionId, action });
    
    // Find the suggestion title
    const message = messages[messageIndex];
    const suggestion = message.suggestions?.find(s => s.id === suggestionId);
    
    console.log('Found suggestion:', suggestion);
    
    if (action === 'know_more') {
      // Add user message asking for more info and let AI respond
      const userMessage = `Tell me more about "${suggestion?.title}"`;
      setInput(userMessage);
      // Trigger send after a brief moment
      setTimeout(() => sendMessage(), 100);
      return;
    }

    // Update suggestion status for approve/deny
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
    
    console.log('About to trigger AI response for action');
    
    // Let AI handle the response for approve/deny actions
    if (action === 'approved' && suggestion) {
      const userMessage = `I approve the suggestion: "${suggestion.title}"`;
      setInput(userMessage);
      setTimeout(() => sendMessage(), 100);
    } else if (action === 'denied' && suggestion) {
      const userMessage = `I decline the suggestion: "${suggestion.title}"`;
      setInput(userMessage);
      setTimeout(() => sendMessage(), 100);
    }
  }, [messages]);

  const generateTitle = (firstUserMessage: string) => {
    // Generate a concise title from the first user message
    const message = firstUserMessage.trim();
    
    // Extract key words (remove common words)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'my', 'i', 'can', 'you', 'me', 'how', 'what', 'when', 'where', 'why'];
    const words = message.toLowerCase().split(' ')
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5);
    
    if (words.length === 0) {
      // Fallback to first few words
      const fallbackWords = message.split(' ').slice(0, 3);
      return fallbackWords.join(' ').charAt(0).toUpperCase() + fallbackWords.join(' ').slice(1);
    }
    
    // Capitalize first letter of each word
    const title = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return title;
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

  const sendMessage = useCallback(async (overrideText?: string, options?: { silentUser?: boolean }) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || isLoading) return;

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
      const convId = await saveConversation(newMessages, title);

      if (convId) {
        // Save user message
        await saveMessage(convId, 'user', textToSend);
      }

      // Get auth token (optional - works without auth for testing)
      const { data: { session } } = await supabase.auth.getSession();

      console.log('Sending to edge function:', { contextType, contextData });

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

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || "Failed to get response");
      }

      // Check if response is JSON (goal update) or streaming
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log('Received JSON response:', data);
        
        const assistantMessage: string = data.message ?? "";
        const suggestions: Suggestion[] | undefined = data.suggestions ?? undefined;
        
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: assistantMessage,
            suggestions
          }
        ]);
        
        // Save assistant message
        if (convId && assistantMessage) {
          await saveMessage(convId, 'assistant', assistantMessage);
        }
        
        setIsLoading(false);
        return;
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
                
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  
                  if (last?.role === 'assistant') {
                    return prev.map((m, i) =>
                      i === prev.length - 1 
                        ? { 
                            ...m, 
                            content: assistantMessage,
                            suggestions: suggestions ?? m.suggestions
                          } 
                        : m
                    );
                  }
                  
                  return [
                    ...prev, 
                    { 
                      role: 'assistant', 
                      content: assistantMessage,
                      suggestions
                    }
                  ];
                });
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }

        // After streaming finishes, attach suggestions for goal chat
        if (contextType === "goal" && assistantMessage) {
          const goalSuggestions = buildGoalSuggestionsFromMessage(assistantMessage);

          if (goalSuggestions.length > 0) {
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1 && m.role === "assistant"
                  ? { ...m, suggestions: goalSuggestions }
                  : m
              )
            );
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
    handleSuggestionAction,
  };
};