# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9188546b-338d-4a41-9cd8-e542cb966b15

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9188546b-338d-4a41-9cd8-e542cb966b15) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technologies

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## LangChain Backend Setup

The financial chat functionality uses LangChain with OpenAI on the backend (Supabase Edge Functions).

### Environment Variables

Required secrets (configured in Supabase):
- `OPENAI_API_KEY` - OpenAI API key for LangChain LLM
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Architecture

**Backend (Edge Functions):**
- Located in `/supabase/functions/financial-chat/`
- Uses Deno runtime with LangChain integration
- Loads prompts from MD files using `promptLoader.ts`
- Constructs dynamic prompts with `PromptTemplate` from LangChain
- Streams responses from OpenAI GPT-4o-mini

**Frontend:**
- Located in `/src/`
- React components call edge functions via Supabase client
- No direct AI/LangChain imports in frontend code
- Uses `useFinancialChat` hook for chat functionality

### Prompt Files

AI prompts are stored as markdown files and loaded dynamically:

**Frontend prompts** (`/src/prompts/*.md`):
- Used for reference and client-side display only

**Backend prompts** (`/supabase/functions/financial-chat/prompts/*.md`):
- `onboarding.md` - User onboarding chatbot
- `networth.md` - Net worth analysis
- `assets.md` - Asset management advice
- `liabilities.md` - Debt management
- `goals.md` - Financial goals coaching
- `center-chat.md` - General financial assistant
- `market-insights.md` - Market analysis
- `what-if.md` - Scenario planning
- `finshorts.md` - Financial news
- `alternate-investments.md` - Alternative investments
- `explore.md` - Explore page content generation
- `tax-loss-harvesting.md` - Tax optimization

### How It Works

1. User sends message from React component
2. Frontend calls `/supabase/functions/financial-chat` via Supabase client
3. Edge function:
   - Loads appropriate MD prompt based on context type
   - Builds context (user data, conversation history, goals, etc.)
   - Creates LangChain `PromptTemplate` with prompt + context
   - Invokes OpenAI LLM via LangChain
   - Streams response back to frontend
4. Frontend displays streaming response in chat UI

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9188546b-338d-4a41-9cd8-e542cb966b15) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
