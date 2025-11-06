import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && scenario) {
      // Initialize with the assistant's intro message
      setMessages([
        {
          role: "assistant",
          content: scenario.introMessage,
        },
      ]);
      // Make sure actions are hidden initially
      setShowActions(false);
    } else {
      setMessages([]);
      setShowActions(false);
    }
  }, [isOpen, scenario]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const updatedMessages: Message[] = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // For What If scenarios with goalTemplate, use the predefined response for the first user message
      if (scenario?.goalTemplate && updatedMessages.length === 2) {
        // This is the first user response after the intro
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant" as const,
              content: scenario.goalTemplate!.description,
            },
          ]);
          // Show action buttons after the predefined response
          setShowActions(true);
          setIsLoading(false);
        }, 500); // Small delay to simulate thinking
      } else {
        // For follow-up questions, call the AI and hide action buttons
        setShowActions(false);
        const { data, error } = await supabase.functions.invoke("financial-chat", {
          body: {
            messages: updatedMessages,
          },
        });

        if (error) throw error;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: data.message,
          },
        ]);
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!scenario?.goalTemplate) return;

    // Hide action buttons
    setShowActions(false);

    // Add user's approval as a message
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: "Approve" },
    ]);

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's current age from profile
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
        targetAge = currentAge + 4; // 4 years from now
      }

      // Initial allocation: $400 from savings + $200 from stocks
      const initialAmount = 600;

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        name: "Car",
        target_amount: 12000,
        current_amount: initialAmount,
        description: scenario.goalTemplate.description,
        allocation_savings: 70,
        allocation_stocks: 20,
        allocation_bonds: 10,
        ...(targetAge && { target_age: targetAge }),
      });

      if (error) throw error;

      // Add assistant confirmation message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: `Perfect! I've created your Car purchase goal with a target of $12,000${targetAge ? ` by age ${targetAge}` : ' in 4 years'}. I've allocated an initial $${initialAmount} from your savings and stocks. Your allocation strategy is 70% savings, 20% stocks, and 10% bonds. You can track this goal in your Goals page.`,
        },
      ]);
    } catch (error) {
      console.error("Error creating goal:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "I apologize, but there was an error creating your goal. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = () => {
    // Hide action buttons
    setShowActions(false);

    // Add user's denial as a message
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: "Deny" },
    ]);

    // Add assistant acknowledgment
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant" as const,
        content: "No problem! If you change your mind or want to explore other financial goals, just let me know. Is there anything else I can help you with?",
      },
    ]);
  };

  const sendMessage = async (messagesToSend: Message[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("financial-chat", {
        body: {
          messages: messagesToSend,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: data.message,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKnowMore = () => {
    setShowActions(false);
    setInput("Tell me more about this plan");
    // Trigger send immediately
    setTimeout(() => {
      const knowMoreMessage: Message[] = [...messages, { role: "user" as const, content: "Tell me more about this plan" }];
      setMessages(knowMoreMessage);
      sendMessage(knowMoreMessage);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{scenario?.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {showActions && scenario?.goalTemplate && (
          <div className="flex gap-2 py-3 border-t">
            <Button onClick={handleApprove} className="flex-1">
              Approve
            </Button>
            <Button onClick={handleDeny} variant="outline" className="flex-1">
              Deny
            </Button>
            <Button onClick={handleKnowMore} variant="ghost" className="flex-1">
              Know more
            </Button>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
