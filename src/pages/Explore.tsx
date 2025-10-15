import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CategoryDetail, Category } from "@/components/CategoryDetail";
import { categories } from "@/data/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categories[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
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
            placeholder="Stocks, ETFs, and collections"
            className="h-14 pl-12 bg-secondary border-0 rounded-2xl text-base"
          />
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="mb-6 -mx-6">
          <div className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`flex flex-col items-center gap-2 group flex-shrink-0 ${
                  selectedCategory?.id === category.id ? 'ring-2 ring-primary rounded-full' : ''
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center text-2xl transition-transform group-hover:scale-110`}
                >
                  {category.emoji}
                </div>
                <span className="text-xs text-center text-muted-foreground line-clamp-2 w-20">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Category Content */}
        {selectedCategory && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">{selectedCategory.name}</h2>
            <p className="text-sm text-muted-foreground mb-6">{selectedCategory.description}</p>
            
            {/* Suggestion Cards */}
            <div className="grid gap-4">
              {selectedCategory.stocks.slice(0, 3).map((stock) => (
                <Card key={stock.id} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${stock.color} flex items-center justify-center text-xl`}>
                        {stock.emoji}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{stock.name}</CardTitle>
                        <CardDescription className="text-xs">{stock.symbol}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              
              {selectedCategory.stocks.length > 3 && (
                <button 
                  onClick={() => handleCategoryClick(selectedCategory)}
                  className="text-sm text-primary font-medium"
                >
                  + {selectedCategory.stocks.length - 3} MORE
                </button>
              )}
            </div>
          </div>
        )}

        {/* Investment Suggestions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Suggestions for you</h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.slice(1, 5).map((category) => {
              const randomStock = category.stocks[Math.floor(Math.random() * category.stocks.length)];
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-border/50"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-full ${randomStock.color} flex items-center justify-center text-2xl mb-3`}>
                      {randomStock.emoji}
                    </div>
                    <CardTitle className="text-sm mb-1">{category.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {category.description.substring(0, 60)}...
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <CategoryDetail
          category={selectedCategory}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Explore;
