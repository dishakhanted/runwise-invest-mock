import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { SuggestionDetailDialog } from "@/components/SuggestionDetailDialog";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  expectedReturn?: string;
  riskLevel?: string;
  timeHorizon?: string;
}

const suggestions: Suggestion[] = [
  {
    id: "1",
    title: "Index Fund Portfolio",
    description: "Diversified low-cost index funds tracking major market indices",
    emoji: "📊",
    color: "bg-blue-500",
    expectedReturn: "7-10% annually",
    riskLevel: "Medium",
    timeHorizon: "5+ years",
  },
  {
    id: "2",
    title: "Emergency Fund Builder",
    description: "High-yield savings for 3-6 months of expenses",
    emoji: "🏦",
    color: "bg-green-500",
    expectedReturn: "4-5% annually",
    riskLevel: "Low",
    timeHorizon: "Immediate",
  },
  {
    id: "3",
    title: "Tech Growth ETF",
    description: "Technology sector focused exchange-traded funds",
    emoji: "💻",
    color: "bg-purple-500",
    expectedReturn: "12-15% annually",
    riskLevel: "High",
    timeHorizon: "7+ years",
  },
  {
    id: "4",
    title: "Retirement 401(k) Max",
    description: "Maximize employer match contributions",
    emoji: "🎯",
    color: "bg-orange-500",
    expectedReturn: "100% instant return on match",
    riskLevel: "Low",
    timeHorizon: "Long-term",
  },
  {
    id: "5",
    title: "Dividend Aristocrats",
    description: "Stocks with 25+ years of dividend growth",
    emoji: "💰",
    color: "bg-yellow-500",
    expectedReturn: "6-8% + dividends",
    riskLevel: "Medium",
    timeHorizon: "10+ years",
  },
  {
    id: "6",
    title: "Bond Ladder Strategy",
    description: "Staggered maturity bonds for steady income",
    emoji: "🪜",
    color: "bg-indigo-500",
    expectedReturn: "4-6% annually",
    riskLevel: "Low",
    timeHorizon: "3-5 years",
  },
  {
    id: "7",
    title: "Real Estate REIT",
    description: "Real estate investment trusts for property exposure",
    emoji: "🏠",
    color: "bg-red-500",
    expectedReturn: "8-12% annually",
    riskLevel: "Medium-High",
    timeHorizon: "5+ years",
  },
  {
    id: "8",
    title: "International Diversification",
    description: "Emerging and developed market exposure",
    emoji: "🌍",
    color: "bg-teal-500",
    expectedReturn: "8-11% annually",
    riskLevel: "Medium-High",
    timeHorizon: "7+ years",
  },
];

const Explore = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header with Logo */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold">Explore</h1>
          <Logo className="h-10 w-10" />
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search investments, strategies..."
            className="h-14 pl-12 bg-secondary border-0 rounded-2xl text-base"
          />
        </div>

        {/* Suggestions Grid - Masonry Style */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Investment Suggestions</h2>
          <div className="grid grid-cols-2 gap-4 auto-rows-auto">
            {suggestions.map((suggestion, index) => {
              const isLarge = index === 0 || index === 4;
              return (
                <Card
                  key={suggestion.id}
                  className={`cursor-pointer hover:shadow-lg transition-all border-border/50 ${
                    isLarge ? "row-span-2" : ""
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-full ${suggestion.color} flex items-center justify-center text-2xl mb-3`}>
                      {suggestion.emoji}
                    </div>
                    <CardTitle className="text-sm mb-2">{suggestion.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-3 flex-1">
                      {suggestion.description}
                    </CardDescription>
                    {suggestion.expectedReturn && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{suggestion.expectedReturn}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{suggestion.riskLevel} Risk</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <SuggestionDetailDialog
          suggestion={selectedSuggestion}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Explore;
