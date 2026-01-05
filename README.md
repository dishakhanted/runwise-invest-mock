# Runwise Invest Mock

A financial management demo application with hybrid AI architecture for instant dashboard summaries and real-time interactive AI responses.

## Features

- **Hybrid AI Architecture**: Cached summaries load instantly (<200ms), while user interactions use real-time AI
- **Financial Dashboard**: Portfolio summaries, risk scores, goal tracking, and insights
- **AI Chat Interface**: Interactive financial advisor with cached initial suggestions
- **Goal Management**: Create and track financial goals with AI-powered recommendations
- **Account Management**: Link and manage financial accounts
- **Demo Mode**: Pre-populated demo profiles for quick testing

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Google Gemini API
- **Authentication**: Supabase Auth
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- Supabase CLI
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd runwise-invest-mock
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up Supabase:
```bash
# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push

# Deploy edge functions
supabase functions deploy financial-chat
```

4. Set up environment variables:
   - Create `.env.local` file
   - Add your Supabase URL and anon key
   - Configure Google Gemini API key in Supabase secrets:
     ```bash
     supabase secrets set GEMINI_API_KEY=<your-api-key>
     supabase secrets set GEMINI_MODEL_MAIN=gemini-2.5-flash
     ```

5. Start the development server:
```bash
npm run dev
# or
bun run dev
```

## Architecture

### Hybrid AI Caching

The application uses a hybrid caching strategy:

- **Cached Summaries**: Initial dashboard summaries and suggestions are cached in the database for instant loading
- **Real-time AI**: All user interactions (slider changes, what-if questions, suggestions actions) use live AI responses
- **Cache Invalidation**: Cache is automatically invalidated when financial data changes

### Database Schema

Key tables:
- `summary_cache`: Stores cached AI summaries, suggestions, and suggestion responses
- `profiles`: User profile information
- `goals`: Financial goals and tracking
- `accounts`: Linked financial accounts
- `conversations`: AI chat conversation history

### Edge Functions

- `financial-chat`: Main AI interaction endpoint
  - `/summary`: Returns cached summary (if available)
  - `/suggestions`: Returns cached initial suggestions
  - `/interact`: Real-time AI responses for user interactions

## Development

### Project Structure

```
src/
  ├── components/      # React components
  ├── pages/          # Page components
  ├── hooks/          # Custom React hooks
  ├── contexts/       # React context providers
  ├── lib/            # Utility functions
  └── integrations/   # External service integrations

supabase/
  ├── functions/      # Edge functions
  │   └── financial-chat/
  │       ├── index.ts        # Main function entry
  │       ├── cacheUtils.ts   # Caching utilities
  │       └── ...
  └── migrations/     # Database migrations
```

### Key Files

- `src/components/AIChatDialog.tsx`: Main AI chat interface with cache support
- `src/hooks/useFinancialChat.ts`: Hook for AI chat interactions
- `src/pages/Dashboard.tsx`: Main dashboard with financial summaries
- `supabase/functions/financial-chat/index.ts`: Edge function for AI interactions
- `supabase/functions/financial-chat/cacheUtils.ts`: Cache management utilities

## Deployment

### Frontend (Vercel)

The project is configured for Vercel deployment with a minimal `vercel.json` configuration that handles SPA routing for React Router.

1. Connect your repository to Vercel
2. Vercel will auto-detect the Vite framework
3. The `vercel.json` file ensures all routes are properly handled for client-side routing

### Supabase Functions

Deploy the financial-chat function:
```bash
supabase functions deploy financial-chat
```

### Database Migrations

Apply migrations:
```bash
supabase db push
```

### Environment Variables

**Vercel Environment Variables:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

**Supabase Secrets:**
- `GEMINI_API_KEY`: Google Gemini API key
- `GEMINI_MODEL_MAIN`: Model name (e.g., `gemini-2.5-flash`)

## Testing

Run tests:
```bash
npm test
# or
bun test
```

## License

[Your License Here]
