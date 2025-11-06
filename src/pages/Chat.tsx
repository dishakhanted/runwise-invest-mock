import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { Bot, Send, User, Inbox, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFinancialChat } from "@/hooks/useFinancialChat";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Subscribe to conversation changes for real-time updates
    const channel = supabase
      .channel('inbox-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const initialMessage = "Hello, how may I help you today?";
  
  const initialSuggestions = undefined;

  const { messages, input, setInput, isLoading, sendMessage, handleSuggestionAction } = useFinancialChat({
    contextType: 'general',
    contextData: null,
    initialMessage,
    initialSuggestions,
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
          <h1 className="text-2xl font-bold">GrowW AI</h1>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full relative"
            onClick={() => navigate('/inbox')}
          >
            <Inbox className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
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
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion) => (
                        <div 
                          key={suggestion.id}
                          className="bg-background/50 rounded-lg p-3 border border-border"
                        >
                          <p className="text-sm font-medium mb-1">{suggestion.title}</p>
                          <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                          
                          {suggestion.status === 'pending' && (
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex-1 h-8"
                                  onClick={() => handleSuggestionAction(index, suggestion.id, 'approved')}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8"
                                  onClick={() => handleSuggestionAction(index, suggestion.id, 'denied')}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Deny
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full h-8"
                                onClick={() => handleSuggestionAction(index, suggestion.id, 'know_more')}
                              >
                                Know more
                              </Button>
                            </div>
                          )}
                          
                          {suggestion.status === 'approved' && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Check className="h-3 w-3" />
                              Approved
                            </div>
                          )}
                          
                          {suggestion.status === 'denied' && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <X className="h-3 w-3" />
                              Denied
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
        <div className="absolute bottom-20 left-0 right-0 bg-background border-t border-border">
          <div className="px-6 py-4">
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