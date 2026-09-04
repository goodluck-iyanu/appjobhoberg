export type SeniorityLevel = 'nysc' | 'intern' | 'entry' | 'mid' | 'senior' | 'all'
export type WorkType = 'remote' | 'hybrid' | 'onsite'
export type GeoScope = 'nigeria' | 'africa' | 'worldwide' | 'unknown' | 'remote_ng' | 'worldwide_ok' | 'geo_blocked'
export type HiresFromNigeria = 'yes' | 'no' | 'unknown'
export type VerificationStatus = 'verified_employer' | 'aggregated' | 'remote_unverified'
export type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Closed'

export interface EducationItem {
  institution: string
  degree: string
  field_of_study?: string
  graduation_year?: string
}

export interface ExperienceItem {
  company: string
  title: string
  location?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
  description?: string
  bullets?: string[]
}

export interface UserProfile {
  id: string
  created_at?: string
  updated_at?: string
  full_name?: string
  display_name?: string
  email?: string
  phone?: string
  city?: string
  state?: string
  country?: string
  target_roles?: string[]
  target_locations?: string[]
  work_types?: WorkType[]
  seniority?: SeniorityLevel
  expected_salary_min?: number
  expected_salary_max?: number
  expected_salary_currency?: string
  open_to_relocate?: boolean
  remote_from_nigeria?: boolean
  nysc_status?: 'completed' | 'serving' | 'exempted' | 'student' | 'not_applicable'
  skills?: string[]
  education?: EducationItem[]
  experience?: ExperienceItem[]
  certifications?: string[]
  links?: {
    linkedin?: string
    github?: string
    portfolio?: string
    twitter?: string
  }
  profile_strength?: number
  raw_cv_path?: string
  cv_parsed_at?: string
  is_premium?: boolean
  premium_tier?: 'free' | 'pro_monthly' | 'pro_quarterly' | 'pro_yearly'
  premium_since?: string
  premium_until?: string
  free_tailor_used?: boolean
}

export interface JobItem {
  id: string
  slug?: string
  title: string
  company_name: string
  company_domain?: string
  company_logo_url?: string | null
  location: string
  city?: string
  state?: string
  country?: string
  work_type?: WorkType
  geo_scope?: GeoScope
  hires_from_nigeria?: HiresFromNigeria
  category?: string
  seniority?: SeniorityLevel
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  salary_range?: string
  description: string
  requirements?: string
  apply_url: string
  apply_email?: string
  source?: string
  verification?: VerificationStatus
  is_scam_flagged?: boolean
  status?: string
  posted_at?: string
  created_at?: string
  expires_at?: string
  // Computed match fields (optional on join)
  match_score?: number
  match_reason?: string
  missing_keywords?: string[]
}

export interface JobMatch {
  user_id: string
  job_id: string
  score: number
  reason: string
  missing_keywords: string[]
  computed_at?: string
}

export interface ApplicationItem {
  id: string
  user_id: string
  job_id?: string | null
  job_title: string
  company_name: string
  location?: string
  apply_url?: string
  status: ApplicationStatus
  match_score?: number
  cv_version_id?: string
  applied_at: string
  next_follow_up?: string | null
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface CvVersion {
  id: string
  user_id: string
  job_id?: string | null
  kind: 'master' | 'tailored' | 'rewrite'
  title: string
  content: {
    full_name?: string
    email?: string
    phone?: string
    city?: string
    summary?: string
    skills?: string[]
    experience?: ExperienceItem[]
    education?: EducationItem[]
    certifications?: string[]
    target_job_title?: string
  }
  pdf_path?: string
  outdated?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreditLedgerItem {
  id: string
  user_id: string
  kind: 'tailor_cv' | 'rewrite_cv' | 'cover_letter' | 'cv_health_check'
  delta: number
  reason: string
  ref?: string
  balance_after: number
  created_at?: string
}

export interface PlanPricing {
  id: 'free' | 'pro_monthly' | 'pro_quarterly' | 'pro_yearly'
  name: string
  price_ngn: number
  kobo: number
  period: string
  popular?: boolean
  features: string[]
}

export const PRICING_PLANS: PlanPricing[] = [
  {
    id: 'free',
    name: 'Free Seeker',
    price_ngn: 0,
    kobo: 0,
    period: 'forever',
    features: [
      'Unlimited job searches & filters',
      'Unlimited applications (Free forever)',
      '1 Master CV structured profile',
      'Truthful Match % on recommended jobs',
      'Full Application Tracker pipeline',
      '3 saved search email alerts',
      '1 Lifetime AI Tailored CV trial',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Hoberg Pro',
    price_ngn: 2500,
    kobo: 250000,
    period: 'month',
    popular: true,
    features: [
      'Everything in Free Seeker',
      '8 Job-Specific Tailored CVs / month',
      '2 Full AI CV Professional Rewrites / month',
      '8 Custom Cover Letters / month',
      'Full Match breakdown with keyword gaps',
      'Instant & daily alert notifications',
      'Priority visibility for Nigerian employers',
    ],
  },
  {
    id: 'pro_quarterly',
    name: 'Pro Quarterly',
    price_ngn: 6500,
    kobo: 650000,
    period: '3 months',
    features: [
      'Everything in Pro Monthly',
      'Save ₦1,000 every quarter',
      '24 Tailored CVs over 3 months',
      '6 Full AI Professional Rewrites',
      'Instant WhatsApp & Email job alerts',
    ],
  },
  {
    id: 'pro_yearly',
    name: 'Pro Annual',
    price_ngn: 20000,
    kobo: 2000000,
    period: 'year',
    features: [
      'Everything in Pro Quarterly',
      'Save ₦10,000 per year (33% discount)',
      'Unlimited AI CV Health Checks',
      '96 Tailored CVs per year',
      'Direct priority support',
    ],
  },
]

export const ONE_OFF_CREDITS = [
  {
    id: 'tailor_single',
    kind: 'tailor_cv',
    name: '1 Job-Specific Tailored CV',
    price_ngn: 700,
    kobo: 70000,
    description: 'Optimize your bullet points & keywords for 1 target job',
  },
  {
    id: 'tailor_pack_3',
    kind: 'tailor_cv',
    name: '3 Tailored CVs Bundle',
    price_ngn: 1800,
    kobo: 180000,
    description: 'Save ₦300 on 3 tailored applications',
  },
  {
    id: 'rewrite_full',
    kind: 'rewrite_cv',
    name: 'Full AI CV Professional Rewrite',
    price_ngn: 2000,
    kobo: 200000,
    description: 'Complete restructuring of your entire CV from top to bottom',
  },
  {
    id: 'cover_letter',
    kind: 'cover_letter',
    name: '1 Job Cover Letter',
    price_ngn: 400,
    kobo: 40000,
    description: 'Concise, compelling 3-paragraph letter matching the job',
  },
  {
    id: 'cv_health_check',
    kind: 'cv_health_check',
    name: 'CV Health & ATS Check',
    price_ngn: 500,
    kobo: 50000,
    description: 'Full audit of formatting, impact metrics, and missing keywords',
  },
]

