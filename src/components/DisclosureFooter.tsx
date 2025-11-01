import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DisclosureFooter = () => {
  return (
    <div className="w-full py-8 px-6 border-t border-border/50 mt-8">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-foreground"
        onClick={() => {
          // Navigate to disclosure
          window.location.href = "/profile#disclosure";
        }}
      >
        <FileText className="h-3 w-3 mr-1.5" />
        Disclosure
      </Button>
    </div>
  );
};
