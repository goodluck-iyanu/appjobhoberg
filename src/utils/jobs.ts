import { createClient } from '@/utils/supabase/server'
import { FALLBACK_JOBS, Job } from '@/data/jobs'

interface RemotiveJob {
  id: number | string
  url: string
  title: string
  company_name: string
  company_logo?: string
  company_logo_url?: string
  category?: string
  job_type?: string
  publication_date?: string
  candidate_required_location?: string
  salary?: string
  description?: string
}

interface JobicyJob {
  id: number | string
  url: string
  jobTitle: string
  companyName: string
  companyLogo?: string
  jobIndustry?: string[]
  jobType?: string[]
  pubDate?: string
  jobGeo?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryPeriod?: string
  jobDescription?: string
}

interface RemoteOKJob {
  id: string | number
  slug?: string
  position?: string
  company?: string
  company_logo?: string
  location?: string
  tags?: string[]
  description?: string
  url?: string
  apply_url?: string
  date?: string
  salary_min?: number
  salary_max?: number
}

function decodeHtmlEntities(str: string): string {
  if (!str) return ''
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function normalizeJobType(jobType?: string | string[]): string {
  if (!jobType) return 'Full-time'
  const str = Array.isArray(jobType) ? jobType.join(' ') : String(jobType)
  const lower = str.toLowerCase()
  if (lower.includes('full')) return 'Full-time'
  if (lower.includes('part')) return 'Part-time'
  if (lower.includes('contract')) return 'Contract'
  if (lower.includes('freelance')) return 'Freelance'
  if (lower.includes('intern')) return 'Internship'
  return 'Full-time'
}

function normalizeCategory(cat?: string): string {
  if (!cat) return 'General'
  const lower = cat.toLowerCase()
  if (lower.includes('software') || lower.includes('dev') || lower.includes('engineer') || lower.includes('tech') || lower.includes('code') || lower.includes('program')) return 'Engineering'
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('product design') || lower.includes('creative')) return 'Design'
  if (lower.includes('market') || lower.includes('growth') || lower.includes('seo') || lower.includes('social') || lower.includes('brand')) return 'Marketing'
  if (lower.includes('support') || lower.includes('customer') || lower.includes('client') || lower.includes('success')) return 'Customer Support'
  if (lower.includes('sales') || lower.includes('account executive') || lower.includes('biz dev') || lower.includes('business development')) return 'Sales'
  if (lower.includes('product') || lower.includes('pm')) return 'Product'
  if (lower.includes('data') || lower.includes('analyst') || lower.includes('analytics') || lower.includes('machine learning') || lower.includes('ai')) return 'Data Science'
  if (lower.includes('writing') || lower.includes('content') || lower.includes('copy') || lower.includes('editorial')) return 'Writing'
  if (lower.includes('finance') || lower.includes('accounting') || lower.includes('bookkeeper') || lower.includes('payroll')) return 'Finance'
  if (lower.includes('hr') || lower.includes('people') || lower.includes('recruiting') || lower.includes('talent')) return 'Human Resources'
  if (lower.includes('admin') || lower.includes('assistant') || lower.includes('operations') || lower.includes('management')) return 'Operations'
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

/**
 * Smartly shuffles and interleaves jobs across diverse industries and categories
 */
export function smartShuffleJobs(jobs: Job[], seedOffset = 0): Job[] {
  if (!jobs || jobs.length <= 1) return jobs

  const groups: { [cat: string]: Job[] } = {}
  for (const j of jobs) {
    const cat = j.category || 'General'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(j)
  }

  const categories = Object.keys(groups)
  const rotationIndex = Math.abs(seedOffset) % (categories.length || 1)
  const rotatedCategories = [
    ...categories.slice(rotationIndex),
    ...categories.slice(0, rotationIndex),
  ]

  const maxLen = Math.max(...Object.values(groups).map((g) => g.length))
  const interleaved: Job[] = []

  for (let i = 0; i < maxLen; i++) {
    for (const cat of rotatedCategories) {
      if (groups[cat] && i < groups[cat].length) {
        interleaved.push(groups[cat][i])
      }
    }
  }

  return interleaved
}

/**
 * Fetches 100% real, active remote jobs directly from official providers
 * (Remotive, Jobicy, Himalayas, RemoteOK, and WeWorkRemotely)
 * Zero dummy jobs.
 */
export async function fetchAllFeeds(): Promise<Job[]> {
  const remotiveCategories = [
    'software-dev',
    'customer-support',
    'design',
    'marketing',
    'sales',
    'product',
    'business',
    'data',
    'writing',
    'hr',
    'finance',
    'all-others',
  ]

  const jobicyIndustries = [
    'engineering',
    'marketing',
    'supporting',
    'copywriting',
    'business',
    'hr',
    'management',
  ]

  const wwrCategories = [
    'remote-programming-jobs',
    'remote-customer-support-jobs',
    'remote-devops-sysadmin-jobs',
    'remote-sales-and-marketing-jobs',
    'remote-product-jobs',
  ]

  const apiPromises: Promise<Job[]>[] = []

  // 1. Remotive API (Multiple remote categories)
  for (const cat of remotiveCategories) {
    apiPromises.push(
      fetch(`https://remotive.com/api/remote-jobs?category=${cat}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.jobs && Array.isArray(data.jobs)) {
            return data.jobs.map((item: RemotiveJob) => ({
              id: `remotive-${item.id}`,
              created_at: item.publication_date || new Date().toISOString(),
              title: decodeHtmlEntities(item.title || 'Remote Role'),
              company_name: decodeHtmlEntities(item.company_name || 'Remote Partner'),
              company_logo_url: item.company_logo_url || item.company_logo || null,
              location: item.candidate_required_location ? `${item.candidate_required_location} (Remote)` : 'Worldwide (Remote)',
              employment_type: normalizeJobType(item.job_type),
              is_remote: true,
              salary_range: item.salary || 'Competitive',
              category: normalizeCategory(item.category || cat),
              description: item.description || '',
              requirements: '',
              apply_url: (item.url && item.url.startsWith('http')) ? item.url : `https://remotive.com`,
              status: 'open',
              source: 'Remotive API',
            }))
          }
          return []
        })
        .catch(() => [])
    )
  }

  // 2. Jobicy API (Multiple remote industries)
  for (const ind of jobicyIndustries) {
    apiPromises.push(
      fetch(`https://jobicy.com/api/v2/remote-jobs?count=50&industry=${ind}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.jobs && Array.isArray(data.jobs)) {
            return data.jobs.map((item: JobicyJob) => {
              let salaryText = 'Competitive'
              if (item.salaryMin && item.salaryMax) {
                const cur = item.salaryCurrency || '$'
                salaryText = `${cur}${item.salaryMin.toLocaleString()} - ${cur}${item.salaryMax.toLocaleString()}${item.salaryPeriod ? ` / ${item.salaryPeriod}` : ''}`
              } else if (item.salaryMin) {
                const cur = item.salaryCurrency || '$'
                salaryText = `From ${cur}${item.salaryMin.toLocaleString()}`
              }
              return {
                id: `jobicy-${item.id}`,
                created_at: item.pubDate || new Date().toISOString(),
                title: decodeHtmlEntities(item.jobTitle || 'Remote Role'),
                company_name: decodeHtmlEntities(item.companyName || 'Remote Partner'),
                company_logo_url: item.companyLogo || null,
                location: item.jobGeo ? `${item.jobGeo} (Remote)` : 'Worldwide (Remote)',
                employment_type: normalizeJobType(item.jobType),
                is_remote: true,
                salary_range: salaryText,
                category: normalizeCategory((item.jobIndustry && item.jobIndustry[0]) || ind),
                description: item.jobDescription || '',
                requirements: '',
                apply_url: (item.url && item.url.startsWith('http')) ? item.url : `https://jobicy.com`,
                status: 'open',
                source: 'Jobicy API',
              }
            })
          }
          return []
        })
        .catch(() => [])
    )
  }

  // 3. Himalayas API (100+ verified remote tech jobs)
  apiPromises.push(
    fetch('https://himalayas.app/jobs/api?limit=100', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.jobs && Array.isArray(data.jobs)) {
          return data.jobs.map((item: any) => {
            let salaryText = 'Competitive'
            if (item.minSalary && item.maxSalary) {
              const cur = item.currency || '$'
              salaryText = `${cur}${item.minSalary.toLocaleString()} - ${cur}${item.maxSalary.toLocaleString()}${item.salaryPeriod ? ` / ${item.salaryPeriod}` : ''}`
            } else if (item.minSalary) {
              salaryText = `From ${item.currency || '$'}${item.minSalary.toLocaleString()}`
            }
            return {
              id: `himalayas-${item.guid?.split('-').pop() || Math.random().toString(36).substring(7)}`,
              created_at: item.pubDate ? new Date(item.pubDate * 1000).toISOString() : new Date().toISOString(),
              title: decodeHtmlEntities(item.title || 'Remote Role'),
              company_name: decodeHtmlEntities(item.companyName || 'Remote Partner'),
              company_logo_url: item.companyLogo || null,
              location: item.locationRestrictions && item.locationRestrictions.length > 0
                ? `${item.locationRestrictions.join(', ')} (Remote)`
                : 'Worldwide (Remote)',
              employment_type: item.employmentType || 'Full-time',
              is_remote: true,
              salary_range: salaryText,
              category: normalizeCategory((item.categories && item.categories[0]) || 'Engineering'),
              description: item.description || item.excerpt || '',
              requirements: '',
              apply_url: item.applicationLink || item.guid || 'https://himalayas.app',
              status: 'open',
              source: 'Himalayas API',
            }
          })
        }
        return []
      })
      .catch(() => [])
  )

  // 4. RemoteOK API (100+ verified remote roles)
  apiPromises.push(
    fetch('https://remoteok.com/api', {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          return data
            .filter((item: RemoteOKJob) => item && item.position && item.company)
            .map((item: RemoteOKJob) => {
              let salaryText = 'Competitive'
              if (item.salary_min && item.salary_max && item.salary_max > 0) {
                salaryText = `$${item.salary_min.toLocaleString()} - $${item.salary_max.toLocaleString()} / yr`
              }
              const targetApply = item.apply_url || item.url || 'https://remoteok.com'

              return {
                id: `remoteok-${item.id}`,
                created_at: item.date || new Date().toISOString(),
                title: decodeHtmlEntities(item.position || 'Remote Role'),
                company_name: decodeHtmlEntities(item.company || 'Remote Partner'),
                company_logo_url: item.company_logo || null,
                location: item.location ? `${item.location} (Remote)` : 'Worldwide (Remote)',
                employment_type: 'Full-time',
                is_remote: true,
                salary_range: salaryText,
                category: normalizeCategory(item.tags && item.tags[0] ? item.tags[0] : 'Engineering'),
                description: item.description || '',
                requirements: '',
                apply_url: targetApply.startsWith('http') ? targetApply : `https://${targetApply}`,
                status: 'open',
                source: 'RemoteOK API',
              }
            })
        }
        return []
      })
      .catch(() => [])
  )

  // 5. We Work Remotely (Official remote RSS feeds)
  for (const cat of wwrCategories) {
    apiPromises.push(
      fetch(`https://weworkremotely.com/categories/${cat}.rss`, {
        cache: 'no-store',
        headers: { Accept: 'application/rss+xml, text/xml' },
      })
        .then((res) => (res.ok ? res.text() : ''))
        .then((xml) => {
          if (!xml || !xml.includes('<item>')) return []
          const items = xml.split('<item>').slice(1)
          const parsedJobs: Job[] = []
          for (const item of items) {
            const rawTitle = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
            const desc = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''

            if (!rawTitle || !link) continue

            // Title format is usually "CompanyName: Job Title"
            let company = 'Remote Company'
            let jobTitle = rawTitle
            if (rawTitle.includes(':')) {
              const parts = rawTitle.split(':')
              company = parts[0].trim()
              jobTitle = parts.slice(1).join(':').trim()
            }

            parsedJobs.push({
              id: `wwr-${link.split('/').pop() || Math.random().toString(36).substring(7)}`,
              created_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
              title: decodeHtmlEntities(jobTitle),
              company_name: decodeHtmlEntities(company),
              company_logo_url: null,
              location: 'Worldwide (Remote)',
              employment_type: 'Full-time',
              is_remote: true,
              salary_range: 'Competitive',
              category: normalizeCategory(cat.replace('remote-', '').replace('-jobs', '')),
              description: desc,
              requirements: '',
              apply_url: link.startsWith('http') ? link : `https://${link}`,
              status: 'open',
              source: 'WeWorkRemotely',
            })
          }
          return parsedJobs
        })
        .catch(() => [])
    )
  }

  const results = await Promise.all(apiPromises)
  const allFetched = results.flat()

  // Deduplicate by normalized title + company
  const seen = new Set<string>()
  const uniqueJobs: Job[] = []

  for (const j of allFetched) {
    if (!j.title || !j.company_name) continue
    const key = `${j.title.toLowerCase().trim()}___${j.company_name.toLowerCase().trim()}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueJobs.push(j)
    }
  }

  return uniqueJobs
}

/**
 * Public job retrieval for pages and search filters.
 * Reads directly from the Supabase database if populated, or falls back to live feeds.
 * 100% Real remote jobs — Zero dummy jobs.
 */
export async function fetchLiveJobs(options?: {
  query?: string
  category?: string
  location?: string
  limit?: number
}): Promise<Job[]> {
  const jobsList: Job[] = []

  // 1. Supabase Database Jobs
  try {
    const supabase = await createClient()
    const { data: dbJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (dbJobs && dbJobs.length > 0) {
      jobsList.push(
        ...(dbJobs as Job[]).map((j) => ({
          ...j,
          source: j.source || 'Verified Remote Role',
        }))
      )
    }
  } catch {}

  // 2. If database is completely empty, fetch live directly from official feeds so site is immediately populated
  if (jobsList.length === 0) {
    const liveFeeds = await fetchAllFeeds()
    jobsList.push(...liveFeeds)
  }

  // 3. Filtering
  let filtered = jobsList

  if (options?.query) {
    const q = options.query.toLowerCase().trim()
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company_name.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q)
    )
  }

  if (options?.category && options.category !== 'all') {
    const cat = options.category.toLowerCase().trim()
    filtered = filtered.filter(
      (job) =>
        job.category.toLowerCase().includes(cat) ||
        job.title.toLowerCase().includes(cat)
    )
  }

  if (options?.location) {
    const loc = options.location.toLowerCase().trim()
    filtered = filtered.filter((job) => job.location.toLowerCase().includes(loc))
  }

  if (options?.limit && options.limit > 0) {
    return filtered.slice(0, options.limit)
  }

  return filtered
}

/**
 * Fetch a single job by ID from DB or live feeds
 */
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
  } catch {}

  // 2. Check live feeds
  try {
    const allJobs = await fetchAllFeeds()
    const found = allJobs.find((j) => String(j.id) === String(id))
    if (found) return found
  } catch {}

  return null
}
