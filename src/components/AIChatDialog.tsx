import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useFinancialChat } from "@/hooks/useFinancialChat";

interface AIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: "net-worth" | "assets" | "liabilities";
  netWorth: number;
  assetsTotal: number;
  liabilitiesTotal: number;
  cashTotal: number;
  investmentsTotal: number;
}

export const AIChatDialog = ({ 
  isOpen, 
  onClose, 
  viewMode, 
  netWorth, 
  assetsTotal, 
  liabilitiesTotal,
  cashTotal,
  investmentsTotal
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
      return `Hi! I'm your financial assistant. Your total liabilities are ${formatCurrency(liabilitiesTotal)}. I can help you create a debt payoff strategy, explore refinancing options, or prioritize which debts to tackle first. How can I assist you today?`;
    }
  };

  const { messages, input, setInput, isLoading, sendMessage, handleClose } = useFinancialChat({
    contextType: 'dashboard',
    contextData: {
      viewMode,
      netWorth,
      assetsTotal,
      liabilitiesTotal,
      cashTotal,
      investmentsTotal
    },
    initialMessage: getInitialMessage(),
    onClose
  });

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
            AI Financial Assistant
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pr-4">
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
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
          <Button onClick={sendMessage} size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};