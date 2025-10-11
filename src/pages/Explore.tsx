import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CategoryDetail, Category } from "@/components/CategoryDetail";
import { categories } from "@/data/categories";

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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

        {/* Categories Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center text-2xl transition-transform group-hover:scale-110`}
              >
                {category.emoji}
              </div>
              <span className="text-xs text-center text-muted-foreground line-clamp-2">
                {category.name}
              </span>
            </button>
          ))}
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
