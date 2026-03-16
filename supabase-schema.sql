-- OffWorkYet schema for Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rice_name TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'User',
  city TEXT NOT NULL DEFAULT '',
  job_title TEXT NOT NULL DEFAULT 'Senior SWE',
  company TEXT NOT NULL DEFAULT 'Meta',
  monthly_salary INTEGER NOT NULL DEFAULT 2200,
  working_days_per_month INTEGER NOT NULL DEFAULT 22,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Work sessions (current day tracking)
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  start_time_ts BIGINT,
  day_start_time_str TEXT,
  total_elapsed_ms BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Daily logs (end-of-day summary)
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  hours_worked REAL NOT NULL,
  hourly_rate INTEGER NOT NULL,
  vibe TEXT NOT NULL CHECK (vibe IN ('Sushi', 'Salad', 'Bread')),
  shifts INTEGER NOT NULL DEFAULT 1,
  start_time_str TEXT,
  end_time_str TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_date ON work_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, date);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Work sessions: users can only access their own sessions
CREATE POLICY "Users can view own sessions"
  ON work_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON work_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON work_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily logs: users can view all (for Plaza), but only modify their own
CREATE POLICY "Users can view all daily logs"
  ON daily_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own daily logs"
  ON daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
  ON daily_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Profiles: allow viewing other profiles (for Plaza crew names)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);
