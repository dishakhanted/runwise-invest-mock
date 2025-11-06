import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FinancialSuggestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialSuggestionsDialog = ({ isOpen, onClose }: FinancialSuggestionsDialogProps) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loanSuggestionDismissed, setLoanSuggestionDismissed] = useState(false);
  const [emergencySuggestionDismissed, setEmergencySuggestionDismissed] = useState(false);

  const handleLoanApprove = () => {
    toast.success("Great! Your loan payment has been increased to $500/month. You'll be debt-free in 36 months!");
    setLoanSuggestionDismissed(true);
  };

  const handleLoanDeny = () => {
    toast.info("No problem. You can always adjust your payment plan later.");
    setLoanSuggestionDismissed(true);
  };

  const handleLoanKnowMore = () => {
    toast.info("Current payment: $320/month. Proposed: $500/month (+$180). Time to debt-free: 36 months vs 87 months.");
  };

  const handleEmergencyApprove = () => {
    toast.success("Perfect! Auto-transfer of $500/month to your emergency fund is now active. You'll reach 6 months coverage by next year!");
    setEmergencySuggestionDismissed(true);
  };

  const handleEmergencyDeny = () => {
    toast.info("Understood. Building an emergency fund is important - let me know when you're ready!");
    setEmergencySuggestionDismissed(true);
  };

  const handleEmergencyKnowMore = () => {
    toast.info("Current: $5,800 (~2 months). Target: $18,000 (6 months). Monthly auto-transfer: $500. Timeframe: 12 months.");
  };

  if (!showBreakdown) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Financial Summary</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                You are in decent shape for your age!
              </p>
              <p className="text-sm leading-relaxed">
                I have good news! You can get debt neutral in 3 years, Yes No more loans.
              </p>
              <p className="text-sm leading-relaxed">
                Oh no, you have only 2 months of expenses as a safety net, it's a pickle.
              </p>
              <p className="text-sm text-muted-foreground">
                Click to chat with your AI assistant Groww for personalized insights
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={() => setShowBreakdown(true)}
            >
              Show Me How
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Financial Game Plan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Income Breakdown */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed">
                With your <span className="font-semibold">$5,200 monthly income</span>, here's the simple game plan — about <span className="font-semibold">$3,700</span> covers your living costs, and the remaining <span className="font-semibold">$1,500</span> works for you: <span className="font-semibold">$500</span> goes to your loan, <span className="font-semibold">$500</span> builds your emergency fund in liquid investments, and <span className="font-semibold">$500</span> grows in medium-risk retirement and home funds — every dollar has a job this year.
              </p>
            </CardContent>
          </Card>

          {/* Loan Payment Suggestion */}
          {!loanSuggestionDismissed && (
            <Card className="border-destructive/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Increase Education Loan Payment</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Hey, Right now, you're paying <span className="font-medium text-foreground">$320 a month</span> on your student loan. If you bump that to <span className="font-medium text-foreground">$500</span>, you'll be completely debt-free in <span className="font-medium text-foreground">36 months</span>. That's an extra $180 a month, roughly what you spend on takeout and Ubers. Should I do it for you?
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={handleLoanApprove}
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleLoanDeny}
                  >
                    Deny
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={handleLoanKnowMore}
                  >
                    Know more
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Fund Suggestion */}
          {!emergencySuggestionDismissed && (
            <Card className="border-primary/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Build Emergency Fund of 6 Months</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You've got <span className="font-medium text-foreground">$5,800 saved</span>, about two months of expenses. Let's make that six months (<span className="font-medium text-foreground">$18K</span>). To do that, shall I auto transfer <span className="font-medium text-foreground">$500 a month</span> into it. By this time next year, you'll have a real cushion.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={handleEmergencyApprove}
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleEmergencyDeny}
                  >
                    Deny
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={handleEmergencyKnowMore}
                  >
                    Know more
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loanSuggestionDismissed && emergencySuggestionDismissed && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <p className="text-sm">All suggestions reviewed! Check back later for more personalized insights.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
