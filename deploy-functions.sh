#!/bin/bash

# Deploy Edge Functions
# Main app project: sjcyhlbqnlnwftuhokwj
# Waitlist project: gvjfcdttfczigeqsilml

echo "🚀 Deploying Edge Functions..."
echo ""

# Check if logged in
if ! supabase projects list &>/dev/null; then
  echo "⚠️  Not logged in to Supabase. Please run: supabase login"
  echo ""
fi

# Deploy financial-chat to main app project
echo "📦 Deploying financial-chat to main app project..."
cd supabase/functions/financial-chat
supabase functions deploy financial-chat --project-ref sjcyhlbqnlnwftuhokwj
if [ $? -eq 0 ]; then
  echo "✅ financial-chat deployed successfully"
else
  echo "❌ financial-chat deployment failed (you may not have access to this project)"
  echo "   You can skip this and just deploy waitlist-submit"
fi
echo ""

# Deploy waitlist-submit to waitlist project
echo "📦 Deploying waitlist-submit to waitlist project..."
cd ../waitlist-submit
supabase functions deploy waitlist-submit --project-ref gvjfcdttfczigeqsilml --no-verify-jwt
if [ $? -eq 0 ]; then
  echo "✅ waitlist-submit deployed successfully"
else
  echo "❌ waitlist-submit deployment failed"
fi
echo ""

echo "✨ Deployment complete!"
