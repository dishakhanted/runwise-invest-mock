# Demo Setup Instructions for Gunjan's Account

## Quick Start

1. **Sign up a new account:**
   - Go to the app's signup page
   - Email: `gunjan@demo.com`
   - Password: `Demo123!`
   - Complete the onboarding flow (you can fill in any data for now)

2. **Get the User ID:**
   - Open the Backend (Lovable Cloud)
   - Go to Table Editor → auth.users
   - Find the user with email `gunjan@demo.com`
   - Copy the `id` (UUID)

3. **Run the seed script:**
   - Open the Backend (Lovable Cloud)
   - Go to SQL Editor
   - Open `demo-seed.sql` from the project root
   - Replace all instances of `USER_ID_HERE` with the actual user ID you copied
   - Run the script

4. **Log in and explore:**
   - Log out and log back in with `gunjan@demo.com` / `Demo123!`
   - Navigate to the Goals page to see all pre-populated goals

## Demo Goals Created

- **Buy House Downpayment**: $3.2k / $100k (Target age: 35)
- **Retirement**: $9.8k / $4.5M (Target age: 58)
- **Emergency Fund**: $6k / $18k
- **Education Loan**: $12k / $40k

Each goal includes detailed descriptions and insights visible on the Goals page.

## Demo Linked Accounts

- Chase Bank Checking (...1234): $5,000
- Vanguard Investment (...5678): $9,800
- Sallie Mae Student Loan (...9012): $28,000
