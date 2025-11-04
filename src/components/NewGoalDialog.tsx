import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Target, Send, Sparkles, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const NewGoalDialog = ({ isOpen, onClose }: NewGoalDialogProps) => {
  const { toast } = useToast();
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<"name" | "amount" | "age" | "chat">("name");
  const [isComplete, setIsComplete] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Initialize with first question when dialog opens
  const initializeChat = () => {
    if (messages.length === 0 && isOpen) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: "Hi! I'm here to help you create a financial goal. Let's start by naming your goal. What would you like to save for? (e.g., Dream Vacation, New Car, Retirement)",
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      let assistantMessage: Message;

      if (currentQuestion === "name") {
        setGoalName(input);
        assistantMessage = {
          role: "assistant",
          content: `Great! "${input}" is a wonderful goal. Now, how much money do you need to reach this goal? Please enter a target amount in dollars.`,
        };
        setCurrentQuestion("amount");
      } else if (currentQuestion === "amount") {
        const amount = parseInt(input.replace(/[^0-9]/g, ""));
        if (isNaN(amount)) {
          assistantMessage = {
            role: "assistant",
            content: "I didn't quite get that. Please enter a number for your target amount (e.g., 50000).",
          };
        } else {
          setTargetAmount(amount.toString());
          assistantMessage = {
            role: "assistant",
            content: `Perfect! ${formatCurrency(amount)} for your "${goalName}". At what age would you like to achieve this goal?`,
          };
          setCurrentQuestion("age");
        }
      } else if (currentQuestion === "age") {
        const age = parseInt(input.replace(/[^0-9]/g, ""));
        if (isNaN(age) || age < 18 || age > 100) {
          assistantMessage = {
            role: "assistant",
            content: "Please enter a valid age between 18 and 100.",
          };
        } else {
          setTargetAge(age.toString());
          const timeHorizon = age - 35; // assuming current age 35
          assistantMessage = {
            role: "assistant",
            content: `Excellent! Let me summarize your goal:

📊 **${goalName}**
- **Target Amount:** ${formatCurrency(parseInt(targetAmount))}
- **Target Age:** ${age} years old
- **Time Horizon:** ${timeHorizon} years

💡 **Initial Suggestions:**

1. **Monthly Savings:** You'd need to save approximately ${formatCurrency(parseInt(targetAmount) / (timeHorizon * 12))} per month.

2. **Investment Strategy:** With a ${timeHorizon}-year timeline, consider a balanced portfolio.

3. **Next Steps:** Link a savings or investment account to automate contributions.

Do you have any questions about this goal, or are you ready to create it?`,
          };
          setCurrentQuestion("chat");
          setIsComplete(true);
        }
      } else {
        // Chat mode - provide helpful responses
        const responses = [
          "That's a great question! For long-term goals, I'd recommend a diversified portfolio with 70% stocks and 30% bonds.",
          "Based on your timeline, consider maxing out tax-advantaged accounts first, like a Roth IRA or 401(k).",
          "To stay on track, set up automatic monthly transfers. This makes saving effortless!",
          "Review this goal annually and adjust your contributions as your income grows.",
        ];
        assistantMessage = {
          role: "assistant",
          content: responses[Math.floor(Math.random() * responses.length)],
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateGoal = () => {
    if (!goalName || !targetAmount || !targetAge) {
      toast({
        title: "Incomplete Information",
        description: "Please answer all the questions first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Goal Created!",
      description: `Your goal "${goalName}" has been created successfully.`,
    });

    // Reset state
    setGoalName("");
    setTargetAmount("");
    setTargetAge("");
    setMessages([]);
    setCurrentQuestion("name");
    setIsComplete(false);
    onClose();
  };

  // Initialize chat when dialog opens
  if (isOpen && messages.length === 0) {
    initializeChat();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <Card
                    className={`p-3 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder={
                currentQuestion === "chat" 
                  ? "Ask a question or say 'ready' to create goal..." 
                  : "Type your answer..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {isComplete && (
              <Button onClick={handleCreateGoal} className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
