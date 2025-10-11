import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

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

const Goals = () => {
  const [goals] = useState<Goal[]>([
    {
      id: "1",
      name: "Emergency Fund",
      targetAmount: 50000,
      currentAmount: 30000,
      savingAccount: "High Yield Savings",
      investmentAccount: "None",
      allocation: { savings: 100, stocks: 0, bonds: 0 },
    },
    {
      id: "2",
      name: "House Down Payment",
      targetAmount: 100000,
      currentAmount: 45000,
      savingAccount: "Savings Account",
      investmentAccount: "Brokerage",
      allocation: { savings: 40, stocks: 50, bonds: 10 },
    },
    {
      id: "3",
      name: "Retirement at 65",
      targetAmount: 1000000,
      currentAmount: 237672,
      savingAccount: "Roth IRA",
      investmentAccount: "401(k)",
      allocation: { savings: 20, stocks: 60, bonds: 20 },
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">Goals</h1>
          <Logo className="h-10 w-10" />
        </div>

        {/* Horizontal Goal Cards */}
        <div className="flex gap-4 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {goals.map((goal) => (
            <Card
              key={goal.id}
              className="min-w-[280px] p-4 flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{goal.name}</h3>
              
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current</span>
                  <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>

              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${getProgress(goal.currentAmount, goal.targetAmount)}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(getProgress(goal.currentAmount, goal.targetAmount))}% Complete
              </p>

              {/* Fund Allocation */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Funds Allocated From:</p>
                
                {goal.allocation.savings > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Savings</span>
                    <span className="font-medium">{goal.allocation.savings}%</span>
                  </div>
                )}
                
                {goal.allocation.stocks > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Stocks</span>
                    <span className="font-medium">{goal.allocation.stocks}%</span>
                  </div>
                )}
                
                {goal.allocation.bonds > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Bonds</span>
                    <span className="font-medium">{goal.allocation.bonds}%</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
          
          {/* Add Goal Card */}
          <Card className="min-w-[280px] p-4 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Add New Goal</p>
            </div>
          </Card>
        </div>

        {/* Progression Chart */}
        <div className="relative w-full h-48 mb-8">
          <svg
            viewBox="0 0 400 150"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--chart-gradient-start))" />
                <stop offset="100%" stopColor="hsl(var(--chart-gradient-end))" />
              </linearGradient>
            </defs>

            {/* Curved line showing progression */}
            <path
              d="M 20 100 Q 120 80, 200 70 T 380 50"
              fill="none"
              stroke="url(#goalGradient)"
              strokeWidth="3"
              className="drop-shadow-lg"
            />

            {/* Goal markers on the line */}
            {goals.map((goal, index) => {
              const x = 20 + (index * 180);
              const y = 100 - (index * 25);
              const progress = getProgress(goal.currentAmount, goal.targetAmount);
              
              return (
                <g key={goal.id}>
                  {/* Outer circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  {/* Inner circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill="hsl(var(--primary))"
                  />
                  {/* Progress indicator */}
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="hsl(var(--background))"
                  />
                  {/* Progress fill */}
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="hsl(var(--primary))"
                    style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Labels below chart */}
          <div className="flex justify-between mt-4 px-2">
            <span className="text-xs text-muted-foreground">Today</span>
            <span className="text-xs text-muted-foreground">Future Goals</span>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Goals;
