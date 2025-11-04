import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ChevronRight, Landmark, TrendingUp, Bell, HelpCircle, List, FolderOpen, LogOut, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };
  
  const settingsItems = [
    {
      icon: User,
      title: "Profile",
      description: "Edit personal, contact, tax, and employment info.",
      path: "/profile",
    },
    {
      icon: Lock,
      title: "Security",
      description: "Set password, email, PIN, biometrics, two-factor authentication, trusted contact, and more.",
      path: "/security",
    },
    {
      icon: Landmark,
      title: "Accounts",
      description: "View account details, link transfer accounts, set beneficiaries, and more.",
      path: "/accounts",
    },
    {
      icon: TrendingUp,
      title: "Investing",
      description: "Manage stock restrictions and securities lending across accounts.",
      path: "/investing",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage push and email preferences.",
      path: "/notifications",
    },
  ];

  const infoItems = [
    {
      icon: HelpCircle,
      title: "Support",
      description: "Contact us, help center, ATM locator",
      path: "/support",
    },
    {
      icon: List,
      title: "Activity log",
      description: "See what's happening in your accounts.",
      path: "/activity-log",
    },
    {
      icon: FolderOpen,
      title: "Documents",
      description: "Download or upload statements, tax documents, agreements",
      path: "/documents",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {profile?.preferred_first_name || profile?.legal_first_name || "User"}
        </h1>
        
        <div className="space-y-8">
          {/* SETTINGS Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-6 tracking-wider">
              SETTINGS
            </h3>
            <div className="space-y-6">
              {settingsItems.map((item, idx) => (
                item.path ? (
                  <Link
                    key={idx}
                    to={item.path}
                    className="flex items-start gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
                  </Link>
                ) : (
                  <div
                    key={idx}
                    className="flex items-start gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
                  </div>
                )
              ))}
            </div>
          </div>

          {/* INFO Section */}
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-6 tracking-wider">
              INFO
            </h3>
            <div className="space-y-6">
              {infoItems.map((item, idx) => (
                item.path ? (
                  <Link
                    key={idx}
                    to={item.path}
                    className="flex items-start gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
                  </Link>
                ) : (
                  <div
                    key={idx}
                    className="flex items-start gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div className="pt-4">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start gap-4 h-auto py-4 px-0 hover:opacity-80"
              onClick={() => navigate('/login')}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <LogOut className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold">Sign out</span>
            </Button>
          </div>

          <DisclosureFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Settings;
