-- Add account_status column to user table
-- user_status enum already exists from 0000_brief_stardust
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "account_status" "user_status" DEFAULT 'active';
