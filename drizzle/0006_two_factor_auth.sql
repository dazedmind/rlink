-- Two-factor authentication (Better Auth two-factor plugin)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS "two_factor" (
  "id" text PRIMARY KEY NOT NULL,
  "secret" text NOT NULL,
  "backup_codes" text NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "two_factor_userId_idx" ON "two_factor" ("user_id");
