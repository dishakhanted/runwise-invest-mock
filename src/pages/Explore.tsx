import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ExploreChatDialog } from "@/components/ExploreChatDialog";

interface ChatContextData {
  initialInsight?: string;
  [key: string]: any;
}

const Explore = () => {
  const [activeChatContext, setActiveChatContext] = useState<"market-insights" | "finshorts" | "what-if" | "alternate-investments" | "tax-loss-harvesting" | null>(null);
  const [chatContextData, setChatContextData] = useState<ChatContextData>({});

  // Static demo content
  const content = {
    marketInsights: {
      title: "📈 Market Insights",
      items: [
        "Tech stocks rally on AI chip demand surge",
        "Federal Reserve holds rates steady at 5.25%",
        "Energy sector shows strongest growth in Q4"
      ]
    },
    whatIfScenarios: [
      { title: "I increase my 401(k) by 2%?" },
      { title: "I delay buying a home by 1 year?" },
      { title: "I refinance my student loans?" }
    ],
    finShorts: {
      title: "⚡ Fin-shorts",
      items: [
        "529 plans now cover apprenticeships and student loan repayments",
        "IRS increases 401(k) contribution limit to $23,000 for 2024",
        "High-yield savings accounts averaging 4.5% APY"
      ]
    },
    alternateInvestments: {
      title: "🎯 Alternate Investments",
      description: "Based on your portfolio, consider:",
      items: [
        "Real Estate Investment Trusts (REITs)",
        "Treasury Inflation-Protected Securities",
        "Municipal bonds for tax advantages"
      ]
    },
    harvestGains: {
      title: "💰 Harvest gains",
      description: "Potential tax-loss harvesting opportunities identified in your portfolio"
    }
  };

  const handleChatOpen = (contextType: "market-insights" | "finshorts" | "what-if" | "alternate-investments" | "tax-loss-harvesting", data?: ChatContextData) => {
    setActiveChatContext(contextType);
    
    // Prepare the initial summary based on context type
    let initialSummary = "";
    switch (contextType) {
      case "market-insights":
        initialSummary = content.marketInsights.items.join("\n");
        break;
      case "finshorts":
        initialSummary = content.finShorts.items.join("\n");
        break;
      case "what-if":
        initialSummary = "Explore scenarios:\n" + content.whatIfScenarios.map(s => s.title).join("\n");
        break;
      case "alternate-investments":
        initialSummary = content.alternateInvestments.description + "\n" + content.alternateInvestments.items.map((item, i) => `${i + 1}. ${item}`).join("\n");
        break;
      case "tax-loss-harvesting":
        initialSummary = content.harvestGains.description;
        break;
    }
    
    setChatContextData({ ...data, initialSummary });
  };

  const handleChatClose = () => {
    setActiveChatContext(null);
    setChatContextData({});
  };
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header with Logo */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-5xl font-bold">Explore</h1>
          <Logo className="h-10 w-10" />
        </div>

        {/* Top Row - Market Insights & What if */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card 
            className="border-[hsl(var(--card-teal))]/30 bg-[hsl(var(--card-teal))]/10 cursor-pointer hover:bg-[hsl(var(--card-teal))]/20 transition-colors"
            onClick={() => handleChatOpen('market-insights', { initialInsight: content.marketInsights.items[0] })}
          >
            <CardContent className="p-4">
              <CardTitle className="text-2xl text-[hsl(var(--card-teal))] mb-4">{content.marketInsights.title}</CardTitle>
              <ul className="space-y-3 text-sm text-foreground">
                {content.marketInsights.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-sm font-bold text-[hsl(var(--card-teal))] mt-4">
                Click here to know more
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border-[hsl(var(--card-amber))]/30 bg-[hsl(var(--card-amber))]/10 cursor-pointer hover:bg-[hsl(var(--card-amber))]/20 transition-colors"
            onClick={() => handleChatOpen('what-if')}
          >
            <CardContent className="p-4">
              <CardTitle className="text-2xl text-[hsl(var(--card-amber))] mb-4">🤔 What if?</CardTitle>
              <ul className="space-y-3 text-sm text-foreground">
                {content.whatIfScenarios.map((scenario, index) => (
                  <li key={index}>
                    <span className="font-semibold">{scenario.title}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-bold text-[hsl(var(--card-amber))] mt-4">
                Click here to know more
              </p>
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
            <p className="text-sm font-bold text-[hsl(var(--card-sky))] mt-4">
              Click here to know more
            </p>
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
              <p className="text-sm font-bold text-[hsl(var(--card-violet))] mt-4">
                Click here to know more
              </p>
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
              <p className="text-sm font-bold text-[hsl(var(--card-rose))] mt-4">
                Click here to know more
              </p>
            </CardContent>
          </Card>
        </div>

        <DisclosureFooter />
      </div>

      {activeChatContext && (
        <ExploreChatDialog
          isOpen={true}
          onClose={handleChatClose}
          contextType={activeChatContext}
          contextData={chatContextData}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Explore;
