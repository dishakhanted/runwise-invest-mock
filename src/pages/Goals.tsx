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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  savingAccount: string;
  investmentAccount: string;
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
    },
    {
      id: "2",
      name: "House Down Payment",
      targetAmount: 100000,
      currentAmount: 45000,
      savingAccount: "Savings Account",
      investmentAccount: "Brokerage",
    },
    {
      id: "3",
      name: "Retirement at 65",
      targetAmount: 1000000,
      currentAmount: 237672,
      savingAccount: "Roth IRA",
      investmentAccount: "401(k)",
    },
  ]);

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
      setGoals([
        ...goals,
        {
          id: Date.now().toString(),
          name: newGoal.name,
          targetAmount: parseFloat(newGoal.targetAmount),
          currentAmount: parseFloat(newGoal.currentAmount),
          savingAccount: newGoal.savingAccount,
          investmentAccount: newGoal.investmentAccount,
        },
      ]);
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">Goals</h1>
          <Logo className="h-10 w-10" />
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <Collapsible key={goal.id}>
              <Card className="p-4">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} of{" "}
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  </div>
                  <Progress
                    value={getProgress(goal.currentAmount, goal.targetAmount)}
                    className="mt-3"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Saving Account:
                    </span>
                    <span className="font-medium">{goal.savingAccount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Investment Account:
                    </span>
                    <span className="font-medium">
                      {goal.investmentAccount || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-medium">
                      {Math.round(
                        getProgress(goal.currentAmount, goal.targetAmount)
                      )}
                      %
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Goal
                  </Button>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}

          {isAddingGoal ? (
            <Card className="p-4 space-y-4">
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
          ) : (
            <Button
              onClick={() => setIsAddingGoal(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Goals;
