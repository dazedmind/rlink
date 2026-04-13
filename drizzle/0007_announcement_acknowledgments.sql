CREATE TABLE IF NOT EXISTS "announcement_acknowledgments" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "announcement_id" integer NOT NULL REFERENCES "announcements"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "announcement_acknowledgments_user_id_announcement_id_unique" UNIQUE ("user_id", "announcement_id")
);

CREATE INDEX IF NOT EXISTS "announcement_acknowledgments_user_id_idx" ON "announcement_acknowledgments" ("user_id");
CREATE INDEX IF NOT EXISTS "announcement_acknowledgments_announcement_id_idx" ON "announcement_acknowledgments" ("announcement_id");
