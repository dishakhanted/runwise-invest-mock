/**
 * Demo Login Page
 * Allows users to select a demo persona to explore the app
 */

import { useNavigate } from 'react-router-dom';
import { getAllDemoProfiles, DemoProfile } from '@/demo/demoProfiles';
import { useSession } from '@/contexts/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft, TrendingUp, Target, Wallet } from 'lucide-react';

const DemoLogin = () => {
  const navigate = useNavigate();
  const { setDemoMode } = useSession();
  const profiles = getAllDemoProfiles();

  const handleSelectProfile = (profile: DemoProfile) => {
    setDemoMode(profile.id);
    navigate('/dashboard');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Logo className="h-10 w-10" />
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Try Demo Mode</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore GrowWise with realistic sample data. Select a persona below to see how 
            the app works for different financial situations.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {profiles.map((profile) => (
            <Card 
              key={profile.id}
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] hover:border-primary/50 group"
              onClick={() => handleSelectProfile(profile)}
            >
              <CardHeader className="text-center pb-2">
                <div className="text-5xl mb-3">{profile.avatar}</div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {profile.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {profile.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span>Net Worth</span>
                  </div>
                  <div className="text-right font-semibold">
                    {formatCurrency(profile.netWorthSummary.netWorth)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span>Assets</span>
                  </div>
                  <div className="text-right font-semibold text-success">
                    {formatCurrency(profile.netWorthSummary.assetsTotal)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4 text-icon-blue" />
                    <span>Goals</span>
                  </div>
                  <div className="text-right font-semibold">
                    {profile.goals.length} active
                  </div>
                </div>

                {/* Select Button */}
                <Button 
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                  variant="outline"
                >
                  Explore as {profile.profile.preferred_first_name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Demo mode uses sample data only. No real accounts or data will be accessed.</p>
          <Button 
            variant="link" 
            className="mt-2"
            onClick={() => navigate('/waitlist')}
          >
            Join waitlist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
