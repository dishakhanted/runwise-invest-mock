import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DisclosureFooter = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 z-40 max-w-[calc(100vw-2rem)]">
      <Button
        variant="secondary"
        size="sm"
        className="shadow-lg text-xs"
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
