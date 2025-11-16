import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";
import { ChevronLeft, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useFinancialChat } from "@/hooks/useFinancialChat";

interface ChatbotStepProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const ChatbotStep = ({ data, onComplete, onBack }: ChatbotStepProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collectedData, setCollectedData] = useState({
    income: "",
    employmentType: "",
    goals: "",
  });

  // Use the AI chat hook for onboarding
  const {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
  } = useFinancialChat({
    contextType: 'onboarding',
    contextData: data,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-start the onboarding conversation when component mounts
  const hasStarted = useRef(false);
  useEffect(() => {
    if (!hasStarted.current && messages.length === 0 && !isLoading) {
      hasStarted.current = true;
      // Trigger AI to start onboarding by sending a greeting
      const triggerMessage = async () => {
        setInput("Hello");
        // Wait for state to update, then send
        setTimeout(() => {
          sendMessage();
        }, 100);
      };
      triggerMessage();
    }
  }, []);

  // Check if onboarding is complete by detecting JSON in the last assistant message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.content.includes('{')) {
      // Try to extract JSON from the message
      try {
        const jsonMatch = lastMessage.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const onboardingResult = JSON.parse(jsonMatch[0]);
          // Store the collected data and complete onboarding
          handleOnboardingComplete(onboardingResult);
        }
      } catch (error) {
        console.error('Error parsing onboarding JSON:', error);
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage();
  };

  const handleOnboardingComplete = async (onboardingResult: any) => {
    if (isCreatingAccount) return; // Prevent duplicate submissions
    
    setIsCreatingAccount(true);
    
    try {
      // Store the collected data from AI
      setCollectedData({
        income: onboardingResult.salary || "",
        employmentType: onboardingResult.work_type || "",
        goals: Array.isArray(onboardingResult.goals) 
          ? onboardingResult.goals.join(", ") 
          : onboardingResult.goals || "",
      });

      // Create auth account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email!,
        password: data.password!,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create account");

      // Save profile data
      const { error: profileError } = await supabase
        .from("profiles")
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
          ssn_encrypted: data.ssn,
          credit_check_consent: data.creditCheckConsent || false,
          income: onboardingResult.salary || "",
          employment_type: onboardingResult.work_type || "",
          goals: Array.isArray(onboardingResult.goals) 
            ? onboardingResult.goals.join(", ") 
            : onboardingResult.goals || "",
          onboarding_completed: true,
        })
        .eq("user_id", authData.user.id);

      if (profileError) throw profileError;

      // Create linked accounts
      if (data.linkedAccounts && data.linkedAccounts.length > 0) {
        const { error: accountsError } = await supabase.from("linked_accounts").insert(
          data.linkedAccounts.map((account) => ({
            ...account,
            user_id: authData.user.id,
          })),
        );

        if (accountsError) console.error("Error creating linked accounts:", accountsError);
      }

      // Create default goals
      const currentAge = data.dateOfBirth 
        ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() 
        : 25;

      const defaultGoals = [
        {
          name: "Pay Off Student Loan",
          target_amount: 27800,
          target_age: currentAge + 5,
          current_amount: 3500,
          allocation_savings: 50,
          allocation_stocks: 30,
          allocation_bonds: 20,
          user_id: authData.user.id,
        },
        {
          name: "Retirement Planning",
          target_amount: 1000000,
          target_age: 65,
          current_amount: 5300,
          allocation_savings: 20,
          allocation_stocks: 60,
          allocation_bonds: 20,
          user_id: authData.user.id,
        },
        {
          name: "Home Goal",
          target_amount: 10000,
          target_age: currentAge + 6,
          current_amount: 2400,
          allocation_savings: 40,
          allocation_stocks: 50,
          allocation_bonds: 10,
          user_id: authData.user.id,
        },
      ];

      const { error: goalsError } = await supabase.from("goals").insert(defaultGoals);

      if (goalsError) console.error("Error creating goals:", goalsError);

      toast({
        title: "Account created!",
        description: "Welcome to GrowWise. Redirecting to your dashboard...",
      });

      setTimeout(() => {
        navigate("/dashboard");
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

  return (
    <div className="flex-1 flex flex-col h-full">
      <Button variant="ghost" onClick={onBack} className="w-fit -ml-2 mb-6">
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </Button>

      <h2 className="text-2xl font-semibold mb-2 text-foreground">
        Let's get to know you
      </h2>
      <p className="text-muted-foreground mb-6">
        Answer a few questions so we can personalize your experience
      </p>

      <ScrollArea ref={scrollRef} className="flex-1 pr-4 -mr-4">
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
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-6 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your answer..."
          className="flex-1"
          disabled={isLoading || isCreatingAccount}
        />
        <Button
          onClick={handleSend}
          size="icon"
          disabled={!input.trim() || isLoading || isCreatingAccount}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
