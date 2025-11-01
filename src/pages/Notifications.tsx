import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Notifications = () => {
  const navigate = useNavigate();
  const [accountUpdates, setAccountUpdates] = useState(false);
  const [rewards, setRewards] = useState(false);
  const [invites, setInvites] = useState(false);
  const [autopilot, setAutopilot] = useState(false);
  const [announcements, setAnnouncements] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="relative mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="absolute left-0 top-0"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-center">Notifications</h1>
        </div>

        <div className="space-y-6">
          {/* Enable Push Notifications */}
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              To be notified next time these activities occur, enable push notifications.
            </p>
            <Button className="w-full h-14 text-lg font-semibold">
              Enable
            </Button>
          </div>

          {/* DEVICE Section */}
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-6 tracking-wider">
              DEVICE
            </h3>

            <div className="space-y-6">
              {/* Account updates */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">Account updates</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Stay updated on general activity like transfers and interest earnings, as well as login attempts
                  </p>
                </div>
                <Switch
                  checked={accountUpdates}
                  onCheckedChange={setAccountUpdates}
                  className="mt-1"
                />
              </div>

              {/* Rewards */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">Rewards</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Never miss a chance to win cash, invest for free, or enjoy other perks
                  </p>
                </div>
                <Switch
                  checked={rewards}
                  onCheckedChange={setRewards}
                  className="mt-1"
                />
              </div>

              {/* Invites */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">Invites</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get status updates on your invites when you share Wealthfront with friends
                  </p>
                </div>
                <Switch
                  checked={invites}
                  onCheckedChange={setInvites}
                  className="mt-1"
                />
              </div>

              {/* Autopilot */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">Autopilot</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Know the status of your transfers for excess cash monitoring
                  </p>
                </div>
                <Switch
                  checked={autopilot}
                  onCheckedChange={setAutopilot}
                  className="mt-1"
                />
              </div>

              {/* Announcements */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">Announcements</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Find out when we launch new products or features
                  </p>
                </div>
                <Switch
                  checked={announcements}
                  onCheckedChange={setAnnouncements}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DisclosureFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Notifications;
