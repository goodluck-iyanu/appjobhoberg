import type { Metadata } from 'next'
import JobHubPage from '@/components/JobHubPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'NYSC Jobs & PPA Openings in Nigeria | Hoberg Jobs',
  description: 'Verified Primary Place of Assignment (PPA) jobs and internship opportunities for NYSC corps members in Lagos, Abuja, and remote.',
}

export default function NyscJobsPage() {
  return (
    <JobHubPage
      title="NYSC Jobs &amp; PPA Opportunities in Nigeria"
      subtitle="Verified corporate, tech, teaching, and administrative placements for serving NYSC corps members."
      locationBadge="🇳🇬 NYSC Placements &amp; Internships"
      filterOptions={{ category: 'nysc' }}
    />
  )
}

