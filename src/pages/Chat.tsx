import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { Bot, Send, User, Plus } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Investment Strategy",
      lastMessage: "How should I diversify my portfolio?",
      timestamp: new Date(Date.now() - 3600000),
      messages: [
        {
          role: "user",
          content: "How should I diversify my portfolio?",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          role: "assistant",
          content: "Based on your current holdings, I recommend spreading your investments across different asset classes. Consider a mix of stocks, bonds, and real estate for optimal diversification.",
          timestamp: new Date(Date.now() - 3500000),
        },
      ],
    },
    {
      id: "2",
      title: "Retirement Planning",
      lastMessage: "When should I start saving for retirement?",
      timestamp: new Date(Date.now() - 86400000),
      messages: [
        {
          role: "user",
          content: "When should I start saving for retirement?",
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          role: "assistant",
          content: "The best time to start is now! With your current age and income, contributing 15% to your 401(k) could help you build a comfortable retirement fund.",
          timestamp: new Date(Date.now() - 86300000),
        },
      ],
    },
    {
      id: "3",
      title: "Emergency Fund",
      lastMessage: "How much should I keep in my emergency fund?",
      timestamp: new Date(Date.now() - 172800000),
      messages: [
        {
          role: "user",
          content: "How much should I keep in my emergency fund?",
          timestamp: new Date(Date.now() - 172800000),
        },
        {
          role: "assistant",
          content: "I recommend maintaining 3-6 months of expenses in an easily accessible savings account. Based on your spending patterns, that would be around $15,000-$30,000.",
          timestamp: new Date(Date.now() - 172700000),
        },
      ],
    },
  ]);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>("1");
  const [input, setInput] = useState("");

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const handleSend = () => {
    if (!input.trim() || !selectedConversationId) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, userMessage],
            lastMessage: input,
            timestamp: new Date(),
          };
        }
        return conv;
      })
    );

    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "I understand your question. I'm here to help you with your financial decisions. Could you provide more details so I can give you the best advice?",
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === selectedConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, aiMessage],
              lastMessage: aiMessage.content.substring(0, 50) + "...",
              timestamp: new Date(),
            };
          }
          return conv;
        })
      );
    }, 1000);
  };

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: "Start a new conversation",
      timestamp: new Date(),
      messages: [
        {
          role: "assistant",
          content: "Hi! I'm your financial assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ],
    };
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversationId(newConversation.id);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-lg mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNewChat}
            className="rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-4 pb-32">
            {selectedConversation?.messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Fixed Input at Bottom - Above Bottom Nav */}
        <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border">
          <div className="max-w-lg mx-auto px-6 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DisclosureFooter />
      </div>

      <BottomNav />
    </div>
  );
};

export default Chat;
