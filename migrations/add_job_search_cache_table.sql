-- Migration: Add job_search_cache table
-- This table caches search results for performance
-- Run this in your Supabase SQL editor to fix the PGRST205 error

-- Create the job_search_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_search_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key text UNIQUE NOT NULL,
  results jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS job_search_cache_key_idx ON job_search_cache(cache_key);
CREATE INDEX IF NOT EXISTS job_search_cache_created_at_idx ON job_search_cache(created_at);

-- Enable Row Level Security
ALTER TABLE job_search_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read search cache (for anonymous search)
DROP POLICY IF EXISTS "Anyone can read search cache." ON job_search_cache;
CREATE POLICY "Anyone can read search cache." ON job_search_cache
  FOR SELECT USING (true);

-- Policy: Service role can manage search cache (for API routes)
DROP POLICY IF EXISTS "Service role can manage search cache." ON job_search_cache;
CREATE POLICY "Service role can manage search cache." ON job_search_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Also allow anonymous users to insert (for caching without auth)
DROP POLICY IF EXISTS "Allow insert for caching" ON job_search_cache;
CREATE POLICY "Allow insert for caching" ON job_search_cache
  FOR INSERT WITH CHECK (true);

-- Allow updates to existing cache entries
DROP POLICY IF EXISTS "Allow update for caching" ON job_search_cache;
CREATE POLICY "Allow update for caching" ON job_search_cache
  FOR UPDATE USING (true);

-- Optional: Create a function to clean up expired cache entries
-- You can call this periodically or via a cron job
CREATE OR REPLACE FUNCTION cleanup_expired_search_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM job_search_cache 
  WHERE created_at < NOW() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql;

-- Grant usage to anon role (for unauthenticated requests)
GRANT SELECT, INSERT, UPDATE ON job_search_cache TO anon;
GRANT SELECT, INSERT, UPDATE ON job_search_cache TO authenticated;

COMMENT ON TABLE job_search_cache IS 'Cache for job search results to improve performance';
