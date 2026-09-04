import { createClient } from '@/utils/supabase/server'
import { JobItem, UserProfile } from '@/types'
import { calculateJobMatch } from '@/utils/matching'

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

export function decodeHtmlEntities(str: string): string {
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

export function normalizeJobType(jobType?: string | string[]): 'remote' | 'hybrid' | 'onsite' {
  if (!jobType) return 'remote'
  const str = (Array.isArray(jobType) ? jobType.join(' ') : String(jobType)).toLowerCase()
  if (str.includes('hybrid')) return 'hybrid'
  if (str.includes('onsite') || str.includes('on-site') || str.includes('in-office')) return 'onsite'
  return 'remote'
}

export function normalizeCategory(cat?: string): string {
  if (!cat) return 'General'
  const lower = cat.toLowerCase()
  if (lower.includes('software') || lower.includes('dev') || lower.includes('engineer') || lower.includes('tech') || lower.includes('code') || lower.includes('program')) return 'Engineering'
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('creative')) return 'Design'
  if (lower.includes('market') || lower.includes('growth') || lower.includes('seo') || lower.includes('social')) return 'Marketing'
  if (lower.includes('support') || lower.includes('customer') || lower.includes('client') || lower.includes('success')) return 'Customer Support'
  if (lower.includes('sales') || lower.includes('account executive') || lower.includes('business development')) return 'Sales'
  if (lower.includes('product') || lower.includes('pm')) return 'Product'
  if (lower.includes('data') || lower.includes('analyst') || lower.includes('analytics') || lower.includes('ai')) return 'Data Science'
  if (lower.includes('writing') || lower.includes('content') || lower.includes('copy')) return 'Writing'
  if (lower.includes('finance') || lower.includes('accounting') || lower.includes('bookkeeper')) return 'Finance'
  if (lower.includes('hr') || lower.includes('people') || lower.includes('recruiting')) return 'Human Resources'
  if (lower.includes('admin') || lower.includes('assistant') || lower.includes('operations')) return 'Operations'
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

/**
 * Detects whether a job hires from Nigeria or has high/low chance
 */
export function detectHiresFromNigeria(locationText: string, description: string): {
  hiresFromNigeria: 'yes' | 'no' | 'unknown'
  geoScope: 'nigeria' | 'africa' | 'worldwide' | 'unknown'
  city: string
  country: string
} {
  const loc = (locationText || '').toLowerCase()
  const desc = (description || '').toLowerCase()

  // 1. Explicit Nigeria / State
  if (
    loc.includes('nigeria') || loc.includes('lagos') || loc.includes('abuja') ||
    loc.includes('port harcourt') || loc.includes('ibadan') || loc.includes('enugu') ||
    loc.includes('kaduna') || loc.includes('benin') || loc.includes('calabar') ||
    desc.includes('based in nigeria') || desc.includes('work from nigeria')
  ) {
    let city = 'Lagos'
    if (loc.includes('abuja')) city = 'Abuja'
    else if (loc.includes('port harcourt')) city = 'Port Harcourt'
    else if (loc.includes('ibadan')) city = 'Ibadan'
    else if (loc.includes('enugu')) city = 'Enugu'

    return {
      hiresFromNigeria: 'yes',
      geoScope: 'nigeria',
      city,
      country: 'Nigeria',
    }
  }

  // 2. Strict US / EU / UK work authorization requirement (Cannot hire from Nigeria)
  if (
    desc.includes('us citizenship required') ||
    desc.includes('must be authorized to work in the us') ||
    desc.includes('us work authorization required') ||
    desc.includes('must reside in the united states') ||
    desc.includes('must be located in the us') ||
    desc.includes('us only') ||
    loc.includes('united states only') ||
    loc.includes('usa only') ||
    loc.includes('uk only') ||
    loc.includes('eu only') ||
    loc.includes('canada only')
  ) {
    return {
      hiresFromNigeria: 'no',
      geoScope: 'unknown',
      city: 'International',
      country: 'International',
    }
  }

  // 3. Africa / Worldwide Remote
  if (
    loc.includes('worldwide') || loc.includes('anywhere') || loc.includes('global') ||
    loc.includes('africa') || loc.includes('emea') || loc.includes('latam/apac/africa') ||
    desc.includes('worldwide remote') || desc.includes('hire globally')
  ) {
    return {
      hiresFromNigeria: 'yes',
      geoScope: loc.includes('africa') ? 'africa' : 'worldwide',
      city: 'Remote',
      country: loc.includes('africa') ? 'Africa' : 'Global',
    }
  }

  return {
    hiresFromNigeria: 'unknown',
    geoScope: 'unknown',
    city: 'Remote',
    country: 'International',
  }
}

/**
 * Detects scam patterns
 */
export function isScamPattern(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  return (
    text.includes('send registration fee') ||
    text.includes('application fee required') ||
    text.includes('pay to start') ||
    text.includes('send bvn') ||
    text.includes('airtime recharge card') ||
    text.includes('crypto deposit required') ||
    text.includes('whatsapp only for bvn')
  )
}

/**
 * Public & Auth job retrieval for pages and search filters.
 * Reads directly from Supabase database with Nigerian-first sorting and real-time match scores.
 */
export async function fetchLiveJobs(options?: {
  query?: string
  category?: string
  location?: string
  city?: string
  workType?: string
  seniority?: string
  dollarOnly?: boolean
  nigeriaOnly?: boolean
  limit?: number
  userProfile?: Partial<UserProfile> | null
}): Promise<JobItem[]> {
  const jobsList: JobItem[] = []

  try {
    const supabase = await createClient()
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .eq('is_scam_flagged', false)

    // Filter by city if specified
    if (options?.city && options.city.toLowerCase() !== 'all') {
      query = query.ilike('location', `%${options.city}%`)
    }

    // Filter by work type
    if (options?.workType && options.workType !== 'all') {
      query = query.eq('work_type', options.workType)
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(options?.limit && options.limit > 0 ? options.limit * 3 : 2000)

    const { data: dbJobs, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
    }

    if (dbJobs && dbJobs.length > 0) {
      const filteredDbJobs = (dbJobs as JobItem[]).filter(j => 
        !j.title.toLowerCase().includes('dummy') && 
        !j.title.toLowerCase().includes('test ')
      )
      
      jobsList.push(
        ...filteredDbJobs.map((j) => ({
          id: String(j.id),
          slug: j.slug,
          created_at: j.created_at,
          posted_at: j.posted_at || j.created_at,
          expires_at: j.expires_at,
          title: decodeHtmlEntities(j.title),
          company_name: decodeHtmlEntities(j.company_name),
          company_domain: j.company_domain,
          company_logo_url: j.company_logo_url,
          location: j.location,
          city: j.city,
          state: j.state,
          country: j.country,
          work_type: normalizeJobType(j.work_type),
          geo_scope: j.geo_scope,
          hires_from_nigeria: j.hires_from_nigeria || 'unknown',
          salary_min: j.salary_min,
          salary_max: j.salary_max,
          salary_currency: j.salary_currency,
          salary_range: j.salary_range,
          description: j.description,
          requirements: j.requirements,
          apply_url: j.apply_url,
          apply_email: j.apply_email,
          source: j.source,
          verification: j.verification,
          is_scam_flagged: j.is_scam_flagged,
          status: j.status,
        }))
      )
    }
  } catch (err) {
    console.error('Error fetching jobs from DB:', err)
  }

  // If database is completely empty or has very few jobs (e.g. dummy jobs), fetch directly from live feeds
  if (jobsList.length < 50) {
    const liveFeeds = await fetchAllFeeds()
    jobsList.push(...liveFeeds)
  }

  // In-memory advanced filtering
  let filtered = jobsList

  // Query search
  if (options?.query) {
    const q = options.query.toLowerCase().trim()
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company_name.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        (job.category && job.category.toLowerCase().includes(q)) ||
        (job.description && job.description.toLowerCase().includes(q))
    )
  }

  // Category filter
  if (options?.category && options.category !== 'all') {
    const cat = options.category.toLowerCase().trim()
    filtered = filtered.filter(
      (job) =>
        (job.category && job.category.toLowerCase().includes(cat)) ||
        job.title.toLowerCase().includes(cat)
    )
  }

  // Location filter
  if (options?.location && options.location !== 'all') {
    const loc = options.location.toLowerCase().trim()
    filtered = filtered.filter((job) => job.location.toLowerCase().includes(loc))
  }

  // Dollar Remote shelf filter
  if (options?.dollarOnly) {
    filtered = filtered.filter(
      (job) =>
        (job.salary_range && job.salary_range.includes('$')) ||
        (job.salary_currency === 'USD') ||
        (job.source && job.source.includes('RemoteOK'))
    )
  }

  // Nigeria & Africa only filter
  if (options?.nigeriaOnly) {
    filtered = filtered.filter(
      (job) =>
        job.country === 'Nigeria' ||
        job.geo_scope === 'nigeria' ||
        job.geo_scope === 'africa' ||
        job.location.toLowerCase().includes('nigeria') ||
        job.location.toLowerCase().includes('lagos')
    )
  }

  // Calculate truthful match scores if profile is provided
  if (options?.userProfile) {
    filtered = filtered.map((job) => {
      const match = calculateJobMatch(options.userProfile, job)
      return {
        ...job,
        match_score: match.score,
        match_reason: match.reason,
        missing_keywords: match.missing_keywords,
      }
    })

    // Sort by match score descending
    filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
  } else {
    // Sort Nigerian jobs first, then worldwide
    filtered.sort((a, b) => {
      const aIsNg = a.country === 'Nigeria' || a.location.toLowerCase().includes('nigeria') ? 1 : 0
      const bIsNg = b.country === 'Nigeria' || b.location.toLowerCase().includes('nigeria') ? 1 : 0
      return bIsNg - aIsNg
    })
  }

  if (options?.limit && options.limit > 0) {
    return filtered.slice(0, options.limit)
  }

  return filtered
}

/**
 * Fetch a single job by ID or slug
 */
export async function fetchJobById(idOrSlug: string, userProfile?: Partial<UserProfile> | null): Promise<JobItem | null> {
  let job: JobItem | null = null

  // 1. Check Supabase DB by UUID or Slug
  try {
    const supabase = await createClient()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)

    let query = supabase.from('jobs').select('*')
    if (isUuid) {
      query = query.eq('id', idOrSlug)
    } else {
      query = query.eq('slug', idOrSlug)
    }

    const { data } = await query.maybeSingle()
    if (data) {
      job = data as JobItem
    }
  } catch {}

  // 2. Check live feeds if not in DB
  if (!job) {
    try {
      const allJobs = await fetchAllFeeds()
      const found = allJobs.find((j) => String(j.id) === String(idOrSlug) || j.slug === idOrSlug)
      if (found) job = found
    } catch {}
  }

  if (job && userProfile) {
    const match = calculateJobMatch(userProfile, job)
    job.match_score = match.score
    job.match_reason = match.reason
    job.missing_keywords = match.missing_keywords
  }

  return job
}

