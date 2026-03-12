-- Add model_id to project_gallery for linking to house models
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'project_gallery' AND column_name = 'model_id'
  ) THEN
    ALTER TABLE project_gallery ADD COLUMN model_id text REFERENCES project_models(id) ON DELETE CASCADE;
  END IF;
END $$;
