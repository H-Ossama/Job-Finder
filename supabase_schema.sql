-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for CVs
create table cvs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  title text not null,
  content jsonb, -- Store structured CV data
  template text default 'modern', -- Template ID (modern, professional, creative, etc.)
  ats_score integer default 0, -- ATS compatibility score 0-100
  ats_analysis jsonb, -- Detailed ATS analysis results
  original_file_url text, -- If uploaded
  is_primary boolean default false
);

-- Create index for faster queries
create index cvs_user_id_idx on cvs(user_id);
create index cvs_template_idx on cvs(template);

alter table cvs enable row level security;

create policy "Users can view own CVs." on cvs
  for select using (auth.uid() = user_id);

create policy "Users can insert own CVs." on cvs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own CVs." on cvs
  for update using (auth.uid() = user_id);

create policy "Users can delete own CVs." on cvs
  for delete using (auth.uid() = user_id);

-- Create a table for Job Applications
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  job_title text not null,
  company_name text not null,
  job_url text,
  status text default 'applied', -- applied, interviewing, offer, rejected
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table applications enable row level security;

create policy "Users can view own applications." on applications
  for select using (auth.uid() = user_id);

create policy "Users can insert own applications." on applications
  for insert with check (auth.uid() = user_id);

create policy "Users can update own applications." on applications
  for update using (auth.uid() = user_id);

-- =====================================================
-- JOB SEARCH TABLES
-- =====================================================

-- Job search results cache - caches search results for performance
create table job_search_cache (
  id uuid default gen_random_uuid() primary key,
  cache_key text unique not null, -- Unique key based on search parameters
  results jsonb not null, -- Cached search results
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index job_search_cache_key_idx on job_search_cache(cache_key);
create index job_search_cache_created_at_idx on job_search_cache(created_at);

-- Public read access for search cache (no auth required for search)
alter table job_search_cache enable row level security;

create policy "Anyone can read search cache." on job_search_cache
  for select using (true);

create policy "Service role can manage search cache." on job_search_cache
  for all using (auth.role() = 'service_role');

-- Jobs cache table - stores jobs fetched from external APIs
create table jobs_cache (
  id uuid default gen_random_uuid() primary key,
  external_id text not null, -- ID from the source API
  source text not null, -- 'remoteok', 'adzuna', 'jsearch', 'themuse', etc.
  title text not null,
  company text not null,
  company_logo text,
  location text,
  location_type text, -- 'remote', 'hybrid', 'onsite'
  country text,
  city text,
  salary_min integer,
  salary_max integer,
  salary_currency text default 'USD',
  job_type text, -- 'full-time', 'part-time', 'contract', 'internship'
  experience_level text, -- 'entry', 'mid', 'senior', 'lead', 'executive'
  description text,
  requirements text[],
  benefits text[],
  skills text[],
  apply_url text not null,
  posted_at timestamp with time zone,
  expires_at timestamp with time zone,
  raw_data jsonb, -- Original API response for reference
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Unique constraint to prevent duplicates from same source
  constraint unique_job_source unique (external_id, source)
);

-- Create indexes for faster job searches
create index jobs_cache_source_idx on jobs_cache(source);
create index jobs_cache_title_idx on jobs_cache using gin(to_tsvector('english', title));
create index jobs_cache_company_idx on jobs_cache(company);
create index jobs_cache_location_idx on jobs_cache(location);
create index jobs_cache_country_idx on jobs_cache(country);
create index jobs_cache_city_idx on jobs_cache(city);
create index jobs_cache_job_type_idx on jobs_cache(job_type);
create index jobs_cache_experience_level_idx on jobs_cache(experience_level);
create index jobs_cache_posted_at_idx on jobs_cache(posted_at desc);
create index jobs_cache_skills_idx on jobs_cache using gin(skills);

-- Jobs cache is public read for all authenticated users
alter table jobs_cache enable row level security;

create policy "Authenticated users can view cached jobs." on jobs_cache
  for select using (auth.role() = 'authenticated');

-- Only service role can insert/update/delete (from API routes)
create policy "Service role can manage jobs cache." on jobs_cache
  for all using (auth.role() = 'service_role');

-- =====================================================
-- Saved/Bookmarked Jobs table
-- =====================================================
create table saved_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  job_id uuid references jobs_cache(id) on delete cascade not null,
  notes text, -- User notes about the job
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Each user can only save a job once
  constraint unique_user_saved_job unique (user_id, job_id)
);

create index saved_jobs_user_id_idx on saved_jobs(user_id);
create index saved_jobs_job_id_idx on saved_jobs(job_id);

alter table saved_jobs enable row level security;

create policy "Users can view own saved jobs." on saved_jobs
  for select using (auth.uid() = user_id);

create policy "Users can save jobs." on saved_jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved jobs." on saved_jobs
  for delete using (auth.uid() = user_id);

create policy "Users can update own saved job notes." on saved_jobs
  for update using (auth.uid() = user_id);

-- =====================================================
-- Job Search History table - for analytics and caching
-- =====================================================
create table job_searches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  query text,
  location text,
  country text,
  filters jsonb, -- job_type, experience_level, salary_range, etc.
  results_count integer default 0,
  sources_used text[], -- which APIs were queried
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index job_searches_user_id_idx on job_searches(user_id);
create index job_searches_query_idx on job_searches(query);
create index job_searches_created_at_idx on job_searches(created_at desc);

