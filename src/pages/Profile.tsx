import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { Logo } from "@/components/Logo";
import { ChevronRight, ChevronLeft, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  
  const profileData = {
    personalInfo: [
      {
        label: "Name",
        value: profile?.legal_first_name && profile?.legal_last_name 
          ? `${profile.legal_first_name}${profile.middle_name ? ' ' + profile.middle_name : ''} ${profile.legal_last_name}${profile.suffix ? ' ' + profile.suffix : ''}`
          : "Not set",
        action: "Request to update",
        actionType: "button",
      },
      {
        label: "Preferred name",
        value: profile?.preferred_first_name || "Not set",
        hasArrow: true,
      },
      {
        label: "Date of Birth",
        value: profile?.date_of_birth 
          ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : "Not set",
        hasArrow: true,
      },
      {
        label: "Employment type",
        value: profile?.employment_type || "Not set",
        hasArrow: true,
      },
    ],
    taxInfo: [
      {
        label: "Pretax annual income",
        value: profile?.income || "Not set",
        hasArrow: true,
      },
    ],
    contactInfo: [
      {
        label: "Phone",
        value: profile?.phone || "Not set",
        hasArrow: true,
      },
      {
        label: "Residential address",
        value: profile?.address && profile?.city && profile?.state && profile?.zip_code
          ? `${profile.address}, ${profile.city}, ${profile.state} ${profile.zip_code}`
          : "Not set",
        hasArrow: true,
      },
    ],
    employmentInfo: [
      {
        label: "Employment type",
        value: profile?.employment_type || "Not set",
        hasArrow: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="relative mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2">Profile</h1>
          <Logo className="h-16 w-16" />
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold">
            {profile?.preferred_first_name && profile?.legal_last_name
              ? `${profile.preferred_first_name} ${profile.legal_last_name}`
              : profile?.legal_first_name && profile?.legal_last_name
              ? `${profile.legal_first_name} ${profile.legal_last_name}`
              : "User"}
          </h2>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="tax">Tax</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 tracking-wider">
                PERSONAL INFO
              </h3>
              <div className="space-y-6">
                {profileData.personalInfo.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-lg font-medium mb-1">{item.label}</div>
                        <div className="text-muted-foreground">{item.value}</div>
                      </div>
                      {item.actionType === "button" && (
                        <Button
                          variant="ghost"
                          className="text-primary hover:text-primary/80 px-2"
                        >
                          {item.action}
                        </Button>
                      )}
                      {item.hasArrow && (
                        <ChevronRight className="h-5 w-5 text-primary mt-1" />
                      )}
                      {'locked' in item && item.locked && (
                        <Lock className="h-5 w-5 text-primary mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DisclosureFooter />
          </TabsContent>

          <TabsContent value="tax" className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 tracking-wider">
                TAX INFO
              </h3>
              <div className="space-y-6">
                {profileData.taxInfo.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-lg font-medium mb-1">{item.label}</div>
                        <div className="text-muted-foreground">{item.value}</div>
                      </div>
                      {item.hasArrow && (
                        <ChevronRight className="h-5 w-5 text-primary mt-1" />
                      )}
                      {'hasInfo' in item && item.hasInfo && (
                        <Info className="h-5 w-5 text-primary mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DisclosureFooter />
          </TabsContent>

          <TabsContent value="contact" className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 tracking-wider">
                CONTACT INFO
              </h3>
              <div className="space-y-6">
                {profileData.contactInfo.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-lg font-medium mb-1">{item.label}</div>
                        <div className="text-muted-foreground">{item.value}</div>
                      </div>
                      {item.hasArrow && (
                        <ChevronRight className="h-5 w-5 text-primary mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DisclosureFooter />
          </TabsContent>

          <TabsContent value="employment" className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 tracking-wider">
                EMPLOYMENT INFO
              </h3>
              <div className="space-y-6">
                {profileData.employmentInfo.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-lg font-medium mb-1">{item.label}</div>
                        <div className="text-muted-foreground">{item.value}</div>
                      </div>
                      {item.hasArrow && (
                        <ChevronRight className="h-5 w-5 text-primary mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DisclosureFooter />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
