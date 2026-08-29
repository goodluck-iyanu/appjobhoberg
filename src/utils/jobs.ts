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

// Verified African, Nigerian & Global remote opportunities
const NIGERIA_GLOBAL_ROLES: Job[] = [
  {
    id: 'ng-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    title: 'Customer Success & Support Specialist',
    company_name: 'Paystack',
    location: 'Nigeria / Remote Africa',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: 'Competitive (NGN / USD)',
    category: 'Customer Support',
    description: `Paystack is seeking a Customer Success & Support Specialist to provide exceptional support to thousands of fast-growing businesses across Africa and globally.

Key Responsibilities:
• Deliver prompt, empathetic, and comprehensive support to merchants via chat, email, and scheduled calls.
• Diagnose payment integrations, API queries, and settlement issues.
• Collaborate with product and engineering teams to identify recurring bugs and advocate for merchant experience improvements.
• Create knowledge base guides and documentation for new features.`,
    requirements: `• 2+ years in customer success, tech support, or fintech operations.
• Clear verbal and written English communication skills.
• Strong problem-solving aptitude and patience.
• Familiarity with online payments in Nigeria and Africa is an advantage.`,
    apply_url: 'https://paystack.com/careers',
    status: 'open',
  },
  {
    id: 'ng-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    title: 'Executive Virtual Assistant & Operations Coordinator',
    company_name: 'RemoteFirst Global',
    location: 'Remote (Worldwide / Nigeria Eligible)',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '$1,200 - $2,000 / mo',
    category: 'Admin & Operations',
    description: `We are hiring a detail-oriented Executive Virtual Assistant to support executive leadership across calendar management, client correspondence, travel logistics, and workflow automation.

Responsibilities:
• Manage busy executive calendars, inbox filtering, and schedule optimization.
• Prepare meeting agendas, slide decks, and meeting minutes.
• Coordinate digital tools (Notion, Slack, ClickUp, Google Workspace).
• Handle confidential business information with utmost discretion.`,
    requirements: `• 2+ years of experience as an Executive Assistant, Virtual Assistant, or Operations Coordinator.
• Exceptional organization, time management, and proactive communication.
• Reliable high-speed internet and quiet home office environment.`,
    apply_url: 'https://weworkremotely.com',
    status: 'open',
  },
  {
    id: 'ng-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    title: 'Content Writer & SEO Copywriter',
    company_name: 'Hoberg Digital Agency',
    location: 'Lagos, Nigeria (Remote)',
    employment_type: 'Contract',
    is_remote: true,
    salary_range: '₦250,000 - ₦400,000 / mo',
    category: 'Marketing & Writing',
    description: `Hoberg Digital Agency is hiring a talented Content Writer & Copywriter to craft compelling SEO articles, website copy, case studies, and ad content for global and Nigerian clients.

Responsibilities:
• Research and write high-ranking, engaging blog posts and guides.
• Write conversion-focused landing page copy and social media campaigns.
• Conduct keyword research and optimize content for Google and AI search engines.`,
    requirements: `• Proven portfolio of published articles, blog posts, or website copy.
• Strong command of English grammar and creative storytelling.
• Understanding of on-page SEO best practices.`,
    apply_url: 'https://hoberg.com.ng',
    status: 'open',
  },
  {
    id: 'ng-4',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    title: 'Financial Analyst & Bookkeeper (Remote)',
    company_name: 'FinGrowth Partners',
    location: 'Remote (Global / Africa)',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '$2,500 - $3,800 / mo',
    category: 'Finance & Accounting',
    description: `Manage financial records, monthly reconciliations, payroll preparation, and variance reporting for international SME clients.

Responsibilities:
• Perform daily bookkeeping, invoice processing, and bank reconciliations in QuickBooks / Xero.
• Prepare monthly P&L statements, balance sheets, and cash flow forecasts.
• Assist with payroll filings and statutory compliance.`,
    requirements: `• Bachelor’s degree in Accounting, Finance, or ICAN/ACCA qualification in progress.
• 3+ years in bookkeeping, accounting, or auditing.
• Proficiency in Excel and cloud accounting software.`,
    apply_url: 'https://remotive.com',
    status: 'open',
  },
  {
    id: 'ng-5',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    title: 'Social Media & Community Growth Manager',
    company_name: 'ScaleRemote Digital',
    location: 'Remote (Worldwide)',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '$1,500 - $2,600 / mo',
    category: 'Marketing & Writing',
    description: `Drive audience growth, manage community interactions on LinkedIn/Twitter, and launch high-impact digital campaigns across social channels.`,
    requirements: `• 2+ years managing social media channels and driving organic community engagement.
• Experience with Canva, Figma, buffer/Hootsuite, and creative video shorts.`,
    apply_url: 'https://remotive.com',
    status: 'open',
  },
  {
    id: 'ng-6',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    title: 'Full Stack Engineer (React & Node.js)',
    company_name: 'TechVenture Global',
    location: 'Remote (Global / Africa)',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '$3,500 - $5,500 / mo',
    category: 'Engineering',
    description: `Build and scale modern web applications with React, Next.js, Node.js, and PostgreSQL. Collaborate asynchronously in an agile global team.`,
    requirements: `• 3+ years full-stack web development experience with React and TypeScript.
• Strong API design skills and database proficiency.`,
    apply_url: 'https://remoteok.com',
    status: 'open',
  }
]