alter table job_searches enable row level security;

create policy "Users can view own search history." on job_searches
  for select using (auth.uid() = user_id);

create policy "Users can create search records." on job_searches
  for insert with check (auth.uid() = user_id);

-- =====================================================
-- Job Applications (Enhanced) - linked to cached jobs
-- =====================================================
create table job_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  job_id uuid references jobs_cache(id) on delete set null, -- Can be null if job expires
  cv_id uuid references cvs(id) on delete set null, -- CV used for application
  status text default 'applied' check (status in ('saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  applied_at timestamp with time zone default timezone('utc'::text, now()),
  cover_letter text,
  ai_cover_letter text, -- AI-generated cover letter
  notes text,
  interview_date timestamp with time zone,
  interview_type text, -- 'phone', 'video', 'onsite', 'technical'
  interview_notes text,
  offer_details jsonb, -- salary, benefits, etc.
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index job_applications_user_id_idx on job_applications(user_id);
create index job_applications_job_id_idx on job_applications(job_id);
create index job_applications_status_idx on job_applications(status);
create index job_applications_applied_at_idx on job_applications(applied_at desc);

alter table job_applications enable row level security;

create policy "Users can view own job applications." on job_applications
  for select using (auth.uid() = user_id);

create policy "Users can create job applications." on job_applications
  for insert with check (auth.uid() = user_id);

create policy "Users can update own job applications." on job_applications
  for update using (auth.uid() = user_id);

create policy "Users can delete own job applications." on job_applications
  for delete using (auth.uid() = user_id);

-- =====================================================
-- User Job Preferences - for AI matching
-- =====================================================
create table user_job_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  desired_titles text[], -- e.g., ['Software Engineer', 'Full Stack Developer']
  desired_locations text[], -- e.g., ['Remote', 'New York, NY', 'San Francisco, CA']
  desired_countries text[], -- e.g., ['USA', 'UK', 'Germany']
  salary_min integer,
  salary_max integer,
  salary_currency text default 'USD',
  job_types text[], -- ['full-time', 'contract']
  experience_levels text[], -- ['mid', 'senior']
  industries text[], -- ['Technology', 'Finance']
  company_sizes text[], -- ['startup', 'medium', 'enterprise']
  required_benefits text[], -- ['remote', 'health_insurance', '401k']
  skills text[], -- skills the user has
  excluded_companies text[], -- companies to exclude from matches
  auto_apply_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table user_job_preferences enable row level security;

create policy "Users can view own preferences." on user_job_preferences
  for select using (auth.uid() = user_id);

create policy "Users can create own preferences." on user_job_preferences
  for insert with check (auth.uid() = user_id);

create policy "Users can update own preferences." on user_job_preferences
  for update using (auth.uid() = user_id);

-- =====================================================
-- Activity Log - for recent activity feed
-- =====================================================
create table activity_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  activity_type text not null, -- 'job_match', 'application_sent', 'interview_scheduled', 'cv_updated', etc.
  title text not null,
  description text,
  metadata jsonb, -- Additional data (job_id, company, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index activity_log_user_id_idx on activity_log(user_id);
create index activity_log_type_idx on activity_log(activity_type);
create index activity_log_created_at_idx on activity_log(created_at desc);

alter table activity_log enable row level security;

create policy "Users can view own activity." on activity_log
  for select using (auth.uid() = user_id);

create policy "Users can create activity." on activity_log
  for insert with check (auth.uid() = user_id);

-- =====================================================
-- Job Matches - Cache AI-calculated match scores
-- =====================================================
create table job_matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  job_id text not null, -- Job ID (can be external format like 'remoteok_123')
  cv_id uuid references cvs(id) on delete set null,
  match_score integer not null check (match_score >= 0 and match_score <= 100),
  analysis text, -- AI-generated analysis text
  matched_skills text[], -- Skills the user has that match the job
  missing_skills text[], -- Skills the job requires that user is missing
  recommendations text[], -- AI recommendations for improving match
  job_data jsonb, -- Cached job info (title, company, description snippet)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Each user can only have one match analysis per job
  constraint unique_user_job_match unique (user_id, job_id)
);

create index job_matches_user_id_idx on job_matches(user_id);
create index job_matches_job_id_idx on job_matches(job_id);
create index job_matches_match_score_idx on job_matches(match_score desc);
create index job_matches_created_at_idx on job_matches(created_at desc);

alter table job_matches enable row level security;

create policy "Users can view own job matches." on job_matches
  for select using (auth.uid() = user_id);

create policy "Users can create own job matches." on job_matches
  for insert with check (auth.uid() = user_id);

create policy "Users can update own job matches." on job_matches
  for update using (auth.uid() = user_id);

create policy "Users can delete own job matches." on job_matches
  for delete using (auth.uid() = user_id);

-- Trigger to update updated_at
create trigger update_job_matches_updated_at
  before update on job_matches
  for each row execute function update_updated_at_column();

-- =====================================================
-- Function to auto-update updated_at timestamp
-- =====================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply trigger to relevant tables
create trigger update_jobs_cache_updated_at
  before update on jobs_cache
  for each row execute function update_updated_at_column();

create trigger update_job_applications_updated_at
  before update on job_applications
  for each row execute function update_updated_at_column();

create trigger update_user_job_preferences_updated_at
  before update on user_job_preferences
  for each row execute function update_updated_at_column();
