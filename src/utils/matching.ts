import { UserProfile, JobItem } from '@/types'

// Common tech, soft, and industry skill keywords for extraction and matching
const COMMON_SKILLS = [
  'javascript', 'typescript', 'react', 'next.js', 'vue', 'angular', 'node.js', 'python',
  'django', 'flask', 'fastapi', 'java', 'spring', 'go', 'golang', 'rust', 'c#', '.net',
  'php', 'laravel', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'rest api',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'devops',
  'html', 'css', 'tailwind', 'sass', 'figma', 'ui/ux', 'product design', 'user research',
  'wireframing', 'prototyping', 'product management', 'jira', 'agile', 'scrum',
  'customer support', 'customer service', 'zendesk', 'intercom', 'freshdesk', 'crm', 'hubspot',
  'salesforce', 'sales', 'lead generation', 'cold outreach', 'account management', 'b2b',
  'digital marketing', 'seo', 'sem', 'google analytics', 'content writing', 'copywriting',
  'social media', 'email marketing', 'accounting', 'bookkeeping', 'quickbooks', 'xero',
  'excel', 'financial modeling', 'data analysis', 'power bi', 'tableau', 'pandas',
  'machine learning', 'communication', 'problem solving', 'virtual assistant', 'administration'
]

export interface MatchResult {
  score: number
  reason: string
  missing_keywords: string[]
}

/**
 * Normalizes text to lowercase alphanumeric tokens
 */
function tokenize(text: string): Set<string> {
  if (!text) return new Set()
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
  return new Set(tokens)
}

/**
 * Extracts recognized skills from text (case-insensitive)
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return []
  const lower = text.toLowerCase()
  const found: string[] = []
  for (const skill of COMMON_SKILLS) {
    if (lower.includes(skill)) {
      found.push(skill)
    }
  }
  return Array.from(new Set(found))
}

/**
 * Calculates deterministic match % (0–100) between a user profile and a job listing.
 * NO LLM tokens used on read! Fast, cheap, and truthful.
 */
export function calculateJobMatch(
  profile: Partial<UserProfile> | null | undefined,
  job: Partial<JobItem>
): MatchResult {
  if (!profile) {
    return {
      score: 50,
      reason: 'Sign in to see your truthful profile match score.',
      missing_keywords: [],
    }
  }

  const jobTitle = (job.title || '').toLowerCase()
  const jobDesc = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase()
  const userSkills = (profile.skills || []).map((s) => s.toLowerCase().trim())
  const userRoles = (profile.target_roles || []).map((r) => r.toLowerCase().trim())
  const userCity = (profile.city || 'Lagos').toLowerCase()
  const userSeniority = (profile.seniority || 'mid').toLowerCase()

  let score = 0
  const reasons: string[] = []
  const missingKeywords: string[] = []

  // 1. Title Overlap (35 max points)
  let titleScore = 0
  let matchedRole = ''
  if (userRoles.length > 0) {
    for (const role of userRoles) {
      if (jobTitle.includes(role) || role.includes(jobTitle)) {
        titleScore = 35
        matchedRole = role
        break
      }
      // Partial word match
      const roleTokens = role.split(' ')
      const matchingTokens = roleTokens.filter((t) => t.length > 2 && jobTitle.includes(t))
      if (matchingTokens.length > 0) {
        titleScore = Math.max(titleScore, Math.round((matchingTokens.length / roleTokens.length) * 30))
        matchedRole = matchingTokens.join(' ')
      }
    }
  } else {
    // Default fallback check from current job title or skills
    titleScore = 15
  }
  score += titleScore
  if (matchedRole && titleScore >= 20) {
    reasons.push(`Target role (${matchedRole}) matches title`)
  }

  // 2. Skills Overlap (35 max points)
  const jobSkills = extractSkillsFromText(jobDesc)
  let matchedSkillsCount = 0

  if (jobSkills.length > 0 && userSkills.length > 0) {
    for (const jSkill of jobSkills) {
      const isMatched = userSkills.some(
        (uSkill) => uSkill === jSkill || uSkill.includes(jSkill) || jSkill.includes(uSkill)
      )
      if (isMatched) {
        matchedSkillsCount++
      } else {
        if (missingKeywords.length < 3) {
          missingKeywords.push(jSkill.charAt(0).toUpperCase() + jSkill.slice(1))
        }
      }
    }
    const skillRatio = Math.min(1, matchedSkillsCount / Math.max(1, Math.min(jobSkills.length, 6)))
    score += Math.round(skillRatio * 35)
    if (matchedSkillsCount > 0) {
      const sample = userSkills.filter((s) => jobSkills.includes(s)).slice(0, 2).join(', ')
      if (sample) reasons.push(`Skills match: ${sample}`)
    }
  } else if (userSkills.length > 0) {
    score += 20
  } else {
    score += 10
  }

  // 3. Location & Work Type Fit (15 max points)
  const jobLoc = (job.location || '').toLowerCase()
  const isRemote = job.work_type === 'remote' || jobLoc.includes('remote')
  const isNigeria = job.country === 'Nigeria' || jobLoc.includes('nigeria') || jobLoc.includes('lagos') || jobLoc.includes('abuja')

  if (isRemote && profile.remote_from_nigeria) {
    score += 15
    reasons.push('Remote from Nigeria')
  } else if (jobLoc.includes(userCity)) {
    score += 15
    reasons.push(`Location (${profile.city || 'Lagos'}) matches`)
  } else if (isNigeria) {
    score += 10
  } else {
    score += 5
  }

  // 4. Seniority Fit (15 max points)
  const jobSeniority = (job.seniority || '').toLowerCase()
  if (jobSeniority && userSeniority) {
    if (jobSeniority === userSeniority || jobSeniority === 'all') {
      score += 15
    } else if (
      (userSeniority === 'entry' && jobSeniority === 'nysc') ||
      (userSeniority === 'mid' && jobSeniority === 'entry') ||
      (userSeniority === 'senior' && jobSeniority === 'mid')
    ) {
      score += 10
    } else {
      score += 5
    }
  } else {
    score += 10
  }

  // ── Cap Checks & Truthful Penalties ──
  // Foreign role that doesn't hire from Nigeria
  if (job.hires_from_nigeria === 'no') {
    score = Math.min(score, 35)
    reasons.unshift('⚠️ Low hire chance from Nigeria')
  } else if (job.hires_from_nigeria === 'unknown' && !isNigeria && !jobLoc.includes('worldwide')) {
    score = Math.min(score, 60)
  }

  // Hard clamp 15 to 98
  score = Math.max(18, Math.min(96, score))

  // Construct single-sentence explanation
  let reasonString = reasons.slice(0, 2).join(' • ')
  if (!reasonString) {
    reasonString = 'General alignment with your profile details'
  }

  return {
    score,
    reason: reasonString,
    missing_keywords: missingKeywords,
  }
}

