import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot } from "lucide-react";
import { useFinancialChat } from "@/hooks/useFinancialChat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WhatIfScenario {
  title: string;
  introMessage: string;
  goalTemplate?: {
    name: string;
    targetAmount: number;
    description: string;
  };
}

interface WhatIfChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: WhatIfScenario | null;
}

export const WhatIfChatDialog = ({ isOpen, onClose, scenario }: WhatIfChatDialogProps) => {
  const { toast } = useToast();
  
  const { messages, input, setInput, isLoading, sendMessage, handleClose } = useFinancialChat({
    contextType: 'general',
    contextData: { ...scenario, exploreContext: 'what-if' },
    initialMessage: "",
    initialSuggestions: [],
    onClose,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleApprove = async () => {
    if (!scenario?.goalTemplate) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('date_of_birth')
        .eq('user_id', user.id)
        .maybeSingle();

      let targetAge = null;
      if (profile?.date_of_birth) {
        const today = new Date();
        const birthDate = new Date(profile.date_of_birth);
        const currentAge = today.getFullYear() - birthDate.getFullYear();
        targetAge = currentAge + 4;
      }

      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        name: scenario.goalTemplate.name,
        target_amount: scenario.goalTemplate.targetAmount,
        description: scenario.goalTemplate.description,
        current_amount: 0,
        target_age: targetAge,
        allocation_savings: 60,
        allocation_stocks: 30,
        allocation_bonds: 10,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal created successfully!",
      });

      onClose();
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] max-h-[85vh] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {scenario?.title || "What-If Scenario"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-2">
          {scenario?.goalTemplate && (
            <div className="flex gap-2">
              <Button onClick={handleApprove} variant="default" className="flex-1">
                Create Goal
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Maybe Later
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
