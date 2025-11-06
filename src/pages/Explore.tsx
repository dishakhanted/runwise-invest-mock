import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { WhatIfChatDialog } from "@/components/WhatIfChatDialog";

interface WhatIfScenario {
  title: string;
  initialPrompt: string;
  goalTemplate?: {
    name: string;
    targetAmount: number;
    description: string;
  };
}

const whatIfScenarios: WhatIfScenario[] = [
  {
    title: "Plan to Buy a Car Soon?",
    initialPrompt: "Yeah, I don't have one yet but was actually thinking about it. Tell me more.",
    goalTemplate: {
      name: "Car Purchase",
      targetAmount: 13000,
      description: "Good timing. You can easily free up $500 a month from your savings once your emergency fund hits its full target — it won't affect your long-term goals. I'll park that amount in a short-tenor liquid or ultra-short debt fund, where it earns modest returns but stays easily accessible. In about two years, you'll have $12K–$13K, enough for a solid used car or a down payment on a new one.",
    },
  },
  {
    title: "Plan to Start a Family at 35?",
    initialPrompt: "I'm thinking about starting a family around 35. What should I plan for financially?",
    goalTemplate: {
      name: "Family Planning Fund",
      targetAmount: 50000,
      description: "A wife and kid changes two things: income stability and housing needs. Let's build a dedicated fund that covers the initial expenses and helps you transition smoothly when the time comes.",
    },
  },
];

const Explore = () => {
  const [selectedScenario, setSelectedScenario] = useState<WhatIfScenario | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleWhatIfClick = (index: number) => {
    setSelectedScenario(whatIfScenarios[index]);
    setIsDialogOpen(true);
  };
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header with Logo */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">Explore</h1>
          <Logo className="h-10 w-10" />
        </div>

        {/* Top Row - Love Equity & What if */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <CardTitle className="text-lg text-primary mb-4">Love Equity?</CardTitle>
              <ul className="space-y-3 text-sm text-foreground">
                <li>
                  <span className="font-semibold">S&P 500 up 1.2% this week</span> — Tech and Energy lead gains, defensive sectors flat.
                </li>
                <li>
                  <span className="font-semibold">Upcoming IPOs to watch:</span> Stripe (re-filed), Databricks, and Reddit (AI-data push).
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <CardTitle className="text-lg text-primary mb-4">What if?</CardTitle>
              <ul className="space-y-3 text-sm text-foreground">
                <li 
                  className="cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                  onClick={() => handleWhatIfClick(0)}
                >
                  <span className="font-semibold">What if you plan to buy a car soon?</span> San Francisco life gets much easier with your own wheels — especially once you're balancing work, errands, or weekend drives outside the city.
                </li>
                <li 
                  className="cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                  onClick={() => handleWhatIfClick(1)}
                >
                  <span className="font-semibold">What if you plan to start a family at 35?</span> A wife and kid changes two things: income stability and housing needs.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Fin-shorts Section */}
        <Card className="mb-4 border-border/50">
          <CardContent className="p-4">
            <CardTitle className="text-lg text-primary mb-4">Fin-shorts</CardTitle>
            <ul className="space-y-3 text-sm text-foreground">
              <li>
                <span className="font-semibold">Tech Wakes, Market Naps:</span> S&P 500 stays flat as Big Tech quietly adds $150 billion in value.
              </li>
              <li>
                <span className="font-semibold">Red Sea Ripples Hit Oil:</span> Tensions push Brent above $88, shaking airlines and transport stocks.
              </li>
              <li>
                <span className="font-semibold">AI ETFs Print Gold:</span> $2 billion pours into AI funds — investors chase the new digital rush.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Bottom Row - Alternate Investments & Harvest gains */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <CardTitle className="text-lg text-primary mb-4">Alternate Investments</CardTitle>
              <p className="text-sm text-foreground mb-3">
                Ever thought about diversifying beyond U.S. equity markets?
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
                <li>Diversify beyond U.S. markets — add a touch of Gold & Global ETFs.</li>
                <li>Make your portfolio future-proof with 5% in emerging markets.</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <CardTitle className="text-lg text-primary mb-4">Harvest your gains</CardTitle>
              <p className="text-sm text-foreground">
                Taxes and investing always dance together; learn a bit of tax harvesting now, and you'll keep more of what you earn later.
              </p>
            </CardContent>
          </Card>
        </div>

        <DisclosureFooter />
      </div>

      <WhatIfChatDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        scenario={selectedScenario}
      />

      <BottomNav />
    </div>
  );
};

export default Explore;
