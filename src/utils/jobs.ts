import { createClient } from '@/utils/supabase/server'
import { FALLBACK_JOBS, Job } from '@/data/jobs'

interface RemotiveJob {
  id: number | string
  url: string
  title: string
  company_name: string
  company_logo?: string
  company_logo_url?: string
  category: string
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary?: string
  description: string
  requirements?: string
}

function normalizeJobType(jobType: string): string {
  if (!jobType) return 'Full-time'
  const lower = jobType.toLowerCase()
  if (lower.includes('full')) return 'Full-time'
  if (lower.includes('part')) return 'Part-time'
  if (lower.includes('contract')) return 'Contract'
  if (lower.includes('freelance')) return 'Freelance'
  if (lower.includes('intern')) return 'Internship'
  return 'Full-time'
}

export async function fetchLiveJobs(options?: {
  query?: string
  category?: string
  limit?: number
}): Promise<Job[]> {
  const jobsList: Job[] = []

  // 1. Try fetching custom jobs from Supabase
  try {
    const supabase = await createClient()
    const { data: dbJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (dbJobs && dbJobs.length > 0) {
      jobsList.push(...(dbJobs as Job[]))
    }
  } catch {
    // Supabase table not created yet or credentials not configured
  }

  // 2. Fetch real live remote jobs from Remotive API
  try {
    let apiUrl = 'https://remotive.com/api/remote-jobs?limit=50'
    if (options?.category) {
      apiUrl += `&category=${encodeURIComponent(options.category.toLowerCase())}`
    }
    if (options?.query) {
      apiUrl += `&search=${encodeURIComponent(options.query)}`
    }

    const res = await fetch(apiUrl, {
      next: { revalidate: 1800 }, // Cache for 30 mins
      headers: {
        Accept: 'application/json',
      },
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.jobs && Array.isArray(data.jobs)) {
        const liveJobs: Job[] = data.jobs.map((item: RemotiveJob) => ({
          id: String(item.id),
          created_at: item.publication_date || new Date().toISOString(),
          title: item.title,
          company_name: item.company_name,
          company_logo_url: item.company_logo_url || item.company_logo || null,
          location: item.candidate_required_location || 'Worldwide (Remote)',
          employment_type: normalizeJobType(item.job_type),
          is_remote: true,
          salary_range: item.salary || '',
          category: item.category || 'Engineering',
          description: item.description,
          requirements: '',
          apply_url: item.url,
          status: 'open',
        }))

        jobsList.push(...liveJobs)
      }
    }
  } catch (error) {
    console.error('Failed to fetch from Remotive API:', error)
  }

  // 3. If list is still empty, return fallback curated jobs
  if (jobsList.length === 0) {
    return FALLBACK_JOBS
  }

  // 4. Apply client-side filter if query provided and API didn't filter
  let filtered = jobsList
  if (options?.query) {
    const q = options.query.toLowerCase()
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company_name.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q)
    )
  }

  if (options?.limit && options.limit > 0) {
    return filtered.slice(0, options.limit)
  }

  return filtered
}

export async function fetchJobById(id: string): Promise<Job | null> {
  // 1. Check Supabase
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (data) return data as Job
  } catch {
    // ignore
  }

  // 2. Fetch from Live Jobs list
  const allJobs = await fetchLiveJobs()
  const found = allJobs.find((j) => String(j.id) === String(id))
  if (found) return found

  // 3. Check fallback
  return FALLBACK_JOBS.find((j) => String(j.id) === String(id)) || null
}
