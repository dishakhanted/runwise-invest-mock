import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import {
  User,
  Lock,
  Building2,
  TrendingUp,
  Bell,
  HelpCircle,
  List,
  Folder,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const menuSections = [
    {
      title: "SETTINGS",
      items: [
        {
          icon: User,
          label: "Profile",
          description: "Edit personal, contact, tax, and employment info.",
          action: () => {},
        },
        {
          icon: Lock,
          label: "Security",
          description:
            "Set password, email, PIN, biometrics, two-factor authentication, trusted contact, and more.",
          action: () => {},
        },
        {
          icon: Building2,
          label: "Accounts",
          description:
            "View account details, link transfer accounts, set beneficiaries, and more.",
          action: () => {},
        },
        {
          icon: TrendingUp,
          label: "Investing",
          description:
            "Manage stock restrictions and securities lending across accounts.",
          action: () => {},
        },
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage push and email preferences.",
          action: () => {},
        },
      ],
    },
    {
      title: "INFO",
      items: [
        {
          icon: HelpCircle,
          label: "Support",
          description: "Contact us, help center, ATM locator",
          action: () => {},
        },
        {
          icon: List,
          label: "Activity log",
          description: "See what's happening in your accounts.",
          action: () => {},
        },
        {
          icon: Folder,
          label: "Documents",
          description:
            "Download or upload statements, tax documents, agreements",
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-5xl font-bold mb-12">Disha</h1>

        <div className="space-y-8">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 px-1">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start px-1 py-6 h-auto text-left"
                    onClick={item.action}
                  >
                    <item.icon className="h-6 w-6 mr-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-medium mb-1">
                        {item.label}
                      </span>
                      <span className="text-sm text-muted-foreground font-normal">
                        {item.description}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            className="w-full justify-start px-1 py-6 h-auto text-destructive hover:text-destructive"
          >
            <LogOut className="h-6 w-6 mr-4" />
            <span className="text-lg font-medium">Sign out</span>
          </Button>

          <DisclosureFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
