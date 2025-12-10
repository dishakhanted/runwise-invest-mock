/**
 * Parser for structured LLM responses containing suggestions
 * Handles JSON parsing and fallback for unstructured responses
 */

export type SuggestionActionType =
  | "COMPLETE_EMERGENCY_FUND"
  | "REALLOCATE_DOWN_PAYMENT"
  | "ACCELERATE_SOFI_LOAN"
  | "NO_ACTION";

export interface AISuggestion {
  id: string;
  title: string;
  body: string;
  contextType?: string;
  actionType?: SuggestionActionType;
}

export interface ParsedAIResponse {
  summary: string;
  suggestions: AISuggestion[];
}

/**
 * Parses LLM response into structured format
 * Supports JSON output from networth and other structured contexts
 */
export function parseStructuredResponse(
  rawResponse: string,
  contextType: string,
  promptType: string
): ParsedAIResponse {
  // For networth, assets, liabilities, and dashboard contexts, expect JSON output
  const isStructuredContext = 
    promptType === 'networth' || 
    promptType === 'assets' || 
    promptType === 'liabilities' ||
    contextType === 'net_worth' || 
    contextType === 'networth' || 
    contextType === 'dashboard' ||
    contextType === 'assets' ||
    contextType === 'liabilities';
    
  if (isStructuredContext) {
    try {
      // Try to extract JSON from the response
      // Handle cases where response might have markdown code blocks or extra text
      let jsonStr = rawResponse.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      // Try to find JSON object in the response
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Validate structure
      if (parsed && typeof parsed === 'object') {
        const summary = parsed.summary || '';
        const suggestions: AISuggestion[] = [];
        
        if (Array.isArray(parsed.suggestions)) {
          parsed.suggestions.forEach((sug: any, idx: number) => {
            if (sug && typeof sug.title === 'string' && typeof sug.body === 'string') {
              const titleLower = sug.title.trim().toLowerCase();
              let actionType: SuggestionActionType = "NO_ACTION";
              
              // Infer action type from title
              if (titleLower.includes("complete emergency fund") || titleLower.includes("emergency fund target") || titleLower.includes("increase emergency fund")) {
                actionType = "COMPLETE_EMERGENCY_FUND";
              } else if (titleLower.includes("down payment allocation") || titleLower.includes("align down payment") || titleLower.includes("rebalance")) {
                actionType = "REALLOCATE_DOWN_PAYMENT";
              } else if (titleLower.includes("sofi loan") || titleLower.includes("accelerate") || (titleLower.includes("pay down") && titleLower.includes("high interest"))) {
                actionType = "ACCELERATE_SOFI_LOAN";
              }
              
              suggestions.push({
                id: `${contextType}-${Date.now()}-${idx}`,
                title: sug.title.trim(),
                body: sug.body.trim(),
                contextType,
                actionType,
              });
            }
          });
        }
        
        return {
          summary: summary.trim() || rawResponse,
          suggestions,
        };
      }
    } catch (error) {
      console.warn(`[suggestionParser] Failed to parse JSON response for ${contextType}:`, error);
      // Fall through to fallback parsing
    }
  }
  
  // Fallback: parse unstructured text
  return parseUnstructuredResponse(rawResponse, contextType);
}

/**
 * Fallback parser for unstructured responses
 * Extracts summary and suggestions from plain text
 */
function parseUnstructuredResponse(
  rawResponse: string,
  contextType: string
): ParsedAIResponse {
  // Remove "Approve / Deny / Know More" lines
  const cleaned = rawResponse
    .replace(/Approve\s*\/\s*Deny\s*\/\s*Know\s*More/gi, '')
    .replace(/Approve\s*\/\s*Decline\s*\/\s*Know\s*More/gi, '')
    .trim();
  
  // Split into blocks (paragraphs separated by blank lines)
  const blocks = cleaned
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);
  
  if (blocks.length === 0) {
    return {
      summary: rawResponse,
      suggestions: [],
    };
  }
  
  // First block is summary
  const summary = blocks[0];
  
  // Remaining blocks are suggestions
  const suggestions: AISuggestion[] = [];
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    
    if (lines.length === 0) continue;
    
    // First line is title, rest is body
    const title = lines[0].replace(/^\*\*|\*\*$/g, '').trim(); // Remove markdown bold
    const body = lines.slice(1).join(' ').trim();
    
    if (title && title.length > 0) {
      suggestions.push({
        id: `${contextType}-${Date.now()}-${i - 1}`,
        title: title.slice(0, 100),
        body: body.slice(0, 500) || title,
        contextType,
      });
    }
  }
  
  return { summary, suggestions };
}

