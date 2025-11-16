import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFinancialChat } from "@/hooks/useFinancialChat";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  expectedReturn?: string;
  riskLevel?: string;
  timeHorizon?: string;
}

interface SuggestionDetailDialogProps {
  suggestion: Suggestion | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestionDetailDialog = ({ suggestion, isOpen, onClose }: SuggestionDetailDialogProps) => {
  const { messages, input, setInput, isLoading, sendMessage, handleClose } = useFinancialChat({
    contextType: 'general',
    contextData: {
      suggestion,
      exploreContext: 'suggestion-detail'
    },
    initialMessage: "",
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

  const handleExecute = () => {
    setInput(`I want to proceed with "${suggestion?.title}"`);
    setTimeout(() => sendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  };

  if (!suggestion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${suggestion.color} flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
              {suggestion.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg truncate">{suggestion.title}</DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6" ref={scrollRef}>
          <div className="space-y-3 py-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[85%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
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

        <div className="px-6 pb-6 pt-3 border-t space-y-2">
          <Button onClick={handleExecute} className="w-full" variant="default">
            <CheckCircle className="h-4 w-4 mr-2" />
            Execute This Strategy
          </Button>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this suggestion..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
