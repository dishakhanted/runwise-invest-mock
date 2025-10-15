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
  const [step, setStep] = useState(1);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNext = () => {
    if (!goalName || !targetAmount || !targetAge) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const initialMessage: Message = {
      role: "assistant",
      content: `Great! I'm here to help you plan for "${goalName}". Let me summarize what you've told me:

📊 **Goal Overview:**
- **Target Amount:** ${formatCurrency(parseInt(targetAmount))}
- **Target Age:** ${targetAge} years old
- **Current Age:** 35 years (example)
- **Time Horizon:** ${parseInt(targetAge) - 35} years

💡 **Initial Suggestions:**

1. **Monthly Savings Required:** Based on your target, you'd need to save approximately ${formatCurrency(parseInt(targetAmount) / ((parseInt(targetAge) - 35) * 12))} per month.

2. **Investment Strategy:** With a ${parseInt(targetAge) - 35}-year timeline, you could consider a balanced portfolio with growth potential.

3. **Account Recommendations:** Consider linking a high-yield savings account or investment account to automate your contributions.

What questions do you have about this goal? Would you like suggestions on where to save or invest?`,
    };

    setMessages([initialMessage]);
    setStep(2);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const responses = [
        "That's a great question! For a long-term goal like this, I'd recommend a diversified portfolio with 70% stocks and 30% bonds to balance growth and stability.",
        "Based on your timeline, you have time to weather market fluctuations. Consider maxing out tax-advantaged accounts first, like a Roth IRA.",
        "To stay on track, I recommend setting up automatic monthly transfers. Would you like me to help you calculate the exact amount based on expected returns?",
        "Good thinking! You might also want to review this goal annually and adjust your contributions as your income grows.",
      ];
      
      const assistantMessage: Message = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateGoal = () => {
    toast({
      title: "Goal Created!",
      description: `Your goal "${goalName}" has been created successfully.`,
    });

    setStep(1);
    setGoalName("");
    setTargetAmount("");
    setTargetAge("");
    setMessages([]);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setMessages([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {step === 1 ? "Create New Goal" : `Planning: ${goalName}`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name *</Label>
              <Input
                id="goalName"
                placeholder="e.g., Dream Vacation, New Car, Retirement"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAge">Target Age *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetAge"
                  type="number"
                  placeholder="45"
                  value={targetAge}
                  onChange={(e) => setTargetAge(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        ) : (
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
                placeholder="Ask a question or request suggestions..."
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
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleCreateGoal} className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
