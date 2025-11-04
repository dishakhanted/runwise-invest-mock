import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";
import { ChevronLeft, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ChatbotStepProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

interface Message {
  role: "assistant" | "user";
  content: string;
}

export const ChatbotStep = ({ data, onComplete, onBack }: ChatbotStepProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
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
    goalsDetails: [] as Array<{ name: string; targetAmount: number; targetAge?: number }>,
  });
  const [isCollectingGoalDetails, setIsCollectingGoalDetails] = useState(false);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [goalDetailStep, setGoalDetailStep] = useState<'amount' | 'age'>('amount');
  const [parsedGoals, setParsedGoals] = useState<string[]>([]);

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

  const parseGoals = (goalsText: string): string[] => {
    const goals = [];
    const text = goalsText.toLowerCase();
    
    if (text.includes('retirement') || text.includes('retire')) {
      goals.push('Retirement Planning');
    }
    if (text.includes('house') || text.includes('home') || text.includes('property')) {
      goals.push('House Down Payment');
    }
    if (text.includes('emergency') || text.includes('fund')) {
      goals.push('Emergency Fund');
    }
    if (text.includes('debt') || text.includes('loan') || text.includes('pay off')) {
      goals.push('Pay Off Debt');
    }
    if (text.includes('education') || text.includes('college') || text.includes('school')) {
      goals.push('Education Fund');
    }
    if (text.includes('vacation') || text.includes('travel')) {
      goals.push('Vacation Fund');
    }
    
    return goals.length > 0 ? goals : ['General Savings'];
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");

    // Handle goal detail collection
    if (isCollectingGoalDetails) {
      setTimeout(() => {
        const currentGoal = parsedGoals[currentGoalIndex];
        
        if (goalDetailStep === 'amount') {
          const amount = parseFloat(currentInput.replace(/[^0-9.]/g, ''));
          if (isNaN(amount)) {
            const assistantMessage: Message = {
              role: "assistant",
              content: "Please enter a valid number for the target amount.",
            };
            setMessages((prev) => [...prev, assistantMessage]);
            return;
          }
          
          setCollectedData(prev => ({
            ...prev,
            goalsDetails: [
              ...prev.goalsDetails,
              { name: currentGoal, targetAmount: amount }
            ]
          }));
          
          // Always ask for target age for all goals
          setGoalDetailStep('age');
          const agePrompt = currentGoal === 'Retirement Planning' 
            ? "At what age would you like to retire?"
            : `At what age would you like to achieve this goal?`;
          const assistantMessage: Message = {
            role: "assistant",
            content: agePrompt,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else if (goalDetailStep === 'age') {
          const age = parseInt(currentInput.replace(/[^0-9]/g, ''));
          if (isNaN(age) || age < 18 || age > 100) {
            const assistantMessage: Message = {
              role: "assistant",
              content: "Please enter a valid retirement age (between 18 and 100).",
            };
            setMessages((prev) => [...prev, assistantMessage]);
            return;
          }
          
          // Update the last goal with target age
          setCollectedData(prev => ({
            ...prev,
            goalsDetails: prev.goalsDetails.map((g, idx) => 
              idx === prev.goalsDetails.length - 1 ? { ...g, targetAge: age } : g
            )
          }));
          
          // Move to next goal or finish
          if (currentGoalIndex < parsedGoals.length - 1) {
            setCurrentGoalIndex(prev => prev + 1);
            setGoalDetailStep('amount');
            const assistantMessage: Message = {
              role: "assistant",
              content: `Great! Now let's talk about your "${parsedGoals[currentGoalIndex + 1]}" goal. What's your target amount for this goal?`,
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } else {
            // All goals collected
            setIsCollectingGoalDetails(false);
            const assistantMessage: Message = {
              role: "assistant",
              content: "Perfect! I have everything I need. Based on your income, employment type, and goals, we'll create a personalized financial plan for you. Click 'Complete Setup' to get started!",
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
        }
      }, 800);
      return;
    }

    // Handle regular questions
    if (currentQuestion === 0) {
      setCollectedData(prev => ({ ...prev, income: currentInput }));
    } else if (currentQuestion === 1) {
      setCollectedData(prev => ({ ...prev, employmentType: currentInput }));
    } else if (currentQuestion === 2) {
      setCollectedData(prev => ({ ...prev, goals: currentInput }));
      
      // Parse goals and start collecting details
      const goals = parseGoals(currentInput);
      setParsedGoals(goals);
      
      setTimeout(() => {
        setIsCollectingGoalDetails(true);
        setCurrentGoalIndex(0);
        setGoalDetailStep('amount');
        const assistantMessage: Message = {
          role: "assistant",
          content: `Great! I identified these goals: ${goals.join(', ')}. Let's get more specific. For your "${goals[0]}" goal, what's your target amount?`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 800);
      return;
    }

    // Simulate assistant response for regular questions
    setTimeout(() => {
      if (currentQuestion < questions.length) {
        const assistantMessage: Message = {
          role: "assistant",
          content: questions[currentQuestion].prompt,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentQuestion((prev) => prev + 1);
      }
    }, 800);
  };

  const handleComplete = async () => {
    setIsCreatingAccount(true);
    
    try {
      // Create the account
      if (!data.email || !data.password) {
        throw new Error("Email and password are required");
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create account");

      // Save profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          legal_first_name: data.legalFirstName,
          preferred_first_name: data.preferredFirstName,
          middle_name: data.middleName,
          legal_last_name: data.legalLastName,
          suffix: data.suffix,
          date_of_birth: data.dateOfBirth,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          ssn_encrypted: data.ssn, // Note: Should be encrypted in production
          credit_check_consent: data.creditCheckConsent || false,
          income: collectedData.income,
          employment_type: collectedData.employmentType,
          goals: collectedData.goals,
          onboarding_completed: true,
        })
        .eq('user_id', authData.user.id);

      if (profileError) throw profileError;

      // Create linked accounts
      if (data.linkedAccounts && data.linkedAccounts.length > 0) {
        const { error: accountsError } = await supabase
          .from('linked_accounts')
          .insert(
            data.linkedAccounts.map(account => ({
              ...account,
              user_id: authData.user.id
            }))
          );

        if (accountsError) console.error('Error creating linked accounts:', accountsError);
      }

      // Create goals from collected details
      if (collectedData.goalsDetails.length > 0) {
        const goalsList = collectedData.goalsDetails.map(goal => {
          // Set allocation based on goal type
          let allocation = { savings: 40, stocks: 40, bonds: 20 };
          
          if (goal.name === 'Retirement Planning') {
            allocation = { savings: 20, stocks: 60, bonds: 20 };
          } else if (goal.name === 'Emergency Fund' || goal.name === 'Pay Off Debt') {
            allocation = { savings: 100, stocks: 0, bonds: 0 };
          } else if (goal.name === 'House Down Payment') {
            allocation = { savings: 40, stocks: 50, bonds: 10 };
          }
          
          return {
            name: goal.name,
            target_amount: goal.targetAmount,
            target_age: goal.targetAge,
            current_amount: 0,
            allocation_savings: allocation.savings,
            allocation_stocks: allocation.stocks,
            allocation_bonds: allocation.bonds
          };
        });

        const { error: goalsError } = await supabase
          .from('goals')
          .insert(
            goalsList.map(goal => ({
              ...goal,
              user_id: authData.user.id
            }))
          );

        if (goalsError) console.error('Error creating goals:', goalsError);
      }

      toast({
        title: "Account created!",
        description: "Welcome to GrowWise. Redirecting to your dashboard...",
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error("Account creation error:", error);
      toast({
        title: "Account Creation Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const isComplete = !isCollectingGoalDetails && currentQuestion > questions.length;

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
        {!isComplete && (
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
        )}
        <Button
          onClick={handleComplete}
          className="w-full h-14 text-lg rounded-2xl"
          variant={isComplete ? "default" : "outline"}
          disabled={isCreatingAccount}
        >
          {isCreatingAccount ? "Creating Account..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
};
