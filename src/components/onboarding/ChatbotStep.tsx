import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";
import { ChevronLeft, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatbotStepProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

interface Message {
  role: "assistant" | "user";
  content: string;
}

export const ChatbotStep = ({ onComplete, onBack }: ChatbotStepProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome! I'm here to help you get started. Let me ask you a few questions to personalize your experience. What is your annual pretax income?",
    },
  ]);
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collectedData, setCollectedData] = useState({
    income: "",
    employmentType: "",
    goals: "",
  });

  const questions = [
    {
      field: "income",
      prompt: "What is your employment type? (e.g., Full-time, Part-time, Self-employed, Retired)",
    },
    {
      field: "employmentType",
      prompt: "What are your main financial goals? (e.g., retirement planning, buying a home, paying off debt)",
    },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Store the answer
    if (currentQuestion === 0) {
      setCollectedData(prev => ({ ...prev, income: input }));
    } else if (currentQuestion === 1) {
      setCollectedData(prev => ({ ...prev, employmentType: input }));
    } else if (currentQuestion === 2) {
      setCollectedData(prev => ({ ...prev, goals: input }));
    }

    setInput("");

    // Simulate assistant response
    setTimeout(() => {
      if (currentQuestion < questions.length) {
        const assistantMessage: Message = {
          role: "assistant",
          content: questions[currentQuestion].prompt,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // Final message
        const assistantMessage: Message = {
          role: "assistant",
          content: "Perfect! I have everything I need. Based on your income, employment type, and goals, we'll create a personalized financial plan for you. Click 'Complete Setup' to get started!",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    }, 800);
  };

  const handleComplete = () => {
    onComplete(collectedData);
  };

  const isComplete = currentQuestion > questions.length;

  return (
    <div className="flex-1 flex flex-col h-full">
      <Button
        variant="ghost"
        onClick={onBack}
        className="w-fit -ml-2 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-2">Tell us about yourself</h1>
      <p className="text-muted-foreground mb-6">
        Answer a few questions to help us personalize your experience.
      </p>

      <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-6 space-y-3">
        {!isComplete ? (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your answer..."
              className="h-14"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="h-14 w-14 shrink-0 rounded-2xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleComplete}
            className="w-full h-14 text-lg rounded-2xl"
          >
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  );
};
