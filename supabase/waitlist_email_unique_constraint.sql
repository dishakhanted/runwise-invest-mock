-- Add UNIQUE constraint to email column in waitlist table
-- Run this SQL in your waitlist Supabase database (not the main database)

-- First, check if there are any duplicate emails and handle them if needed
-- (Uncomment and run this first if you need to clean up duplicates)
-- SELECT email, COUNT(*) 
-- FROM waitlist 
-- GROUP BY email 
-- HAVING COUNT(*) > 1;

-- Add UNIQUE constraint on email column
ALTER TABLE waitlist 
ADD CONSTRAINT waitlist_email_unique UNIQUE (email);
