-- Migrate careers.department from 'department' enum to 'career_department' enum
-- This removes careers' dependency on department so user table can keep it.
-- Run: npx drizzle-kit migrate  (or: psql $DATABASE_URL -f drizzle/0005_career_department.sql)

-- 1. Create career_department enum (same values as department for compatibility)
DO $$ BEGIN
  CREATE TYPE "career_department" AS ENUM (
    'construction',
    'design',
    'hr',
    'it',
    'office_president',
    'project_development',
    'property_management',
    'sales_admin',
    'sales_marketing',
    'sales_documentation'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Migrate careers.department to use career_department
ALTER TABLE "careers"
  ALTER COLUMN "department" TYPE "career_department"
  USING "department"::text::"career_department";

ALTER TABLE "careers"
  ALTER COLUMN "department" SET DEFAULT 'construction'::"career_department";
