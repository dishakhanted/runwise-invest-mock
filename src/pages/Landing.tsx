import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WealthChart } from "@/components/WealthChart";

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  renderVisual: () => JSX.Element;
};

const Landing = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 0,
      title: "AI edge",
      subtitle: "for your wealth building.",
      renderVisual: () => (
        <WealthChart currentAmount="$237,672" futureAmount="$1.3M net worth at 65" />
      ),
    },
    {
      id: 1,
      title: "All your money in one place",
      subtitle: "See checking, savings, investments, and debt in one clear view.",
      renderVisual: () => (
        <div className="flex flex-col gap-3 mt-6 w-full max-w-md">
          {[
            { label: "Checking · $4,250", accent: "bg-primary/15 border-primary/30" },
            { label: "Savings · $28,500", accent: "bg-secondary/40 border-secondary/60" },
            { label: "401(k) · $73,200", accent: "bg-muted/60 border-muted-foreground/20" },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border px-4 py-4 shadow-sm ${card.accent}`}
            >
              <div className="text-lg font-semibold text-foreground">{card.label}</div>
              <div className="text-sm text-muted-foreground mt-1">Updated just now</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 2,
      title: "Smart suggestions you can act on",
      subtitle: "GrowWise turns your finances into clear actions you can approve.",
      renderVisual: () => (
        <div className="space-y-4 mt-6">
          <div className="max-w-[280px] rounded-2xl border border-primary/30 bg-primary/10 text-primary px-4 py-3 shadow-sm">
            “Your cash flow is strong — want to boost your investments this month?”
          </div>
          <div className="flex flex-col gap-3">
            {[
              {
                title: "Complete emergency fund goal",
                detail: "3 steps · Est. +$6.5K safety",
              },
              {
                title: "Rebalance investments for goals",
                detail: "Auto-approve in 1 tap",
              },
            ].map((suggestion) => (
              <div
                key={suggestion.title}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Suggestion
                </div>
                <div className="font-semibold text-foreground">{suggestion.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{suggestion.detail}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Progress toward your goals",
      subtitle: "Track how each decision moves you closer to what you care about.",
      renderVisual: () => (
        <div className="flex flex-col gap-4 mt-6">
          {[
            { label: "Emergency Fund", percent: 95, tone: "bg-emerald-500" },
            { label: "Down payment", percent: 40, tone: "bg-blue-500" },
          ].map((goal) => (
            <div
              key={goal.label}
              className="rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-foreground">{goal.label}</div>
                <div className="text-sm text-muted-foreground">{goal.percent}%</div>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${goal.tone}`}
                  style={{ width: `${goal.percent}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Updated after your latest decision
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const currentSlide = slides[activeSlide];

  return (
    <div className="min-h-screen bg-background flex flex-col -mt-30">
      <div className="flex-1 flex flex-col justify-between px-6 py-12 max-w-lg mx-auto w-full">
        {/* Content */}
        <div className="flex-1 flex flex-col justify-center -mt-20">
          <h1 className="text-5xl font-bold mb-2">{currentSlide.title}</h1>
          <h2 className="text-3xl font-light text-foreground/90 mb-8">
            {currentSlide.subtitle}
          </h2>

          {currentSlide.renderVisual()}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((slide, index) => {
            const isActive = index === activeSlide;
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-pressed={isActive}
                onClick={() => setActiveSlide(index)}
                className={`h-3 w-3 rounded-full border transition-colors ${
                  isActive ? "bg-primary border-primary" : "border-muted bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate("/demo-login")}
            variant="outline"
            className="w-full h-14 text-lg rounded-2xl border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Try Demo
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/waitlist")}
            className="w-full h-14 text-lg text-foreground hover:bg-secondary rounded-2xl"
          >
            Join waitlist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
