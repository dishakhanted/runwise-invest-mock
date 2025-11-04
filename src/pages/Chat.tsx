import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { Bot, Send, User, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFinancialChat } from "@/hooks/useFinancialChat";

const Chat = () => {
  const navigate = useNavigate();

  const initialMessage = "Hi! I'm your financial assistant. I can help you with budgeting, investment advice, savings strategies, and answer any questions about your finances. What would you like to discuss today?";

  const { messages, input, setInput, isLoading, sendMessage } = useFinancialChat({
    contextType: 'general',
    contextData: null,
    initialMessage,
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-md w-full flex flex-col h-screen border-x border-border relative">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full"
            onClick={() => navigate('/inbox')}
          >
            <Inbox className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-4 pb-32">
            {messages.map((message, index) => (
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
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

        {/* Fixed Input at Bottom - Above Bottom Nav */}
        <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border">
          <div className="max-w-lg mx-auto px-6 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={sendMessage} size="icon" disabled={isLoading || !input.trim()}>
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