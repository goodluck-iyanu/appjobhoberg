import type { Metadata } from 'next'
import JobHubPage from '@/components/JobHubPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Graduate Trainee Jobs in Nigeria | Hoberg Jobs',
  description: 'Entry-level and graduate trainee jobs in Nigeria. Zero experience required roles with on-the-job training.',
}

export default function GraduateJobsPage() {
  return (
    <JobHubPage
      title="Graduate Trainee &amp; Entry-Level Jobs in Nigeria"
      subtitle="Kickstart your career with verified graduate trainee programs and entry-level roles in Nigeria."
      locationBadge="🎓 Graduate Trainee &amp; Entry Level"
      filterOptions={{ category: 'graduate' }}
    />
  )
}

