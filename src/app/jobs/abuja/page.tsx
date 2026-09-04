import type { Metadata } from 'next'
import JobHubPage from '@/components/JobHubPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Jobs in Abuja, FCT Nigeria | Hoberg Jobs',
  description: 'Find verified job openings in Abuja, Central Area, Garki, Wuse, and Maitama. Apply free on Hoberg Jobs.',
}

export default function AbujaJobsPage() {
  return (
    <JobHubPage
      title="Verified Jobs in Abuja, Nigeria"
      subtitle="Corporate, administrative, NGO, and tech roles in the Federal Capital Territory."
      locationBadge="🏛️ Abuja, Nigeria"
      filterOptions={{ city: 'abuja', nigeriaOnly: true }}
    />
  )
}

