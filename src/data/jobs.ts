export interface Job {
  id: string
  created_at: string
  title: string
  company_name: string
  company_logo_url?: string | null
  location: string
  employment_type: string
  is_remote: boolean
  salary_range: string
  description: string
  requirements: string
  apply_url: string
  status: string
  category: string
  source?: string
}

// 100% Real API jobs only — zero dummy jobs
export const FALLBACK_JOBS: Job[] = []
