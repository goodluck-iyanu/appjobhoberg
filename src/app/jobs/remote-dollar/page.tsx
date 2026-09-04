import type { Metadata } from 'next'
import JobHubPage from '@/components/JobHubPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'USD & Dollar Remote Jobs for Nigerians | Hoberg Jobs',
  description: 'Verified international remote positions offering USD compensation that actively hire candidates in Nigeria.',
}

export default function RemoteDollarJobsPage() {
  return (
    <JobHubPage
      title="Dollar Remote Jobs (Hiring in Nigeria)"
      subtitle="International remote companies with USD compensation that accept Nigerian and African applicants."
      locationBadge="💵 USD Compensation Shelf"
      filterOptions={{ dollarOnly: true, workType: 'remote' }}
    />
  )
}

