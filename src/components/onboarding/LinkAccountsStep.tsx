import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { ChevronLeft, Building2, TrendingUp, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LinkAccountsStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const accountTypes = [
  {
    id: "bank",
    title: "Bank Accounts",
    description: "Connect your checking and savings accounts",
    icon: Building2,
  },
  {
    id: "investment",
    title: "Investment Accounts",
    description: "Link your brokerage and retirement accounts",
    icon: TrendingUp,
  },
  {
    id: "loan",
    title: "Loan Accounts",
    description: "Add mortgages, student loans, and other debts",
    icon: CreditCard,
  },
];

export const LinkAccountsStep = ({ data, onNext, onBack }: LinkAccountsStepProps) => {
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>(
    data.linkedAccounts || []
  );

  const handleAccountClick = (accountId: string) => {
    // Simulate account linking
    setLinkedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleContinue = () => {
    onNext({ linkedAccounts });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Button
        variant="ghost"
        onClick={onBack}
        className="w-fit -ml-2 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-2">Link Your Accounts</h1>
      <p className="text-muted-foreground mb-8">
        Connect your financial accounts to get a complete picture of your wealth.
      </p>

      <div className="flex-1 space-y-4">
        {accountTypes.map((account) => {
          const Icon = account.icon;
          const isLinked = linkedAccounts.includes(account.id);
          
          return (
            <Card
              key={account.id}
              className={`p-6 cursor-pointer transition-all ${
                isLinked ? "border-primary bg-primary/5" : "hover:border-primary/50"
              }`}
              onClick={() => handleAccountClick(account.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  isLinked ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{account.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {account.description}
                  </p>
                  {isLinked && (
                    <p className="text-sm text-primary font-medium mt-2">
                      ✓ Connected
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3 mt-8">
        <Button 
          onClick={handleContinue} 
          className="w-full h-14 text-lg rounded-2xl"
          disabled={linkedAccounts.length === 0}
        >
          Continue
        </Button>
        <Button 
          onClick={handleContinue} 
          variant="ghost"
          className="w-full h-14 text-lg rounded-2xl"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};
