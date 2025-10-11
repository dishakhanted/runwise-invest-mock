import { useState } from "react";
import { Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetAge: number;
  position: { x: number; y: number };
}

interface WealthChartProps {
  currentAmount?: string;
  futureAmount?: string;
  showLabels?: boolean;
  goals?: Goal[];
}

export const WealthChart = ({
  currentAmount = "$237,672",
  futureAmount = "$1.3M net worth at 65",
  showLabels = true,
  goals = [],
}: WealthChartProps) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative w-full h-64 my-8">
      {/* SVG Chart */}
      <svg
        viewBox="0 0 400 200"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--chart-gradient-start))" />
            <stop offset="100%" stopColor="hsl(var(--chart-gradient-end))" />
          </linearGradient>
        </defs>

        {/* Curved line */}
        <path
          d="M 0 120 Q 100 100, 200 80 T 400 40"
          fill="none"
          stroke="url(#chartGradient)"
          strokeWidth="3"
          className="drop-shadow-lg"
        />

        {/* Current position marker */}
        <circle cx="80" cy="105" r="8" fill="hsl(var(--chart-gradient-start))" />
        <circle
          cx="80"
          cy="105"
          r="14"
          fill="none"
          stroke="hsl(var(--chart-gradient-start))"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Future position marker */}
        <circle cx="320" cy="50" r="8" fill="hsl(var(--chart-gradient-end))" />
        <circle
          cx="320"
          cy="50"
          r="14"
          fill="none"
          stroke="hsl(var(--chart-gradient-end))"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Goal markers */}
        {goals.map((goal) => (
          <g key={goal.id}>
            {/* Balloon circle */}
            <circle
              cx={goal.position.x}
              cy={goal.position.y - 20}
              r="12"
              fill="hsl(var(--primary))"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedGoal(goal)}
            />
            {/* Balloon string */}
            <line
              x1={goal.position.x}
              y1={goal.position.y - 8}
              x2={goal.position.x}
              y2={goal.position.y}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              opacity="0.6"
            />
            {/* Goal icon in balloon */}
            <Target
              x={goal.position.x - 6}
              y={goal.position.y - 26}
              className="w-3 h-3 text-primary-foreground pointer-events-none"
            />
          </g>
        ))}
      </svg>

      {/* Labels */}
      {showLabels && (
        <>
          <div className="absolute bottom-0 left-0 text-sm text-muted-foreground">
            Today
          </div>
          <div className="absolute bottom-0 right-0 text-sm text-muted-foreground">
            Age 80
          </div>
          <div className="absolute top-0 left-4 text-lg font-semibold text-foreground">
            {currentAmount}
          </div>
          <div className="absolute top-0 right-4 text-sm font-medium text-foreground text-right">
            {futureAmount}
          </div>
        </>
      )}

      {/* Goal Details Dialog */}
      <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedGoal?.name}</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Target Amount:</span>
                <span className="font-semibold">{formatCurrency(selectedGoal.targetAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Amount:</span>
                <span className="font-semibold">{formatCurrency(selectedGoal.currentAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Target Age:</span>
                <span className="font-semibold">{selectedGoal.targetAge}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-semibold">
                  {Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)}%
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
