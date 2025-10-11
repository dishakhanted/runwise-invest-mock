import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Gift } from "lucide-react";

const Rewards = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">Rewards</h1>
          <Logo className="h-10 w-10" />
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Gift className="h-24 w-24 text-primary mb-4" />
          <p className="text-muted-foreground text-center">
            Your rewards will appear here
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Rewards;
