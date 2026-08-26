import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, MapPin, Briefcase, Clock, Building2 } from 'lucide-react'

// Define the Job type based on our database schema
type Job = {
  id: string
  created_at: string
  title: string
  company_name: string
  location: string
  employment_type: string
  is_remote: boolean
  salary_range: string
  description: string
  apply_url: string
}

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch open jobs from the database
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Find the best <span className="text-blue-600">remote</span> opportunities.
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Discover legitimate, verified remote jobs tailored to your skills. Build your profile, save jobs, and track your applications securely.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center pl-4 pr-2 py-2 bg-gray-50 rounded-xl">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company" 
                className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500 outline-none"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors whitespace-nowrap">
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Jobs Listing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Job Type</h3>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Freelance'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm text-gray-600">Remote Only</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Jobs Feed */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Latest Opportunities</h2>
              <span className="text-sm text-gray-500">{jobs?.length || 0} jobs found</span>
            </div>

            {error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                Failed to load jobs. Please check your database connection.
              </div>
            ) : !jobs || jobs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs available yet</h3>
                <p className="text-gray-500">Run the SQL setup script to add dummy data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 font-medium">{job.company_name}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {job.salary_range && (
                            <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                              {job.salary_range}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {job.is_remote ? 'Remote' : job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {job.employment_type}
                        </div>
                        <div className="text-xs text-gray-400 ml-auto">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  )
}
