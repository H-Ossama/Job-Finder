-- Comprehensive migration to create jobs_cache and fix relationships
-- Run this in Supabase SQL Editor

-- 1. Create jobs_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs_cache (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id text,
    source text,
    title text,
    company text,
    company_logo text,
    location text,
    location_type text,
    salary_min numeric,
    salary_max numeric,
    salary_currency text,
    job_type text,
    description text,
    skills text[],
    apply_url text,
    posted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(source, external_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS jobs_cache_source_external_id_idx ON jobs_cache(source, external_id);
CREATE INDEX IF NOT EXISTS jobs_cache_created_at_idx ON jobs_cache(created_at);

-- 3. Enable Row Level Security
ALTER TABLE jobs_cache ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS Policies
-- Allow public read access (needed for joining in queries)
DROP POLICY IF EXISTS "Public read access" ON jobs_cache;
CREATE POLICY "Public read access" ON jobs_cache FOR SELECT USING (true);

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access" ON jobs_cache;
CREATE POLICY "Service role full access" ON jobs_cache FOR ALL USING (auth.role() = 'service_role');

-- 5. Fix the foreign key relationship in job_applications
DO $$ 
BEGIN 
    -- Check if constraint exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'job_applications_job_id_fkey'
    ) THEN
        ALTER TABLE job_applications
        ADD CONSTRAINT job_applications_job_id_fkey
        FOREIGN KEY (job_id)
        REFERENCES jobs_cache(id)
        ON DELETE SET NULL;
    END IF;
END $$;
