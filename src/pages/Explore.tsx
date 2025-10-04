import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

const stockLogos = [
  { name: "NVIDIA", color: "bg-success", emoji: "🎮" },
  { name: "J&J", color: "bg-destructive", emoji: "🏥" },
  { name: "Apple", color: "bg-foreground/10", emoji: "🍎" },
  { name: "Tesla", color: "bg-destructive", emoji: "🚗" },
];

const Explore = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <h1 className="text-5xl font-bold mb-6">Explore</h1>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Stocks, ETFs, and collections"
            className="h-14 pl-12 bg-secondary border-0 rounded-2xl text-base"
          />
        </div>

        {/* Stock Collections */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Stock collections with NVIDIA Corp
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-4">
            {stockLogos.map((stock, i) => (
              <div
                key={i}
                className={`w-20 h-20 rounded-full ${stock.color} flex items-center justify-center text-3xl shrink-0 ${
                  i === 1 ? "ring-4 ring-primary" : ""
                }`}
              >
                {stock.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Collection Card */}
        <Card className="bg-card p-6 rounded-3xl mb-6">
          <h3 className="text-2xl font-bold mb-3">Generative AI</h3>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Don't just chat with chatbots—invest in them. These companies are
            developing technology...
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-xl">
                🎮
              </div>
              <span className="font-medium">NVIDIA Corp</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center text-xl">
                💼
              </div>
              <span className="font-medium">International Business Machi...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-icon-orange flex items-center justify-center text-xl">
                📦
              </div>
              <span className="font-medium">Amazon.com Inc.</span>
            </div>
          </div>

          <button className="mt-6 text-sm font-medium text-foreground/60 hover:text-foreground">
            + 3 MORE
          </button>
        </Card>

        {/* Newly Added */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Newly added</h2>
          <button className="text-primary hover:text-primary/80 font-medium">
            See all
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Explore;
