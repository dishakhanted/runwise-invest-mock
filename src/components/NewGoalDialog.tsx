import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewGoalDialog = ({ isOpen, onClose }: NewGoalDialogProps) => {
  const { toast } = useToast();
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [savingAccount, setSavingAccount] = useState("");
  const [investmentAccount, setInvestmentAccount] = useState("");

  const handleCreate = () => {
    if (!goalName || !targetAmount || !targetAge) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Goal Created!",
      description: `Your goal "${goalName}" has been created successfully.`,
    });

    // Reset form
    setGoalName("");
    setTargetAmount("");
    setTargetAge("");
    setSavingAccount("");
    setInvestmentAccount("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalName">Goal Name *</Label>
            <Input
              id="goalName"
              placeholder="e.g., Dream Vacation, New Car"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount *</Label>
            <Input
              id="targetAmount"
              type="number"
              placeholder="e.g., 50000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAge">Target Age *</Label>
            <Input
              id="targetAge"
              type="number"
              placeholder="e.g., 45"
              value={targetAge}
              onChange={(e) => setTargetAge(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savingAccount">Savings Account</Label>
            <Select value={savingAccount} onValueChange={setSavingAccount}>
              <SelectTrigger id="savingAccount">
                <SelectValue placeholder="Select savings account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-yield">High Yield Savings</SelectItem>
                <SelectItem value="santander-savings">Santander Savings</SelectItem>
                <SelectItem value="bofa-savings">Bank of America Savings</SelectItem>
                <SelectItem value="chase-savings">Chase Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investmentAccount">Investment Account</Label>
            <Select value={investmentAccount} onValueChange={setInvestmentAccount}>
              <SelectTrigger id="investmentAccount">
                <SelectValue placeholder="Select investment account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fidelity">Fidelity Personal Investment</SelectItem>
                <SelectItem value="roth-ira">Roth IRA</SelectItem>
                <SelectItem value="robinhood">Robinhood Trading</SelectItem>
                <SelectItem value="401k">401(k)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreate} className="flex-1">
              Create Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
