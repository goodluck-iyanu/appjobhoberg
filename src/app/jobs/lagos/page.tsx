import type { Metadata } from 'next'
import JobHubPage from '@/components/JobHubPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Jobs in Lagos, Nigeria | Hoberg Jobs',
  description: 'Explore verified job openings in Lagos, Ikeja, Lekki, Victoria Island, and Yaba. Apply free on Hoberg Jobs.',
}

export default function LagosJobsPage() {
  return (
    <JobHubPage
      title="Verified Jobs in Lagos, Nigeria"
      subtitle="On-site, hybrid, and remote opportunities across Ikeja, Victoria Island, Lekki, and Yaba."
      locationBadge="📍 Lagos, Nigeria"
      filterOptions={{ city: 'lagos', nigeriaOnly: true }}
    />
  )
}

