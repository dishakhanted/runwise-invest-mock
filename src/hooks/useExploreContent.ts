import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function useExploreContent() {
  const [content, setContent] = useState<ExploreContent>({
    marketInsights: { title: "💰 Market Insights", items: [] },
    whatIfScenarios: [],
    finShorts: { title: "⚡ Fin-shorts", items: [] },
    alternateInvestments: { title: "🌍 Alternate Investments", description: "", items: [] },
    harvestGains: { title: "🎯 Harvest your gains", description: "" },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExploreContent = async () => {
      setIsLoading(true);
      try {
        // Fetch content for each section in parallel
        const [marketData, whatIfData, finShortsData, alternateData, harvestData] = await Promise.all([
          supabase.functions.invoke('financial-chat', {
            body: {
              messages: [{ role: 'user', content: 'Generate market insights summary' }],
              contextType: 'market-insights',
            },
          }),
          supabase.functions.invoke('financial-chat', {
            body: {
              messages: [{ role: 'user', content: 'Generate what-if scenarios' }],
              contextType: 'what-if',
            },
          }),
          supabase.functions.invoke('financial-chat', {
            body: {
              messages: [{ role: 'user', content: 'Generate financial shorts' }],
              contextType: 'finshorts',
            },
          }),
          supabase.functions.invoke('financial-chat', {
            body: {
              messages: [{ role: 'user', content: 'Generate alternate investments overview' }],
              contextType: 'alternate-investments',
            },
          }),
          supabase.functions.invoke('financial-chat', {
            body: {
              messages: [{ role: 'user', content: 'Generate tax harvesting overview' }],
              contextType: 'tax-loss-harvesting',
            },
          }),
        ]);

        // Parse AI responses into structured content
        const newContent: ExploreContent = {
          marketInsights: {
            title: "💰 Market Insights",
            items: marketData.data?.message ? [marketData.data.message] : ["Loading market insights..."],
          },
          whatIfScenarios: whatIfData.data?.message ? 
            [{
              title: "AI-Generated Scenarios",
              introMessage: whatIfData.data.message,
            }] : [],
          finShorts: {
            title: "⚡ Fin-shorts",
            items: finShortsData.data?.message ? [finShortsData.data.message] : ["Loading financial shorts..."],
          },
          alternateInvestments: {
            title: "🌍 Alternate Investments",
            description: alternateData.data?.message || "Loading alternate investments...",
            items: [],
          },
          harvestGains: {
            title: "🎯 Harvest your gains",
            description: harvestData.data?.message || "Loading tax harvesting info...",
          },
        };

        setContent(newContent);
      } catch (error) {
        console.error('Error fetching explore content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExploreContent();
  }, []);

  return { content, isLoading, isMock: false };
}
