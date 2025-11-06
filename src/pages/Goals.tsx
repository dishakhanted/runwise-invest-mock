import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { Logo } from "@/components/Logo";
import { GoalAIChatDialog } from "@/components/GoalAIChatDialog";
import { NewGoalDialog } from "@/components/NewGoalDialog";
import { Button } from "@/components/ui/button";
import { Plus, Target, Wallet, TrendingUp, Building2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const Goals = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGoals: Goal[] = (data || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        targetAmount: Number(goal.target_amount),
        currentAmount: Number(goal.current_amount),
        savingAccount: goal.saving_account || 'None',
        investmentAccount: goal.investment_account || 'None',
        description: goal.description || undefined,
        allocation: {
          savings: goal.allocation_savings,
          stocks: goal.allocation_stocks,
          bonds: goal.allocation_bonds
        }
      }));

      setGoals(formattedGoals);
      
      // Set first goal as selected by default
      if (formattedGoals.length > 0 && !selectedGoalId) {
        setSelectedGoalId(formattedGoals[0].id);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCreateGoal = async (newGoal: Omit<Goal, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: newGoal.name,
          target_amount: newGoal.targetAmount,
          current_amount: newGoal.currentAmount,
          saving_account: newGoal.savingAccount,
          investment_account: newGoal.investmentAccount,
          allocation_savings: newGoal.allocation.savings,
          allocation_stocks: newGoal.allocation.stocks,
          allocation_bonds: newGoal.allocation.bonds
        })
        .select()
        .single();

      if (error) throw error;

      const goal: Goal = {
        id: data.id,
        name: data.name,
        targetAmount: Number(data.target_amount),
        currentAmount: Number(data.current_amount),
        savingAccount: data.saving_account,
        investmentAccount: data.investment_account,
        allocation: {
          savings: data.allocation_savings,
          stocks: data.allocation_stocks,
          bonds: data.allocation_bonds
        }
      };

      setGoals([...goals, goal]);
      setSelectedGoalId(goal.id);

      toast({
        title: "Success",
        description: "Goal created successfully",
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    }
  };

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

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);
  const totalGoalAmount = selectedGoal?.currentAmount || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              {selectedGoal ? formatCurrency(selectedGoal.currentAmount) : "$0"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedGoal ? `${selectedGoal.name} Progress` : "Select a goal"}
            </p>
          </div>
          <Logo className="h-10 w-10" />
        </div>

        {/* Goal Toggle Buttons */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {goals.map((goal) => (
            <Button
              key={goal.id}
              variant={selectedGoalId === goal.id ? "default" : "secondary"}
              className={cn(
                "flex-shrink-0 rounded-full",
                selectedGoalId === goal.id && "shadow-lg"
              )}
              onClick={() => setSelectedGoalId(goal.id)}
            >
              {goal.name}
            </Button>
          ))}
          <Button
            variant="secondary"
            size="icon"
            className="flex-shrink-0 rounded-full"
            onClick={() => setIsNewGoalOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Goal Details */}
        {selectedGoal && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold">{selectedGoal.name}</h2>
                <span className="text-lg font-medium">
                  {formatCurrency(totalGoalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <span>Target: {formatCurrency(selectedGoal.targetAmount)}</span>
                <span>{Math.round(getProgress(selectedGoal.currentAmount, selectedGoal.targetAmount))}% Complete</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${getProgress(selectedGoal.currentAmount, selectedGoal.targetAmount)}%` }}
                />
              </div>
            </div>

            {/* Fund Allocation Cards */}
            <div className="space-y-3">
              {selectedGoal.allocation.savings > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--icon-mint))]/20 flex items-center justify-center flex-shrink-0">
                      <Wallet className="w-6 h-6 text-[hsl(var(--icon-mint))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-semibold">Savings Account</p>
                          <p className="text-sm text-muted-foreground">{selectedGoal.savingAccount}</p>
                        </div>
                        <span className="font-semibold text-right">
                          {formatCurrency((totalGoalAmount * selectedGoal.allocation.savings) / 100)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedGoal.allocation.savings}% allocation</p>
                    </div>
                  </div>
                </Card>
              )}

              {selectedGoal.allocation.stocks > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--icon-blue))]/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-[hsl(var(--icon-blue))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-semibold">Stock Investments</p>
                          <p className="text-sm text-muted-foreground">{selectedGoal.investmentAccount}</p>
                        </div>
                        <span className="font-semibold text-right">
                          {formatCurrency((totalGoalAmount * selectedGoal.allocation.stocks) / 100)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedGoal.allocation.stocks}% allocation</p>
                    </div>
                  </div>
                </Card>
              )}

              {selectedGoal.allocation.bonds > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--icon-cyan))]/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[hsl(var(--icon-cyan))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-semibold">Bonds</p>
                          <p className="text-sm text-muted-foreground">Fixed Income</p>
                        </div>
                        <span className="font-semibold text-right">
                          {formatCurrency((totalGoalAmount * selectedGoal.allocation.bonds) / 100)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedGoal.allocation.bonds}% allocation</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* AI Summary Box for Goal */}
            <Card 
              className="mt-6 cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
              onClick={() => setIsChatOpen(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Goal Summary & Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedGoal.description || (
                        <>
                          You're {Math.round(getProgress(selectedGoal.currentAmount, selectedGoal.targetAmount))}% of the way to your {selectedGoal.name} goal. 
                          You need {formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)} more to reach your target. 
                          Click to chat with your AI assistant for personalized strategies to reach this goal faster.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <DisclosureFooter />
      </div>
      <BottomNav />
      <GoalAIChatDialog 
        isOpen={isChatOpen} 
        onClose={() => {
          setIsChatOpen(false);
          loadGoals(); // Refresh goals after closing dialog
        }}
        goal={selectedGoal || null}
      />
      <NewGoalDialog 
        isOpen={isNewGoalOpen}
        onClose={() => setIsNewGoalOpen(false)}
        onCreateGoal={handleCreateGoal}
      />
    </div>
  );
};

export default Goals;