/**
 * Ingestion pipeline: Fetches 100% live remote feeds and tags with Nigerian-first metadata
 */
export async function fetchAllFeeds(): Promise<JobItem[]> {
  const remotiveCategories = [
    'software-dev', 'customer-support', 'design', 'marketing', 'sales',
    'product', 'business', 'data', 'writing', 'hr', 'finance', 'all-others',
  ]

  const jobicyIndustries = [
    'engineering', 'marketing', 'supporting', 'copywriting', 'business', 'hr', 'management',
  ]

  const wwrCategories = [
    'remote-programming-jobs', 'remote-customer-support-jobs', 'remote-devops-sysadmin-jobs',
    'remote-sales-and-marketing-jobs', 'remote-product-jobs',
  ]

  const apiPromises: Promise<JobItem[]>[] = []

  // 1. Remotive API
  for (const cat of remotiveCategories) {
    apiPromises.push(
      fetch(`https://remotive.com/api/remote-jobs?category=${cat}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.jobs && Array.isArray(data.jobs)) {
            return data.jobs.map((item: RemotiveJob) => {
              const locationText = item.candidate_required_location ? `${item.candidate_required_location} (Remote)` : 'Worldwide (Remote)'
              const desc = item.description || ''
              const title = decodeHtmlEntities(item.title || 'Remote Role')
              const { hiresFromNigeria, geoScope, city, country } = detectHiresFromNigeria(locationText, desc)

              return {
                id: `remotive-${item.id}`,
                created_at: item.publication_date || new Date().toISOString(),
                posted_at: item.publication_date || new Date().toISOString(),
                title,
                company_name: decodeHtmlEntities(item.company_name || 'Remote Partner'),
                company_logo_url: item.company_logo_url || item.company_logo || null,
                location: locationText,
                city,
                country,
                work_type: 'remote' as const,
                geo_scope: geoScope,
                hires_from_nigeria: hiresFromNigeria,
                salary_range: item.salary || 'Competitive',
                category: normalizeCategory(item.category || cat),
                description: desc,
                requirements: '',
                apply_url: (item.url && item.url.startsWith('http')) ? item.url : `https://remotive.com`,
                status: 'open',
                source: 'Remotive API',
                verification: 'aggregated' as const,
                is_scam_flagged: isScamPattern(title, desc),
              }
            })
          }
          return []
        })
        .catch(() => [])
    )
  }

  // 2. Jobicy API
  for (const ind of jobicyIndustries) {
    apiPromises.push(
      fetch(`https://jobicy.com/api/v2/remote-jobs?count=200&industry=${ind}`, {
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
              const locationText = item.jobGeo ? `${item.jobGeo} (Remote)` : 'Worldwide (Remote)'
              const desc = item.jobDescription || ''
              const title = decodeHtmlEntities(item.jobTitle || 'Remote Role')
              const { hiresFromNigeria, geoScope, city, country } = detectHiresFromNigeria(locationText, desc)

              return {
                id: `jobicy-${item.id}`,
                created_at: item.pubDate || new Date().toISOString(),
                posted_at: item.pubDate || new Date().toISOString(),
                title,
                company_name: decodeHtmlEntities(item.companyName || 'Remote Partner'),
                company_logo_url: item.companyLogo || null,
                location: locationText,
                city,
                country,
                work_type: 'remote' as const,
                geo_scope: geoScope,
                hires_from_nigeria: hiresFromNigeria,
                salary_range: salaryText,
                category: normalizeCategory((item.jobIndustry && item.jobIndustry[0]) || ind),
                description: desc,
                requirements: '',
                apply_url: (item.url && item.url.startsWith('http')) ? item.url : `https://jobicy.com`,
                status: 'open',
                source: 'Jobicy API',
                verification: 'aggregated' as const,
                is_scam_flagged: isScamPattern(title, desc),
              }
            })
          }
          return []
        })
        .catch(() => [])
    )
  }

  // 3. RemoteOK API
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
              const locationText = item.location ? `${item.location} (Remote)` : 'Worldwide (Remote)'
              const desc = item.description || ''
              const title = decodeHtmlEntities(item.position || 'Remote Role')
              const { hiresFromNigeria, geoScope, city, country } = detectHiresFromNigeria(locationText, desc)

              return {
                id: `remoteok-${item.id}`,
                created_at: item.date || new Date().toISOString(),
                posted_at: item.date || new Date().toISOString(),
                title,
                company_name: decodeHtmlEntities(item.company || 'Remote Partner'),
                company_logo_url: item.company_logo || null,
                location: locationText,
                city,
                country,
                work_type: 'remote' as const,
                geo_scope: geoScope,
                hires_from_nigeria: hiresFromNigeria,
                salary_range: salaryText,
                category: normalizeCategory(item.tags && item.tags[0] ? item.tags[0] : 'Engineering'),
                description: desc,
                requirements: '',
                apply_url: targetApply.startsWith('http') ? targetApply : `https://${targetApply}`,
                status: 'open',
                source: 'RemoteOK API',
                verification: 'aggregated' as const,
                is_scam_flagged: isScamPattern(title, desc),
              }
            })
        }
        return []
      })
      .catch(() => [])
  )

  // 4. We Work Remotely
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
          const parsedJobs: JobItem[] = []
          for (const item of items) {
            const rawTitle = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
            const desc = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''

            if (!rawTitle || !link) continue

            let company = 'Remote Company'
            let jobTitle = rawTitle
            if (rawTitle.includes(':')) {
              const parts = rawTitle.split(':')
              company = parts[0].trim()
              jobTitle = parts.slice(1).join(':').trim()
            }

            const title = decodeHtmlEntities(jobTitle)
            const { hiresFromNigeria, geoScope, city, country } = detectHiresFromNigeria('Worldwide (Remote)', desc)

            parsedJobs.push({
              id: `wwr-${link.split('/').pop() || Math.random().toString(36).substring(7)}`,
              created_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
              posted_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
              title,
              company_name: decodeHtmlEntities(company),
              company_logo_url: null,
              location: 'Worldwide (Remote)',
              city,
              country,
              work_type: 'remote',
              geo_scope: geoScope,
              hires_from_nigeria: hiresFromNigeria,
              salary_range: 'Competitive',
              category: normalizeCategory(cat.replace('remote-', '').replace('-jobs', '')),
              description: desc,
              requirements: '',
              apply_url: link.startsWith('http') ? link : `https://${link}`,
              status: 'open',
              source: 'WeWorkRemotely',
              verification: 'aggregated',
              is_scam_flagged: isScamPattern(title, desc),
            })
          }
          return parsedJobs
        })
        .catch(() => [])
    )
  }

  const results = await Promise.all(apiPromises)
  const allFetched = results.flat()

  // Deduplicate by title + company
  const seen = new Set<string>()
  const uniqueJobs: JobItem[] = []

  for (const j of allFetched) {
    if (!j.title || !j.company_name || j.is_scam_flagged) continue
    const key = `${j.title.toLowerCase().trim()}___${j.company_name.toLowerCase().trim()}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueJobs.push(j)
    }
  }

  return uniqueJobs
}
