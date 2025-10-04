import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  amount: string;
  timeInfo?: string;
}

export const AccountCard = ({
  icon: Icon,
  iconColor = "bg-icon-purple",
  title,
  subtitle,
  amount,
  timeInfo,
}: AccountCardProps) => {
  return (
    <div className="flex items-center gap-4 py-4">
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
          iconColor
        )}
      >
        <Icon className="h-7 w-7 text-background" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="text-right">
        <p className="font-semibold text-foreground">{amount}</p>
        {timeInfo && <p className="text-sm text-muted-foreground">{timeInfo}</p>}
      </div>
    </div>
  );
};
