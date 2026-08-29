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

export const FALLBACK_JOBS: Job[] = [
  {
    id: 'job-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    title: 'Senior Frontend Engineer (React & Next.js)',
    company_name: 'Vercel',
    location: 'Worldwide',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '$130,000 - $165,000 / yr',
    category: 'Engineering',
    description: `We are looking for a Senior Frontend Engineer to join our core product team. You will lead the development of high-performance web applications using Next.js, React, and TypeScript.

Responsibilities:
• Architect, build, and maintain accessible, responsive web interfaces.
• Collaborate with product managers and designers to translate complex ideas into intuitive user experiences.
• Optimize frontend performance, web vitals, and asset delivery.
• Mentor junior engineers and participate in code reviews.`,
    requirements: `• 5+ years of production experience with modern React & TypeScript.
• Deep understanding of Server Components, SSR, and Next.js App Router.
• Passion for clean UI/UX and micro-interactions.
• Experience building high-scale design systems.`,
    apply_url: 'https://vercel.com/careers',
    status: 'open',
  },
  {
    id: 'job-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    title: 'Senior Product Designer',
    company_name: 'Linear',
    location: 'Remote (US & Europe)',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '$140,000 - $175,000 / yr',
    category: 'Design',
    description: `Linear is searching for a Senior Product Designer with craft, taste, and a high bar for detail. You will own features end-to-end from ideation to shipping.

Responsibilities:
• Design intuitive workflows, polished interactions, and elegant UI components.
• Work closely with engineering to ensure pixel-perfect implementation.
• Conduct user research and iterate based on community feedback.`,
    requirements: `• 4+ years designing web and desktop applications.
• Strong portfolio demonstrating typography, layout, and interaction design.
• Proficiency with Figma and prototyping tools.`,
    apply_url: 'https://linear.app/careers',
    status: 'open',
  },
  {
    id: 'job-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    title: 'Growth & Product Marketing Manager',
    company_name: 'Stripe',
    location: 'Remote (Global)',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '$120,000 - $155,000 / yr',
    category: 'Marketing',
    description: `Stripe is seeking an experienced Growth Marketing Manager to expand our global developer ecosystem and increase adoption across emerging markets.

Responsibilities:
• Formulate acquisition campaigns across search, social, and partner channels.
• Analyze conversion funnels and run data-driven A/B experiments.
• Craft compelling messaging and landing page experiences.`,
    requirements: `• 3+ years in B2B SaaS growth or product marketing.
• Strong analytical mindset (SQL, Google Analytics, Amplitude).
• Exceptional written communication skills.`,
    apply_url: 'https://stripe.com/jobs',
    status: 'open',
  },
  {
    id: 'job-4',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    title: 'Senior Backend Engineer (Go & PostgreSQL)',
    company_name: 'Supabase',
    location: 'Remote (Anywhere)',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '$135,000 - $170,000 / yr',
    category: 'Engineering',
    description: `Join the team building the open-source Firebase alternative. You will build distributed systems, API gateways, and manage multi-tenant database infrastructure.

Responsibilities:
• Develop reliable backend services in Go and Rust.
• Scale PostgreSQL clusters, optimize query performance, and enhance RLS security.
• Contribute to open-source developer tooling.`,
    requirements: `• Solid experience with Go, Docker, and PostgreSQL.
• Understanding of auth security, JWTs, and distributed cloud systems.`,
    apply_url: 'https://supabase.com/careers',
    status: 'open',
  },
  {
    id: 'job-5',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    title: 'Technical Product Manager',
    company_name: 'Raycast',
    location: 'Remote (Europe / UK / Africa)',
    employment_type: 'Full-time',
    is_remote: true,
    salary_range: '£85,000 - £110,000 / yr',
    category: 'Product',
    description: `Help us build the next generation of productivity tools. You will lead development roadmaps for Raycast extensions, AI integrations, and developer APIs.

Responsibilities:
• Define product requirements, user stories, and feature specs.
• Coordinate between design, engineering, and developer advocates.
• Gather feedback from our active community of power users.`,
    requirements: `• 3+ years experience as a technical PM or software engineer.
• Deep passion for developer tools and workflow automation.`,
    apply_url: 'https://raycast.com/careers',
    status: 'open',
  }
]

