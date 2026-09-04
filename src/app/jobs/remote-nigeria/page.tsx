import type { Metadata } from 'next'
import JobHubPage from '@/components/JobHubPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Remote Jobs in Nigeria | Hoberg Jobs',
  description: 'Work from home opportunities that hire Nigerian candidates. Zero fees to apply.',
}

export default function RemoteNigeriaJobsPage() {
  return (
    <JobHubPage
      title="Remote Jobs Hiring in Nigeria"
      subtitle="Work from home roles from Nigerian and African companies that hire across all 36 states."
      locationBadge="🌐 Work from Anywhere in Nigeria"
      filterOptions={{ workType: 'remote', nigeriaOnly: true }}
    />
  )
}

