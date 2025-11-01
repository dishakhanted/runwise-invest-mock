import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Accounts = () => {
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
          <h1 className="text-2xl font-semibold text-center">Accounts</h1>
        </div>

        <div className="space-y-6">
          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            Select an account below to view account number, configure bank accounts enabled for transfer, set beneficiaries, and more.
          </p>

          {/* Individual Cash Account */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Individual Cash Account</h3>
                <p className="text-sm text-muted-foreground">Individual</p>
              </div>
              <ExternalLink className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            </div>
          </div>

          {/* Individual Automated Investing Account */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Individual Automated Investing Account</h3>
                <p className="text-sm text-muted-foreground">Individual</p>
              </div>
              <ExternalLink className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            </div>
          </div>

          {/* Stock Investing Account */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Stock Investing Account</h3>
                <p className="text-sm text-muted-foreground">Individual</p>
              </div>
              <ExternalLink className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8"></div>

          {/* Linked accounts */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Linked accounts</h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8"></div>

          {/* Close accounts */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <h3 className="text-lg font-semibold text-destructive">Close accounts</h3>
          </div>

          <DisclosureFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Accounts;
