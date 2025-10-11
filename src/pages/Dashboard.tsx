import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { AccountCard } from "@/components/AccountCard";
import { WealthChart } from "@/components/WealthChart";
import { Logo } from "@/components/Logo";
import { GoalsDialog } from "@/components/GoalsDialog";
import {
  Wallet,
  Umbrella,
  Banknote,
  Building2,
  TrendingUp,
  BarChart3,
  Sparkles,
  Home,
  GraduationCap,
  Car,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "net-worth" | "assets" | "liabilities";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("net-worth");
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);

  const cashTotal = 105270.54;
  const investmentsTotal = 50106.56;
  const fidelityTotal = 33068.62;
  const robinhoodTotal = 8500.0;
  const assetsTotal = cashTotal + investmentsTotal + fidelityTotal + robinhoodTotal;
  
  const homeLoan = 285000.0;
  const educationLoan = 45000.0;
  const vehicleLoan = 18500.0;
  const liabilitiesTotal = homeLoan + educationLoan + vehicleLoan;
  
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
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hover:bg-transparent"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Goals
          </Button>
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
        {viewMode === "net-worth" && <WealthChart />}

        {/* Cash Section */}
        {showCashSection && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Cash</h2>
              <p className="text-2xl font-semibold">{formatCurrency(cashTotal)}</p>
            </div>

            <div className="divide-y divide-border">
              <AccountCard
                icon={Wallet}
                iconColor="bg-card border-2 border-foreground/10"
                title="Individual Cash Account"
                subtitle="Individual · 3.75% APY"
                amount="$7,882.95"
              />
              <AccountCard
                icon={Umbrella}
                iconColor="bg-icon-purple"
                title="Emergency fund"
                subtitle="Individual · 3.75% APY"
                amount="$81,600.00"
              />
              <AccountCard
                icon={Banknote}
                iconColor="bg-card border-2 border-foreground/10"
                title="Savings"
                subtitle="Individual · 3.75% APY"
                amount="$14,367.00"
              />
              <AccountCard
                icon={Building2}
                iconColor="bg-icon-blue"
                title="Checking - 1928"
                subtitle="Chase"
                amount="$741.71"
                timeInfo="17 hours ago"
              />
              <AccountCard
                icon={Building2}
                iconColor="bg-icon-blue"
                title="Savings - 2132"
                subtitle="Chase"
                amount="$100.04"
                timeInfo="17 hours ago"
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
                iconColor="bg-card border-2 border-foreground/10"
                title="Individual Automated Investing Account"
                subtitle="Individual"
                amount="$12,823.82"
              />
              <AccountCard
                icon={BarChart3}
                iconColor="bg-card border-2 border-foreground/10"
                title="Your first stock portfolio"
                subtitle="Individual"
                amount="$4,214.12"
              />
              <AccountCard
                icon={Sparkles}
                iconColor="bg-success"
                title="Personal Investment - 6206"
                subtitle="Fidelity Investments"
                amount="$16,975.67"
                timeInfo="16 hours ago"
              />
              <AccountCard
                icon={Sparkles}
                iconColor="bg-success"
                title="Roth IRA (after-tax) - 3355"
                subtitle="Fidelity Investments"
                amount="$16,092.95"
                timeInfo="16 hours ago"
              />
              <AccountCard
                icon={TrendingUp}
                iconColor="bg-success"
                title="Stock Portfolio - 4421"
                subtitle="Fidelity Investments"
                amount="$15,234.89"
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
              <AccountCard
                icon={TrendingUp}
                iconColor="bg-success"
                title="Investment Account - 7788"
                subtitle="Fidelity Investments"
                amount="$17,833.73"
                timeInfo="16 hours ago"
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
                icon={Home}
                iconColor="bg-destructive"
                title="Home Loan"
                subtitle="Wells Fargo · 3.5% APR"
                amount={`-${formatCurrency(homeLoan)}`}
              />
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
      </div>

      <GoalsDialog isOpen={isGoalsOpen} onClose={() => setIsGoalsOpen(false)} />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
