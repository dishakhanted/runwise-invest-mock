import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Check, X } from "lucide-react";
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
  showFinancialSummary = false
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
    if (showFinancialSummary) {
      return `With your $5,200 monthly income, here's the simple game plan — about $3,700 covers your living costs, and the remaining $1,500 works for you: $500 goes to your loan, $500 builds your emergency fund in liquid investments, and $500 grows in medium-risk retirement and home funds — every dollar has a job this year.`;
    }
    
    if (viewMode === "net-worth") {
      return `Hi! I'm your financial assistant. Your current net worth is ${formatCurrency(netWorth)}. You have ${formatCurrency(assetsTotal)} in assets and ${formatCurrency(liabilitiesTotal)} in liabilities. Here are some suggestions to optimize your financial strategy:`;
    } else if (viewMode === "assets") {
      return `Hi! I'm your financial assistant. Your total assets are ${formatCurrency(assetsTotal)}, with ${formatCurrency(cashTotal)} in cash and ${formatCurrency(investmentsTotal)} in investments. Here are some recommendations:`;
    } else {
      return `Hi! I'm your financial assistant. Your total liabilities are ${formatCurrency(liabilitiesTotal)}. Here are some strategies to manage your debt:`;
    }
  };

  const getInitialSuggestions = () => {
    if (showFinancialSummary) {
      return [
        {
          id: 'suggestion-1',
          title: 'Increase Education Loan Payment',
          description: "Hey, Right now, you're paying $320 a month on your student loan. If you bump that to $500, you'll be completely debt-free in 36 months. That's an extra $180 a month, roughly what you spend on takeout and Ubers. Should I do it for you?",
          status: 'pending' as const
        },
        {
          id: 'suggestion-2',
          title: 'Build Emergency Fund of 6 Months',
          description: "You've got $5,800 saved, about two months of expenses. Let's make that six months ($18K). To do that, shall I auto transfer $500 a month into it. By this time next year, you'll have a real cushion.",
          status: 'pending' as const
        }
      ];
    }
    
    if (viewMode === "net-worth") {
      return [
        {
          id: 'suggestion-1',
          title: 'Increase Investment Allocation',
          description: 'Consider increasing your investment percentage by 5% to accelerate wealth building.',
          status: 'pending' as const
        },
        {
          id: 'suggestion-2',
          title: 'Review Monthly Expenses',
          description: 'Analyze your spending to identify areas where you can save $500/month.',
          status: 'pending' as const
        }
      ];
    } else if (viewMode === "assets") {
      return [
        {
          id: 'suggestion-1',
          title: 'Diversify Investments',
          description: 'Consider diversifying your portfolio with international stocks for better returns.',
          status: 'pending' as const
        },
        {
          id: 'suggestion-2',
          title: 'High-Yield Savings',
          description: 'Move some cash to a high-yield savings account earning 4.5% APY.',
          status: 'pending' as const
        }
      ];
    } else {
      return [
        {
          id: 'suggestion-1',
          title: 'Debt Avalanche Method',
          description: 'Focus on paying off highest-interest debt first to save on interest charges.',
          status: 'pending' as const
        },
        {
          id: 'suggestion-2',
          title: 'Consider Refinancing',
          description: 'Explore refinancing options that could lower your interest rates by 2%.',
          status: 'pending' as const
        }
      ];
    }
  };

  const { messages, input, setInput, isLoading, sendMessage, handleClose, handleSuggestionAction } = useFinancialChat({
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
    initialSuggestions: getInitialSuggestions(),
    onClose
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
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
            AI Financial Assistant
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
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
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion) => (
                        <div 
                          key={suggestion.id}
                          className="bg-background/50 rounded-lg p-3 border border-border"
                        >
                          <p className="text-sm font-medium mb-1">{suggestion.title}</p>
                          <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                          
                          {suggestion.status === 'pending' && (
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex-1 h-8"
                                  onClick={() => handleSuggestionAction(index, suggestion.id, 'approved')}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8"
                                  onClick={() => handleSuggestionAction(index, suggestion.id, 'denied')}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Deny
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full h-8"
                                onClick={() => handleSuggestionAction(index, suggestion.id, 'know_more')}
                              >
                                Know more
                              </Button>
                            </div>
                          )}
                          
                          {suggestion.status === 'approved' && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Check className="h-3 w-3" />
                              Approved
                            </div>
                          )}
                          
                          {suggestion.status === 'denied' && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <X className="h-3 w-3" />
                              Denied
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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