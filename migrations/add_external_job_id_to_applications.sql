-- Add external_job_id to job_applications for reliable tracking of search results
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS external_job_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS job_applications_external_job_id_idx ON job_applications(external_job_id);
