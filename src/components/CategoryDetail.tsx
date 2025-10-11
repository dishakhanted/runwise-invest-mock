import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export interface Stock {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  stocks: Stock[];
  emoji: string;
  color: string;
}

interface CategoryDetailProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryDetail = ({ category, isOpen, onClose }: CategoryDetailProps) => {
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set());

  if (!category) return null;

  const toggleStock = (stockId: string) => {
    setSelectedStocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stockId)) {
        newSet.delete(stockId);
      } else {
        newSet.add(stockId);
      }
      return newSet;
    });
  };

  const handleInvest = () => {
    if (selectedStocks.size === 0) {
      toast.error("Please select at least one stock to invest");
      return;
    }
    toast.success(`Invested in ${selectedStocks.size} stocks from ${category.name}`);
    onClose();
    setSelectedStocks(new Set());
  };

  const handleSelectAll = () => {
    if (selectedStocks.size === category.stocks.length) {
      setSelectedStocks(new Set());
    } else {
      setSelectedStocks(new Set(category.stocks.map((s) => s.id)));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="text-4xl">{category.emoji}</span>
            {category.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {category.description}
          </p>

          <div className="flex items-center justify-between border-b border-border pb-3">
            <p className="text-sm font-medium">
              {category.stocks.length} investments
            </p>
            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
              {selectedStocks.size === category.stocks.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="space-y-3">
            {category.stocks.map((stock) => (
              <div
                key={stock.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Checkbox
                  id={stock.id}
                  checked={selectedStocks.has(stock.id)}
                  onCheckedChange={() => toggleStock(stock.id)}
                />
                <div
                  className={`w-12 h-12 rounded-full ${stock.color} flex items-center justify-center text-xl shrink-0`}
                >
                  {stock.emoji}
                </div>
                <label
                  htmlFor={stock.id}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <p className="font-medium">{stock.name}</p>
                  <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                </label>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              className="flex-1"
              disabled={selectedStocks.size === 0}
            >
              Invest in {selectedStocks.size || ""} {selectedStocks.size === 1 ? "stock" : "stocks"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
