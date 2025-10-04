import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { AccountCard } from "@/components/AccountCard";
import { WealthChart } from "@/components/WealthChart";
import {
  Wallet,
  Umbrella,
  Banknote,
  Building2,
  TrendingUp,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "net-worth" | "assets" | "liabilities";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("net-worth");

  const cashTotal = 105270.54;
  const investmentsTotal = 50106.56;
  const assetsTotal = cashTotal + investmentsTotal;
  const liabilitiesTotal = 0; // No liabilities in mock data
  const netWorth = assetsTotal - liabilitiesTotal;

  const viewData = {
    "net-worth": {
      label: "Current net worth",
      amount: netWorth,
    },
    assets: {
      label: "Total assets",
      amount: assetsTotal,
    },
    liabilities: {
      label: "Total liabilities",
      amount: liabilitiesTotal,
    },
  };

  const modes: ViewMode[] = ["net-worth", "assets", "liabilities"];
  const currentIndex = modes.indexOf(viewMode);

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
    setViewMode(modes[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex === modes.length - 1 ? 0 : currentIndex + 1;
    setViewMode(modes[newIndex]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header with Toggle */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-start gap-3">
            <button
              onClick={handlePrevious}
              className="mt-4 p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="Previous view"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-5xl font-bold mb-2">
                {formatCurrency(viewData[viewMode].amount)}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                {viewData[viewMode].label}
                <span className="inline-block w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-xs">
                  i
                </span>
              </p>
            </div>
            <button
              onClick={handleNext}
              className="mt-4 p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="Next view"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hover:bg-transparent"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Goals
          </Button>
        </div>

        {/* Chart */}
        <WealthChart />

        {/* Cash Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Cash</h2>
            <p className="text-2xl font-semibold">$105,270.54</p>
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

        {/* Investments Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Investments</h2>
            <p className="text-2xl font-semibold">$50,106.56</p>
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
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
