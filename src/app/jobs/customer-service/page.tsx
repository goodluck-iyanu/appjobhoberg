import type { Metadata } from 'next'
import JobHubPage from '@/components/JobHubPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Customer Service & Support Jobs in Nigeria | Hoberg Jobs',
  description: 'Remote and on-site customer success, customer service representative, and support specialist jobs in Nigeria.',
}

export default function CustomerServiceJobsPage() {
  return (
    <JobHubPage
      title="Customer Service &amp; Support Jobs in Nigeria"
      subtitle="Remote customer support, live chat specialist, Zendesk agent, and customer success positions."
      locationBadge="🎧 Customer Success &amp; Support"
      filterOptions={{ category: 'support' }}
    />
  )
}

