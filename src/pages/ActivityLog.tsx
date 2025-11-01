import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ChevronLeft, FileText, ArrowLeftRight, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ActivityLog = () => {
  const navigate = useNavigate();

  const activities = [
    {
      type: "Investment",
      icon: FileText,
      date: "Oct 28, 2025",
      account: "Your first stock portfolio",
      description: "We invested your deposit in the amount of $505.00.",
      hasDetails: true,
    },
    {
      type: "Transfer",
      icon: ArrowLeftRight,
      date: "Oct 28, 2025",
      account: "Individual Cash Account",
      description: "You moved money to Stock Investing Account in the amount of $500.00.",
      hasDetails: false,
    },
    {
      type: "Deposit",
      icon: Power,
      date: "Oct 16, 2025",
      account: "Individual Cash Account",
      description: "We received your deposit in the amount of $500.00.",
      hasDetails: false,
    },
    {
      type: "Investment",
      icon: FileText,
      date: "Oct 15, 2025",
      account: "Individual Automated Investing Account",
      description: "We invested your deposit in the amount of $878.54.",
      hasDetails: true,
    },
    {
      type: "Transfer",
      icon: ArrowLeftRight,
      date: "Oct 15, 2025",
      account: "Individual Cash Account",
      description: "You moved money to Individual Automated Investing Account in the amount of $1,000.00.",
      hasDetails: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="relative mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold absolute left-1/2 transform -translate-x-1/2">Activity</h1>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80"
          >
            Filter
          </Button>
        </div>

        <div className="space-y-0 divide-y divide-border">
          {activities.map((activity, idx) => (
            <div key={idx} className="py-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <activity.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{activity.type}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {activity.date} · {activity.account}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activity.description}
                </p>
                {activity.hasDetails && (
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary/80 px-0 mt-2 h-auto"
                  >
                    See details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <DisclosureFooter />
      </div>
      <BottomNav />
    </div>
  );
};

export default ActivityLog;