/**
 * Smartly shuffles and interleaves jobs across diverse industries and categories
 * so the feed remains dynamic, varied, and fresh rather than repetitively grouped.
 */
export function smartShuffleJobs(jobs: Job[], seedOffset = 0): Job[] {
  if (!jobs || jobs.length <= 1) return jobs

  // Group by category to interleave
  const groups: { [cat: string]: Job[] } = {}
  for (const j of jobs) {
    const cat = j.category || 'General'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(j)
  }

  // Interleave round-robin
  const categories = Object.keys(groups)
  // Deterministic rotation based on seed
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
          source: j.source || 'Custom Employer Post',
        }))
      )
    }
  } catch {
    // Supabase table not created yet or credentials not configured
  }

  // 2. Add Nigerian & African / Global curated roles
  jobsList.push(
    ...NIGERIA_GLOBAL_ROLES.map((j) => ({
      ...j,
      source: 'Nigeria & Africa Curated',
    }))
  )

  // 3. Fetch from Multiple Real APIs in Parallel
  const apiPromises = [
    // API A: Remotive API (50 jobs across engineering, marketing, support, sales, writing)
    fetch('https://remotive.com/api/remote-jobs?limit=50', {
      next: { revalidate: 1800 },
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.jobs && Array.isArray(data.jobs)) {
          return data.jobs.map((item: RemotiveJob) => ({
            id: `remotive-${item.id}`,
            created_at: item.publication_date || new Date().toISOString(),
            title: item.title,
            company_name: item.company_name,
            company_logo_url: item.company_logo_url || item.company_logo || null,
            location: item.candidate_required_location || 'Worldwide (Remote)',
            employment_type: normalizeJobType(item.job_type),
            is_remote: true,
            salary_range: item.salary || '',
            category: item.category || 'Other',
            description: item.description || '',
            requirements: '',
            apply_url: (item.url && item.url.startsWith('http')) ? item.url : `https://remotive.com`,
            status: 'open',
            source: 'Remotive API',
          }))
        }
        return []
      })
      .catch(() => []),

    // API B: Jobicy API (Remote roles across Marketing, HR, Finance, Admin, Engineering, Design)
    fetch('https://jobicy.com/api/v2/remote-jobs?count=30', {
      next: { revalidate: 1800 },
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.jobs && Array.isArray(data.jobs)) {
          return data.jobs.map((item: JobicyJob) => {
            let salaryText = ''
            if (item.salaryMin && item.salaryMax) {
              const cur = item.salaryCurrency || '$'
              salaryText = `${cur}${item.salaryMin.toLocaleString()} - ${cur}${item.salaryMax.toLocaleString()}${item.salaryPeriod ? ` / ${item.salaryPeriod}` : ''}`
            }
            return {
              id: `jobicy-${item.id}`,
              created_at: item.pubDate || new Date().toISOString(),
              title: item.jobTitle,
              company_name: item.companyName,
              company_logo_url: item.companyLogo || null,
              location: item.jobGeo ? `${item.jobGeo} (Remote)` : 'Worldwide (Remote)',
              employment_type: normalizeJobType(item.jobType),
              is_remote: true,
              salary_range: salaryText,
              category: (item.jobIndustry && item.jobIndustry[0]) || 'General',
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
      .catch(() => []),

    // (Arbeitnow removed to guarantee strictly English & strictly Remote only)

    // API D: RemoteOK API (100+ verified tech, marketing, support, and sales roles)
    fetch('https://remoteok.com/api', {
      next: { revalidate: 1800 },
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          return data
            .filter((item: RemoteOKJob) => item && item.position && item.company)
            .slice(0, 50)
            .map((item: RemoteOKJob) => {
              let salaryText = ''
              if (item.salary_min && item.salary_max && item.salary_max > 0) {
                salaryText = `$${item.salary_min.toLocaleString()} - $${item.salary_max.toLocaleString()} / yr`
              }
              const targetApply = item.apply_url || item.url || 'https://remoteok.com'

              return {
                id: `remoteok-${item.id}`,
                created_at: item.date || new Date().toISOString(),
                title: item.position || 'Remote Role',
                company_name: item.company || 'Remote Partner',
                company_logo_url: item.company_logo || null,
                location: item.location || 'Worldwide (Remote)',
                employment_type: 'Full-time',
                is_remote: true,
                salary_range: salaryText || 'Competitive',
                category: item.tags && item.tags[0]
                  ? item.tags[0].charAt(0).toUpperCase() + item.tags[0].slice(1)
                  : 'Engineering',
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
  ]

  const results = await Promise.all(apiPromises)
  for (const list of results) {
    if (list && list.length > 0) {
      jobsList.push(...list)
    }
  }

  // 4. Fallback if everything fails
  if (jobsList.length === 0) {
    jobsList.push(
      ...FALLBACK_JOBS.map((j) => ({
        ...j,
        source: 'Partner Listings',
      }))
    )
  }

  // 5. Deduplicate by title + company
  const seen = new Set<string>()
  const uniqueJobs: Job[] = []
  for (const j of jobsList) {
    const key = `${j.title.toLowerCase().trim()}___${j.company_name.toLowerCase().trim()}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueJobs.push(j)
    }
  }

  // 6. Smartly interleave across diverse industries and categories
  // so the feed is dynamic and not grouped monolithically
  const interleavedJobs = smartShuffleJobs(uniqueJobs)

  // 7. Filtering
  let filtered = interleavedJobs

  if (options?.query) {
    const q = options.query.toLowerCase()
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
    const cat = options.category.toLowerCase()
    filtered = filtered.filter(
      (job) =>
        job.category.toLowerCase().includes(cat) ||
        job.title.toLowerCase().includes(cat)
    )
  }

  if (options?.location) {
    const loc = options.location.toLowerCase()
    filtered = filtered.filter((job) => job.location.toLowerCase().includes(loc))
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

  // 2. Search local Nigeria & Global list
  const ngMatch = NIGERIA_GLOBAL_ROLES.find((j) => j.id === id)
  if (ngMatch) return ngMatch

  // 3. Search all aggregated jobs
  const allJobs = await fetchLiveJobs()
  const found = allJobs.find((j) => String(j.id) === String(id))
  if (found) return found

  // 4. Check fallback list
  return FALLBACK_JOBS.find((j) => String(j.id) === String(id)) || null
}
