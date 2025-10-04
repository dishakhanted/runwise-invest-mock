import { BottomNav } from "@/components/BottomNav";
import { Gift } from "lucide-react";

const Rewards = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-5xl font-bold mb-8">Rewards</h1>
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
