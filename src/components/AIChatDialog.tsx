import React, { useEffect, useRef, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useFinancialChat } from "@/hooks/useFinancialChat";
import { SuggestionActions } from "@/components/SuggestionActions";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

interface AIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: "net-worth" | "assets" | "liabilities";
  netWorth: number;
  assetsTotal: number;
  liabilitiesTotal: number;
  cashTotal: number;
  investmentsTotal: number;
  showFinancialSummary?: boolean;
}

export const AIChatDialog = ({
  isOpen,
  onClose,
  viewMode,
  netWorth,
  assetsTotal,
  liabilitiesTotal,
  cashTotal,
  investmentsTotal,
  showFinancialSummary = false,
}: AIChatDialogProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const { demoMode } = useSession();
  const [initialMessage, setInitialMessage] = useState<string>("");
  const [initialSuggestions, setInitialSuggestions] = useState<any[]>([]);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);

  // Check for cached suggestions when dialog opens
  useEffect(() => {
    if (isOpen && !hasCheckedCache) {
      const checkCachedSuggestions = async () => {
        try {
          const requestBody: any = {
            endpoint: "suggestions",
            viewMode: viewMode,
            contextData: {
              netWorth,
              assetsTotal,
              liabilitiesTotal,
              cashTotal,
              investmentsTotal,
            },
          };
          
          if (demoMode) {
            requestBody.demo = { demoProfileId: demoMode };
          }
          
          const { data, error } = await supabase.functions.invoke("financial-chat", {
            body: requestBody,
          });

          console.log('[AIChatDialog] Cache check result:', { 
            hasError: !!error, 
            hasMessage: !!data?.message, 
            hasSuggestions: !!data?.suggestions,
            suggestionsCount: data?.suggestions?.length || 0,
            message: data?.message?.substring(0, 50) + '...'
          });

          if (!error && data?.message && data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            // Found cached suggestions - convert from backend AISuggestion format to frontend Suggestion format
            console.log('[AIChatDialog] Setting cached suggestions:', {
              messageLength: data.message.length,
              suggestionsCount: data.suggestions.length
            });
            setInitialMessage(data.message);
            // Convert backend format (body) to frontend format (description)
            const convertedSuggestions = data.suggestions.map((sug: any) => ({
              id: sug.id || `${viewMode}-${Date.now()}-${Math.random()}`,
              title: sug.title || '',
              description: sug.body || sug.description || '',
              status: 'pending' as const,
            }));
            setInitialSuggestions(convertedSuggestions);
          } else {
            console.log('[AIChatDialog] No cached suggestions found');
          }
          setHasCheckedCache(true);
        } catch (err) {
          console.error("Error checking cached suggestions:", err);
          setHasCheckedCache(true);
        }
      };

      checkCachedSuggestions();
    }
  }, [isOpen, viewMode, hasCheckedCache, demoMode, netWorth, assetsTotal, liabilitiesTotal, cashTotal, investmentsTotal]);

  // Log when initialMessage/initialSuggestions change
  useEffect(() => {
    console.log('[AIChatDialog] initialMessage/initialSuggestions changed:', {
      hasInitialMessage: !!initialMessage,
      initialMessageLength: initialMessage?.length || 0,
      initialSuggestionsCount: initialSuggestions?.length || 0,
    });
  }, [initialMessage, initialSuggestions]);

  const { messages, input, setInput, isLoading, sendMessage, handleClose, handleSuggestionAction } = useFinancialChat({
    contextType: viewMode === "net-worth" ? "net_worth" : viewMode === "assets" ? "assets" : "liabilities",
    contextData: {
      viewMode,
      netWorth,
      assetsTotal,
      liabilitiesTotal,
      cashTotal,
      investmentsTotal,
    },
    initialMessage: initialMessage ? initialMessage : undefined,
    initialSuggestions: initialSuggestions && initialSuggestions.length > 0 ? initialSuggestions : undefined,
    onClose,
  });

  // Log messages changes
  useEffect(() => {
    console.log('[AIChatDialog] Messages changed:', {
      messagesCount: messages.length,
      firstMessage: messages[0]?.content?.substring(0, 50) || 'none',
      hasSuggestions: !!messages[0]?.suggestions,
      suggestionsCount: messages[0]?.suggestions?.length || 0,
    });
  }, [messages]);

  // Reset cache check when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setHasCheckedCache(false);
      setInitialMessage("");
      setInitialSuggestions([]);
    }
  }, [isOpen]);

  // Trigger initial AI response when dialog opens (only if no cached suggestions)
  useEffect(() => {
    if (isOpen && hasCheckedCache && messages.length === 0 && !isLoading && !initialMessage) {
      sendMessage("Please provide an analysis and suggestions based on my financial data.", { silentUser: true });
    }
  }, [isOpen, hasCheckedCache, messages.length, isLoading, initialMessage, sendMessage]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] max-h-[85vh] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            GrowW AI
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message, index) => (
              <React.Fragment key={index}>
                {/* Main message bubble */}
                <div
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content
                        .replace(/\[(Approve|Deny|Know\s*More)\]/gi, "")
                        .trim()}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Separate chat bubbles for each suggestion */}
                {message.role === "assistant" &&
                  message.suggestions &&
                  message.suggestions.length > 0 &&
                  message.suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex gap-3 justify-start mt-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>

                      <div className="max-w-[80%]">
                        <SuggestionActions
                          suggestion={suggestion}
                          messageIndex={index}
                          onAction={handleSuggestionAction}
                        />
                      </div>
                    </div>
                  ))}
              </React.Fragment>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 px-6 pb-6 border-t">
          <Input
            placeholder="Ask me anything about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={() => sendMessage()} size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
