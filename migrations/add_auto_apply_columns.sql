-- Migration: Add auto-apply columns to applications table
-- Run this in your Supabase SQL editor

-- Add new columns to applications table for auto-apply feature
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS auto_applied boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cover_letter text,
ADD COLUMN IF NOT EXISTS ai_summary text,
ADD COLUMN IF NOT EXISTS cv_id uuid REFERENCES cvs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS match_score integer,
ADD COLUMN IF NOT EXISTS job_data jsonb,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS salary text,
ADD COLUMN IF NOT EXISTS interview_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS interview_type text,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create index for auto-apply queries
CREATE INDEX IF NOT EXISTS applications_auto_applied_idx ON applications(auto_applied);
CREATE INDEX IF NOT EXISTS applications_applied_at_idx ON applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS applications_match_score_idx ON applications(match_score DESC);

-- Add columns to preferences table for auto-apply settings
ALTER TABLE preferences
ADD COLUMN IF NOT EXISTS auto_apply_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS min_match_score integer DEFAULT 85,
ADD COLUMN IF NOT EXISTS daily_limit integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS generate_cover_letters boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS default_resume_id uuid REFERENCES cvs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cover_letter_tone text DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS cover_letter_length text DEFAULT 'medium';

-- Create preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  -- Theme and display
  theme text DEFAULT 'purple',
  -- Notifications
  notify_new_matches boolean DEFAULT true,
  notify_application_updates boolean DEFAULT true,
  notify_profile_views boolean DEFAULT false,
  notify_weekly_summary boolean DEFAULT true,
  -- Privacy
  profile_visible boolean DEFAULT true,
  show_salary boolean DEFAULT false,
  allow_data_collection boolean DEFAULT true,
  -- Auto-apply settings
  auto_apply_enabled boolean DEFAULT false,
  min_match_score integer DEFAULT 85,
  daily_limit integer DEFAULT 10,
  generate_cover_letters boolean DEFAULT true,
  default_resume_id uuid REFERENCES cvs(id) ON DELETE SET NULL,
  cover_letter_tone text DEFAULT 'professional',
  cover_letter_length text DEFAULT 'medium',
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on preferences
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- Policies for preferences
CREATE POLICY IF NOT EXISTS "Users can view own preferences." ON preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own preferences." ON preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own preferences." ON preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create auto_apply_history table for tracking auto-apply runs
CREATE TABLE IF NOT EXISTS auto_apply_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  run_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  jobs_found integer DEFAULT 0,
  jobs_analyzed integer DEFAULT 0,
  jobs_matched integer DEFAULT 0,
  applications_submitted integer DEFAULT 0,
  settings jsonb, -- snapshot of settings used
  results jsonb, -- detailed results
  errors jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS auto_apply_history_user_id_idx ON auto_apply_history(user_id);
CREATE INDEX IF NOT EXISTS auto_apply_history_run_at_idx ON auto_apply_history(run_at DESC);

ALTER TABLE auto_apply_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own auto-apply history." ON auto_apply_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own auto-apply history." ON auto_apply_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comment the schema changes
COMMENT ON COLUMN applications.auto_applied IS 'Whether this application was submitted via AI auto-apply';
COMMENT ON COLUMN applications.cover_letter IS 'AI-generated or user-provided cover letter';
COMMENT ON COLUMN applications.ai_summary IS 'AI-generated summary of why this job is a good match';
COMMENT ON COLUMN applications.match_score IS 'Match percentage between CV and job (0-100)';
COMMENT ON COLUMN applications.job_data IS 'Cached job data (source, skills, etc.)';

COMMENT ON COLUMN preferences.auto_apply_enabled IS 'Whether AI auto-apply is enabled';
COMMENT ON COLUMN preferences.min_match_score IS 'Minimum match score required for auto-apply (0-100)';
COMMENT ON COLUMN preferences.daily_limit IS 'Maximum auto-applications per day';
COMMENT ON COLUMN preferences.generate_cover_letters IS 'Whether to generate cover letters for auto-applications';
