import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMockData } from "@/config/environment";

interface ExploreContent {
  marketInsights: {
    title: string;
    items: string[];
  };
  whatIfScenarios: Array<{
    title: string;
    introMessage: string;
    goalTemplate?: {
      name: string;
      targetAmount: number;
      description: string;
    };
  }>;
  finShorts: {
    title: string;
    items: string[];
  };
  alternateInvestments: {
    title: string;
    description: string;
    items: string[];
  };
  harvestGains: {
    title: string;
    description: string;
  };
}

const MOCK_CONTENT: ExploreContent = {
  marketInsights: {
    title: "💰 Love Equity?",
    items: [
      "📈 S&P 500 up 1.2% this week — Tech and Energy lead gains, defensive sectors flat.",
      "🚀 Upcoming IPOs to watch: Stripe (re-filed), Databricks, and Reddit (AI-data push).",
    ],
  },
  whatIfScenarios: [
    {
      title: "Plan to Buy a Car Soon?",
      introMessage: "San Francisco life gets much easier with your own wheels — especially once you're balancing work, errands, or weekend drives outside the city. Have you thought about getting a car?",
      goalTemplate: {
        name: "Car Purchase",
        targetAmount: 13000,
        description: "Good timing. You can easily free up $500 a month from your savings once your emergency fund hits its full target — it won't affect your long-term goals. I'll park that amount in a short-tenor liquid or ultra-short debt fund, where it earns modest returns but stays easily accessible. In about two years, you'll have $12K–$13K, enough for a solid used car or a down payment on a new one.",
      },
    },
    {
      title: "Plan to Start a Family at 35?",
      introMessage: "Starting a family is a big step that comes with new financial considerations. A wife and kid changes two things: income stability and housing needs. Have you thought about planning for this?",
      goalTemplate: {
        name: "Family Planning Fund",
        targetAmount: 50000,
        description: "A wife and kid changes two things: income stability and housing needs. Let's build a dedicated fund that covers the initial expenses and helps you transition smoothly when the time comes.",
      },
    },
  ],
  finShorts: {
    title: "⚡ Fin-shorts",
    items: [
      "💻 Tech Wakes, Market Naps: S&P 500 stays flat as Big Tech quietly adds $150 billion in value.",
      "🛢️ Red Sea Ripples Hit Oil: Tensions push Brent above $88, shaking airlines and transport stocks.",
      "🤖 AI ETFs Print Gold: $2 billion pours into AI funds — investors chase the new digital rush.",
    ],
  },
  alternateInvestments: {
    title: "🌍 Alternate Investments",
    description: "Ever thought about diversifying beyond U.S. equity markets?",
    items: [
      "✨ Diversify beyond U.S. markets — add a touch of Gold & Global ETFs.",
      "🔮 Make your portfolio future-proof with 5% in emerging markets.",
    ],
  },
  harvestGains: {
    title: "🎯 Harvest your gains",
    description: "💸 Taxes and investing always dance together; learn a bit of tax harvesting now, and you'll keep more of what you earn later.",
  },
};

export function useExploreContent() {
  const [content, setContent] = useState<ExploreContent>(MOCK_CONTENT);
  const [isLoading, setIsLoading] = useState(false);
  const [isMock, setIsMock] = useState(useMockData);

  useEffect(() => {
    if (useMockData) {
      setIsMock(true);
      setContent(MOCK_CONTENT);
      return;
    }

    const fetchExploreContent = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('financial-chat', {
          body: {
            messages: [{ role: 'user', content: 'Generate explore page content' }],
            contextType: 'explore',
          },
        });

        if (error) throw error;

        if (data?.content) {
          setContent(JSON.parse(data.content));
          setIsMock(false);
        }
      } catch (error) {
        console.error('Error fetching explore content:', error);
        setContent(MOCK_CONTENT);
        setIsMock(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExploreContent();
  }, []);

  return { content, isLoading, isMock };
}
