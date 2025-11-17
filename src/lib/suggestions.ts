export interface Suggestion {
  id: string;
  title: string;
  description: string;
  status?: "pending" | "approved" | "denied";
}

/**
 * Build one or more suggestions from an assistant message.
 * This is used for goal, net worth, assets, liabilities chatbots,
 * and should produce a clean "headline + explanation" card.
 */
export const buildSuggestionsFromMessage = (
  assistantMessage: string,
  contextType: string
): Suggestion[] => {
  const lines = assistantMessage
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Simple generic heuristic for now:
  // - First line becomes a short title
  // - Remaining lines become the description
  const title = lines[0].slice(0, 80);
  const description = lines.slice(1).join(" ").slice(0, 300);

  return [
    {
      id: `${contextType || "suggestion"}-${Date.now()}`,
      title: title || "Recommendation",
      description: description || assistantMessage.slice(0, 300),
      status: "pending",
    },
  ];
};

/**
 * Detect if the user message is an approval/denial
 * (triggered by clicking Approve / Deny buttons).
 */
export const isApprovalOrDenialMessage = (content: string): boolean => {
  const text = content.trim();
  return (
    text.startsWith("I approve the suggestion:") ||
    text.startsWith("I decline the suggestion:")
  );
};
