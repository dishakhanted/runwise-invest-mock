import { Button } from "@/components/ui/button";
import { WealthChart } from "@/components/WealthChart";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-between px-6 py-12 max-w-lg mx-auto w-full">
        {/* Content */}
        <div className="flex-1 flex flex-col justify-center -mt-20">
          <h1 className="text-5xl font-bold mb-4">AI edge</h1>
          <h2 className="text-4xl font-light text-foreground/90 mb-12">for your wealth building.</h2>

          <WealthChart currentAmount="$237,672" futureAmount="$1.3M net worth at 65" />
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="w-2 h-2 rounded-full bg-muted" />
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate("/onboarding")}
            className="w-full h-14 text-lg bg-foreground text-background hover:bg-foreground/90 rounded-2xl"
          >
            Get started
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            variant="ghost"
            className="w-full h-14 text-lg text-foreground hover:bg-secondary rounded-2xl"
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
