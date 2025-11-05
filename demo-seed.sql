-- Demo User Seed Script for Gunjan
-- This script creates a demo user account with pre-populated goals
-- Email: gunjan@demo.com
-- Password: Demo123!

-- Note: Run this script after creating the user account through the app's signup
-- Replace 'USER_ID_HERE' with the actual user_id from auth.users table

-- First, you'll need to sign up manually with:
-- Email: gunjan@demo.com
-- Password: Demo123!

-- Then get the user_id by running:
-- SELECT id FROM auth.users WHERE email = 'gunjan@demo.com';

-- After getting the user_id, replace USER_ID_HERE below and run this script

-- Insert demo goals
INSERT INTO public.goals (user_id, name, target_amount, current_amount, target_age, description, allocation_savings, allocation_stocks, allocation_bonds)
VALUES
  -- Buy House Downpayment
  (
    'USER_ID_HERE',
    'Buy House Downpayment',
    100000,
    3200,
    35,
    'You'll start seeding this slowly now and ramp it up once the ed-loan ends. Think of it as your next big chapter — every extra dollar after debt goes here',
    20,
    50,
    30
  ),
  
  -- Retirement
  (
    'USER_ID_HERE',
    'Retirement',
    4500000,
    9800,
    58,
    'Stay disciplined with your 401(k) and Roth IRA. For now, invest $300–$400/month; double it post-loan. You're building freedom decades early',
    10,
    70,
    20
  ),
  
  -- Emergency Fund
  (
    'USER_ID_HERE',
    'Emergency Fund',
    18000,
    6000,
    NULL,
    'Build this up through liquid mutual funds — $500/month gets you fully covered in 14 months. After that, the same amount moves into your home and retirement buckets',
    80,
    10,
    10
  ),
  
  -- Education Loan
  (
    'USER_ID_HERE',
    'Education Loan',
    40000,
    12000,
    NULL,
    'You're paying $500/month now — that closes your loan in 3 years flat. Keep it steady, don't prepay beyond this; next year this money becomes your investment engine',
    100,
    0,
    0
  );

-- Insert linked accounts (optional - for demo purposes)
INSERT INTO public.linked_accounts (user_id, account_type, provider_name, last_four_digits, total_amount, interest_rate)
VALUES
  (
    'USER_ID_HERE',
    'Checking',
    'Chase Bank',
    '1234',
    5000,
    0.01
  ),
  (
    'USER_ID_HERE',
    'Investment',
    'Vanguard',
    '5678',
    9800,
    7.5
  ),
  (
    'USER_ID_HERE',
    'Student Loan',
    'Sallie Mae',
    '9012',
    28000,
    4.5
  );

-- Update profile with demo data
UPDATE public.profiles
SET
  legal_first_name = 'Gunjan',
  preferred_first_name = 'Gunjan',
  legal_last_name = 'Demo',
  income = '75000',
  employment_type = 'Full-time',
  goals = 'At 30: not stressing about rent, traveling a bit, and clearing student loans. At 35: own place, maybe starting a family, money growing on autopilot. At 60: freedom to choose work, easier than my parents had it.',
  onboarding_completed = true
WHERE user_id = 'USER_ID_HERE';
