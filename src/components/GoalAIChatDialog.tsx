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
  initialSummary?: string;
}

export const GoalAIChatDialog = ({ isOpen, onClose, goal, initialSummary }: GoalAIChatDialogProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isHouseGoal =
    goal?.name.toLowerCase().includes("house") ||
    goal?.name.toLowerCase().includes("home") ||
    goal?.name.toLowerCase().includes("down payment");

  const initialMessageMemo = useMemo(() => initialSummary || "", [initialSummary]);
  const initialSuggestionsMemo = useMemo(() => [], [goal]);

  const {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleClose,
    handleSuggestionAction,
  } = useFinancialChat({
    contextType: "goal",
    contextData: goal ? { ...goal, id: goal.id } : null,
    initialMessage: initialMessageMemo,
    initialSuggestions: initialSuggestionsMemo,
    onClose,
  });

  const handleSendMessage = () => {
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
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Suggestions with styled buttons */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="bg-background/50 rounded-lg p-3 border border-border">
                          <p className="text-sm font-medium mb-1">{suggestion.title}</p>
                          <p className="text-xs text-muted-foreground mb-3">{suggestion.description}</p>

                          {suggestion.status === "pending" && (
                            <div className="flex gap-2 items-center flex-wrap">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleSuggestionAction(index, suggestion.id, "approved")}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuggestionAction(index, suggestion.id, "denied")}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Deny
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-primary hover:text-primary/80"
                                onClick={() => handleSuggestionAction(index, suggestion.id, "know_more")}
                              >
                                Know more
                              </Button>
                            </div>
                          )}

                          {suggestion.status === "approved" && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Check className="h-3 w-3" />
                              Approved
                            </div>
                          )}

                          {suggestion.status === "denied" && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <X className="h-3 w-3" />
                              Declined
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
