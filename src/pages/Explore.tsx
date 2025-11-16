import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { WhatIfChatDialog } from "@/components/WhatIfChatDialog";
import { ExploreChatDialog } from "@/components/ExploreChatDialog";
import { useExploreContent } from "@/hooks/useExploreContent";
import { Badge } from "@/components/ui/badge";

interface WhatIfScenario {
  title: string;
  introMessage: string;
  goalTemplate?: {
    name: string;
    targetAmount: number;
    description: string;
  };
}

const Explore = () => {
  const { content, isMock } = useExploreContent();
  const [selectedScenario, setSelectedScenario] = useState<WhatIfScenario | null>(null);
  const [isWhatIfDialogOpen, setIsWhatIfDialogOpen] = useState(false);
  const [activeChatContext, setActiveChatContext] = useState<string | null>(null);

  const handleWhatIfClick = (index: number) => {
    setSelectedScenario(content.whatIfScenarios[index]);
    setIsWhatIfDialogOpen(true);
  };

  const handleChatOpen = (contextType: string) => {
    setActiveChatContext(contextType);
  };

  const handleChatClose = () => {
    setActiveChatContext(null);
  };
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header with Logo */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-5xl font-bold">Explore</h1>
          <Logo className="h-10 w-10" />
        </div>
        
        {isMock && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-xs">
              🤖 AI-Generated Mock Data (Test Mode)
            </Badge>
          </div>
        )}

        {/* Top Row - Market Insights & What if */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card 
            className="border-[hsl(var(--card-teal))]/30 bg-[hsl(var(--card-teal))]/10 cursor-pointer hover:bg-[hsl(var(--card-teal))]/20 transition-colors"
            onClick={() => handleChatOpen('market-insights')}
          >
            <CardContent className="p-4">
              <CardTitle className="text-2xl text-[hsl(var(--card-teal))] mb-4">{content.marketInsights.title}</CardTitle>
              <ul className="space-y-3 text-sm text-foreground">
                {content.marketInsights.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--card-amber))]/30 bg-[hsl(var(--card-amber))]/10">
            <CardContent className="p-4">
              <CardTitle className="text-2xl text-[hsl(var(--card-amber))] mb-4">🤔 What if?</CardTitle>
              <ul className="space-y-3 text-sm text-foreground">
                {content.whatIfScenarios.map((scenario, index) => (
                  <li 
                    key={index}
                    className="cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                    onClick={() => handleWhatIfClick(index)}
                  >
                    <span className="font-semibold">{scenario.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Fin-shorts Section */}
        <Card 
          className="mb-4 border-[hsl(var(--card-sky))]/30 bg-[hsl(var(--card-sky))]/10 cursor-pointer hover:bg-[hsl(var(--card-sky))]/20 transition-colors"
          onClick={() => handleChatOpen('finshorts')}
        >
          <CardContent className="p-4">
            <CardTitle className="text-2xl text-[hsl(var(--card-sky))] mb-4">{content.finShorts.title}</CardTitle>
            <ul className="space-y-3 text-sm text-foreground">
              {content.finShorts.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Bottom Row - Alternate Investments & Harvest gains */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card 
            className="border-[hsl(var(--card-violet))]/30 bg-[hsl(var(--card-violet))]/10 cursor-pointer hover:bg-[hsl(var(--card-violet))]/20 transition-colors"
            onClick={() => handleChatOpen('alternate-investments')}
          >
            <CardContent className="p-4">
              <CardTitle className="text-2xl text-[hsl(var(--card-violet))] mb-4">{content.alternateInvestments.title}</CardTitle>
              <p className="text-sm text-foreground mb-3">
                {content.alternateInvestments.description}
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
                {content.alternateInvestments.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card 
            className="border-[hsl(var(--card-rose))]/30 bg-[hsl(var(--card-rose))]/10 cursor-pointer hover:bg-[hsl(var(--card-rose))]/20 transition-colors"
            onClick={() => handleChatOpen('tax-loss-harvesting')}
          >
            <CardContent className="p-4">
              <CardTitle className="text-2xl text-[hsl(var(--card-rose))] mb-4">{content.harvestGains.title}</CardTitle>
              <p className="text-sm text-foreground">
                {content.harvestGains.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <DisclosureFooter />
      </div>

      <WhatIfChatDialog
        isOpen={isWhatIfDialogOpen}
        onClose={() => setIsWhatIfDialogOpen(false)}
        scenario={selectedScenario}
      />

      <ExploreChatDialog
        isOpen={activeChatContext !== null}
        onClose={handleChatClose}
        contextType={activeChatContext || 'center-chat'}
        contextData={{}}
      />

      <BottomNav />
    </div>
  );
};

export default Explore;
