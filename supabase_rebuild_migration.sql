-- ====================================================================
-- HOBERG JOBS — FULL PRODUCT REBUILD MIGRATION SCRIPT
-- Nigerian-First Architecture, AI Gating, Application Tracking & RLS
-- ====================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES (Master Structured CV & Seeker Data) ──
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    display_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT DEFAULT 'Lagos',
    state TEXT DEFAULT 'Lagos',
    country TEXT DEFAULT 'Nigeria',
    target_roles TEXT[] DEFAULT '{}',
    target_locations TEXT[] DEFAULT '{Lagos, Remote}',
    work_types TEXT[] DEFAULT '{remote, hybrid, onsite}',
    seniority TEXT DEFAULT 'mid', -- 'nysc', 'intern', 'entry', 'mid', 'senior'
    expected_salary_min NUMERIC,
    expected_salary_max NUMERIC,
    expected_salary_currency TEXT DEFAULT 'NGN',
    open_to_relocate BOOLEAN DEFAULT false,
    remote_from_nigeria BOOLEAN DEFAULT true,
    nysc_status TEXT DEFAULT 'completed', -- 'completed', 'serving', 'exempted', 'student'
    skills TEXT[] DEFAULT '{}',
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    links JSONB DEFAULT '{}'::jsonb, -- { linkedin, github, portfolio, twitter }
    profile_strength INT DEFAULT 20,
    raw_cv_path TEXT,
    cv_parsed_at TIMESTAMP WITH TIME ZONE,
    is_premium BOOLEAN DEFAULT false,
    premium_tier TEXT DEFAULT 'free', -- 'free', 'pro_monthly', 'pro_quarterly', 'pro_yearly'
    premium_since TIMESTAMP WITH TIME ZONE,
    premium_until TIMESTAMP WITH TIME ZONE,
    free_tailor_used BOOLEAN DEFAULT false
);

-- Add any missing columns to existing profiles table safely
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Lagos';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_roles TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_locations TEXT[] DEFAULT '{Lagos, Remote}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_types TEXT[] DEFAULT '{remote, hybrid, onsite}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seniority TEXT DEFAULT 'mid';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expected_salary_min NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expected_salary_max NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expected_salary_currency TEXT DEFAULT 'NGN';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS open_to_relocate BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS remote_from_nigeria BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nysc_status TEXT DEFAULT 'completed';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_strength INT DEFAULT 20;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS raw_cv_path TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_parsed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_tailor_used BOOLEAN DEFAULT false;

-- ── 2. JOBS (Nigerian-First & Verified Remote Schema) ──
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '45 days'),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_domain TEXT,
    company_logo_url TEXT,
    location TEXT NOT NULL DEFAULT 'Lagos, Nigeria',
    city TEXT DEFAULT 'Lagos',
    state TEXT DEFAULT 'Lagos',
    country TEXT DEFAULT 'Nigeria',
    work_type TEXT DEFAULT 'remote', -- 'onsite', 'hybrid', 'remote'
    geo_scope TEXT DEFAULT 'nigeria', -- 'nigeria', 'africa', 'worldwide', 'unknown'
    hires_from_nigeria TEXT DEFAULT 'yes', -- 'yes', 'no', 'unknown'
    category TEXT DEFAULT 'Engineering',
    seniority TEXT DEFAULT 'mid', -- 'nysc', 'intern', 'entry', 'mid', 'senior', 'all'
    salary_min NUMERIC,
    salary_max NUMERIC,
    salary_currency TEXT DEFAULT 'NGN',
    salary_range TEXT,
    description TEXT NOT NULL,
    requirements TEXT,
    apply_url TEXT NOT NULL,
    apply_email TEXT,
    source TEXT DEFAULT 'aggregated', -- 'employer', 'official_page', 'aggregated', 'internal'
    verification TEXT DEFAULT 'aggregated', -- 'verified_employer', 'aggregated', 'remote_unverified'
    is_scam_flagged BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'open', -- 'open', 'draft', 'expired', 'rejected'
    raw_payload JSONB DEFAULT '{}'::jsonb
);

