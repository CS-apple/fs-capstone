-- Supabase Base Schema Migration

-- Auto-generated from schema.sql, supabase_schema.sql, and battler_stats_views.sql

-- Supabase Realtime Live Chat Schema with Tips, Badges, and Moderation

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('viewer', 'moderator', 'admin');

-- 2. Tables

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'viewer'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Chat Messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tipping Records table
CREATE TABLE tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Null if anonymous
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD' NOT NULL,
  message TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Custom Badges table
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Badges (Many-to-Many mapping)
CREATE TABLE user_badges (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, badge_id)
);

-- Moderation Actions Log
CREATE TABLE moderation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id TEXT NOT NULL,
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g., 'timeout', 'ban', 'delete_message'
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Followed Battlers table
CREATE TABLE followed_battlers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  battler_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_battler_follow UNIQUE (user_id, battler_id)
);

-- 3. Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE followed_battlers ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Chat Messages Policies
CREATE POLICY "Messages are viewable by everyone." 
  ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert messages." 
  ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Moderators and Admins can update messages (e.g., to soft-delete/hide them)
CREATE POLICY "Moderators can update messages." 
  ON chat_messages FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('moderator', 'admin')
    )
  );

-- Tips Policies
CREATE POLICY "Tips are viewable by everyone." 
  ON tips FOR SELECT USING (true);
-- In a real scenario, inserts happen securely from your backend (e.g. Edge Function) 
-- after a Stripe payment succeeds, but allowing authenticated users to log them for testing:
CREATE POLICY "Authenticated users can insert tips." 
  ON tips FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges Policies (Read-only for public, managed by admin)
CREATE POLICY "Badges are viewable by everyone." 
  ON badges FOR SELECT USING (true);

-- User Badges Policies
CREATE POLICY "User badges are viewable by everyone." 
  ON user_badges FOR SELECT USING (true);

-- Followed Battlers Policies
CREATE POLICY "Followed battlers are viewable by everyone." 
  ON followed_battlers FOR SELECT USING (true);

CREATE POLICY "Users can insert their own followed battler." 
  ON followed_battlers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own followed battler." 
  ON followed_battlers FOR DELETE USING (auth.uid() = user_id);

-- Moderation Logs Policies (Viewable only by moderators/admins)
CREATE POLICY "Moderators can view logs." 
  ON moderation_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('moderator', 'admin')
    )
  );
CREATE POLICY "Moderators can insert logs." 
  ON moderation_logs FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('moderator', 'admin')
    )
  );

-- 4. Enable Supabase Realtime
-- We want to broadcast inserts and updates on the chat_messages and tips tables
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table tips;
alter publication supabase_realtime add table moderation_logs;

-- Roast Battle League - PostgreSQL Supabase Schema
-- Paste this script into your Supabase SQL Editor to initialize your database tables.

-- Disable row-level security (RLS) by default for these tables,
-- or enable it with appropriate select/insert policies if you enforce RLS.

-- 0. Divisions
CREATE TABLE IF NOT EXISTS public.divisions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Initial Divisions
INSERT INTO public.divisions (id, name) VALUES 
('east', 'East'),
('south', 'South'),
('pacific', 'Pacific'),
('europe', 'Europe')
ON CONFLICT (id) DO NOTHING;

