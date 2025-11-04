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

        {/* Diagonal dashed growth line */}
        <line
          x1="40"
          y1="160"
          x2="380"
          y2="30"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Goal markers positioned along the line */}
        {goals.map((goal, index) => {
          // Position goals evenly along the diagonal line
          const x = 40 + ((380 - 40) / (goals.length + 1)) * (index + 1);
          const y = 160 - ((160 - 30) / (goals.length + 1)) * (index + 1);
          
          return (
            <g key={goal.id}>
              {/* Goal icon */}
              <circle
                cx={x}
                cy={y - 15}
                r="15"
                fill="hsl(var(--background))"
                stroke="hsl(var(--foreground))"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedGoal(goal)}
              />
              <Target
                x={x - 8}
                y={y - 23}
                className="w-4 h-4 text-foreground pointer-events-none"
              />
              {/* Stem connecting to line */}
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={y - 1}
                stroke="hsl(var(--foreground))"
                strokeWidth="2"
              />
            </g>
          );
        })}
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
