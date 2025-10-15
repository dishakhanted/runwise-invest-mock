import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: "net-worth" | "assets" | "liabilities";
  netWorth: number;
  assetsTotal: number;
  liabilitiesTotal: number;
  cashTotal: number;
  investmentsTotal: number;
  homeLoan: number;
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
  homeLoan
}: AIChatDialogProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitialMessage = () => {
    if (viewMode === "net-worth") {
      return `Hi! I'm your financial assistant. Your current net worth is ${formatCurrency(netWorth)}. You have ${formatCurrency(assetsTotal)} in assets and ${formatCurrency(liabilitiesTotal)} in liabilities. You're making great progress toward your retirement goal! How can I help you optimize your financial strategy today?`;
    } else if (viewMode === "assets") {
      return `Hi! I'm your financial assistant. Your total assets are ${formatCurrency(assetsTotal)}, with ${formatCurrency(cashTotal)} in cash and ${formatCurrency(investmentsTotal)} in investments. I can help you optimize your portfolio allocation, find better investment opportunities, or discuss your savings strategy. What would you like to explore?`;
    } else {
      return `Hi! I'm your financial assistant. Your total liabilities are ${formatCurrency(liabilitiesTotal)}, including your home loan of ${formatCurrency(homeLoan)}. I can help you create a debt payoff strategy, explore refinancing options, or prioritize which debts to tackle first. How can I assist you today?`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getInitialMessage(),
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          role: "assistant",
          content: getInitialMessage(),
        },
      ]);
    }
  }, [isOpen, viewMode]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Mock AI response
    setTimeout(() => {
      const mockResponses = [
        "That's a great question! I'm currently a mock assistant, but soon I'll be able to provide personalized financial insights.",
        "I understand. Once fully integrated, I'll be able to analyze your portfolio and provide detailed recommendations.",
        "Interesting! I'll be able to help you with budgeting, investment strategies, and financial planning soon.",
        "Based on your portfolio, I can help you optimize your investments and reach your financial goals faster.",
      ];
      const mockResponse: Message = {
        role: "assistant",
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      };
      setMessages((prev) => [...prev, mockResponse]);
    }, 1000);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Financial Assistant
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
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
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Ask me anything about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
