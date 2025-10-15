import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LinkAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const banks = [
  { id: "1", name: "Chase", logo: "💳" },
  { id: "2", name: "Bank of America", logo: "🏦" },
  { id: "3", name: "Wells Fargo", logo: "🏛️" },
  { id: "4", name: "Citibank", logo: "🏢" },
  { id: "5", name: "Capital One", logo: "💼" },
  { id: "6", name: "US Bank", logo: "🏦" },
  { id: "7", name: "PNC Bank", logo: "🏛️" },
  { id: "8", name: "TD Bank", logo: "🏢" },
  { id: "9", name: "Santander Bank", logo: "🏦" },
  { id: "10", name: "HSBC", logo: "🏛️" },
  { id: "11", name: "Ally Bank", logo: "💼" },
  { id: "12", name: "Discover Bank", logo: "💳" },
];

export const LinkAccountDialog = ({ isOpen, onClose }: LinkAccountDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBankClick = (bankName: string) => {
    // In a real app, this would initiate the OAuth flow
    alert(`Connecting to ${bankName}...`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Link Your Bank Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for your bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredBanks.map((bank) => (
              <Button
                key={bank.id}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => handleBankClick(bank.name)}
              >
                <span className="text-2xl mr-3">{bank.logo}</span>
                <span className="font-semibold">{bank.name}</span>
              </Button>
            ))}
          </div>

          {filteredBanks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No banks found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