-- Add missing columns to jobs table safely
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '45 days');
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_domain TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Lagos';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Lagos';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Nigeria';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS work_type TEXT DEFAULT 'remote';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS geo_scope TEXT DEFAULT 'nigeria';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS hires_from_nigeria TEXT DEFAULT 'yes';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS seniority TEXT DEFAULT 'mid';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_min NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_max NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'NGN';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS apply_email TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS verification TEXT DEFAULT 'aggregated';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_scam_flagged BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS raw_payload JSONB DEFAULT '{}'::jsonb;

-- ── 3. JOB MATCHES (Deterministic Precomputed Scoring Table) ──
CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    score INT NOT NULL DEFAULT 50,
    reason TEXT NOT NULL DEFAULT 'Relevant to your profile',
    missing_keywords TEXT[] DEFAULT '{}',
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_job_match UNIQUE (user_id, job_id)
);

-- ── 4. SAVED JOBS ──
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
    apply_url TEXT NOT NULL,
    CONSTRAINT unique_user_saved_job UNIQUE (user_id, job_id)
);

-- ── 5. APPLICATIONS TRACKER (Saved -> Applied -> Interview -> Offer -> Closed) ──
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT DEFAULT 'Remote',
    apply_url TEXT,
    status TEXT NOT NULL DEFAULT 'Applied', -- 'Saved', 'Applied', 'Interview', 'Offer', 'Closed'
    match_score INT,
    cv_version_id UUID,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    next_follow_up DATE,
    notes TEXT
);

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Remote';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS apply_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS match_score INT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cv_version_id UUID;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS next_follow_up DATE;

-- ── 6. CV VERSIONS (Master, Tailored, and Rewrite Snapshots) ──
CREATE TABLE IF NOT EXISTS public.cv_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    kind TEXT NOT NULL DEFAULT 'master', -- 'master', 'tailored', 'rewrite'
    title TEXT NOT NULL DEFAULT 'Master CV',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    pdf_path TEXT,
    outdated BOOLEAN DEFAULT false
);

-- ── 7. CREDIT LEDGER (One-off AI Credits & Entitlements) ──
CREATE TABLE IF NOT EXISTS public.credit_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    kind TEXT NOT NULL, -- 'tailor_cv', 'rewrite_cv', 'cover_letter', 'cv_health_check'
    delta INT NOT NULL, -- positive for credits added, negative for used
    reason TEXT NOT NULL, -- 'purchase', 'subscription_grant', 'used_on_job'
    ref TEXT, -- payment reference or job_id
    balance_after INT NOT NULL DEFAULT 0
);

-- ── 8. SUBSCRIPTIONS & PURCHASES ──
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL, -- 'pro_monthly', 'pro_quarterly', 'pro_yearly'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    paystack_customer_code TEXT,
    paystack_subscription_code TEXT,
    paystack_plan_code TEXT
);

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product TEXT NOT NULL, -- 'pro_monthly', 'tailor_single', 'tailor_pack_3', 'rewrite_full', 'cover_letter'
    amount_kobo INT NOT NULL,
    currency TEXT DEFAULT 'NGN',
    paystack_ref TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'success'
);

-- ── 9. EMPLOYER POSTS (Pending Admin Review) ──
CREATE TABLE IF NOT EXISTS public.employer_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    employer_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT DEFAULT 'Lagos',
    state TEXT DEFAULT 'Lagos',
    work_type TEXT DEFAULT 'onsite',
    category TEXT DEFAULT 'General',
    description TEXT NOT NULL,
    requirements TEXT,
    apply_url TEXT,
    apply_email TEXT,
    salary_range TEXT,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    payment_status TEXT DEFAULT 'free', -- 'free', 'featured_paid'
    paystack_ref TEXT
);

-- ── 10. JOB REPORTS & SCAM QUARANTINE ──
CREATE TABLE IF NOT EXISTS public.job_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL, -- 'apply_fee', 'fake_company', 'expired', 'duplicate', 'doesnt_hire_from_nigeria', 'other'
    details TEXT,
    status TEXT DEFAULT 'pending' -- 'pending', 'resolved', 'dismissed'
);