-- 1. Cities
CREATE TABLE IF NOT EXISTS public.cities (
    id TEXT PRIMARY KEY,
    numeric_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    wrbl BOOLEAN DEFAULT FALSE,
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    logo_url TEXT,
    default_prize TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Locations (Venues)
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    description TEXT,
    address TEXT,
    google_maps_link TEXT,
    city_id TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Battlers (Comedians)
CREATE TABLE IF NOT EXISTS public.battlers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT,
    race TEXT,
    rating INTEGER DEFAULT 1000,
    instagram TEXT,
    bio TEXT,
    show_on_homepage BOOLEAN DEFAULT FALSE,
    show_on_city_page BOOLEAN DEFAULT TRUE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    image_url TEXT,
    instagram_reel_url TEXT,
    city_id TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    is_disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Lineups
CREATE TABLE IF NOT EXISTS public.lineups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    host_id TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Matches
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY,
    lineup_id TEXT NOT NULL REFERENCES public.lineups(id) ON DELETE CASCADE,
    battler_1_id TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    battler_2_id TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    winner_id TEXT, -- Store ID or text
    battle_no INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Judge Tables
CREATE TABLE IF NOT EXISTS public.judge_tables (
    id TEXT PRIMARY KEY,
    numeric_id INTEGER NOT NULL,
    judge_1_id TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    judge_2_id TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    judge_3_id TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    judge_4_id TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    judge_5_id TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Shows
CREATE TABLE IF NOT EXISTS public.shows (
    id TEXT PRIMARY KEY,
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
    lineup_id TEXT REFERENCES public.lineups(id) ON DELETE SET NULL,
    judge_table_id TEXT REFERENCES public.judge_tables(id) ON DELETE SET NULL,
    venue TEXT,
    ticket_url TEXT,
    link TEXT,
    youtube_url TEXT,
    city_id TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    prize TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    city_id TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Roast Battle League points
CREATE TABLE IF NOT EXISTS public.rbl_points (
    id SERIAL PRIMARY KEY,
    season INTEGER,
    week INTEGER,
    battler_id1 TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    battler_id2 TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    ranking INTEGER,
    city TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    visiting_city TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    wrbl_city TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    split_points BOOLEAN DEFAULT FALSE,
    points NUMERIC,
    rbl_weekly_episode_url TEXT,
    battle_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. WRBL Affiliate Pairings
CREATE TABLE IF NOT EXISTS public.wrbl_affiliates (
    id SERIAL PRIMARY KEY,
    rbl_city TEXT REFERENCES public.cities(id) ON DELETE CASCADE,
    wrbl_city TEXT REFERENCES public.cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_rbl_wrbl_pairing UNIQUE (rbl_city, wrbl_city)
);

-- 11. Image Gallery
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime subscriptions for events/live scores
alter publication supabase_realtime add table public.divisions;
alter publication supabase_realtime add table public.cities;
alter publication supabase_realtime add table public.locations;
alter publication supabase_realtime add table public.battlers;
alter publication supabase_realtime add table public.lineups;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.judge_tables;
alter publication supabase_realtime add table public.shows;
alter publication supabase_realtime add table public.subscribers;
alter publication supabase_realtime add table public.rbl_points;
alter publication supabase_realtime add table public.wrbl_affiliates;
alter publication supabase_realtime add table public.gallery_images;

-- Set up Row Level Security (RLS) policies
-- Allow everyone to view, but only authorized service roles or admins to edit
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judge_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbl_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wrbl_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Read and Write Permissions for simple hosting setup (allow public read, admin write)
CREATE POLICY "Public Read for All" ON public.divisions FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.battlers FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.lineups FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.judge_tables FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.shows FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.subscribers FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.rbl_points FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.wrbl_affiliates FOR SELECT USING (true);
CREATE POLICY "Public Read for All" ON public.gallery_images FOR SELECT USING (true);

-- Allow Insert/Update/Delete by Admin/Service Role key which bypasses RLS, 
-- or permit public full access for easy client-side configuration:
CREATE POLICY "Public Write Access" ON public.divisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.cities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.battlers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.lineups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.judge_tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.shows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.rbl_points FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.wrbl_affiliates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Access" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true);

-- 11.5 Roles (Lookup table for authorization levels)
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default roles
INSERT INTO public.roles (id, name, description) VALUES
  ('super_admin', 'Super Admin', 'Full system configuration, global adjustments, and manager assignments'),
  ('manager', 'City Manager', 'Manage matches, lineups, shows, locations, and view subscriber lists for their assigned city'),
  ('rbl_weekly_voter', 'Weekly Voter', 'Authorized exclusively to vote on weekly ballots for their assigned city'),
  ('fan', 'Fan', 'General authenticated user with chat access')
ON CONFLICT (id) DO NOTHING;

-- 12. Managers (for local admins and authorized entities)
CREATE TABLE IF NOT EXISTS public.managers (
    email TEXT PRIMARY KEY,
    city_id TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    role_id TEXT REFERENCES public.roles(id) DEFAULT 'manager',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS and realtime for managers table
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read for All" ON public.managers FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON public.managers FOR ALL USING (true) WITH CHECK (true);
alter publication supabase_realtime add table public.managers;

-- Created_by columns for tracking personal ownership of records
ALTER TABLE public.shows ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.lineups ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.judge_tables ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 13. Missed Submissions (Penalty points table)
CREATE TABLE IF NOT EXISTS public.missed_submissions (
    id SERIAL PRIMARY KEY,
    city TEXT REFERENCES public.cities(id) ON DELETE CASCADE,
    season INTEGER NOT NULL DEFAULT 1,
    week INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS and realtime for missed_submissions table
ALTER TABLE public.missed_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read for All" ON public.missed_submissions FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON public.missed_submissions FOR ALL USING (true) WITH CHECK (true);
alter publication supabase_realtime add table public.missed_submissions;

-- 14. Admin Logs (Audit trail of database changes)
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    details TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS and realtime for admin_logs table
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read for All" ON public.admin_logs FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON public.admin_logs FOR ALL USING (true) WITH CHECK (true);
alter publication supabase_realtime add table public.admin_logs;

-- Add instagram_reel_url to battlers
ALTER TABLE public.battlers ADD COLUMN IF NOT EXISTS instagram_reel_url TEXT;

-- Add show_on_city_page to battlers (defaults to TRUE)
ALTER TABLE public.battlers ADD COLUMN IF NOT EXISTS show_on_city_page BOOLEAN DEFAULT TRUE;

-- Add is_disabled to battlers (defaults to FALSE)
ALTER TABLE public.battlers ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;


-- 15. Overall Rankings (Player standings over time)
CREATE TABLE IF NOT EXISTS public.overall_rankings (
    id SERIAL PRIMARY KEY,
    battler_id TEXT NOT NULL REFERENCES public.battlers(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    as_of_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_rank_per_season_week UNIQUE (season, week, rank),
    CONSTRAINT unique_battler_per_season_week UNIQUE (season, week, battler_id)
);

-- RLS and Realtime for overall_rankings table
ALTER TABLE public.overall_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read for All" ON public.overall_rankings FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON public.overall_rankings FOR ALL USING (true) WITH CHECK (true);
alter publication supabase_realtime add table public.overall_rankings;




-- 16. RBL Weekly Submissions
CREATE TABLE IF NOT EXISTS public.rbl_weekly_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    video_url VARCHAR(512) NOT NULL,
    battler1 TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    battler2 TEXT REFERENCES public.battlers(id) ON DELETE SET NULL,
    city TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    visiting_city TEXT REFERENCES public.cities(id) ON DELETE SET NULL,
    battle_info TEXT,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS and Realtime for rbl_weekly_submissions table
ALTER TABLE public.rbl_weekly_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read for All" ON public.rbl_weekly_submissions FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON public.rbl_weekly_submissions FOR ALL USING (true) WITH CHECK (true);
alter publication supabase_realtime add table public.rbl_weekly_submissions;


-- 17. System Configuration
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS and Realtime for system_config
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read for All" ON public.system_config FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON public.system_config FOR ALL USING (true) WITH CHECK (true);
alter publication supabase_realtime add table public.system_config;


-- 18. RBL Weekly Ballots (Voting table)
CREATE TABLE IF NOT EXISTS public.rbl_weekly_ballots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    voter_email TEXT NOT NULL,
    voter_city_id TEXT NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    pick_1_submission_id TEXT REFERENCES public.rbl_weekly_submissions(id) ON DELETE SET NULL,
    pick_2_submission_id TEXT REFERENCES public.rbl_weekly_submissions(id) ON DELETE SET NULL,
    pick_3_submission_id TEXT REFERENCES public.rbl_weekly_submissions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_city_vote_per_week UNIQUE (season, week, voter_city_id)
);

-- RLS and Realtime for rbl_weekly_ballots
ALTER TABLE public.rbl_weekly_ballots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read for All" ON public.rbl_weekly_ballots FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON public.rbl_weekly_ballots FOR ALL USING (true) WITH CHECK (true);
alter publication supabase_realtime add table public.rbl_weekly_ballots;

-- 19. Analytics Views for Battler Stats

CREATE OR REPLACE VIEW public.vw_battler_stats AS
WITH points AS (
    SELECT 
        b.id AS battler_id, 
        SUM(COALESCE(p.points, 11 - CAST(p.ranking AS INTEGER))) AS rbl_points
    FROM public.battlers b
    JOIN public.rbl_points p ON (p.battler_id1 = b.id OR p.battler_id2 = b.id)
    WHERE CAST(p.ranking AS INTEGER) >= 1 AND CAST(p.ranking AS INTEGER) <= 10
    GROUP BY b.id
),
match_stats AS (
    SELECT 
        b.id AS battler_id,
        COUNT(CASE WHEN m.winner_id = b.id THEN 1 END) AS wins,
        COUNT(CASE WHEN m.winner_id != b.id AND m.winner_id != 'draw' AND m.winner_id IS NOT NULL THEN 1 END) AS losses,
        COUNT(CASE WHEN m.winner_id = 'draw' THEN 1 END) AS draws,
        COUNT(m.id) AS matches_count
    FROM public.battlers b
    JOIN public.matches m ON (b.id = m.battler_1_id OR b.id = m.battler_2_id)
    GROUP BY b.id
)
SELECT 
    b.id AS battler_id,
    COALESCE(p.rbl_points, 0) AS rbl_points,
    COALESCE(m.wins, 0) AS wins,
    COALESCE(m.losses, 0) AS losses,
    COALESCE(m.draws, 0) AS draws,
    COALESCE(m.matches_count, 0) AS matches_count
FROM public.battlers b
LEFT JOIN points p ON b.id = p.battler_id
LEFT JOIN match_stats m ON b.id = m.battler_id;

CREATE OR REPLACE VIEW public.vw_battler_stats_in_season AS
WITH current_season AS (
    -- Season starts March 1st. If current month is Jan/Feb (< 3), current season belongs to previous year.
    SELECT 
        CASE 
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 3 THEN EXTRACT(YEAR FROM CURRENT_DATE)::integer - 1
            ELSE EXTRACT(YEAR FROM CURRENT_DATE)::integer
        END AS yr
)
SELECT 
    b.id AS battler_id,
    COUNT(CASE WHEN m.winner_id = b.id THEN 1 END) AS in_season_wins,
    COUNT(CASE WHEN m.winner_id != b.id AND m.winner_id != 'draw' AND m.winner_id IS NOT NULL THEN 1 END) AS in_season_losses,
    COUNT(CASE WHEN m.winner_id = 'draw' THEN 1 END) AS in_season_draws
FROM public.battlers b
LEFT JOIN (
    SELECT m.battler_1_id, m.battler_2_id, m.winner_id
    FROM public.matches m
    JOIN public.shows s ON s.lineup_id = m.lineup_id
    CROSS JOIN current_season cs
    WHERE s.datetime >= MAKE_DATE(cs.yr, 3, 1)
      AND s.datetime < MAKE_DATE(cs.yr + 1, 3, 1)
) m ON (b.id = m.battler_1_id OR b.id = m.battler_2_id)
GROUP BY b.id;

GRANT SELECT ON public.vw_battler_stats TO anon, authenticated, service_role;
GRANT SELECT ON public.vw_battler_stats_in_season TO anon, authenticated, service_role;

-- View for weekly submissions pre-joined with battler and city names
CREATE OR REPLACE VIEW public.vw_rbl_weekly_submissions AS
SELECT 
  s.id,
  s.video_url,
  s.battler1,
  s.battler2,
  s.city,
  s.visiting_city,
  s.battle_info,
  s.season,
  s.week,
  s.created_by,
  s.created_at,
  s.updated_at,
  b1.name AS battler1_name,
  b2.name AS battler2_name,
  c.name AS city_name,
  vc.name AS visiting_city_name
FROM public.rbl_weekly_submissions s
LEFT JOIN public.battlers b1 ON b1.id = s.battler1
LEFT JOIN public.battlers b2 ON b2.id = s.battler2
LEFT JOIN public.cities c ON c.id = s.city
LEFT JOIN public.cities vc ON vc.id = s.visiting_city;

GRANT SELECT ON public.vw_rbl_weekly_submissions TO anon, authenticated, service_role;

-- 19. Upcoming Shows View
CREATE OR REPLACE VIEW public.vw_upcoming_shows AS
SELECT *
FROM public.shows
WHERE datetime >= NOW() - INTERVAL '1 day'
ORDER BY datetime ASC;

GRANT SELECT ON public.vw_upcoming_shows TO anon, authenticated, service_role;

-- Migrations
ALTER TABLE public.rbl_points ADD COLUMN IF NOT EXISTS battle_url TEXT;





-- Comprehensive Stats View for Battlers
CREATE OR REPLACE VIEW public.vw_battler_stats_comprehensive AS
WITH current_season AS (
    -- Season starts March 1st. If current month is Jan/Feb (< 3), current season belongs to previous year.
    SELECT 
        CASE 
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 3 THEN EXTRACT(YEAR FROM CURRENT_DATE)::integer - 1
            ELSE EXTRACT(YEAR FROM CURRENT_DATE)::integer
        END AS yr,
        COALESCE((SELECT MAX(season) FROM public.rbl_points), (EXTRACT(YEAR FROM CURRENT_DATE)::integer - 2022)) AS season_num
),
lifetime_points AS (
    SELECT 
        b.id AS battler_id, 
        COALESCE(SUM(COALESCE(p.points, 11 - CAST(p.ranking AS INTEGER))), 0) AS lifetime_points,
        COUNT(p.id) AS lifetime_appearances
    FROM public.battlers b
    LEFT JOIN public.rbl_points p ON (p.battler_id1 = b.id OR p.battler_id2 = b.id) 
        AND CAST(p.ranking AS INTEGER) >= 1 
        AND CAST(p.ranking AS INTEGER) <= 10
    GROUP BY b.id
),
in_season_points AS (
    SELECT 
        b.id AS battler_id, 
        COALESCE(SUM(COALESCE(p.points, 11 - CAST(p.ranking AS INTEGER))), 0) AS in_season_points,
        COUNT(p.id) AS in_season_appearances
    FROM public.battlers b
    LEFT JOIN public.rbl_points p ON (p.battler_id1 = b.id OR p.battler_id2 = b.id) 
        AND CAST(p.ranking AS INTEGER) >= 1 
        AND CAST(p.ranking AS INTEGER) <= 10
        AND p.season = (SELECT season_num FROM current_season)
    GROUP BY b.id
),
lifetime_matches AS (
    SELECT 
        b.id AS battler_id,
        COUNT(CASE WHEN m.winner_id = b.id THEN 1 END) AS wins,
        COUNT(CASE WHEN m.winner_id != b.id AND m.winner_id != 'draw' AND m.winner_id IS NOT NULL THEN 1 END) AS losses,
        COUNT(CASE WHEN m.winner_id = 'draw' THEN 1 END) AS draws,
        COUNT(m.id) AS matches_count
    FROM public.battlers b
    LEFT JOIN public.matches m ON (b.id = m.battler_1_id OR b.id = m.battler_2_id)
    GROUP BY b.id
),
in_season_matches AS (
    SELECT 
        b.id AS battler_id,
        COUNT(CASE WHEN m.winner_id = b.id THEN 1 END) AS in_season_wins,
        COUNT(CASE WHEN m.winner_id != b.id AND m.winner_id != 'draw' AND m.winner_id IS NOT NULL THEN 1 END) AS in_season_losses,
        COUNT(CASE WHEN m.winner_id = 'draw' THEN 1 END) AS in_season_draws
    FROM public.battlers b
    LEFT JOIN (
        SELECT m.id, m.battler_1_id, m.battler_2_id, m.winner_id
        FROM public.matches m
        JOIN public.shows s ON s.lineup_id = m.lineup_id
        CROSS JOIN current_season cs
        WHERE s.datetime >= MAKE_DATE(cs.yr, 3, 1)
          AND s.datetime < MAKE_DATE(cs.yr + 1, 3, 1)
    ) m ON (b.id = m.battler_1_id OR b.id = m.battler_2_id)
    GROUP BY b.id
)
SELECT 
    b.id AS battler_id,
    
    -- Lifetime Points & Appearances
    lp.lifetime_points,
    lp.lifetime_appearances,
    DENSE_RANK() OVER (ORDER BY lp.lifetime_points DESC) AS lifetime_rank,
    
    -- In-Season Points & Appearances
    ip.in_season_points,
    ip.in_season_appearances,
    DENSE_RANK() OVER (ORDER BY ip.in_season_points DESC) AS in_season_rank,
    
    -- Lifetime Match Record
    lm.wins AS lifetime_wins,
    lm.losses AS lifetime_losses,
    lm.draws AS lifetime_draws,
    lm.matches_count AS lifetime_matches,
    
    -- In-Season Match Record
    ism.in_season_wins,
    ism.in_season_losses,
    ism.in_season_draws
    
FROM public.battlers b
LEFT JOIN lifetime_points lp ON b.id = lp.battler_id
LEFT JOIN in_season_points ip ON b.id = ip.battler_id
LEFT JOIN lifetime_matches lm ON b.id = lm.battler_id
LEFT JOIN in_season_matches ism ON b.id = ism.battler_id;

-- Ensure permissions
GRANT SELECT ON public.vw_battler_stats_comprehensive TO anon, authenticated, service_role;
-- Create a view for matches with battler names
CREATE OR REPLACE VIEW public.matches_with_names AS
SELECT 
    m.id,
    m.lineup_id,
    m.battler_1_id,
    m.battler_2_id,
    m.winner_id,
    m.battle_no,
    m.created_at,
    m.updated_at,
    b1.name as battler_1_name,
    b2.name as battler_2_name,
    w.name as winner_name,
    b1.image_url as b1_image_url,
    b2.image_url as b2_image_url,
    w.image_url as winner_image_url
FROM public.matches m
LEFT JOIN public.battlers b1 ON m.battler_1_id = b1.id
LEFT JOIN public.battlers b2 ON m.battler_2_id = b2.id
LEFT JOIN public.battlers w ON m.winner_id = w.id;

CREATE TABLE IF NOT EXISTS public.unauthenticated_users (
  id uuid not null default gen_random_uuid(),
  email text not null unique,
  name text,
  city_id text references public.cities(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint unauthenticated_users_pkey primary key (id)
);

-- Fantasy Show Attendance
CREATE TABLE IF NOT EXISTS public.fantasy_show_attendance (
  user_email text not null,
  show_id text not null,
  present_at_show boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (user_email, show_id)
);

-- Attendance Claims
CREATE TABLE IF NOT EXISTS public.attendance_claims (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  show_id text not null,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
-- 1. Create the Questions Table
CREATE TABLE IF NOT EXISTS public.fan_league_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    question_type TEXT DEFAULT 'short_text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Answers Table
CREATE TABLE IF NOT EXISTS public.fan_league_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.fan_league_questions(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, question_id)
);

-- 3. Enable RLS
ALTER TABLE public.fan_league_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_league_answers ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for fan_league_questions
-- Anyone can view questions
CREATE POLICY "Questions are viewable by everyone" 
    ON public.fan_league_questions FOR SELECT 
    USING (true);

-- Only admins can insert/update/delete questions
CREATE POLICY "Admins can insert questions" 
    ON public.fan_league_questions FOR INSERT 
    WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update questions" 
    ON public.fan_league_questions FOR UPDATE 
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can delete questions" 
    ON public.fan_league_questions FOR DELETE 
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 5. RLS Policies for fan_league_answers
-- Anyone can view answers (so opponents can see them)
CREATE POLICY "Answers are viewable by everyone" 
    ON public.fan_league_answers FOR SELECT 
    USING (true);

-- Users can only insert their own answers
CREATE POLICY "Users can insert their own answers" 
    ON public.fan_league_answers FOR INSERT 
    WITH CHECK (auth.uid() = profile_id);

-- Users can only update their own answers
CREATE POLICY "Users can update their own answers" 
    ON public.fan_league_answers FOR UPDATE 
    USING (auth.uid() = profile_id);

-- Users can delete their own answers, or admins can delete
CREATE POLICY "Users can delete their own answers" 
    ON public.fan_league_answers FOR DELETE 
    USING (auth.uid() = profile_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 6. Insert initial seed questions
INSERT INTO public.fan_league_questions (question_text, order_index, question_type)
VALUES 
    ('Who is your favorite battler of all time?', 1, 'short_text'),
    ('What is your signature roasting style?', 2, 'short_text'),
    ('Who do you think is the most overrated battler?', 3, 'short_text'),
    ('What is your prediction for the next champion?', 4, 'short_text')
ON CONFLICT DO NOTHING;


-- Comprehensive Stats View for Battlers
CREATE OR REPLACE VIEW public.vw_battler_stats_comprehensive AS
WITH current_season AS (
    -- Season starts March 1st. If current month is Jan/Feb (< 3), current season belongs to previous year.
    SELECT 
        CASE 
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 3 THEN EXTRACT(YEAR FROM CURRENT_DATE)::integer - 1
            ELSE EXTRACT(YEAR FROM CURRENT_DATE)::integer
        END AS yr,
        COALESCE((SELECT MAX(season) FROM public.rbl_points), (EXTRACT(YEAR FROM CURRENT_DATE)::integer - 2022)) AS season_num
),
lifetime_points AS (
    SELECT 
        b.id AS battler_id, 
        COALESCE(SUM(COALESCE(p.points, 11 - CAST(p.ranking AS INTEGER))), 0) AS lifetime_points,
        COUNT(p.id) AS lifetime_appearances
    FROM public.battlers b
    LEFT JOIN public.rbl_points p ON (p.battler_id1 = b.id OR p.battler_id2 = b.id) 
        AND CAST(p.ranking AS INTEGER) >= 1 
        AND CAST(p.ranking AS INTEGER) <= 10
    GROUP BY b.id
),
in_season_points AS (
    SELECT 
        b.id AS battler_id, 
        COALESCE(SUM(COALESCE(p.points, 11 - CAST(p.ranking AS INTEGER))), 0) AS in_season_points,
        COUNT(p.id) AS in_season_appearances
    FROM public.battlers b
    LEFT JOIN public.rbl_points p ON (p.battler_id1 = b.id OR p.battler_id2 = b.id) 
        AND CAST(p.ranking AS INTEGER) >= 1 
        AND CAST(p.ranking AS INTEGER) <= 10
        AND p.season = (SELECT season_num FROM current_season)
    GROUP BY b.id
),
lifetime_matches AS (
    SELECT 
        b.id AS battler_id,
        COUNT(CASE WHEN m.winner_id = b.id THEN 1 END) AS wins,
        COUNT(CASE WHEN m.winner_id != b.id AND m.winner_id != 'draw' AND m.winner_id IS NOT NULL THEN 1 END) AS losses,
        COUNT(CASE WHEN m.winner_id = 'draw' THEN 1 END) AS draws,
        COUNT(m.id) AS matches_count
    FROM public.battlers b
    LEFT JOIN public.matches m ON (b.id = m.battler_1_id OR b.id = m.battler_2_id)
    GROUP BY b.id
),
in_season_matches AS (
    SELECT 
        b.id AS battler_id,
        COUNT(CASE WHEN m.winner_id = b.id THEN 1 END) AS in_season_wins,
        COUNT(CASE WHEN m.winner_id != b.id AND m.winner_id != 'draw' AND m.winner_id IS NOT NULL THEN 1 END) AS in_season_losses,
        COUNT(CASE WHEN m.winner_id = 'draw' THEN 1 END) AS in_season_draws
    FROM public.battlers b
    LEFT JOIN (
        SELECT m.id, m.battler_1_id, m.battler_2_id, m.winner_id
        FROM public.matches m
        JOIN public.shows s ON s.lineup_id = m.lineup_id
        CROSS JOIN current_season cs
        WHERE s.datetime >= MAKE_DATE(cs.yr, 3, 1)
          AND s.datetime < MAKE_DATE(cs.yr + 1, 3, 1)
    ) m ON (b.id = m.battler_1_id OR b.id = m.battler_2_id)
    GROUP BY b.id
)
SELECT 
    b.id AS battler_id,
    
    -- Lifetime Points & Appearances
    lp.lifetime_points,
    lp.lifetime_appearances,
    DENSE_RANK() OVER (ORDER BY lp.lifetime_points DESC) AS lifetime_rank,
    
    -- In-Season Points & Appearances
    ip.in_season_points,
    ip.in_season_appearances,
    DENSE_RANK() OVER (ORDER BY ip.in_season_points DESC) AS in_season_rank,
    
    -- Lifetime Match Record
    lm.wins AS lifetime_wins,
    lm.losses AS lifetime_losses,
    lm.draws AS lifetime_draws,
    lm.matches_count AS lifetime_matches,
    
    -- In-Season Match Record
    ism.in_season_wins,
    ism.in_season_losses,
    ism.in_season_draws
    
FROM public.battlers b
LEFT JOIN lifetime_points lp ON b.id = lp.battler_id
LEFT JOIN in_season_points ip ON b.id = ip.battler_id
LEFT JOIN lifetime_matches lm ON b.id = lm.battler_id
LEFT JOIN in_season_matches ism ON b.id = ism.battler_id;

-- Ensure permissions
GRANT SELECT ON public.vw_battler_stats_comprehensive TO anon, authenticated, service_role;
