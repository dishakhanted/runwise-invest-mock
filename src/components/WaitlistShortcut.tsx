import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import WaitlistForm from "@/components/WaitlistForm";
import { UserPlus } from "lucide-react";

/**
 * Floating waitlist shortcut button that appears on all demo pages
 */
export const WaitlistShortcut = () => {
  const { demoMode } = useSession();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Only show on protected routes (demo pages), not on landing or waitlist page
  const isProtectedRoute = location.pathname !== "/" && 
                          location.pathname !== "/waitlist" &&
                          location.pathname !== "/demo-login" &&
                          !location.pathname.startsWith("/auth") &&
                          !location.pathname.startsWith("/signup") &&
                          !location.pathname.startsWith("/login");

  if (!demoMode || !isProtectedRoute) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[60] h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        size="icon"
        aria-label="Join waitlist"
      >
        <UserPlus className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Join the waitlist</DialogTitle>
            <DialogDescription>
              Save your spot to get early access and updates.
            </DialogDescription>
          </DialogHeader>
          <WaitlistForm />
        </DialogContent>
      </Dialog>
    </>
  );
};
