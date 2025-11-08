import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Check, X } from "lucide-react";
import { useFinancialChat } from "@/hooks/useFinancialChat";
import { useMemo } from "react";
import React from "react";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  savingAccount: string;
  investmentAccount: string;
  description?: string;
  allocation: {
    savings: number;
    stocks: number;
    bonds: number;
  };
}

interface GoalAIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

export const GoalAIChatDialog = ({ isOpen, onClose, goal }: GoalAIChatDialogProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isHouseGoal = goal?.name.toLowerCase().includes('house') || 
                      goal?.name.toLowerCase().includes('home') || 
                      goal?.name.toLowerCase().includes('down payment');

  const getInitialMessage = () => {
    if (!goal) return "Hi! I'm your financial assistant. How can I help you today?";
    
    if (isHouseGoal) {
      return `Hi! I'm your financial assistant. You're working toward "${goal.name}" with a target of ${formatCurrency(goal.targetAmount)}. I'm here to help you with your housing goals!`;
    }
    
    const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0);
    const remaining = goal.targetAmount - goal.currentAmount;
    
    let allocationMessage = "";
    if (goal.allocation.savings > 0) {
      allocationMessage += `${goal.allocation.savings}% in savings`;
    }
    if (goal.allocation.stocks > 0) {
      if (allocationMessage) allocationMessage += ", ";
      allocationMessage += `${goal.allocation.stocks}% in stocks`;
    }
    if (goal.allocation.bonds > 0) {
      if (allocationMessage) allocationMessage += ", ";
      allocationMessage += `${goal.allocation.bonds}% in bonds`;
    }

    return `Hi! I'm your financial assistant. You're working toward "${goal.name}" with a target of ${formatCurrency(goal.targetAmount)}. You've saved ${formatCurrency(goal.currentAmount)} so far (${progress}% complete). Here are some strategies to help you reach your goal:`;
  };

  const getInitialSuggestions = () => {
    if (!goal) return [];
    
    if (isHouseGoal) {
      return [];
    }
    
    const monthsRemaining = 24; // Calculate based on goal timeline
    const monthlyNeeded = (goal.targetAmount - goal.currentAmount) / monthsRemaining;
    
    return [
      {
        id: 'suggestion-1',
        title: 'Increase Monthly Contribution',
        description: `Add $${Math.round(monthlyNeeded * 0.2)} to your monthly savings to reach your goal 4 months earlier.`,
        status: 'pending' as const
      },
      {
        id: 'suggestion-2',
        title: 'Optimize Asset Allocation',
        description: `Shift 10% from savings to stocks for potential higher returns while maintaining your risk level.`,
        status: 'pending' as const
      }
    ];
  };

  const initialMessageMemo = useMemo(() => getInitialMessage(), [goal]);
  const initialSuggestionsMemo = useMemo(() => getInitialSuggestions(), [goal]);

  const { messages, input, setInput, isLoading, sendMessage, handleClose, handleSuggestionAction, addHardcodedMessages } = useFinancialChat({
    contextType: 'goal',
    contextData: goal ? { ...goal, id: goal.id } : null,
    initialMessage: initialMessageMemo,
    initialSuggestions: initialSuggestionsMemo,
    onClose
  });

  const [conversationStep, setConversationStep] = React.useState<'initial' | 'asked-location' | 'waiting-for-approval'>('initial');

  // Handle custom message sending for house goals
  const handleHouseGoalMessage = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    // Step 1: User asks if target is enough
    if (conversationStep === 'initial' && (lowerInput.includes('target enough') || lowerInput.includes('is the target') || lowerInput.includes('enough for'))) {
      addHardcodedMessages([
        { role: 'user', content: userInput },
        { 
          role: 'assistant', 
          content: `It's great you're working towards your "${goal?.name}"! To determine if your target of ${formatCurrency(goal?.targetAmount || 0)} is enough, we need more information.

**Please consider the following:**

1. **What type of home are you aiming for?** (e.g., down payment for a house, full cost of a small condo, land purchase, renovations, etc.)
2. **Where are you looking to buy/build?** (Real estate costs vary wildly by location.)` 
        }
      ]);
      setConversationStep('asked-location');
      setInput('');
      return true;
    }
    
    // Step 2: User responds about location/type
    if (conversationStep === 'asked-location') {
      addHardcodedMessages([
        { role: 'user', content: userInput },
        {
          role: 'assistant',
          content: 'Based on your preferences, the current market prices are higher than your target.',
          suggestions: [
            {
              id: 'increase-target',
              title: 'Increase Target to $125,000',
              description: 'Adjust your goal target to $125,000 to match current market prices for your desired home type and location.',
              status: 'pending' as const
            }
          ]
        }
      ]);
      setConversationStep('waiting-for-approval');
      setInput('');
      return true;
    }
    
    return false;
  };

  const handleSendMessage = () => {
    if (isHouseGoal && handleHouseGoalMessage(input)) {
      return;
    }
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] max-h-[85vh] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            GrowW AI {goal && `- ${goal.name}`}
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
            placeholder={`Ask about your ${goal?.name} goal...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};