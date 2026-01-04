import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { AccountCard } from "@/components/AccountCard";
import { WealthChart } from "@/components/WealthChart";
import { Logo } from "@/components/Logo";
import { AIChatDialog } from "@/components/AIChatDialog";
import { LinkAccountDialog } from "@/components/LinkAccountDialog";
import {
  Wallet,
  Umbrella,
  Banknote,
  Building2,
  TrendingUp,
  BarChart3,
  Home,
  GraduationCap,
  Car,
  Target,
  MessageSquare,
  Link,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useFinancialData } from "@/hooks/useFinancialData";

type ViewMode = "net-worth" | "assets" | "liabilities";

const Dashboard = () => {
  const { isAuthenticated } = useSession();
  const { linkedAccounts, goals, netWorthSummary: financialSummary, isLoading, refetch } = useFinancialData();
  
  const [viewMode, setViewMode] = useState<ViewMode>("net-worth");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLinkAccountOpen, setIsLinkAccountOpen] = useState(false);
  const [showFinancialSummary, setShowFinancialSummary] = useState(false);
  const [netWorthSummaryText, setNetWorthSummaryText] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('dashboard-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('Goal updated on dashboard:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, refetch]);

  // Computed values from hook data
  const bankAccounts = linkedAccounts.filter(acc => acc.account_type === 'bank');
  const investmentAccounts = linkedAccounts.filter(acc => acc.account_type === 'investment');
  const loanAccounts = linkedAccounts.filter(acc => acc.account_type === 'loan');

  const cashTotal = financialSummary.cashTotal;
  const investmentsTotal = financialSummary.investmentsTotal;
  const assetsTotal = financialSummary.assetsTotal;
  const liabilitiesTotal = financialSummary.liabilitiesTotal;
  const netWorth = financialSummary.netWorth;


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const generateFinancialSummaryText = async (
    snapshot: {
      netWorth: number;
      assetsTotal: number;
      liabilitiesTotal: number;
      cashTotal: number;
      investmentsTotal: number;
    },
    currentViewMode: ViewMode
  ) => {
    setLoadingSummary(true);
    try {
      // Determine context type and prompt message based on view mode
      let contextType: string;
      let promptMessage: string;

      switch (currentViewMode) {
        case "net-worth":
          contextType = "net_worth";
          promptMessage = "[SUMMARY_MODE] Using the net worth prompt, give me a short 1–2 sentence summary of my current net worth and key observations. Only return the summary paragraph, no suggestions.";
          break;
        case "assets":
          contextType = "assets";
          promptMessage = "[SUMMARY_MODE] Using the assets prompt, give me a short 1–2 sentence summary of my assets and key observations. Only return the summary paragraph, no suggestions.";
          break;
        case "liabilities":
          contextType = "liabilities";
          promptMessage = "[SUMMARY_MODE] Using the liabilities prompt, give me a short 1–2 sentence summary of my liabilities and key observations. Only return the summary paragraph, no suggestions.";
          break;
      }

      const { data, error } = await supabase.functions.invoke("financial-chat", {
        body: {
          messages: [
            {
              role: "user",
              content: promptMessage,
            },
          ],
          contextType,
          contextData: snapshot,
        },
      });

      if (error) throw error;

      const summaryText =
        data?.message ||
        "Click to chat with GrowW AI for a personalized financial summary.";

      setNetWorthSummaryText(summaryText.trim());
    } catch (e) {
      console.error("Error generating financial summary:", e);
      setNetWorthSummaryText(
        "Click to chat with GrowW AI for a personalized financial summary."
      );
    } finally {
      setLoadingSummary(false);
    }
  };

  const getCurrentAmount = () => {
    switch (viewMode) {
      case "net-worth":
        return netWorth;
      case "assets":
        return assetsTotal;
      case "liabilities":
        return liabilitiesTotal;
    }
  };

  const showCashSection = viewMode === "net-worth" || viewMode === "assets";
  const showInvestmentsSection = viewMode === "net-worth" || viewMode === "assets";
  const showLiabilitiesSection = viewMode === "net-worth" || viewMode === "liabilities";

  // Generate financial summary when financial data or view mode changes
  useEffect(() => {
    if (!isLoading && (netWorth !== 0 || assetsTotal !== 0 || liabilitiesTotal !== 0)) {
      const snapshot = {
        netWorth,
        assetsTotal,
        liabilitiesTotal,
        cashTotal,
        investmentsTotal,
      };
      generateFinancialSummaryText(snapshot, viewMode);
    }
  }, [netWorth, assetsTotal, liabilitiesTotal, cashTotal, investmentsTotal, viewMode, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-5xl font-bold">{formatCurrency(getCurrentAmount())}</h1>
          <Logo className="h-16 w-16" />
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setViewMode("net-worth")}
            className={cn(
              "px-6 py-2 rounded-full font-medium transition-colors",
              viewMode === "net-worth"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            Net Worth
          </button>
          <button
            onClick={() => setViewMode("assets")}
            className={cn(
              "px-6 py-2 rounded-full font-medium transition-colors",
              viewMode === "assets"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            Assets
          </button>
          <button
            onClick={() => setViewMode("liabilities")}
            className={cn(
              "px-6 py-2 rounded-full font-medium transition-colors",
              viewMode === "liabilities"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            Liabilities
          </button>
        </div>

        {/* Chart - only show for net worth */}
        {viewMode === "net-worth" && (
          <WealthChart
            currentAmount={formatCurrency(getCurrentAmount())}
            futureAmount={goals.length > 0 ? `${goals.length} goal${goals.length !== 1 ? 's' : ''} tracked` : "Set goals to track progress"}
            goals={goals.map((goal, index) => ({
              id: goal.id,
              name: goal.name,
              targetAmount: Number(goal.target_amount),
              currentAmount: Number(goal.current_amount),
              targetAge: goal.target_age,
              position: { 
                x: 120 + (index * 100), 
                y: 100 - (index * 15) 
              },
            }))}
          />
        )}

        {/* AI Summary Box */}
        <Card 
          className="mt-6 cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
          onClick={() => {
            setShowFinancialSummary(true);
            setIsChatOpen(true);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Financial Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {loadingSummary
                    ? "Generating your financial summary..."
                    : netWorthSummaryText ||
                      "Click to chat with GrowW AI for a personalized financial summary and insights."}
                </p>
                {!loadingSummary && netWorthSummaryText && (
                  <p className="text-sm font-bold text-primary mt-2">
                    Click here to know more suggestions
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Section */}
        {showCashSection && bankAccounts.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Cash</h2>
              <p className="text-2xl font-semibold">{formatCurrency(cashTotal)}</p>
            </div>

            <div className="divide-y divide-border">
              {bankAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  icon={Building2}
                  iconColor="bg-icon-blue"
                  title={`Account ending in ${account.last_four_digits}`}
                  subtitle={`${account.provider_name} · ${account.interest_rate}% APY`}
                  amount={formatCurrency(account.total_amount)}
                  timeInfo="Recently updated"
                />
              ))}
            </div>
          </div>
        )}

        {/* Investments Section */}
        {showInvestmentsSection && investmentAccounts.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Investments</h2>
              <p className="text-2xl font-semibold">
                {formatCurrency(investmentsTotal)}
              </p>
            </div>

            <div className="divide-y divide-border">
              {investmentAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  icon={TrendingUp}
                  iconColor="bg-success"
                  title={`Investment Account - ${account.last_four_digits}`}
                  subtitle={`${account.provider_name} · ${account.interest_rate}% return`}
                  amount={formatCurrency(account.total_amount)}
                  timeInfo="Recently updated"
                />
              ))}
            </div>
          </div>
        )}

        {/* Liabilities Section */}
        {showLiabilitiesSection && loanAccounts.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Liabilities</h2>
              <p className="text-2xl font-semibold">{formatCurrency(liabilitiesTotal)}</p>
            </div>

            <div className="divide-y divide-border">
              {loanAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  icon={CreditCard}
                  iconColor="bg-destructive"
                  title={`Loan ending in ${account.last_four_digits}`}
                  subtitle={`${account.provider_name} · ${account.interest_rate}% APR`}
                  amount={`-${formatCurrency(account.total_amount)}`}
                  timeInfo="Recently updated"
                />
              ))}
            </div>
          </div>
        )}

        {/* Link Account Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-base font-semibold"
            onClick={() => setIsLinkAccountOpen(true)}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Link className="h-6 w-6 text-primary" />
            </div>
            Link Account
          </Button>
        </div>

        <DisclosureFooter />
      </div>

      <BottomNav />
      <AIChatDialog 
        key={viewMode}
        isOpen={isChatOpen} 
        onClose={() => {
          setIsChatOpen(false);
          setShowFinancialSummary(false);
        }}
        viewMode={viewMode}
        netWorth={netWorth}
        assetsTotal={assetsTotal}
        liabilitiesTotal={liabilitiesTotal}
        cashTotal={cashTotal}
        investmentsTotal={investmentsTotal}
        showFinancialSummary={showFinancialSummary}
      />
      <LinkAccountDialog 
        isOpen={isLinkAccountOpen}
        onClose={() => setIsLinkAccountOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
