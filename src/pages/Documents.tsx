import { BottomNav } from "@/components/BottomNav";
import { DisclosureFooter } from "@/components/DisclosureFooter";
import { X, ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const Documents = () => {
  const navigate = useNavigate();

  const taxDocuments = [
    {
      account: "Individual Cash Account",
      formType: "Form 1099",
    },
    {
      account: "Individual Automated Investing Account",
      formType: "Consolidated Form 1099",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-8">
          <h1 className="text-4xl font-bold">Taxes & Documents</h1>

          {/* Tax Documents Card */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Tax Documents</h2>
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Tax Year Selector */}
              <Select defaultValue="2024">
                <SelectTrigger className="w-full bg-muted">
                  <SelectValue placeholder="Select tax year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">Tax Year: 2024</SelectItem>
                  <SelectItem value="2023">Tax Year: 2023</SelectItem>
                  <SelectItem value="2022">Tax Year: 2022</SelectItem>
                </SelectContent>
              </Select>

              {/* TurboTax Link */}
              <Button
                variant="link"
                className="text-primary hover:text-primary/80 px-0 h-auto text-base"
              >
                TurboTax® Import Instructions
              </Button>

              {/* Table Header */}
              <div className="grid grid-cols-[2fr,2fr,1fr] gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b">
                <div>ACCOUNT</div>
                <div>FORM TYPE</div>
                <div>DOWNLOAD FILES</div>
              </div>

              {/* Table Rows */}
              <div className="space-y-6">
                {taxDocuments.map((doc, idx) => (
                  <div key={idx} className="grid grid-cols-[2fr,2fr,1fr] gap-4 items-start">
                    <div className="text-base">{doc.account}</div>
                    <div className="text-base">{doc.formType}</div>
                    <Button
                      variant="link"
                      className="text-primary hover:text-primary/80 px-0 h-auto text-base justify-start"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statements Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold">Statements and Trade Confirmations</h2>
            </CardContent>
          </Card>

          <DisclosureFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Documents;
