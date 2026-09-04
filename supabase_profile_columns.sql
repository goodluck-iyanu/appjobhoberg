-- ====================================================================
-- HOBERG JOBS — PROFILE EXTENDED COLUMNS MIGRATION
-- Run this in Supabase SQL Editor to add all missing profile columns
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ====================================================================

-- Core columns that MUST exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Lagos';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Nigeria';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Lagos';

-- Extended profile fields used by the profile page
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS career_field TEXT DEFAULT 'Customer Support';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS desired_roles TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_status TEXT DEFAULT 'professional';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'Bachelor''s Degree';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years TEXT DEFAULT '1-2 years';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_summary TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_type_preference TEXT DEFAULT 'Full-time Remote';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expected_salary TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Existing spec columns (safe re-adds)
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
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_strength INT DEFAULT 20;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS raw_cv_path TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_parsed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_since TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_tailor_used BOOLEAN DEFAULT false;

-- Force PostgREST to reload the schema so the new columns are visible immediately
NOTIFY pgrst, 'reload schema';

-- Done! All profile columns now exist.

