import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Clock, RefreshCw, ArrowDown, ArrowUp, ArrowLeftRight, Building2, Send, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const transferOptions = [
  {
    icon: Clock,
    title: "View scheduled transfers",
    badge: "1",
  },
  {
    icon: RefreshCw,
    title: "Set up automated savings plan",
  },
];

const transferActions = [
  {
    icon: ArrowDown,
    title: "Deposit",
    subtitle: "Into Poonji",
  },
  {
    icon: ArrowUp,
    title: "Withdraw",
    subtitle: "From Poonji",
  },
  {
    icon: ArrowLeftRight,
    title: "Transfer",
    subtitle: "Between Poonji accounts · Cash, categories, and investment accounts",
  },
];

const moreWays = [
  { icon: Building2, title: "Bring over investments" },
  { icon: Send, title: "Wire money" },
  { icon: Smartphone, title: "Mobile deposit" },
];

const Transfer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <Logo className="h-16 w-16" />
        </div>

        <h1 className="text-5xl font-bold mb-8">Transfer money</h1>

        {/* Quick Options */}
        <div className="space-y-3 mb-8">
          {transferOptions.map((option, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center relative">
                <option.icon className="h-6 w-6 text-primary" />
                {option.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-xs flex items-center justify-center">
                    {option.badge}
                  </span>
                )}
              </div>
              <span className="font-medium">{option.title}</span>
            </button>
          ))}
        </div>

        <div className="h-px bg-border my-8" />

        {/* Transfer Actions */}
        <div className="space-y-3 mb-8">
          {transferActions.map((action, i) => (
            <button
              key={i}
              className="w-full flex items-start gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <action.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold mb-1">{action.title}</h3>
                {action.subtitle && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {action.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* More Ways */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            More ways to transfer
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-4">
            {moreWays.map((way, i) => (
              <button
                key={i}
                className="flex items-center gap-3 px-6 py-3 bg-secondary rounded-full hover:bg-secondary/80 transition-colors whitespace-nowrap"
              >
                <way.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{way.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Open Account Button */}
        <Button className="w-full h-14 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl text-lg">
          Open a new account
        </Button>

        <DisclosureFooter />
      </div>

      <BottomNav />
    </div>
  );
};

export default Transfer;
