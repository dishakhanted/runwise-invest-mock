import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Investing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="relative mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="absolute left-0 top-0"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-center">Investing</h1>
        </div>

        <div className="space-y-6">
          {/* Stock restrictions */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Stock restrictions</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us which stocks not to trade in your accounts.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            </div>
          </div>

          {/* Securities lending */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Securities lending</h3>
                <p className="text-sm text-muted-foreground">
                  Earn passive income by lending your shares.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            </div>
          </div>

          <DisclosureFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Investing;
