import type { Metadata } from 'next'
import JobHubPage from '@/components/JobHubPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Software Developer Jobs in Nigeria & Remote | Hoberg Jobs',
  description: 'Frontend, Backend, Fullstack, Mobile, and DevOps jobs hiring Nigerian software developers.',
}

export default function SoftwareDeveloperJobsPage() {
  return (
    <JobHubPage
      title="Software Developer &amp; Tech Jobs (Nigeria &amp; Remote)"
      subtitle="Engineering positions across React, Next.js, Node.js, Python, Mobile, and Cloud that hire Nigerian developers."
      locationBadge="💻 Tech &amp; Software Engineering"
      filterOptions={{ category: 'engineering' }}
    />
  )
}

