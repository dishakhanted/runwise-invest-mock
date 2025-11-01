import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ChevronRight, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const profileData = {
    personalInfo: [
      {
        label: "Name",
        value: "Disha Padamraj Khanted",
        action: "Request to update",
        actionType: "button",
      },
      {
        label: "Preferred name",
        value: "Disha",
        hasArrow: true,
      },
      {
        label: "Marital status",
        value: "Single",
        hasArrow: true,
      },
      {
        label: "Country of citizenship",
        value: "India",
        locked: true,
      },
      {
        label: "Liquid net worth",
        value: "$70,000",
        hasArrow: true,
      },
    ],
    taxInfo: [
      {
        label: "Pretax annual income",
        value: "$94,000",
        hasArrow: true,
      },
      {
        label: "Tax filing state",
        value: "Illinois",
        hasInfo: true,
      },
      {
        label: "Tax filing status",
        value: "Single",
        hasArrow: true,
      },
    ],
    contactInfo: [
      {
        label: "Residential address",
        value: "151 N Michigan Ave Apt 1114, Chicago, IL 60601-7538",
        hasArrow: true,
      },
    ],
    employmentInfo: [
      {
        label: "Employment type",
        value: "Employed",
        hasArrow: true,
      },
      {
        label: "Current employer",
        value: "Columbia university",
        hasArrow: true,
      },
      {
        label: "Job title",
        value: "Research",
        hasArrow: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-center mb-8">Profile</h1>

        <div className="space-y-8">
          {/* Personal Info Section */}
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
                    {item.locked && (
                      <Lock className="h-5 w-5 text-primary mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Info Section */}
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
                    {item.hasInfo && (
                      <Info className="h-5 w-5 text-primary mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info Section */}
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

          {/* Employment Info Section */}
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
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
