import { BottomNav } from "@/components/BottomNav";
import { User } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-5xl font-bold mb-8">Profile</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">disha.khanted@gmail.com</h2>
          <p className="text-muted-foreground">Welcome to Honey Pot</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
