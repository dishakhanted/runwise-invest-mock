import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (isOpen && suggestion) {
      const initialMessage: Message = {
        role: "assistant",
        content: `I can help you with "${suggestion.title}". ${suggestion.description}\n\n${
          suggestion.expectedReturn ? `Expected Return: ${suggestion.expectedReturn}\n` : ""
        }${suggestion.riskLevel ? `Risk Level: ${suggestion.riskLevel}\n` : ""}${
          suggestion.timeHorizon ? `Time Horizon: ${suggestion.timeHorizon}\n` : ""
        }\n\nWould you like to proceed with this investment, or do you have any questions?`,
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, suggestion]);

  const handleExecute = () => {
    const confirmMessage: Message = {
      role: "assistant",
      content: `Great! I'll help you set up "${suggestion?.title}". This will be added to your portfolio. You can track its performance in your dashboard.`,
    };
    setMessages([...messages, confirmMessage]);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const aiResponses = [
        "That's a great question! This investment option is designed for long-term growth with balanced risk.",
        "Based on your portfolio, this could help diversify your holdings and reduce overall risk.",
        "This strategy typically works well when combined with regular contributions over time.",
        "The expected returns are based on historical performance, though past results don't guarantee future outcomes.",
      ];
      const aiMessage: Message = {
        role: "assistant",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 500);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  if (!suggestion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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

        <ScrollArea className="flex-1 min-h-0 px-6">
          <div className="space-y-3 py-4">
            {messages.map((message, index) => (
              <Card key={index} className={message.role === "user" ? "ml-4 sm:ml-8 bg-primary text-primary-foreground" : "mr-4 sm:mr-8"}>
                <CardContent className="p-2.5 sm:p-3">
                  <p className="text-xs sm:text-sm">{message.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 px-6 py-3 border-t flex-shrink-0">
          <Button onClick={handleExecute} className="flex-1" size="default">
            <CheckCircle className="w-4 h-4 mr-2" />
            Execute
          </Button>
          <Button onClick={onClose} variant="outline" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 px-6 pb-6 flex-shrink-0">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-sm"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
