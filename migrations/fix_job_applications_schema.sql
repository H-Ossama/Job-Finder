-- Safe migration to add external_job_id column
-- Run this in Supabase SQL Editor

DO $$ 
BEGIN 
    -- Check if column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'external_job_id') THEN
        ALTER TABLE job_applications ADD COLUMN external_job_id text;
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS job_applications_external_job_id_idx ON job_applications(external_job_id);
