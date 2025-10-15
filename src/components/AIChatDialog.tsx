import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, TrendingUp, Wallet, Building2, Target, Check, DollarSign, PiggyBank } from "lucide-react";

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
    if (viewMode === "net-worth") {
      return [
        {
          id: "nw1",
          title: "Increase retirement contributions",
          description: `Boosting your 401(k) contributions by 2% could add ${formatCurrency(150000)} to your retirement by age 65.`,
          icon: TrendingUp,
          iconColor: "bg-primary/10 text-primary border-l-primary",
          isActionable: true,
        },
        {
          id: "nw2",
          title: "Build emergency fund to 6 months",
          description: "Having 6 months of expenses in reserve will protect your investments from unexpected expenses.",
          icon: PiggyBank,
          iconColor: "bg-[hsl(var(--icon-mint))]/10 text-[hsl(var(--icon-mint))] border-l-[hsl(var(--icon-mint))]",
          isActionable: true,
        },
        {
          id: "nw3",
          title: "Consider debt consolidation",
          description: "Consolidating your loans could save ${formatCurrency(3600)}/year in interest payments.",
          icon: DollarSign,
          iconColor: "bg-[hsl(var(--icon-blue))]/10 text-[hsl(var(--icon-blue))] border-l-[hsl(var(--icon-blue))]",
          isActionable: true,
        },
      ];
    } else if (viewMode === "assets") {
      return [
        {
          id: "asset1",
          title: "Rebalance investment portfolio",
          description: "Your current allocation could benefit from more diversification across asset classes.",
          icon: TrendingUp,
          iconColor: "bg-primary/10 text-primary border-l-primary",
          isActionable: true,
        },
        {
          id: "asset2",
          title: "Open a high-yield savings account",
          description: `Moving ${formatCurrency(40000)} to a 4.5% APY account could earn an extra ${formatCurrency(1200)}/year.`,
          icon: Wallet,
          iconColor: "bg-[hsl(var(--icon-mint))]/10 text-[hsl(var(--icon-mint))] border-l-[hsl(var(--icon-mint))]",
          isActionable: true,
        },
        {
          id: "asset3",
          title: "Maximize tax-advantaged accounts",
          description: "You're not maxing out your IRA - contributing the full amount could save ${formatCurrency(1500)} in taxes.",
          icon: Target,
          iconColor: "bg-[hsl(var(--icon-cyan))]/10 text-[hsl(var(--icon-cyan))] border-l-[hsl(var(--icon-cyan))]",
          isActionable: true,
        },
      ];
    } else {
      return [
        {
          id: "liab1",
          title: "Accelerate home loan payments",
          description: `Adding ${formatCurrency(200)}/month to your mortgage could save ${formatCurrency(45000)} in interest and pay it off 5 years early.`,
          icon: Building2,
          iconColor: "bg-primary/10 text-primary border-l-primary",
          isActionable: true,
        },
        {
          id: "liab2",
          title: "Refinance education loan",
          description: "Current rates are lower - refinancing could reduce your monthly payment by ${formatCurrency(150)}/month.",
          icon: TrendingUp,
          iconColor: "bg-[hsl(var(--icon-blue))]/10 text-[hsl(var(--icon-blue))] border-l-[hsl(var(--icon-blue))]",
          isActionable: true,
        },
        {
          id: "liab3",
          title: "Debt snowball strategy",
          description: "Your vehicle loan is excellent. Focus on paying off high-interest debts first for maximum impact.",
          icon: Target,
          iconColor: "bg-[hsl(var(--icon-mint))]/10 text-[hsl(var(--icon-mint))] border-l-[hsl(var(--icon-mint))]",
          isActionable: false,
        },
      ];
    }
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
      setDeniedRecommendations(new Set());
    }
  }, [isOpen, viewMode]);

  const handleApprove = (rec: Recommendation) => {
    const approveMessage: Message = {
      role: "assistant",
      content: `Perfect! I've executed "${rec.title}". ${rec.description} This change has been implemented and you'll see the impact on your portfolio shortly.`,
    };
    setMessages((prev) => [...prev, approveMessage]);
    setDeniedRecommendations((prev) => new Set([...prev, rec.id]));
  };

  const handleDeny = (rec: Recommendation) => {
    setDeniedRecommendations((prev) => new Set([...prev, rec.id]));
  };

  const handleKnowMore = (rec: Recommendation) => {
    let detailedExplanation = "";
    
    if (rec.id === "nw1") {
      detailedExplanation = `Increasing your retirement contributions is one of the most impactful decisions:\n\n1. **Compound Growth**: A 2% increase now means ${formatCurrency(150000)}+ more at retirement due to decades of compound returns.\n\n2. **Tax Advantages**: Contributions reduce your current taxable income while growing tax-deferred.\n\n3. **Portfolio Impact**: This accelerates your path to financial independence and reduces the pressure on other investments.\n\n4. **Employer Match**: Many employers match contributions - you might be leaving free money on the table.`;
    } else if (rec.id === "nw2") {
      detailedExplanation = `A fully-funded emergency fund is the foundation of financial security:\n\n1. **Investment Protection**: Prevents forced liquidation of investments during emergencies, preserving long-term growth.\n\n2. **Net Worth Stability**: Acts as a buffer that prevents your net worth from declining during unexpected expenses.\n\n3. **Risk Management**: Allows you to take appropriate investment risks knowing you have a safety net.\n\n4. **Peace of Mind**: Reduces financial stress and enables better long-term decision making across your entire portfolio.`;
    } else if (rec.id === "nw3") {
      detailedExplanation = `Debt consolidation can dramatically improve your financial position:\n\n1. **Interest Savings**: ${formatCurrency(3600)}/year in savings directly increases your net worth and cash flow.\n\n2. **Simplified Management**: One payment instead of multiple reduces the chance of missed payments and credit damage.\n\n3. **Debt-Free Faster**: Lower interest means more of each payment goes to principal, accelerating payoff.\n\n4. **Portfolio Impact**: The freed-up cash flow can be redirected to investments, potentially doubling the benefit.`;
    } else if (rec.id === "asset1") {
      detailedExplanation = `Portfolio rebalancing is crucial for optimal returns:\n\n1. **Risk Management**: Proper diversification reduces volatility by 30-40% without sacrificing returns.\n\n2. **Return Optimization**: Academic research shows well-diversified portfolios outperform concentrated ones over time.\n\n3. **Market Cycles**: Different asset classes perform well in different conditions - diversification smooths your returns.\n\n4. **Goal Alignment**: Ensures your investments match your risk tolerance and time horizon.`;
    } else if (rec.id === "asset2") {
      detailedExplanation = `High-yield savings accounts maximize your cash returns:\n\n1. **Free Money**: ${formatCurrency(1200)}/year in additional interest is essentially a risk-free return.\n\n2. **Liquidity**: Same accessibility as regular savings, but with 4-6x higher returns.\n\n3. **Portfolio Efficiency**: Every dollar should work as hard as possible - this improves your overall portfolio performance.\n\n4. **Inflation Protection**: Higher yields help preserve purchasing power over time.`;
    } else if (rec.id === "asset3") {
      detailedExplanation = `Maximizing tax-advantaged accounts is a powerful wealth-building strategy:\n\n1. **Tax Savings**: ${formatCurrency(1500)}/year in tax savings compounds over time to significant wealth.\n\n2. **Protected Growth**: Tax-deferred growth means more money compounds faster.\n\n3. **Retirement Security**: IRAs are protected from creditors and provide guaranteed retirement income.\n\n4. **Portfolio Impact**: The tax savings can be reinvested, creating a multiplier effect on your wealth.`;
    } else if (rec.id === "liab1") {
      detailedExplanation = `Accelerating mortgage payments has far-reaching benefits:\n\n1. **Interest Savings**: ${formatCurrency(45000)} saved in interest is equivalent to earning that much tax-free.\n\n2. **Ownership Faster**: Being debt-free 5 years earlier provides immense financial flexibility and security.\n\n3. **Forced Savings**: Extra payments build equity, which is wealth you can access if needed.\n\n4. **Portfolio Impact**: Once paid off, redirect mortgage payments to investments for exponential wealth growth.`;
    } else if (rec.id === "liab2") {
      detailedExplanation = `Refinancing at lower rates improves your entire financial picture:\n\n1. **Cash Flow**: ${formatCurrency(150)}/month freed up can be invested or used to pay down other debts faster.\n\n2. **Interest Savings**: Over the loan term, you could save ${formatCurrency(10000)}+ in interest.\n\n3. **Debt-Free Faster**: Lower rates mean more principal paydown with each payment.\n\n4. **Credit Improvement**: Lower monthly obligations improve your debt-to-income ratio, opening other opportunities.`;
    } else {
      detailedExplanation = `This recommendation is designed to optimize your financial position by improving returns, reducing costs, or accelerating goal achievement. The impact extends across your entire portfolio through better cash flow management, risk reduction, and strategic growth opportunities.`;
    }
    
    const knowMoreMessage: Message = {
      role: "assistant",
      content: detailedExplanation,
    };
    setMessages((prev) => [...prev, knowMoreMessage]);
  };
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

  const recommendations = getRecommendations().filter(rec => !deniedRecommendations.has(rec.id));

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
