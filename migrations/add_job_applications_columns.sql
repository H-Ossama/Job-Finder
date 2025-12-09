-- Migration: Create job_applications table with all needed columns
-- Run this migration to enable application tracking

-- =====================================================
-- Job Applications Table
-- =====================================================
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Link to cached job (optional - null for manual entries)
  job_id uuid,
  
  -- Link to CV used (optional)
  cv_id uuid,
  
  -- External Job ID for tracking search results
  external_job_id text,
  
  -- Manual entry fields (used when job_id is null)
  job_title text,
  company_name text,
  location text,
  salary text,
  job_url text,
  source text DEFAULT 'Manual',
  
  -- Application status
  status text DEFAULT 'applied' CHECK (status IN ('saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  applied_at timestamp with time zone,
  
  -- Cover letters
  cover_letter text,
  ai_cover_letter text,
  
  -- Notes
  notes text,
  
  -- Interview details
  interview_date timestamp with time zone,
  interview_type text,
  interview_notes text,
  
  -- Offer details (JSON for flexibility)
  offer_details jsonb,
  
  -- Rejection info
  rejection_reason text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS job_applications_external_job_id_idx ON job_applications(external_job_id);
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON job_applications(status);
CREATE INDEX IF NOT EXISTS job_applications_applied_at_idx ON job_applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS job_applications_source_idx ON job_applications(source);
CREATE INDEX IF NOT EXISTS job_applications_created_at_idx ON job_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own job applications." ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create job applications." ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job applications." ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job applications." ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE job_applications IS 'User job applications - both linked to cached jobs and manually entered';
COMMENT ON COLUMN job_applications.job_id IS 'Link to jobs_cache table - null for manual entries';
COMMENT ON COLUMN job_applications.job_title IS 'Job title - used when job_id is null (manual entry)';
COMMENT ON COLUMN job_applications.company_name IS 'Company name - used when job_id is null (manual entry)';
COMMENT ON COLUMN job_applications.source IS 'Where the job was found: Manual, LinkedIn, Indeed, Referral, etc.';
