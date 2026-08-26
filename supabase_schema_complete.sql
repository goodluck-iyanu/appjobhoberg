-- ====================================================================
-- HOBERG JOBS — COMPLETE SUPABASE DATABASE SETUP & RLS SECURITY SCRIPT
-- ====================================================================

-- 1. Create the PROFILES table (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    display_name TEXT,
    country TEXT,
    avatar_url TEXT,
    career_field TEXT,
    current_role TEXT,
    experience_level TEXT,
    skills TEXT[] DEFAULT '{}',
    preferred_roles TEXT,
    remote_preference TEXT DEFAULT 'remote_only',
    employment_type TEXT,
    salary_preference TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    cv_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    premium_since TIMESTAMP WITH TIME ZONE
);

-- 2. Create the JOBS table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    location TEXT NOT NULL,
    employment_type TEXT NOT NULL DEFAULT 'Full-time',
    is_remote BOOLEAN DEFAULT true,
    salary_range TEXT,
    category TEXT DEFAULT 'General',
    description TEXT NOT NULL,
    requirements TEXT,
    apply_url TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open' or 'closed'
    source TEXT DEFAULT 'internal'
);

-- 3. Create the SAVED JOBS table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    job_external_id TEXT,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    apply_url TEXT NOT NULL
);

-- 4. Create the APPLICATION TRACKER table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Applied', -- 'Saved', 'Preparing', 'Applied', 'Interview', 'Offer', 'Closed'
    notes TEXT
);

-- 5. Create the PREMIUM WAITLIST table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    career_field TEXT,
    skills TEXT,
    job_interests TEXT,
    discount_tier TEXT DEFAULT 'Founding Member (20% OFF)'
);

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ====================================================================

-- Function to handle new user registration automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires when any user signs up (via Google or Email)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — MANDATORY DEFENSE
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- ── PROFILES POLICIES ──
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ── JOBS POLICIES ──
-- Anyone (public or authenticated) can view open jobs
CREATE POLICY "Public can view open jobs"
    ON public.jobs FOR SELECT
    TO public
    USING (status = 'open');

-- Only service role can modify jobs
CREATE POLICY "Service role can modify jobs"
    ON public.jobs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── SAVED JOBS POLICIES ──
CREATE POLICY "Users can view own saved jobs"
    ON public.saved_jobs FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved jobs"
    ON public.saved_jobs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs"
    ON public.saved_jobs FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ── APPLICATIONS POLICIES ──
CREATE POLICY "Users can view own applications"
    ON public.applications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
    ON public.applications FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
    ON public.applications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
    ON public.applications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ── WAITLIST POLICIES ──
-- Anyone can join the waitlist
CREATE POLICY "Anyone can join waitlist"
    ON public.waitlist FOR INSERT
    TO public
    WITH CHECK (true);
