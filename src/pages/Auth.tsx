import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { logger } from "@/lib/logger";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    logger.auth('Login attempt', { email });

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      logger.debug('Email and password validated');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.auth('Login failed', { email, error: error.message });
        throw error;
      }

      if (data.user) {
        logger.auth('Login successful', { userId: data.user.id, email: data.user.email });
        
        // Check if onboarding is completed
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) {
          logger.warn('Error fetching profile', { error: profileError.message, userId: data.user.id });
        }

        const redirectPath = profile?.onboarding_completed ? '/dashboard' : '/onboarding';
        logger.auth('Redirecting after login', { 
          userId: data.user.id, 
          onboardingCompleted: profile?.onboarding_completed,
          redirectPath,
        });
        
        navigate(redirectPath);
      }
    } catch (error: any) {
      logger.error('Login error', { 
        email, 
        error: error.message,
        errorType: error.constructor.name,
      }, error instanceof Error ? error : undefined);
      
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8">
        <Logo className="h-20 w-20" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to GrowWise</CardTitle>
          <CardDescription className="text-center">
            Your intelligent financial companion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;