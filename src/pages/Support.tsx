import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Support = () => {
  const navigate = useNavigate();
  const version = "2025.10.24";

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
          <h1 className="text-2xl font-semibold text-center">Support</h1>
        </div>

        <div className="space-y-6">
          {/* Contact us */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Contact us</h3>
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Find an ATM */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Find an ATM</h3>
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Help center */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Help center</h3>
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Wealthfront fees */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Wealthfront fees</h3>
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8"></div>

          {/* Rate us on the App Store */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Rate us on the App Store</h3>
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Version */}
          <div className="py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Version</h3>
              <span className="text-lg">{version}</span>
            </div>
          </div>

          <DisclosureFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Support;
