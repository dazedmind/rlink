-- Project gallery table for project/model photos
CREATE TABLE IF NOT EXISTS "project_gallery" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "model_id" text REFERENCES "project_models"("id") ON DELETE CASCADE,
  "image_url" text NOT NULL,
  "caption" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

