import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, TrendingUp, Wallet, Building2, Target, Check } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  isActionable: boolean;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  savingAccount: string;
  investmentAccount: string;
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
  const [deniedRecommendations, setDeniedRecommendations] = useState<Set<string>>(new Set());
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRecommendations = (): Recommendation[] => {
    if (!goal) return [];
    
    if (goal.id === "1") {
      return [
        {
          id: "rec1",
          title: "Increase your monthly contribution",
          description: `Adding just $500/month could help you reach your ${formatCurrency(50000)} emergency fund goal 8 months faster.`,
          icon: TrendingUp,
          iconColor: "bg-primary/10 text-primary border-l-primary",
          isActionable: true,
        },
        {
          id: "rec2",
          title: "Consider a high-yield savings account",
          description: `Current top rates offer 4.5% APY vs your current 3.75% - that's an extra ${formatCurrency(150)}/year.`,
          icon: Wallet,
          iconColor: "bg-[hsl(var(--icon-mint))]/10 text-[hsl(var(--icon-mint))] border-l-[hsl(var(--icon-mint))]",
          isActionable: true,
        },
      ];
    } else if (goal.id === "2") {
      return [
        {
          id: "rec3",
          title: "Optimize your stock allocation",
          description: "Your current 50% stocks allocation is good, but consider diversifying with index funds for stable growth.",
          icon: TrendingUp,
          iconColor: "bg-primary/10 text-primary border-l-primary",
          isActionable: true,
        },
        {
          id: "rec4",
          title: "Take advantage of market dips",
          description: "Set up automatic investing during market corrections to maximize your down payment growth potential.",
          icon: Building2,
          iconColor: "bg-[hsl(var(--icon-blue))]/10 text-[hsl(var(--icon-blue))] border-l-[hsl(var(--icon-blue))]",
          isActionable: true,
        },
        {
          id: "rec5",
          title: "Reduce spending on non-essentials",
          description: `Cutting just $200/month from dining out could add ${formatCurrency(2400)}/year to your down payment fund.`,
          icon: Wallet,
          iconColor: "bg-[hsl(var(--icon-mint))]/10 text-[hsl(var(--icon-mint))] border-l-[hsl(var(--icon-mint))]",
          isActionable: false,
        },
      ];
    } else if (goal.id === "3") {
      return [
        {
          id: "rec6",
          title: "You're on track!",
          description: `At your current pace, you'll exceed your ${formatCurrency(1000000)} retirement goal by age 65. Great work!`,
          icon: TrendingUp,
          iconColor: "bg-primary/10 text-primary border-l-primary",
          isActionable: false,
        },
        {
          id: "rec7",
          title: "Consider increasing bond allocation",
          description: "As you approach retirement, gradually shifting to 30% bonds can help protect your gains.",
          icon: Building2,
          iconColor: "bg-[hsl(var(--icon-blue))]/10 text-[hsl(var(--icon-blue))] border-l-[hsl(var(--icon-blue))]",
          isActionable: true,
        },
        {
          id: "rec8",
          title: "Maximize employer match",
          description: "Make sure you're contributing enough to your 401(k) to get the full company match - it's free money!",
          icon: Target,
          iconColor: "bg-[hsl(var(--icon-cyan))]/10 text-[hsl(var(--icon-cyan))] border-l-[hsl(var(--icon-cyan))]",
          isActionable: true,
        },
      ];
    }
    return [];
  };

  const getInitialMessage = () => {
    if (!goal) return "Hi! I'm your financial assistant. How can I help you today?";
    
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

    return `Hi! I'm your financial assistant. You're working toward "${goal.name}" with a target of ${formatCurrency(goal.targetAmount)}. You've saved ${formatCurrency(goal.currentAmount)} so far (${progress}% complete), with ${formatCurrency(remaining)} remaining. Your current allocation is ${allocationMessage}. I can help you optimize your strategy, adjust your allocation, or explore ways to reach your goal faster. What would you like to discuss?`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getInitialMessage(),
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (isOpen && goal) {
      setMessages([
        {
          role: "assistant",
          content: getInitialMessage(),
        },
      ]);
      setDeniedRecommendations(new Set());
    }
  }, [isOpen, goal]);

  const handleApprove = (rec: Recommendation) => {
    const approveMessage: Message = {
      role: "assistant",
      content: `Perfect! I've executed "${rec.title}". ${rec.description} This change has been implemented and you'll see the impact on your ${goal?.name} goal in your next portfolio update.`,
    };
    setMessages((prev) => [...prev, approveMessage]);
    setDeniedRecommendations((prev) => new Set([...prev, rec.id]));
  };

  const handleDeny = (rec: Recommendation) => {
    setDeniedRecommendations((prev) => new Set([...prev, rec.id]));
  };

  const handleKnowMore = (rec: Recommendation) => {
    let detailedExplanation = "";
    
    if (rec.id === "rec1") {
      detailedExplanation = `Increasing your monthly contribution by $500 is a powerful strategy for several reasons:\n\n1. **Time Value**: The earlier you reach your emergency fund goal, the sooner you can redirect funds to other wealth-building goals.\n\n2. **Security**: A fully-funded emergency fund protects your other investments from being liquidated during unexpected expenses.\n\n3. **Portfolio Impact**: Once your emergency fund is complete, that $500/month can be allocated to higher-return investments, potentially adding $200,000+ to your retirement portfolio over time.\n\n4. **Peace of Mind**: Financial security reduces stress and allows for better long-term decision making across your entire portfolio.`;
    } else if (rec.id === "rec2") {
      detailedExplanation = `Switching to a high-yield savings account is a low-risk, high-impact move:\n\n1. **Additional Returns**: The 0.75% APY difference translates to $${(50000 * 0.0075).toFixed(0)} annually at your target amount - that's compound growth without additional risk.\n\n2. **Liquidity**: High-yield savings accounts maintain the same liquidity as traditional accounts, crucial for emergency funds.\n\n3. **Portfolio Efficiency**: Every dollar earning optimal returns improves your overall portfolio performance.\n\n4. **Inflation Protection**: Higher yields help preserve purchasing power over time, protecting your emergency fund's real value.`;
    } else if (rec.id === "rec3") {
      detailedExplanation = `Optimizing your stock allocation with index funds offers significant advantages:\n\n1. **Diversification**: Index funds spread risk across hundreds of companies, reducing individual stock volatility.\n\n2. **Lower Costs**: Passive index funds typically have expense ratios 90% lower than active funds, meaning more returns stay in your portfolio.\n\n3. **Proven Performance**: Over 15-year periods, index funds outperform 90% of actively managed funds.\n\n4. **Time Efficiency**: As you approach your down payment goal, stable growth becomes more important than maximum returns.`;
    } else if (rec.id === "rec4") {
      detailedExplanation = `Automatic investing during market corrections is a proven wealth-building strategy:\n\n1. **Buy Low**: Market dips offer discounted entry points that can significantly boost long-term returns.\n\n2. **Emotion-Free**: Automated investing removes fear-based decisions that cause many investors to miss opportunities.\n\n3. **Dollar-Cost Averaging**: Regular investments during volatility smooth out your cost basis and reduce timing risk.\n\n4. **Portfolio Growth**: Historical data shows that buying during 10%+ corrections has generated 20-30% higher returns over 3-5 year periods.`;
    } else if (rec.id === "rec7") {
      detailedExplanation = `Increasing bond allocation as you approach retirement is a fundamental strategy:\n\n1. **Capital Preservation**: Bonds protect your accumulated wealth from stock market volatility when you have less time to recover from downturns.\n\n2. **Income Generation**: Bonds provide steady income through interest payments, which becomes valuable in retirement.\n\n3. **Portfolio Stability**: A 30% bond allocation can reduce portfolio volatility by 40% while maintaining strong growth potential.\n\n4. **Sequence of Returns Risk**: The 5 years before and after retirement are critical - bonds protect against negative returns during this vulnerable period.\n\n5. **Historical Performance**: The traditional 60/40 stocks/bonds allocation has delivered strong risk-adjusted returns for retirees over decades.`;
    } else if (rec.id === "rec8") {
      detailedExplanation = `Maximizing employer 401(k) match is the highest-return investment available:\n\n1. **Instant 100% Return**: Employer match is literally free money - a guaranteed return you can't get anywhere else.\n\n2. **Tax Benefits**: Contributions reduce your taxable income now, and grow tax-deferred until retirement.\n\n3. **Compound Growth**: A $3,000 annual match growing at 7% becomes $300,000 over 30 years.\n\n4. **Portfolio Foundation**: This guaranteed return improves your entire portfolio's risk-adjusted performance.\n\n5. **Retirement Security**: Missing employer match means leaving potentially $100,000-$500,000 on the table over a career.`;
    } else {
      detailedExplanation = `This recommendation is designed to optimize your financial position by improving returns, reducing risk, or accelerating goal achievement. The impact extends beyond this single goal to strengthen your overall financial portfolio through better allocation, risk management, and strategic timing.`;
    }
    
    const knowMoreMessage: Message = {
      role: "assistant",
      content: detailedExplanation,
    };
    setMessages((prev) => [...prev, knowMoreMessage]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Mock AI response
    setTimeout(() => {
      const mockResponses = [
        `Great question about your ${goal?.name} goal! Once fully integrated, I'll provide personalized strategies to help you reach ${formatCurrency(goal?.targetAmount || 0)} faster.`,
        `I understand your concern. Based on your current progress of ${formatCurrency(goal?.currentAmount || 0)}, I can suggest optimization strategies when fully active.`,
        `That's an excellent approach! I'll be able to analyze your ${goal?.allocation.stocks}% stock allocation and recommend adjustments to maximize growth.`,
        `Good thinking! Your current ${goal?.allocation.savings}% savings allocation provides stability. I can help you find the right balance between safety and growth.`,
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

  const recommendations = getRecommendations().filter(rec => !deniedRecommendations.has(rec.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] max-h-[85vh] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Financial Assistant - {goal?.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pr-4">
            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Recommendations for you</h3>
                <div className="space-y-2">
                  {recommendations.map((rec) => {
                    const Icon = rec.icon;
                    
                    return (
                      <Card
                        key={rec.id}
                        className={`p-3 border-l-4 ${rec.iconColor.split(' ').pop()}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${rec.iconColor.split(' ').slice(0, -1).join(' ')}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                            
                            {rec.isActionable && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(rec)}
                                  className="h-8 text-xs"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeny(rec)}
                                  className="h-8 text-xs"
                                >
                                  Deny
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleKnowMore(rec)}
                                  className="h-8 text-xs"
                                >
                                  <Bot className="h-3 w-3 mr-1" />
                                  Know More
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat Messages */}
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

        <div className="flex gap-2 pt-4 px-6 pb-6 border-t">
          <Input
            placeholder={`Ask about your ${goal?.name} goal...`}
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
