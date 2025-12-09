-- Fix missing foreign key relationship for Supabase
-- This allows PostgREST to detect the relationship between job_applications and jobs_cache

DO $$ 
BEGIN 
    -- Check if constraint exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'job_applications_job_id_fkey'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE job_applications
        ADD CONSTRAINT job_applications_job_id_fkey
        FOREIGN KEY (job_id)
        REFERENCES jobs_cache(id)
        ON DELETE SET NULL;
    END IF;
END $$;
