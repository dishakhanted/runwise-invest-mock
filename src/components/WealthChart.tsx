interface WealthChartProps {
  currentAmount?: string;
  futureAmount?: string;
  showLabels?: boolean;
}

export const WealthChart = ({
  currentAmount = "$237,672",
  futureAmount = "$1.3M net worth at 65",
  showLabels = true,
}: WealthChartProps) => {
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
    </div>
  );
};
