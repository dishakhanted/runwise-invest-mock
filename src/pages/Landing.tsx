import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-10">
        <div className="flex justify-center">
          <Logo className="h-64 w-64" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Poonji</h1>
          <p className="text-xl text-muted-foreground">
            Your AI financial planner
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate("/demo-login")}
            variant="outline"
            className="w-full sm:w-auto px-8 h-12 text-lg rounded-xl"
          >
            Try Demo
          </Button>
          <Button
            onClick={() => navigate("/waitlist")}
            className="w-full sm:w-auto px-8 h-12 text-lg rounded-xl"
          >
            Join waitlist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
