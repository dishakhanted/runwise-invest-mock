import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [goals, setGoals] = useState<Goal[]>([
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
  
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || "");

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    savingAccount: "",
    investmentAccount: "",
  });

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

  const addGoal = () => {
    if (
      newGoal.name &&
      newGoal.targetAmount &&
      newGoal.currentAmount &&
      newGoal.savingAccount
    ) {
      const newGoalData = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: parseFloat(newGoal.currentAmount),
        savingAccount: newGoal.savingAccount,
        investmentAccount: newGoal.investmentAccount,
        allocation: { savings: 50, stocks: 30, bonds: 20 },
      };
      setGoals([...goals, newGoalData]);
      setSelectedGoalId(newGoalData.id);
      setNewGoal({
        name: "",
        targetAmount: "",
        currentAmount: "",
        savingAccount: "",
        investmentAccount: "",
      });
      setIsAddingGoal(false);
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">Goals</h1>
          <Logo className="h-10 w-10" />
        </div>

        <Tabs value={selectedGoalId} onValueChange={setSelectedGoalId}>
          <TabsList className="w-full mb-6 overflow-x-auto flex justify-start">
            {goals.map((goal) => (
              <TabsTrigger key={goal.id} value={goal.id} className="flex-shrink-0">
                {goal.name}
              </TabsTrigger>
            ))}
            {!isAddingGoal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingGoal(true)}
                className="flex-shrink-0 ml-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </TabsList>

          {goals.map((goal) => (
            <TabsContent key={goal.id} value={goal.id} className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Progress</p>
                    <p className="text-3xl font-bold">{formatCurrency(goal.currentAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                      of {formatCurrency(goal.targetAmount)} goal
                    </p>
                  </div>
                  
                  <Progress
                    value={getProgress(goal.currentAmount, goal.targetAmount)}
                    className="h-3"
                  />
                  
                  <p className="text-sm font-medium text-center">
                    {Math.round(getProgress(goal.currentAmount, goal.targetAmount))}% Complete
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Fund Allocation</h3>
                
                {/* Visual allocation bars */}
                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Savings</span>
                      <span className="font-medium">{goal.allocation.savings}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${goal.allocation.savings}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency((goal.currentAmount * goal.allocation.savings) / 100)} in {goal.savingAccount}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Stocks</span>
                      <span className="font-medium">{goal.allocation.stocks}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${goal.allocation.stocks}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency((goal.currentAmount * goal.allocation.stocks) / 100)} in stocks
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Bonds</span>
                      <span className="font-medium">{goal.allocation.bonds}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-muted rounded-full"
                        style={{ width: `${goal.allocation.bonds}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency((goal.currentAmount * goal.allocation.bonds) / 100)} in bonds
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Primary Account:</span>
                    <span className="font-medium">{goal.savingAccount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investment Account:</span>
                    <span className="font-medium">{goal.investmentAccount || "None"}</span>
                  </div>
                </div>
              </Card>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  deleteGoal(goal.id);
                  if (goals.length > 1) {
                    setSelectedGoalId(goals.find(g => g.id !== goal.id)?.id || "");
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Goal
              </Button>
            </TabsContent>
          ))}
        </Tabs>

        {isAddingGoal && (
          <Card className="p-4 space-y-4 mt-6">
            <h3 className="font-semibold text-lg">Add New Goal</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, name: e.target.value })
                  }
                  placeholder="e.g., Vacation Fund"
                />
              </div>
              <div>
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetAmount: e.target.value })
                  }
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="currentAmount">Current Amount</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, currentAmount: e.target.value })
                  }
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="savingAccount">Saving Account</Label>
                <Select
                  value={newGoal.savingAccount}
                  onValueChange={(value) =>
                    setNewGoal({ ...newGoal, savingAccount: value })
                  }
                >
                  <SelectTrigger id="savingAccount">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High Yield Savings">
                      High Yield Savings
                    </SelectItem>
                    <SelectItem value="Savings Account">
                      Savings Account
                    </SelectItem>
                    <SelectItem value="Roth IRA">Roth IRA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="investmentAccount">
                  Investment Account (Optional)
                </Label>
                <Select
                  value={newGoal.investmentAccount}
                  onValueChange={(value) =>
                    setNewGoal({ ...newGoal, investmentAccount: value })
                  }
                >
                  <SelectTrigger id="investmentAccount">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Brokerage">Brokerage</SelectItem>
                    <SelectItem value="401(k)">401(k)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addGoal} className="flex-1">
                Add Goal
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingGoal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Goals;
