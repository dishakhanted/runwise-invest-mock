import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  savingAccount: string;
  investmentAccount: string;
}

interface GoalsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultGoals: Goal[] = [
  {
    id: "1",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 3500,
    savingAccount: "Chase Savings",
    investmentAccount: "Fidelity IRA",
  },
  {
    id: "2",
    name: "House Down Payment",
    targetAmount: 50000,
    currentAmount: 12000,
    savingAccount: "Marcus HYSA",
    investmentAccount: "Vanguard Index Fund",
  },
  {
    id: "3",
    name: "Vacation Fund",
    targetAmount: 5000,
    currentAmount: 1200,
    savingAccount: "Ally Savings",
    investmentAccount: "Robinhood",
  },
];

const savingAccounts = ["Chase Savings", "Marcus HYSA", "Ally Savings", "Other"];
const investmentAccounts = ["Fidelity IRA", "Vanguard Index Fund", "Robinhood", "Other"];

export const GoalsDialog = ({ isOpen, onClose }: GoalsDialogProps) => {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    savingAccount: "",
    investmentAccount: "",
  });

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.savingAccount || !newGoal.investmentAccount) {
      toast.error("Please fill in all fields");
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount || 0,
      savingAccount: newGoal.savingAccount,
      investmentAccount: newGoal.investmentAccount,
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      savingAccount: "",
      investmentAccount: "",
    });
    setIsAddingGoal(false);
    toast.success("Goal added successfully");
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
    toast.success("Goal deleted");
  };

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Financial Goals</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-secondary p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{goal.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteGoal(goal.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${getProgress(goal.currentAmount, goal.targetAmount)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Saving Account</p>
                  <p className="font-medium">{goal.savingAccount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Investment Account</p>
                  <p className="font-medium">{goal.investmentAccount}</p>
                </div>
              </div>
            </div>
          ))}

          {isAddingGoal ? (
            <div className="bg-secondary p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-semibold">Add New Goal</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    placeholder="e.g., New Car"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target-amount">Target Amount ($)</Label>
                    <Input
                      id="target-amount"
                      type="number"
                      value={newGoal.targetAmount || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="current-amount">Current Amount ($)</Label>
                    <Input
                      id="current-amount"
                      type="number"
                      value={newGoal.currentAmount || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="saving-account">Saving Account</Label>
                  <Select
                    value={newGoal.savingAccount}
                    onValueChange={(value) => setNewGoal({ ...newGoal, savingAccount: value })}
                  >
                    <SelectTrigger id="saving-account">
                      <SelectValue placeholder="Select saving account" />
                    </SelectTrigger>
                    <SelectContent>
                      {savingAccounts.map((account) => (
                        <SelectItem key={account} value={account}>
                          {account}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="investment-account">Investment Account</Label>
                  <Select
                    value={newGoal.investmentAccount}
                    onValueChange={(value) => setNewGoal({ ...newGoal, investmentAccount: value })}
                  >
                    <SelectTrigger id="investment-account">
                      <SelectValue placeholder="Select investment account" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentAccounts.map((account) => (
                        <SelectItem key={account} value={account}>
                          {account}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingGoal(false);
                      setNewGoal({
                        name: "",
                        targetAmount: 0,
                        currentAmount: 0,
                        savingAccount: "",
                        investmentAccount: "",
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={addGoal} className="flex-1">
                    Add Goal
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsAddingGoal(true)}
              variant="outline"
              className="w-full h-14"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Goal
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
