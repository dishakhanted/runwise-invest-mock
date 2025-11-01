import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Security = () => {
  const navigate = useNavigate();
  const [unlockWithPin, setUnlockWithPin] = useState(false);
  const [unlockWithFaceId, setUnlockWithFaceId] = useState(true);

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
          <h1 className="text-2xl font-semibold text-center">Security</h1>
        </div>

        <div className="space-y-6">
          {/* Unlock with PIN */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Unlock with a PIN</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlock the app by using a numeric code. After 5 failed attempts, you'll be signed out of the app.
              </p>
            </div>
            <Switch
              checked={unlockWithPin}
              onCheckedChange={setUnlockWithPin}
              className="mt-1"
            />
          </div>

          {/* Unlock with Face ID */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Unlock with Face ID</h3>
              <p className="text-sm text-muted-foreground">
                Unlock the app using Face ID.
              </p>
            </div>
            <Switch
              checked={unlockWithFaceId}
              onCheckedChange={setUnlockWithFaceId}
              className="mt-1"
            />
          </div>

          {/* Change email */}
          <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity py-2">
            <h3 className="text-lg font-semibold">Change email</h3>
            <ExternalLink className="h-5 w-5 text-primary" />
          </div>

          {/* Change password */}
          <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity py-2">
            <h3 className="text-lg font-semibold">Change password</h3>
            <ExternalLink className="h-5 w-5 text-primary" />
          </div>

          {/* Two-factor authentication */}
          <div className="py-2">
            <div className="flex items-start justify-between gap-4 mb-1">
              <h3 className="text-lg font-semibold">Two-factor authentication</h3>
              <span className="text-primary font-medium">Enabled</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add another layer of security to your account by requiring an additional verification code each time you log in.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8"></div>

          {/* Trusted contact */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-start justify-between gap-4 mb-1">
              <h3 className="text-lg font-semibold">Trusted contact</h3>
              <ExternalLink className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Designate someone to get in touch with if Wealthfront is unable to contact you for an extended period of time.
            </p>
          </div>

          {/* App specific passwords */}
          <div className="cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-start justify-between gap-4 mb-1">
              <h3 className="text-lg font-semibold">App specific passwords</h3>
              <ExternalLink className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generate unique passwords to link your Wealthfront account to other services like Turbotax.
            </p>
          </div>

          <DisclosureFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Security;
