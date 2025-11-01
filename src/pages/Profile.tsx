import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { Logo } from "@/components/Logo";
import {
  User,
  Bell,
  Settings,
  Building2,
  FileText,
  BookOpen,
  DollarSign,
  Headphones,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const menuSections = [
    {
      title: "PROFILE",
      items: [
        { icon: Bell, label: "Activity", action: () => {} },
        { icon: Settings, label: "Settings", action: () => {} },
        { icon: Building2, label: "Linked accounts", action: () => {} },
        { icon: FileText, label: "Notes", action: () => {} },
        { icon: FileText, label: "Disclosure", action: () => {} },
      ],
    },
    {
      title: "RESOURCES",
      items: [
        { icon: BookOpen, label: "Blog", action: () => {} },
        { icon: DollarSign, label: "Runwise fees", action: () => {} },
      ],
    },
    {
      title: "SUPPORT",
      items: [
        { icon: Headphones, label: "Contact us", action: () => {} },
        { icon: HelpCircle, label: "Help center", action: () => {} },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">Profile</h1>
          <Logo className="h-10 w-10" />
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-1">
            disha.khanted@gmail.com
          </h2>
          <p className="text-sm text-muted-foreground">Welcome to Runwisr</p>
        </div>

        <div className="space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start px-3 py-6 h-auto"
                    onClick={item.action}
                  >
                    <item.icon className="h-5 w-5 mr-3 text-primary" />
                    <span className="text-base">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-6 h-auto text-destructive hover:text-destructive"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="text-base">Sign out</span>
          </Button>
        </div>
      </div>
      <BottomNav />
      <DisclosureFooter />
    </div>
  );
};

export default Profile;
