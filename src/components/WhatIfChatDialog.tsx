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
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("financial-chat", {
        body: {
          message: userMessage,
          conversationHistory: messages,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
      
      // Show action buttons after the first AI response
      setShowActions(true);
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        name: scenario.goalTemplate.name,
        target_amount: scenario.goalTemplate.targetAmount,
        current_amount: 0,
        description: scenario.goalTemplate.description,
        allocation_savings: 70,
        allocation_stocks: 20,
        allocation_bonds: 10,
      });

      if (error) throw error;

      toast({
        title: "Goal Created",
        description: `${scenario.goalTemplate.name} has been added to your goals.`,
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

  const handleDeny = () => {
    toast({
      title: "Understood",
      description: "No goal will be created at this time.",
    });
    onClose();
  };

  const handleKnowMore = () => {
    setShowActions(false);
    setInput("Tell me more about this plan");
    handleSend();
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
