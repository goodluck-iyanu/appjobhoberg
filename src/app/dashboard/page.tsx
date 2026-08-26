import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase,
  Bookmark,
  Building2,
  MapPin,
  Clock,
  Settings,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
} from '@/components/icons'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user applications
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)

  const displayName = profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="flex-1 bg-[#f5f5f7] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Welcome Header */}
        <div className="bg-white border border-[#d2d2d7]/70 rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0066cc] text-[12px] font-semibold px-3 py-1 rounded-full mb-3 border border-blue-100">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified Account
              </div>
              <h1 className="text-[26px] sm:text-[34px] font-bold text-[#1d1d1f] tracking-tight">
                Welcome, {displayName}!
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#86868b] mt-1">
                {user.email} &bull; Remote Job Seeker
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="bg-[#1d1d1f] hover:bg-[#2d2d30] text-white text-[14px] font-medium px-5 py-2.5 rounded-full transition-colors"
              >
                Edit Profile
              </Link>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-[14px] font-medium px-4 py-2.5 rounded-full border border-[#d2d2d7]/60 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Profile Completion Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-[#0066cc] rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">Career Profile</h3>
            <p className="text-[13px] text-[#86868b] mb-4">
              {profile?.career_field ? `Field: ${profile.career_field}` : 'Add your career field and skills for smart matching.'}
            </p>
            <Link href="/profile" className="text-[13px] font-semibold text-[#0066cc] hover:underline inline-flex items-center">
              Update details <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">Saved Roles</h3>
            <p className="text-[13px] text-[#86868b] mb-4">
              Bookmark interesting opportunities while browsing to review later.
            </p>
            <Link href="/jobs" className="text-[13px] font-semibold text-[#0066cc] hover:underline inline-flex items-center">
              Find more jobs <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">Applications</h3>
            <p className="text-[13px] text-[#86868b] mb-4">
              {applications && applications.length > 0 ? `${applications.length} active application(s)` : 'Track all roles you have applied for in one place.'}
            </p>
            <Link href="/jobs" className="text-[13px] font-semibold text-[#0066cc] hover:underline inline-flex items-center">
              Explore openings <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Explore Latest Jobs CTA */}
        <div className="bg-gradient-to-r from-[#0066cc] to-[#004bb5] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h2 className="text-[20px] sm:text-[24px] font-bold mb-1">Ready to discover new roles?</h2>
            <p className="text-white/80 text-[14px]">Browse over 200+ verified remote jobs matching your background.</p>
          </div>
          <Link
            href="/jobs"
            className="bg-white text-[#0066cc] font-semibold text-[15px] px-6 py-3 rounded-full hover:bg-white/90 transition-colors shrink-0 shadow-sm"
          >
            Browse Remote Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
