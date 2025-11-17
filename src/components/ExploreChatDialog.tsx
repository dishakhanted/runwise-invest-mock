import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useFinancialChat } from "@/hooks/useFinancialChat";
import { SuggestionActions } from "@/components/SuggestionActions";

interface ExploreChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: "market-insights" | "finshorts" | "what-if" | "alternate-investments" | "tax-loss-harvesting";
  contextData?: Record<string, any>;
}

export const ExploreChatDialog = ({
  isOpen,
  onClose,
  contextType,
  contextData = {},
}: ExploreChatDialogProps) => {
  const { messages, input, setInput, isLoading, sendMessage, handleClose, handleSuggestionAction } = useFinancialChat({
    contextType: contextType,
    contextData: contextData,
    initialMessage: contextData?.initialInsight || "",
    initialSuggestions: [],
    onClose,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

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
                    {contextType === 'market-insights' && index === 0 && message.role === 'assistant' && (
                      <button
                        onClick={() => sendMessage('Know More')}
                        className="mt-3 text-sm text-primary hover:underline font-medium block"
                        disabled={isLoading}
                      >
                        Know More
                      </button>
                    )}
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
            {isLoading && (
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

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
