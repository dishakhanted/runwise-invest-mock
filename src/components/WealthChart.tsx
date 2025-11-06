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
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--chart-gradient-start))" />
            <stop offset="100%" stopColor="hsl(var(--chart-gradient-end))" />
          </linearGradient>
          <linearGradient id="balloonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Y-axis */}
        <line
          x1="40"
          y1="20"
          x2="40"
          y2="160"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
        />
        
        {/* X-axis */}
        <line
          x1="40"
          y1="160"
          x2="380"
          y2="160"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
        />

        {/* Diagonal dashed growth line with gradient */}
        <line
          x1="40"
          y1="160"
          x2="380"
          y2="30"
          stroke="url(#chartGradient)"
          strokeWidth="3"
          strokeDasharray="5,5"
        />

        {/* Goal markers as balloons positioned along the line */}
        {(() => {
          // Sort goals by target age
          const sortedGoals = [...goals].sort((a, b) => {
            const ageA = a.targetAge || 999;
            const ageB = b.targetAge || 999;
            return ageA - ageB;
          });

          const minAge = 25;
          const maxAge = 80;
          const ageRange = maxAge - minAge;
          const minSpacing = 40; // Minimum pixel spacing between goals

          // Calculate positions with collision prevention
          const positions = sortedGoals.map((goal, index) => {
            let ageProgress;
            if (goal.targetAge) {
              ageProgress = Math.min(Math.max((goal.targetAge - minAge) / ageRange, 0), 1);
            } else {
              ageProgress = (index + 1) / (sortedGoals.length + 1);
            }
            
            let x = 40 + ((380 - 40) * ageProgress);
            const y = 160 - ((160 - 30) * ageProgress);
            
            return { goal, x, y, originalX: x };
          });

          // Adjust positions to prevent overlapping and recalculate y to stay on line
          for (let i = 1; i < positions.length; i++) {
            const prev = positions[i - 1];
            const curr = positions[i];
            
            if (curr.x - prev.x < minSpacing) {
              curr.x = prev.x + minSpacing;
              // Recalculate y to keep point on the diagonal line
              // Line goes from (40, 160) to (380, 30)
              const lineProgress = (curr.x - 40) / (380 - 40);
              curr.y = 160 - ((160 - 30) * lineProgress);
            }
          }

          return positions.map(({ goal, x, y }) => (
            <g key={goal.id}>
              {/* Balloon circle */}
              <circle
                cx={x}
                cy={y - 25}
                r="14"
                fill="hsl(var(--primary))"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedGoal(goal)}
              />
              {/* Balloon string */}
              <line
                x1={x}
                y1={y - 11}
                x2={x}
                y2={y}
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                opacity="0.6"
              />
              {/* Goal icon in balloon - using a simple path for target icon */}
              <g transform={`translate(${x - 6}, ${y - 31})`}>
                <circle cx="6" cy="6" r="4" fill="none" stroke="white" strokeWidth="1.5" />
                <circle cx="6" cy="6" r="1.5" fill="white" />
              </g>
            </g>
          ));
        })()}
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
