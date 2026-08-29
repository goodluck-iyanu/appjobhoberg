import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function decodeHtmlEntities(str) {
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

function normalizeJobType(jobType) {
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

function normalizeCategory(cat) {
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

async function runFullSync() {
  console.log('Fetching live feeds from all 5 official remote providers...');

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

  const apiPromises = []

  // 1. Remotive API
  for (const cat of remotiveCategories) {
    apiPromises.push(
      fetch(`https://remotive.com/api/remote-jobs?category=${cat}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.jobs && Array.isArray(data.jobs)) {
            return data.jobs.map((item) => ({
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

  // 2. Jobicy API
  for (const ind of jobicyIndustries) {
    apiPromises.push(
      fetch(`https://jobicy.com/api/v2/remote-jobs?count=50&industry=${ind}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.jobs && Array.isArray(data.jobs)) {
            return data.jobs.map((item) => {
              let salaryText = 'Competitive'
              if (item.salaryMin && item.salaryMax) {
                const cur = item.salaryCurrency || '$'
                salaryText = `${cur}${item.salaryMin.toLocaleString()} - ${cur}${item.salaryMax.toLocaleString()}${item.salaryPeriod ? ` / ${item.salaryPeriod}` : ''}`
              } else if (item.salaryMin) {
                const cur = item.salaryCurrency || '$'
                salaryText = `From ${cur}${item.salaryMin.toLocaleString()}`
              }
              return {
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

  // 3. Himalayas API
  apiPromises.push(
    fetch('https://himalayas.app/jobs/api?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.jobs && Array.isArray(data.jobs)) {
          return data.jobs.map((item) => {
            let salaryText = 'Competitive'
            if (item.minSalary && item.maxSalary) {
              const cur = item.currency || '$'
              salaryText = `${cur}${item.minSalary.toLocaleString()} - ${cur}${item.maxSalary.toLocaleString()}${item.salaryPeriod ? ` / ${item.salaryPeriod}` : ''}`
            } else if (item.minSalary) {
              salaryText = `From ${item.currency || '$'}${item.minSalary.toLocaleString()}`
            }
            return {
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

  // 4. RemoteOK API
  apiPromises.push(
    fetch('https://remoteok.com/api', {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          return data
            .filter((item) => item && item.position && item.company)
            .map((item) => {
              let salaryText = 'Competitive'
              if (item.salary_min && item.salary_max && item.salary_max > 0) {
                salaryText = `$${item.salary_min.toLocaleString()} - $${item.salary_max.toLocaleString()} / yr`
              }
              const targetApply = item.apply_url || item.url || 'https://remoteok.com'

              return {
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

  // 5. We Work Remotely
  for (const cat of wwrCategories) {
    apiPromises.push(
      fetch(`https://weworkremotely.com/categories/${cat}.rss`, {
        headers: { Accept: 'application/rss+xml, text/xml' },
      })
        .then((res) => (res.ok ? res.text() : ''))
        .then((xml) => {
          if (!xml || !xml.includes('<item>')) return []
          const items = xml.split('<item>').slice(1)
          const parsedJobs = []
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

            parsedJobs.push({
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

  const seen = new Set()
  const jobsToInsert = []

  for (const j of allFetched) {
    if (!j.title || !j.company_name) continue
    const key = `${j.title.toLowerCase().trim()}___${j.company_name.toLowerCase().trim()}`
    if (!seen.has(key)) {
      seen.add(key)
      const itemCreatedAt = new Date(Date.now() - jobsToInsert.length * 60000).toISOString()
      jobsToInsert.push({
        ...j,
        created_at: itemCreatedAt,
      })
    }
  }

  console.log(`Fetched ${allFetched.length} raw jobs, deduplicated to ${jobsToInsert.length} real remote jobs.`);

  // Wipe non-internal jobs
  console.log('Wiping existing external jobs from Supabase...');
  await supabase.from('jobs').delete().neq('source', 'internal')

  // Insert in chunks of 50
  console.log('Inserting fresh jobs into Supabase database...');
  let inserted = 0
  const chunkSize = 50
  for (let i = 0; i < jobsToInsert.length; i += chunkSize) {
    const chunk = jobsToInsert.slice(i, i + chunkSize)
    const { data, error } = await supabase.from('jobs').insert(chunk).select('id')
    if (error) {
      console.error(`Error inserting chunk ${i}:`, error.message)
    } else {
      inserted += (data || []).length
    }
  }

  const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
  console.log(`Sync Complete! Successfully inserted ${inserted} jobs. Total in DB: ${count}`);
}

runFullSync();