-- ── 11. JOB ALERTS ──
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    query TEXT,
    city TEXT DEFAULT 'All Nigeria',
    category TEXT DEFAULT 'All',
    min_score INT DEFAULT 60,
    channel TEXT DEFAULT 'email', -- 'email', 'whatsapp'
    is_active BOOLEAN DEFAULT true,
    is_pro BOOLEAN DEFAULT false
);

-- ── 12. AI USAGE LOGS (Cost & Token Monitoring) ──
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    feature TEXT NOT NULL, -- 'cv_parse', 'cv_tailor', 'cv_rewrite', 'cover_letter'
    model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    cost_estimate_usd NUMERIC(8,6) DEFAULT 0,
    success BOOLEAN DEFAULT true
);

-- ── 13. AUTOMATIC PROFILE TRIGGER ON SIGNUP ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email,
        full_name, 
        display_name, 
        avatar_url,
        city,
        country
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'Lagos',
        'Nigeria'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 14. ROW LEVEL SECURITY (RLS) POLICIES ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users manage own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Jobs: Public can view published open jobs, Service Role can do everything
DROP POLICY IF EXISTS "Public can view open jobs" ON public.jobs;
CREATE POLICY "Public can view open jobs" ON public.jobs FOR SELECT TO public USING (status = 'open' AND is_scam_flagged = false);

DROP POLICY IF EXISTS "Service role can modify jobs" ON public.jobs;
CREATE POLICY "Service role can modify jobs" ON public.jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Job Matches: User reads own matches
DROP POLICY IF EXISTS "Users can view own matches" ON public.job_matches;
CREATE POLICY "Users can view own matches" ON public.job_matches FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own matches" ON public.job_matches;
CREATE POLICY "Users can insert own matches" ON public.job_matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can modify matches" ON public.job_matches;
CREATE POLICY "Service role can modify matches" ON public.job_matches FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Saved Jobs: User manages own
DROP POLICY IF EXISTS "Users can view own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can insert own saved jobs" ON public.saved_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can delete own saved jobs" ON public.saved_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Applications: User manages own applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own applications" ON public.applications;
CREATE POLICY "Users can delete own applications" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CV Versions: User manages own
DROP POLICY IF EXISTS "Users can view own cv versions" ON public.cv_versions;
CREATE POLICY "Users can view own cv versions" ON public.cv_versions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cv versions" ON public.cv_versions;
CREATE POLICY "Users can insert own cv versions" ON public.cv_versions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cv versions" ON public.cv_versions;
CREATE POLICY "Users can update own cv versions" ON public.cv_versions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cv versions" ON public.cv_versions;
CREATE POLICY "Users can delete own cv versions" ON public.cv_versions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Credit Ledger: User reads own credits
DROP POLICY IF EXISTS "Users can view own credits" ON public.credit_ledger;
CREATE POLICY "Users can view own credits" ON public.credit_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages credits" ON public.credit_ledger;
CREATE POLICY "Service role manages credits" ON public.credit_ledger FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Subscriptions & Purchases: User reads own
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Employer Posts: Anyone can submit a post, only service_role / admin approves
DROP POLICY IF EXISTS "Public can submit employer post" ON public.employer_posts;
CREATE POLICY "Public can submit employer post" ON public.employer_posts FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages employer posts" ON public.employer_posts;
CREATE POLICY "Service role manages employer posts" ON public.employer_posts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Job Reports: Anyone can report a job
DROP POLICY IF EXISTS "Public can submit job report" ON public.job_reports;
CREATE POLICY "Public can submit job report" ON public.job_reports FOR INSERT TO public WITH CHECK (true);

-- Alerts: User manages own alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
CREATE POLICY "Users can view own alerts" ON public.alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON public.alerts;
CREATE POLICY "Users can insert own alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON public.alerts;
CREATE POLICY "Users can update own alerts" ON public.alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.alerts;
CREATE POLICY "Users can delete own alerts" ON public.alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';


-- Fix missing email column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
NOTIFY pgrst, 'reload schema';