/**
 * Calculates profile strength (0–100) and returns up to 4 actionable next steps.
 */
export function calculateProfileStrength(profile: Partial<UserProfile> | null): {
  score: number
  label: string
  nextActions: { id: string; text: string; href: string }[]
} {
  if (!profile) {
    return {
      score: 10,
      label: 'Getting Started',
      nextActions: [
        { id: 'upload_cv', text: 'Upload your CV once for instant matching', href: '/app/cv' },
        { id: 'set_roles', text: 'Specify 1–3 target job roles', href: '/profile' },
        { id: 'add_skills', text: 'Add your top technical and soft skills', href: '/profile' },
      ],
    }
  }

  let score = 20
  const actions: { id: string; text: string; href: string }[] = []

  // 1. Full name & contact
  if (profile.full_name && profile.phone) {
    score += 15
  } else {
    actions.push({ id: 'contact', text: 'Add phone number for employer contact', href: '/profile' })
  }

  // 2. Target roles
  if (profile.target_roles && profile.target_roles.length > 0) {
    score += 15
  } else {
    actions.push({ id: 'roles', text: 'Select target job titles to personalize your feed', href: '/profile' })
  }

  // 3. Skills
  if (profile.skills && profile.skills.length >= 4) {
    score += 20
  } else {
    actions.push({ id: 'skills', text: 'Add at least 4 key skills to unlock 80%+ matches', href: '/profile' })
  }

  // 4. Experience & Education
  if (profile.experience && profile.experience.length > 0) {
    score += 15
  } else {
    actions.push({ id: 'exp', text: 'Add your work experience or past projects', href: '/profile' })
  }

  if (profile.education && profile.education.length > 0) {
    score += 10
  } else {
    actions.push({ id: 'edu', text: 'Add education and NYSC status', href: '/profile' })
  }

  // 5. Links
  if (profile.links?.linkedin || profile.links?.github || profile.links?.portfolio) {
    score += 5
  } else {
    if (actions.length < 4) {
      actions.push({ id: 'links', text: 'Add LinkedIn or portfolio link', href: '/profile' })
    }
  }

  score = Math.min(100, score)

  let label = 'Needs Attention'
  if (score >= 80) label = 'All-Star Candidate'
  else if (score >= 60) label = 'Strong Profile'
  else if (score >= 40) label = 'Intermediate'

  return {
    score,
    label,
    nextActions: actions.slice(0, 4),
  }
}

