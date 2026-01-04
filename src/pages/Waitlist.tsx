import { Button } from "@/components/ui/button";
import WaitlistForm from "@/components/WaitlistForm";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const Waitlist = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="px-0">
          ← Back
        </Button>

        <div className="flex flex-col items-center space-y-2 mt-8">
          <Logo className="h-24 w-24" />
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold">Join the waitlist</h1>
            <p className="text-muted-foreground">
              Save your spot to get early access and updates.
            </p>
          </div>
        </div>

        <WaitlistForm />
      </div>
    </div>
  );
};

export default Waitlist;

