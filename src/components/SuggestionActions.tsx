import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status?: 'pending' | 'approved' | 'denied';
}

interface SuggestionActionsProps {
  suggestion: Suggestion;
  messageIndex: number;
  onAction: (messageIndex: number, suggestionId: string, action: 'approved' | 'denied' | 'know_more') => void;
}

export const SuggestionActions = ({ suggestion, messageIndex, onAction }: SuggestionActionsProps) => {
  return (
    <div className="bg-background/50 rounded-lg p-3 border border-border">
      <p className="text-sm font-medium mb-1">{suggestion.title}</p>
      <p className="text-xs text-muted-foreground mb-3">{suggestion.description}</p>

      {suggestion.status === "pending" && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="success"
              className="rounded-full px-4 h-8"
              onClick={() => onAction(messageIndex, suggestion.id, "approved")}
            >
              <Check className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full px-4 h-8"
              onClick={() => onAction(messageIndex, suggestion.id, "denied")}
            >
              <X className="h-3 w-3 mr-1" />
              Deny
            </Button>
          </div>
          <div className="mt-2">
            <Button
              size="sm"
              variant="link"
              className="p-0 h-auto"
              onClick={() => onAction(messageIndex, suggestion.id, "know_more")}
            >
              Know more
            </Button>
          </div>
        </>
      )}

      {suggestion.status === "approved" && (
        <div className="flex items-center gap-1 text-xs text-success">
          <Check className="h-3 w-3" />
          Approved
        </div>
      )}

      {suggestion.status === "denied" && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <X className="h-3 w-3" />
          Declined
        </div>
      )}
    </div>
  );
};
