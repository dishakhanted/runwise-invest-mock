import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ViewMode = "net-worth" | "assets" | "liabilities";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("net-worth");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLinkAccountOpen, setIsLinkAccountOpen] = useState(false);

  const cashTotal = 105741.75;
  const investmentsTotal = 0;
  const fidelityTotal = 33068.62;
  const robinhoodTotal = 8500.0;
  const assetsTotal = cashTotal + investmentsTotal + fidelityTotal + robinhoodTotal;
  
  const educationLoan = 45000.0;
  const vehicleLoan = 18500.0;
  const liabilitiesTotal = educationLoan + vehicleLoan;
  
  const netWorth = assetsTotal - liabilitiesTotal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-5xl font-bold">{formatCurrency(getCurrentAmount())}</h1>
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
            futureAmount="$1.3M net worth at 65"
            goals={[
              {
                id: "1",
                name: "Emergency Fund",
                targetAmount: 50000,
                currentAmount: 30000,
                targetAge: 35,
                position: { x: 150, y: 95 },
              },
              {
                id: "2",
                name: "House Down Payment",
                targetAmount: 100000,
                currentAmount: 45000,
                targetAge: 45,
                position: { x: 220, y: 75 },
              },
              {
                id: "3",
                name: "Retirement",
                targetAmount: 1000000,
                currentAmount: 237672,
                targetAge: 65,
                position: { x: 320, y: 50 },
              },
            ]}
          />
        )}

        {/* AI Summary Box */}
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
                <h3 className="font-semibold mb-1">Financial Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {viewMode === "net-worth" && (
                    <>Your net worth is {formatCurrency(netWorth)} with assets totaling {formatCurrency(assetsTotal)}. You're on track to reach your retirement goal. Click to chat with your AI assistant for personalized insights.</>
                  )}
                  {viewMode === "assets" && (
                    <>Your total assets are {formatCurrency(assetsTotal)}, including {formatCurrency(cashTotal)} in cash and {formatCurrency(investmentsTotal + fidelityTotal + robinhoodTotal)} in investments. Click to explore optimization opportunities with your AI assistant.</>
                  )}
                  {viewMode === "liabilities" && (
                    <>Your total liabilities are {formatCurrency(liabilitiesTotal)}, including an education loan of {formatCurrency(educationLoan)} and a vehicle loan of {formatCurrency(vehicleLoan)}. Click to discuss debt management strategies with your AI assistant.</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Section */}
        {showCashSection && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Cash</h2>
              <p className="text-2xl font-semibold">{formatCurrency(cashTotal)}</p>
            </div>

            <div className="divide-y divide-border">
              <AccountCard
                icon={Building2}
                iconColor="bg-icon-blue"
                title="Checking Account"
                subtitle="Santander"
                amount="$65,000.00"
                timeInfo="2 hours ago"
              />
              <AccountCard
                icon={Building2}
                iconColor="bg-icon-blue"
                title="Savings Account"
                subtitle="Santander"
                amount="$40,741.75"
                timeInfo="2 hours ago"
              />
            </div>
          </div>
        )}

        {/* Investments Section */}
        {showInvestmentsSection && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Investments</h2>
              <p className="text-2xl font-semibold">
                {formatCurrency(investmentsTotal + fidelityTotal + robinhoodTotal)}
              </p>
            </div>

            <div className="divide-y divide-border">
              <AccountCard
                icon={TrendingUp}
                iconColor="bg-success"
                title="Personal Investment - 6206"
                subtitle="Fidelity Investments"
                amount="$16,975.67"
                timeInfo="16 hours ago"
              />
              <AccountCard
                icon={TrendingUp}
                iconColor="bg-success"
                title="Roth IRA (after-tax) - 3355"
                subtitle="Fidelity Investments"
                amount="$16,092.95"
                timeInfo="16 hours ago"
              />
              <AccountCard
                icon={BarChart3}
                iconColor="bg-icon-orange"
                title="Trading Account"
                subtitle="Robinhood"
                amount="$8,500.00"
                timeInfo="2 hours ago"
              />
            </div>
          </div>
        )}

        {/* Liabilities Section */}
        {showLiabilitiesSection && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Liabilities</h2>
              <p className="text-2xl font-semibold">{formatCurrency(liabilitiesTotal)}</p>
            </div>

            <div className="divide-y divide-border">
              <AccountCard
                icon={GraduationCap}
                iconColor="bg-destructive"
                title="Education Loan"
                subtitle="Federal Student Aid · 4.5% APR"
                amount={`-${formatCurrency(educationLoan)}`}
              />
              <AccountCard
                icon={Car}
                iconColor="bg-destructive"
                title="Vehicle Loan"
                subtitle="Toyota Financial · 2.9% APR"
                amount={`-${formatCurrency(vehicleLoan)}`}
              />
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
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        viewMode={viewMode}
        netWorth={netWorth}
        assetsTotal={assetsTotal}
        liabilitiesTotal={liabilitiesTotal}
        cashTotal={cashTotal}
        investmentsTotal={investmentsTotal + fidelityTotal + robinhoodTotal}
      />
      <LinkAccountDialog 
        isOpen={isLinkAccountOpen}
        onClose={() => setIsLinkAccountOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
