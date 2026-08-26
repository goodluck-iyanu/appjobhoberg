import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Briefcase, Clock, Building2, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react'

export default async function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch the specific job
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !job) {
    notFound()
  }

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <p className="text-lg text-gray-600 font-medium">{job.company_name}</p>
                </div>
              </div>
              
              {/* Apply Button Logic based on auth state */}
              <div className="shrink-0 flex flex-col items-center md:items-end">
                {user ? (
                  <a 
                    href={job.apply_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                ) : (
                  <Link 
                    href="/login"
                    className="inline-flex items-center justify-center w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
                  >
                    Log in to Apply
                  </Link>
                )}
                {!user && <p className="text-xs text-gray-500 mt-3 text-center">You must be signed in to apply.</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{job.is_remote ? 'Remote' : job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{job.employment_type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Posted {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-blue max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
              {job.description}
            </div>

            {job.requirements && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                <div className="prose prose-blue max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </>
            )}

            {job.salary_range && (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 font-bold">
                  $
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-1">Salary Range</h3>
                  <p className="text-lg font-bold text-green-900">{job.salary_range}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Warning */}
          <div className="bg-gray-50 p-6 border-t border-gray-200 text-sm text-gray-500 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p>
              Hoberg Jobs does its best to verify all opportunities, but please exercise caution. 
              Never pay for an interview or share sensitive financial information during the application process.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

