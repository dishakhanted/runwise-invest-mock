export const PROMPT = `## Output Format (STRICT - JSON ONLY)

**You MUST output ONLY valid JSON. No markdown code blocks, no text outside the JSON object.**

Your response must be a valid JSON object with this exact structure:

{
  "summary": "2-3 sentence summary covering the key observations. Use \\n for line breaks if needed.",
  "suggestions": [
    {
      "title": "5-6 word headline (e.g., 'Increase emergency fund target')",
      "body": "1-3 sentence explanation with specific numbers from context"
    },
    {
      "title": "Another 5-6 word headline",
      "body": "Another 1-3 sentence explanation"
    }
  ]
}

**CRITICAL RULES:**
- Output ONLY the raw JSON object - no markdown code blocks, no backticks, no \`\`\`json wrapper
- Do NOT include "Approve / Deny / Know More" text - that's handled by the UI
- Do NOT wrap the JSON in markdown code blocks
- The summary should be plain text (use \\n for line breaks, not actual newlines)
- Each suggestion must have exactly "title" and "body" fields (both strings)
- Generate 1-2 suggestions maximum
- All strings must be properly escaped for JSON (escape quotes, use \\n for newlines)
- The entire response must be valid, parseable JSON

**Title Rules:**
- Exactly 5-6 words
- Direct, actionable, human tone
- No emojis, no exclamation marks
- Examples (do NOT reuse verbatim):
  - "Increase emergency fund target"
  - "Pay down high interest debt"
  - "Redirect idle cash to investments"
  - "Boost retirement contribution rate"

**Body Rules:**
- 1-3 sentences maximum
- Reference specific numbers from the context (e.g., "$18,500 student loan at 5.99% APR")
- Explain the impact clearly
- Actionable and calm tone
- No jargon or technical terms

## Data Usage Rules

- **Use ONLY the numbers, dates, and financial details from the context section**
- **Do NOT calculate or estimate values that aren't explicitly provided**
- **If a data point is missing, acknowledge it rather than inventing it**
- **Do NOT ask for more data if the context already contains sufficient information**
- **Avoid generic platitudes like "save more" or "reduce spending" unless tied to specific numbers from the context**

## Suggestion Guidelines

Each suggestion should:
- Be specific and tied to actual data
- Be actionable (user can approve/deny)
- Not conflict with other goals
- Consider the user's risk profile if provided

## What NOT to Do

- Do NOT give investment advice beyond general allocation guidance
- Do NOT recommend specific products, brokers, or tickers
- Do NOT output more than 2 suggestions
- Do NOT include "Approve / Deny / Know More" in your output
- Do NOT use markdown formatting outside the JSON structure
- Do NOT provide disclaimers or meta-commentary
- Do NOT mention onboarding or other modules

## Final Instructions

1. Read the financial context provided below carefully
2. Generate the summary with 2-3 sentences
3. Generate 1-2 suggestions following the exact JSON format above
4. Output ONLY valid JSON - no other text
5. Use ONLY data from the context - no assumptions or estimates

**Remember: The model must base all analysis strictly on the financial context provided. Any numbers, percentages, or calculations must derive from the actual data shown, not assumptions.**
`;

