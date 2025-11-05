import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { ChevronLeft, Building2, TrendingUp, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LinkAccountsStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const banks = [
  { id: "1", name: "Chase", logo: "💳" },
  { id: "2", name: "Bank of America", logo: "🏦" },
  { id: "3", name: "Wells Fargo", logo: "🏛️" },
  { id: "4", name: "Citibank", logo: "🏢" },
  { id: "5", name: "Capital One", logo: "💼" },
  { id: "6", name: "US Bank", logo: "🏦" },
  { id: "7", name: "PNC Bank", logo: "🏛️" },
  { id: "8", name: "TD Bank", logo: "🏢" },
];

const investmentAccounts = [
  { id: "1", name: "Fidelity", logo: "📈" },
  { id: "2", name: "Vanguard", logo: "📊" },
  { id: "3", name: "Charles Schwab", logo: "💹" },
  { id: "4", name: "E*TRADE", logo: "📉" },
  { id: "5", name: "TD Ameritrade", logo: "💰" },
  { id: "6", name: "Robinhood", logo: "🎯" },
  { id: "7", name: "Webull", logo: "📱" },
  { id: "8", name: "Interactive Brokers", logo: "🌐" },
];

const loanProviders = [
  { id: "1", name: "Wells Fargo Mortgage", logo: "🏠" },
  { id: "2", name: "Quicken Loans", logo: "🏡" },
  { id: "3", name: "Chase Home Lending", logo: "🏘️" },
  { id: "4", name: "Bank of America Mortgage", logo: "🏢" },
  { id: "5", name: "Sallie Mae", logo: "🎓" },
  { id: "6", name: "Navient", logo: "📚" },
  { id: "7", name: "SoFi", logo: "💳" },
  { id: "8", name: "LendingClub", logo: "🤝" },
];

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
  const [linkedAccounts, setLinkedAccounts] = useState<{[key: string]: number}>({
    bank: 0,
    investment: 0,
    loan: 0
  });
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<{ name: string; type: string } | null>(null);
  const [formData, setFormData] = useState({
    lastFourDigits: "",
    totalAmount: "",
    interestRate: ""
  });
  const [tempLinkedAccounts, setTempLinkedAccounts] = useState(data.linkedAccounts || []);

  const getProviders = () => {
    switch (dialogOpen) {
      case "bank":
        return banks;
      case "investment":
        return investmentAccounts;
      case "loan":
        return loanProviders;
      default:
        return [];
    }
  };

  const filteredProviders = getProviders().filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccountClick = (accountId: string) => {
    setDialogOpen(accountId);
    setSearchQuery("");
  };

  useEffect(() => {
    loadLinkedAccounts();
  }, [tempLinkedAccounts]);

  const loadLinkedAccounts = () => {
    const counts = { bank: 0, investment: 0, loan: 0 };
    tempLinkedAccounts.forEach(account => {
      counts[account.account_type as keyof typeof counts]++;
    });
    setLinkedAccounts(counts);
  };

  const handleProviderClick = (providerName: string) => {
    setSelectedProvider({ name: providerName, type: dialogOpen! });
    setDialogOpen(null);
    setFormDialogOpen(true);
  };

  const handleSaveAccount = () => {
    if (!selectedProvider) return;

    // Validate form
    if (!formData.lastFourDigits || !formData.totalAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.lastFourDigits.length !== 4 || !/^\d+$/.test(formData.lastFourDigits)) {
      toast.error("Last 4 digits must be exactly 4 numbers");
      return;
    }

    // Store account data temporarily in state
    const newAccount = {
      account_type: selectedProvider.type,
      provider_name: selectedProvider.name,
      last_four_digits: formData.lastFourDigits,
      total_amount: parseFloat(formData.totalAmount),
      interest_rate: formData.interestRate ? parseFloat(formData.interestRate) : 0
    };

    setTempLinkedAccounts(prev => [...prev, newAccount]);
    toast.success(`${selectedProvider.name} account linked successfully!`);
    setFormDialogOpen(false);
    setFormData({ lastFourDigits: "", totalAmount: "", interestRate: "" });
    setSelectedProvider(null);
  };

  const handleContinue = () => {
    onNext({ linkedAccounts: tempLinkedAccounts });
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
          const count = linkedAccounts[account.id as keyof typeof linkedAccounts];
          const isLinked = count > 0;
          
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
                      ✓ {count} {count === 1 ? 'account' : 'accounts'} connected
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
          disabled={Object.values(linkedAccounts).every(count => count === 0)}
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

      {/* Account Selection Dialog */}
      <Dialog open={dialogOpen !== null} onOpenChange={() => setDialogOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogOpen === "bank" && <Building2 className="h-5 w-5" />}
              {dialogOpen === "investment" && <TrendingUp className="h-5 w-5" />}
              {dialogOpen === "loan" && <CreditCard className="h-5 w-5" />}
              {dialogOpen === "bank" && "Select Your Bank"}
              {dialogOpen === "investment" && "Select Investment Account"}
              {dialogOpen === "loan" && "Select Loan Provider"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredProviders.map((provider) => (
                <Button
                  key={provider.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => handleProviderClick(provider.name)}
                >
                  <span className="text-2xl mr-3">{provider.logo}</span>
                  <span className="font-semibold">{provider.name}</span>
                </Button>
              ))}
            </div>

            {filteredProviders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No providers found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Details Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Enter {selectedProvider?.name} Account Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lastFourDigits">Account Number (Last 4 Digits)</Label>
              <Input
                id="lastFourDigits"
                placeholder="1234"
                maxLength={4}
                value={formData.lastFourDigits}
                onChange={(e) => setFormData(prev => ({ ...prev, lastFourDigits: e.target.value.replace(/\D/g, '') }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount ($)</Label>
              <Input
                id="totalAmount"
                type="number"
                placeholder="10000"
                value={formData.totalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%) <span className="text-muted-foreground text-sm">(Optional)</span></Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                placeholder="2.5"
                value={formData.interestRate}
                onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setFormDialogOpen(false);
                  setFormData({ lastFourDigits: "", totalAmount: "", interestRate: "" });
                  setSelectedProvider(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveAccount}
              >
                Link Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
