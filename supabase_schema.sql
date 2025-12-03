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
