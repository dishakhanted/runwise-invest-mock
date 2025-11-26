-- Add allocation columns to linked_accounts table
ALTER TABLE public.linked_accounts 
ADD COLUMN allocation_savings INTEGER NOT NULL DEFAULT 0,
ADD COLUMN allocation_stocks INTEGER NOT NULL DEFAULT 0,
ADD COLUMN allocation_bonds INTEGER NOT NULL DEFAULT 0;